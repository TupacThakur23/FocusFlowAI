class ContextBuilder {
  constructor(options = {}) {
    this.config = {
      maxContextTokens: options.maxContextTokens || 4000,
      minSourceTokens: options.minSourceTokens || 100,
      maxSourcesPerGroup: options.maxSourcesPerGroup || 5,
      overlapTokens: options.overlapTokens || 50,
      enableSourceGrouping: options.enableSourceGrouping !== false,
      enableSemanticGrouping: options.enableSemanticGrouping !== false,
      enableTemporalGrouping: options.enableTemporalGrouping !== false,
      enableCompression: options.enableCompression !== false,
      compressionRatio: options.compressionRatio || 0.7,
      enableStructuredFormatting: options.enableStructuredFormatting !== false,
      includeCitations: options.includeCitations !== false,
      includeMetadata: options.includeMetadata !== false,
      minRelevanceScore: options.minRelevanceScore || 0.3,
      enableRedundancyRemoval: options.enableRedundancyRemoval !== false,
      redundancyThreshold: options.redundancyThreshold || 0.85
    };
    this.contextStats = {
      totalChunks: 0,
      selectedChunks: 0,
      removedDuplicates: 0,
      compressedTokens: 0,
      finalTokens: 0,
      buildTime: 0
    };
  }
  buildContext(results, query, options = {}) {
    const startTime = Date.now();
    this.contextStats = {
      totalChunks: results.length,
      selectedChunks: 0,
      removedDuplicates: 0,
      compressedTokens: 0,
      finalTokens: 0,
      buildTime: 0
    };
    try {
      const filteredResults = this.filterByRelevance(results);
      const deduplicatedResults = this.removeRedundancy(filteredResults);
      const groupedResults = this.groupResults(deduplicatedResults, query);
      const orderedGroups = this.orderGroupsByRelevance(groupedResults);
      const context = this.buildContextWithBudget(orderedGroups, query, options);
      const finalContext = this.config.enableCompression ? this.compressContext(context) : context;
      this.contextStats.buildTime = Date.now() - startTime;
      this.contextStats.selectedChunks = this.countTotalChunks(finalContext);
      this.contextStats.finalTokens = this.estimateTokens(finalContext.text);
      return {
        ...finalContext,
        metadata: {
          ...this.contextStats,
          groups: orderedGroups.length,
          sources: this.countUniqueSources(finalContext),
          compressionRatio: this.config.enableCompression ? (this.contextStats.finalTokens / this.contextStats.compressedTokens).toFixed(2) : 1.0,
          buildStrategy: this.determineBuildStrategy(query, options)
        }
      };
    } catch (error) {
      console.error('Context building failed:', error);
      throw new Error(`Context building failed: ${error.message}`);
    }
  }
  filterByRelevance(results) {
    return results.filter(result => result.totalScore >= this.config.minRelevanceScore);
  }
  removeRedundancy(results) {
    if (!this.config.enableRedundancyRemoval) return results;
    const deduplicated = [];
    const seen = new Set();
    for (const result of results) {
      const contentSignature = this.generateContentSignature(result);
      if (!seen.has(contentSignature)) {
        seen.add(contentSignature);
        deduplicated.push(result);
      } else {
        this.contextStats.removedDuplicates++;
      }
    }
    return deduplicated;
  }
  groupResults(results, query) {
    const groups = [];
    const used = new Set();
    for (let i = 0; i < results.length && groups.length < 20; i++) {
      const result = results[i];
      if (used.has(result.chunkId)) continue;
      let group = [result];
      used.add(result.chunkId);
      for (let j = i + 1; j < results.length; j++) {
        const candidate = results[j];
        if (used.has(candidate.chunkId)) continue;
        if (this.shouldGroupTogether(result, candidate, query)) {
          group.push(candidate);
          used.add(candidate.chunkId);
          if (group.length >= this.config.maxSourcesPerGroup) {
            break;
          }
        }
      }
      groups.push({
        id: `group_${groups.length}`,
        chunks: group,
        relevance: Math.max(...group.map(r => r.totalScore)),
        diversity: this.calculateGroupDiversity(group),
        sources: this.getGroupSources(group)
      });
    }
    return groups;
  }
  orderGroupsByRelevance(groups) {
    return groups.sort((a, b) => {
      const aAvgRelevance = a.relevance / a.chunks.length;
      const bAvgRelevance = b.relevance / b.chunks.length;
      if (Math.abs(aAvgRelevance - bAvgRelevance) > 0.01) {
        return bAvgRelevance - aAvgRelevance;
      }
      return b.diversity - a.diversity;
    });
  }
  buildContextWithBudget(groups, query, options) {
    let context = {
      text: '',
      groups: [],
      citations: [],
      metadata: {
        totalTokens: 0,
        sources: new Set(),
        groups: groups.length
      }
    };
    let remainingTokens = this.config.maxContextTokens;
    const queryHeader = this.buildQueryHeader(query);
    const queryTokens = this.estimateTokens(queryHeader);
    if (queryTokens < remainingTokens) {
      context.text += queryHeader;
      context.metadata.totalTokens += queryTokens;
      remainingTokens -= queryTokens;
    }
    for (const group of groups) {
      if (remainingTokens <= this.config.minSourceTokens) break;
      const groupContext = this.buildGroupContext(group, remainingTokens);
      context.text += groupContext.text;
      context.groups.push(groupContext.group);
      context.citations.push(...groupContext.citations);
      context.metadata.totalTokens += groupContext.tokens;
      remainingTokens -= groupContext.tokens;
      groupContext.sources.forEach(source => context.metadata.sources.add(source));
    }
    const footerTokens = this.estimateTokens(this.buildContextFooter());
    if (footerTokens < remainingTokens) {
      context.text += this.buildContextFooter();
      context.metadata.totalTokens += footerTokens;
    }
    return context;
  }
  buildGroupContext(group, availableTokens) {
    const groupText = [];
    const citations = [];
    const sources = [];
    let usedTokens = 0;
    const groupHeader = `## Source Group ${group.id}\n\n`;
    const headerTokens = this.estimateTokens(groupHeader);
    if (headerTokens < availableTokens) {
      groupText.push(groupHeader);
      usedTokens += headerTokens;
    }
    for (const chunk of group.chunks) {
      const chunkTokens = this.estimateTokens(chunk.metadata.content || '');
      const totalTokens = usedTokens + chunkTokens + 50;
      if (totalTokens > availableTokens) {
        const truncatedContent = this.truncateToTokens(chunk.metadata.content || '', availableTokens - usedTokens - 20);
        groupText.push(`**Source:** ${chunk.metadata.url || 'Unknown'}\n`);
        groupText.push(`**Relevance:** ${chunk.totalScore.toFixed(3)}\n\n`);
        groupText.push(`${truncatedContent}...\n\n[Content truncated due to token limit]\n\n`);
        usedTokens = availableTokens;
        break;
      }
      groupText.push(`**Source:** ${chunk.metadata.url || 'Unknown'}\n`);
      groupText.push(`**Relevance:** ${chunk.totalScore.toFixed(3)}\n\n`);
      groupText.push(`${chunk.metadata.content}\n\n`);
      if (this.config.includeCitations) {
        citations.push({
          id: chunk.chunkId || chunk.id,
          source: chunk.metadata.url || 'Unknown',
          title: chunk.metadata.workbookTitle || 'Unknown',
          relevance: chunk.totalScore,
          text: this.extractCitationText(chunk.metadata.content || '')
        });
      }
      if (chunk.metadata.url) {
        sources.push(chunk.metadata.url);
      }
      usedTokens = totalTokens;
    }
    return {
      group: {
        id: group.id,
        chunks: group.chunks,
        relevance: group.relevance,
        diversity: group.diversity,
        sources: group.sources
      },
      text: groupText.join(''),
      citations: citations,
      tokens: usedTokens,
      sources
    };
  }
  buildQueryHeader(query) {
    const timestamp = new Date().toISOString();
    return `# Query Context\n\n**Query:** ${query.text || 'Unknown'}\n**Timestamp:** ${timestamp}\n**Intent:** ${query.intent || 'research'}\n\n---\n\n`;
  }
  buildContextFooter() {
    return `\n---\n\n**Note:** This context is provided to help answer the user's query. Please use the relevant information from these sources to construct a comprehensive, accurate response. Cite sources appropriately.\n\n`;
  }
  compressContext(context) {
    const originalTokens = this.estimateTokens(context.text);
    const targetTokens = Math.floor(originalTokens * this.config.compressionRatio);
    if (targetTokens >= originalTokens) {
      return context;
    }
    const compressedText = this.intelligentCompression(context.text, targetTokens);
    const actualTokens = this.estimateTokens(compressedText);
    this.contextStats.compressedTokens = actualTokens;
    return {
      ...context,
      text: compressedText,
      compressed: true,
      originalTokens,
      compressedTokens: actualTokens,
      compressionRatio: (actualTokens / originalTokens).toFixed(2)
    };
  }
  intelligentCompression(text, targetTokens) {
    const lines = text.split('\n');
    const importantLines = [];
    const regularLines = [];
    let currentTokens = 0;
    for (const line of lines) {
      const lineTokens = this.estimateTokens(line);
      if (currentTokens + lineTokens > targetTokens) {
        break;
      }
      if (this.isImportantLine(line)) {
        importantLines.push(line);
      } else {
        regularLines.push(line);
      }
      currentTokens += lineTokens;
    }
    let compressed = importantLines.join('\n');
    for (const line of regularLines) {
      const lineTokens = this.estimateTokens(line);
      if (this.estimateTokens(compressed) + lineTokens > targetTokens) {
        break;
      }
      compressed += '\n' + line;
    }
    return compressed;
  }
  shouldGroupTogether(result1, result2, query) {
    if (result1.metadata.url === result2.metadata.url) return true;
    if (result1.metadata.workbookId === result2.metadata.workbookId) return true;
    const tags1 = new Set(result1.metadata.semanticTags || []);
    const tags2 = new Set(result2.metadata.semanticTags || []);
    const intersection = new Set([...tags1].filter(tag => tags2.has(tag)));
    if (intersection.size > 0 && intersection.size / Math.min(tags1.size, tags2.size) > 0.4) {
      return true;
    }
    const scoreDiff = Math.abs(result1.totalScore - result2.totalScore);
    if (scoreDiff < 0.1) return true;
    return false;
  }
  calculateGroupDiversity(group) {
    if (group.length <= 1) return 0;
    const allSources = new Set();
    const allWorkbooks = new Set();
    const allTags = new Set();
    group.forEach(result => {
      if (result.metadata.url) allSources.add(result.metadata.url);
      if (result.metadata.workbookId) allWorkbooks.add(result.metadata.workbookId);
      (result.metadata.semanticTags || []).forEach(tag => allTags.add(tag));
    });
    const sourceDiversity = allSources.size / group.length;
    const workbookDiversity = allWorkbooks.size / group.length;
    const tagDiversity = allTags.size / group.reduce((sum, result) => sum + (result.metadata.semanticTags || []).length, 0);
    return (sourceDiversity + workbookDiversity + tagDiversity) / 3;
  }
  getGroupSources(group) {
    const sources = new Set();
    group.forEach(result => {
      if (result.metadata.url) {
        sources.add(result.metadata.url);
      }
    });
    return Array.from(sources);
  }
  generateContentSignature(result) {
    const content = (result.metadata.content || '').toLowerCase().replace(/\s+/g, ' ').trim();
    const firstWords = content.split(/\s+/).slice(0, 10).join(' ');
    return this.simpleHash(firstWords);
  }
  isImportantLine(line) {
    const trimmed = line.trim();
    if (trimmed.startsWith('#') || trimmed.startsWith('##')) return true;
    if (trimmed.includes('**Source:**') || trimmed.includes('**Relevance:**')) return true;
    const importantIndicators = ['important', 'critical', 'key', 'main', 'primary', 'conclusion', 'summary', 'finding', 'result'];
    const lowerLine = trimmed.toLowerCase();
    return importantIndicators.some(indicator => lowerLine.includes(indicator));
  }
  extractCitationText(content) {
    const sentences = content.split(/[.!?]+/);
    if (sentences.length > 0) {
      const firstSentence = sentences[0].trim();
      if (firstSentence.length > 10 && firstSentence.length < 100) {
        return firstSentence;
      }
    }
    return content.substring(0, 50).trim();
  }
  truncateToTokens(text, maxTokens) {
    if (maxTokens <= 0) return '';
    const words = text.split(/\s+/);
    let truncated = [];
    let currentTokens = 0;
    for (const word of words) {
      const wordTokens = Math.ceil(word.length / 4);
      if (currentTokens + wordTokens > maxTokens) {
        break;
      }
      truncated.push(word);
      currentTokens += wordTokens;
    }
    return truncated.join(' ');
  }
  estimateTokens(text) {
    if (!text) return 0;
    return Math.ceil(text.length / 4);
  }
  countTotalChunks(context) {
    return context.groups ? context.groups.reduce((sum, group) => sum + group.chunks.length, 0) : 0;
  }
  countUniqueSources(context) {
    return context.metadata ? context.metadata.sources.size : 0;
  }
  determineBuildStrategy(query, options) {
    let strategy = 'standard';
    if (options.prioritizeRecency) {
      strategy = 'temporal';
    } else if (options.prioritizeDiversity) {
      strategy = 'diverse';
    } else if (query.intent === 'comparison') {
      strategy = 'comparative';
    } else if (options.maxSourcesPerGroup < 3) {
      strategy = 'focused';
    }
    return strategy;
  }
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }
  getStats() {
    return {
      config: this.config,
      recentStats: this.contextStats,
      capabilities: ['grouped context construction', 'source-separated evidence', 'relevance ordering', 'token budget management', 'redundancy removal', 'intelligent compression', 'structured formatting', 'citation generation']
    };
  }
  updateConfig(newConfig) {
    this.config = {
      ...this.config,
      ...newConfig
    };
  }
  reset() {
    this.contextStats = {
      totalChunks: 0,
      selectedChunks: 0,
      removedDuplicates: 0,
      compressedTokens: 0,
      finalTokens: 0,
      buildTime: 0
    };
  }
}
export const contextBuilder = new ContextBuilder();
export const buildContext = contextBuilder.buildContext.bind(contextBuilder);
export const updateConfig = contextBuilder.updateConfig.bind(contextBuilder);
export const getStats = contextBuilder.getStats.bind(contextBuilder);
export const reset = contextBuilder.reset.bind(contextBuilder);
export default contextBuilder;

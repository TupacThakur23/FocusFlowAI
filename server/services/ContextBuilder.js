/**
 * ContextBuilder - Intelligent Context Construction for FocusFlow AI
 * 
 * Provides advanced context building:
 * - Grouped context construction
 * - Source-separated evidence
 * - Relevance ordering
 * - Token budget management
 * - Redundancy removal
 * - Context compression
 * - Structured context formatting
 */

class ContextBuilder {
  constructor(options = {}) {
    this.config = {
      // Context limits
      maxContextTokens: options.maxContextTokens || 4000,
      minSourceTokens: options.minSourceTokens || 100,
      maxSourcesPerGroup: options.maxSourcesPerGroup || 5,
      overlapTokens: options.overlapTokens || 50,
      
      // Grouping strategy
      enableSourceGrouping: options.enableSourceGrouping !== false,
      enableSemanticGrouping: options.enableSemanticGrouping !== false,
      enableTemporalGrouping: options.enableTemporalGrouping !== false,
      
      // Compression
      enableCompression: options.enableCompression !== false,
      compressionRatio: options.compressionRatio || 0.7,
      
      // Formatting
      enableStructuredFormatting: options.enableStructuredFormatting !== false,
      includeCitations: options.includeCitations !== false,
      includeMetadata: options.includeMetadata !== false,
      
      // Quality filters
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

  /**
   * Build intelligent context from retrieval results
   * @param {Array} results - Scored retrieval results
   * @param {Object} query - Query information
   * @param {Object} options - Context building options
   * @returns {Object} Built context
   */
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
      // Filter results by relevance threshold
      const filteredResults = this.filterByRelevance(results);
      
      // Remove redundancy
      const deduplicatedResults = this.removeRedundancy(filteredResults);
      
      // Group results by source and semantics
      const groupedResults = this.groupResults(deduplicatedResults, query);
      
      // Order groups by relevance
      const orderedGroups = this.orderGroupsByRelevance(groupedResults);
      
      // Build context with token budget management
      const context = this.buildContextWithBudget(orderedGroups, query, options);
      
      // Apply compression if enabled
      const finalContext = this.config.enableCompression 
        ? this.compressContext(context)
        : context;

      // Update statistics
      this.contextStats.buildTime = Date.now() - startTime;
      this.contextStats.selectedChunks = this.countTotalChunks(finalContext);
      this.contextStats.finalTokens = this.estimateTokens(finalContext.text);
      
      return {
        ...finalContext,
        metadata: {
          ...this.contextStats,
          groups: orderedGroups.length,
          sources: this.countUniqueSources(finalContext),
          compressionRatio: this.config.enableCompression 
            ? (this.contextStats.finalTokens / this.contextStats.compressedTokens).toFixed(2)
            : 1.0,
          buildStrategy: this.determineBuildStrategy(query, options)
        }
      };
      
    } catch (error) {
      console.error('Context building failed:', error);
      throw new Error(`Context building failed: ${error.message}`);
    }
  }

  /**
   * Filter results by minimum relevance score
   * @param {Array} results - Retrieval results
   * @returns {Array} Filtered results
   */
  filterByRelevance(results) {
    return results.filter(result => 
      result.totalScore >= this.config.minRelevanceScore
    );
  }

  /**
   * Remove redundant content
   * @param {Array} results - Filtered results
   * @returns {Array} Deduplicated results
   */
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

  /**
   * Group results by source and semantics
   * @param {Array} results - Deduplicated results
   * @param {Object} query - Query information
   * @returns {Array} Grouped results
   */
  groupResults(results, query) {
    const groups = [];
    const used = new Set();
    
    for (let i = 0; i < results.length && groups.length < 20; i++) {
      const result = results[i];
      if (used.has(result.chunkId)) continue;
      
      let group = [result];
      used.add(result.chunkId);
      
      // Find related results
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

  /**
   * Order groups by relevance and diversity
   * @param {Array} groups - Grouped results
   * @returns {Array} Ordered groups
   */
  orderGroupsByRelevance(groups) {
    return groups.sort((a, b) => {
      // Primary sort by average relevance
      const aAvgRelevance = a.relevance / a.chunks.length;
      const bAvgRelevance = b.relevance / b.chunks.length;
      
      if (Math.abs(aAvgRelevance - bAvgRelevance) > 0.01) {
        return bAvgRelevance - aAvgRelevance;
      }
      
      // Secondary sort by diversity
      return b.diversity - a.diversity;
    });
  }

  /**
   * Build context with token budget management
   * @param {Array} groups - Ordered groups
   * @param {Object} query - Query information
   * @param {Object} options - Building options
   * @returns {Object} Built context
   */
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
    
    // Add query context header
    const queryHeader = this.buildQueryHeader(query);
    const queryTokens = this.estimateTokens(queryHeader);
    
    if (queryTokens < remainingTokens) {
      context.text += queryHeader;
      context.metadata.totalTokens += queryTokens;
      remainingTokens -= queryTokens;
    }
    
    // Process groups within token budget
    for (const group of groups) {
      if (remainingTokens <= this.config.minSourceTokens) break;
      
      const groupContext = this.buildGroupContext(group, remainingTokens);
      context.text += groupContext.text;
      context.groups.push(groupContext.group);
      context.citations.push(...groupContext.citations);
      
      context.metadata.totalTokens += groupContext.tokens;
      remainingTokens -= groupContext.tokens;
      
      // Add all sources from this group
      groupContext.sources.forEach(source => context.metadata.sources.add(source));
    }
    
    // Add context footer if space permits
    const footerTokens = this.estimateTokens(this.buildContextFooter());
    if (footerTokens < remainingTokens) {
      context.text += this.buildContextFooter();
      context.metadata.totalTokens += footerTokens;
    }
    
    return context;
  }

  /**
   * Build context for a single group
   * @param {Object} group - Result group
   * @param {number} availableTokens - Tokens available for this group
   * @returns {Object} Group context
   */
  buildGroupContext(group, availableTokens) {
    const groupText = [];
    const citations = [];
    const sources = [];
    let usedTokens = 0;
    
    // Add group header
    const groupHeader = `## Source Group ${group.id}\n\n`;
    const headerTokens = this.estimateTokens(groupHeader);
    
    if (headerTokens < availableTokens) {
      groupText.push(groupHeader);
      usedTokens += headerTokens;
    }
    
    // Process chunks in group
    for (const chunk of group.chunks) {
      const chunkTokens = this.estimateTokens(chunk.metadata.content || '');
      const totalTokens = usedTokens + chunkTokens + 50; // +50 for formatting
      
      if (totalTokens > availableTokens) {
        // Add truncated indicator
        const truncatedContent = this.truncateToTokens(
          chunk.metadata.content || '', 
          availableTokens - usedTokens - 20
        );
        
        groupText.push(`**Source:** ${chunk.metadata.url || 'Unknown'}\n`);
        groupText.push(`**Relevance:** ${chunk.totalScore.toFixed(3)}\n\n`);
        groupText.push(`${truncatedContent}...\n\n[Content truncated due to token limit]\n\n`);
        
        usedTokens = availableTokens;
        break;
      }
      
      // Add chunk content
      groupText.push(`**Source:** ${chunk.metadata.url || 'Unknown'}\n`);
      groupText.push(`**Relevance:** ${chunk.totalScore.toFixed(3)}\n\n`);
      groupText.push(`${chunk.metadata.content}\n\n`);
      
      // Add citation
      if (this.config.includeCitations) {
        citations.push({
          id: chunk.chunkId || chunk.id,
          source: chunk.metadata.url || 'Unknown',
          title: chunk.metadata.workbookTitle || 'Unknown',
          relevance: chunk.totalScore,
          text: this.extractCitationText(chunk.metadata.content || '')
        });
      }
      
      // Track source
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

  /**
   * Build query header
   * @param {Object} query - Query information
   * @returns {string} Query header
   */
  buildQueryHeader(query) {
    const timestamp = new Date().toISOString();
    
    return `# Query Context\n\n**Query:** ${query.text || 'Unknown'}\n**Timestamp:** ${timestamp}\n**Intent:** ${query.intent || 'research'}\n\n---\n\n`;
  }

  /**
   * Build context footer
   * @returns {string} Context footer
   */
  buildContextFooter() {
    return `\n---\n\n**Note:** This context is provided to help answer the user's query. Please use the relevant information from these sources to construct a comprehensive, accurate response. Cite sources appropriately.\n\n`;
  }

  /**
   * Compress context to fit token budget
   * @param {Object} context - Built context
   * @returns {Object} Compressed context
   */
  compressContext(context) {
    const originalTokens = this.estimateTokens(context.text);
    const targetTokens = Math.floor(originalTokens * this.config.compressionRatio);
    
    if (targetTokens >= originalTokens) {
      return context; // No compression needed
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

  /**
   * Intelligent context compression
   * @param {string} text - Text to compress
   * @param {number} targetTokens - Target token count
   * @returns {string} Compressed text
   */
  intelligentCompression(text, targetTokens) {
    // Prioritize important content
    const lines = text.split('\n');
    const importantLines = [];
    const regularLines = [];
    let currentTokens = 0;
    
    for (const line of lines) {
      const lineTokens = this.estimateTokens(line);
      
      if (currentTokens + lineTokens > targetTokens) {
        break;
      }
      
      // Identify important lines (headers, citations, key points)
      if (this.isImportantLine(line)) {
        importantLines.push(line);
      } else {
        regularLines.push(line);
      }
      
      currentTokens += lineTokens;
    }
    
    // Combine important lines first, then fill with regular lines
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

  /**
   * Check if two results should be grouped together
   * @param {Object} result1 - First result
   * @param {Object} result2 - Second result
   * @param {Object} query - Query information
   * @returns {boolean} Whether to group
   */
  shouldGroupTogether(result1, result2, query) {
    // Same source
    if (result1.metadata.url === result2.metadata.url) return true;
    
    // Same workbook
    if (result1.metadata.workbookId === result2.metadata.workbookId) return true;
    
    // Semantic tag overlap
    const tags1 = new Set(result1.metadata.semanticTags || []);
    const tags2 = new Set(result2.metadata.semanticTags || []);
    const intersection = new Set([...tags1].filter(tag => tags2.has(tag)));
    
    if (intersection.size > 0 && intersection.size / Math.min(tags1.size, tags2.size) > 0.4) {
      return true;
    }
    
    // Similar relevance scores
    const scoreDiff = Math.abs(result1.totalScore - result2.totalScore);
    if (scoreDiff < 0.1) return true;
    
    return false;
  }

  /**
   * Calculate group diversity
   * @param {Array} group - Group of results
   * @returns {number} Diversity score
   */
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
    const tagDiversity = allTags.size / group.reduce((sum, result) => 
      sum + (result.metadata.semanticTags || []).length, 0);
    
    return (sourceDiversity + workbookDiversity + tagDiversity) / 3;
  }

  /**
   * Get sources from group
   * @param {Array} group - Result group
   * @returns {Array} Unique sources
   */
  getGroupSources(group) {
    const sources = new Set();
    
    group.forEach(result => {
      if (result.metadata.url) {
        sources.add(result.metadata.url);
      }
    });
    
    return Array.from(sources);
  }

  /**
   * Generate content signature for deduplication
   * @param {Object} result - Result to signature
   * @returns {string} Content signature
   */
  generateContentSignature(result) {
    const content = (result.metadata.content || '').toLowerCase().replace(/\s+/g, ' ').trim();
    const firstWords = content.split(/\s+/).slice(0, 10).join(' ');
    return this.simpleHash(firstWords);
  }

  /**
   * Check if line is important
   * @param {string} line - Line to check
   * @returns {boolean} Whether line is important
   */
  isImportantLine(line) {
    const trimmed = line.trim();
    
    // Headers
    if (trimmed.startsWith('#') || trimmed.startsWith('##')) return true;
    
    // Citations and sources
    if (trimmed.includes('**Source:**') || trimmed.includes('**Relevance:**')) return true;
    
    // Key indicators
    const importantIndicators = [
      'important', 'critical', 'key', 'main', 'primary',
      'conclusion', 'summary', 'finding', 'result'
    ];
    
    const lowerLine = trimmed.toLowerCase();
    return importantIndicators.some(indicator => lowerLine.includes(indicator));
  }

  /**
   * Extract citation text
   * @param {string} content - Content to extract from
   * @returns {string} Citation text
   */
  extractCitationText(content) {
    // Extract first sentence or key phrase
    const sentences = content.split(/[.!?]+/);
    if (sentences.length > 0) {
      const firstSentence = sentences[0].trim();
      if (firstSentence.length > 10 && firstSentence.length < 100) {
        return firstSentence;
      }
    }
    
    // Extract first 50 characters as fallback
    return content.substring(0, 50).trim();
  }

  /**
   * Truncate text to specific token count
   * @param {string} text - Text to truncate
   * @param {number} maxTokens - Maximum tokens
   * @returns {string} Truncated text
   */
  truncateToTokens(text, maxTokens) {
    if (maxTokens <= 0) return '';
    
    const words = text.split(/\s+/);
    let truncated = [];
    let currentTokens = 0;
    
    for (const word of words) {
      const wordTokens = Math.ceil(word.length / 4); // Estimate tokens per word
      
      if (currentTokens + wordTokens > maxTokens) {
        break;
      }
      
      truncated.push(word);
      currentTokens += wordTokens;
    }
    
    return truncated.join(' ');
  }

  /**
   * Estimate token count
   * @param {string} text - Text to estimate
   * @returns {number} Estimated token count
   */
  estimateTokens(text) {
    if (!text) return 0;
    return Math.ceil(text.length / 4);
  }

  /**
   * Count total chunks in context
   * @param {Object} context - Built context
   * @returns {number} Total chunks
   */
  countTotalChunks(context) {
    return context.groups ? context.groups.reduce((sum, group) => sum + group.chunks.length, 0) : 0;
  }

  /**
   * Count unique sources
   * @param {Object} context - Built context
   * @returns {number} Unique sources
   */
  countUniqueSources(context) {
    return context.metadata ? context.metadata.sources.size : 0;
  }

  /**
   * Determine build strategy
   * @param {Object} query - Query information
   * @param {Object} options - Building options
   * @returns {string} Build strategy
   */
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

  /**
   * Simple hash function
   * @param {string} str - String to hash
   * @returns {string} Hash
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  /**
   * Get context building statistics
   * @returns {Object} Statistics
   */
  getStats() {
    return {
      config: this.config,
      recentStats: this.contextStats,
      capabilities: [
        'grouped context construction',
        'source-separated evidence',
        'relevance ordering',
        'token budget management',
        'redundancy removal',
        'intelligent compression',
        'structured formatting',
        'citation generation'
      ]
    };
  }

  /**
   * Update configuration
   * @param {Object} newConfig - New configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Reset context builder state
   */
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

// Export singleton instance
export const contextBuilder = new ContextBuilder();

// Export utilities
export const buildContext = contextBuilder.buildContext.bind(contextBuilder);
export const updateConfig = contextBuilder.updateConfig.bind(contextBuilder);
export const getStats = contextBuilder.getStats.bind(contextBuilder);
export const reset = contextBuilder.reset.bind(contextBuilder);

export default contextBuilder;

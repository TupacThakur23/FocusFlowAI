

class ChunkProcessor {
  constructor(options = {}) {
    this.config = {

      maxChunkTokens: options.maxChunkTokens || 800,
      minChunkTokens: options.minChunkTokens || 200,
      overlapTokens: options.overlapTokens || 100,
      

      preserveHeadings: options.preserveHeadings !== false,
      preserveCodeBlocks: options.preserveCodeBlocks !== false,
      preserveLists: options.preserveLists !== false,
      

      enableSemanticGrouping: options.enableSemanticGrouping !== false,
      enableImportanceScoring: options.enableImportanceScoring !== false,
      

      includeSourceMetadata: options.includeSourceMetadata !== false,
      includeTimestamps: options.includeTimestamps !== false,
      

      enableDeduplication: options.enableDeduplication !== false,
      enableCompression: options.enableCompression !== false
    };

    this.headingLevels = new Map();
    this.semanticPatterns = new Map();
    this.importanceKeywords = new Set();
    
    this.initializePatterns();
  }

  
  initializePatterns() {

    this.semanticPatterns.set('introduction', [
      'introduction', 'overview', 'background', 'summary', 'abstract',
      'what is', 'definition', 'purpose', 'objective'
    ]);
    
    this.semanticPatterns.set('methodology', [
      'methodology', 'approach', 'method', 'technique', 'procedure',
      'how to', 'implementation', 'process', 'workflow'
    ]);
    
    this.semanticPatterns.set('results', [
      'results', 'findings', 'outcome', 'conclusion', 'summary',
      'key points', 'main findings', 'takeaways'
    ]);
    
    this.semanticPatterns.set('discussion', [
      'discussion', 'analysis', 'interpretation', 'implications',
      'significance', 'meaning', 'relevance'
    ]);

    this.importanceKeywords = new Set([
      'important', 'critical', 'essential', 'key', 'main', 'primary',
      'significant', 'crucial', 'fundamental', 'core', 'central',
      'conclusion', 'summary', 'finding', 'result', 'outcome'
    ]);
  }

  
  async processContent(content) {
    const {
      text,
      url,
      title,
      workbookId,
      timestamp,
      headings = [],
      codeBlocks = [],
      metadata = {}
    } = content;

    try {

      const processedText = this.preprocessText(text);
      

      const semanticSections = this.extractSemanticSections(processedText, headings);
      

      const chunks = await this.generateChunks(semanticSections, {
        url,
        title,
        workbookId,
        timestamp,
        headings,
        codeBlocks,
        metadata
      });

      const finalChunks = this.postProcessChunks(chunks);
      
      return finalChunks;
    } catch (error) {
      console.error('Chunk processing failed:', error);
      throw new Error(`Chunk processing failed: ${error.message}`);
    }
  }

  
  preprocessText(text) {
    if (!text || typeof text !== 'string') {
      return '';
    }

    let processed = text;

    processed = processed.replace(/\s+/g, ' ').trim();
    

    if (this.config.preserveCodeBlocks) {
      processed = this.preserveCodeBlocks(processed);
    }
    

    if (this.config.preserveHeadings) {
      processed = this.normalizeHeadings(processed);
    }
    

    if (this.config.preserveLists) {
      processed = this.preserveLists(processed);
    }

    return processed;
  }

  
  extractSemanticSections(text, headings) {
    const sections = [];
    const lines = text.split('\n');
    let currentSection = {
      type: 'content',
      content: '',
      level: 0,
      heading: null,
      semanticTags: [],
      importance: 0
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      

      const headingMatch = this.matchHeading(line);
      if (headingMatch) {

        if (currentSection.content.trim()) {
          sections.push(this.finalizeSection(currentSection));
        }
        

        currentSection = {
          type: 'heading',
          content: line,
          level: headingMatch.level,
          heading: headingMatch.text,
          semanticTags: this.identifySemanticTags(line),
          importance: this.calculateImportance(line)
        };
      } else {

        currentSection.content += line + '\n';
        

        const tags = this.identifySemanticTags(line);
        const importance = this.calculateImportance(line);
        
        currentSection.semanticTags = [...new Set([...currentSection.semanticTags, ...tags])];
        currentSection.importance = Math.max(currentSection.importance, importance);
      }
    }

    if (currentSection.content.trim()) {
      sections.push(this.finalizeSection(currentSection));
    }

    return sections;
  }

  
  async generateChunks(sections, metadata) {
    const chunks = [];
    let currentChunk = {
      content: '',
      sections: [],
      tokens: 0,
      metadata: {
        ...metadata,
        chunkIndex: 0,
        semanticTags: new Set(),
        importance: 0,
        codeBlocks: []
      }
    };

    for (const section of sections) {
      const sectionTokens = this.estimateTokens(section.content);
      

      if (currentChunk.tokens + sectionTokens > this.config.maxChunkTokens) {
        

        if (currentChunk.content.trim()) {
          chunks.push(this.finalizeChunk(currentChunk));
          

          currentChunk = this.createOverlappedChunk(currentChunk, section, metadata);
        }
      }
      

      currentChunk.content += section.content + '\n';
      currentChunk.sections.push(section);
      currentChunk.tokens += sectionTokens;
      

      section.semanticTags.forEach(tag => currentChunk.metadata.semanticTags.add(tag));
      currentChunk.metadata.importance = Math.max(currentChunk.metadata.importance, section.importance);
      

      if (section.type === 'code' && section.codeBlocks) {
        currentChunk.metadata.codeBlocks.push(...section.codeBlocks);
      }
    }

    if (currentChunk.content.trim()) {
      chunks.push(this.finalizeChunk(currentChunk));
    }

    return chunks;
  }

  
  createOverlappedChunk(previousChunk, nextSection, metadata) {
    const overlapContent = this.getOverlapContent(previousChunk.content, this.config.overlapTokens);
    
    return {
      content: overlapContent + '\n' + nextSection.content,
      sections: [nextSection],
      tokens: this.estimateTokens(overlapContent + nextSection.content),
      metadata: {
        ...metadata,
        chunkIndex: previousChunk.metadata.chunkIndex + 1,
        semanticTags: new Set(),
        importance: nextSection.importance,
        codeBlocks: [],
        hasOverlap: true,
        overlapTokens: this.estimateTokens(overlapContent)
      }
    };
  }

  
  postProcessChunks(chunks) {
    let processedChunks = [...chunks];

    if (this.config.enableDeduplication) {
      processedChunks = this.deduplicateChunks(processedChunks);
    }

    if (this.config.enableCompression) {
      processedChunks = this.compressChunks(processedChunks);
    }

    processedChunks = this.enhanceChunkMetadata(processedChunks);

    return processedChunks;
  }

  
  matchHeading(line) {
    const patterns = [
      { regex: /^(#{1,6})\s+(.+)$/, type: 'markdown' },
      { regex: /^([A-Z][^.]*\.)\s/, type: 'numbered' },
      { regex: /^([A-Z][^.]*:)\s/, type: 'colon' },
      { regex: /^(\d+\.\s)/, type: 'numbered' }
    ];

    for (const pattern of patterns) {
      const match = line.match(pattern.regex);
      if (match) {
        let level = 1;
        let text = match[2] || match[1];
        
        switch (pattern.type) {
          case 'markdown':
            level = match[1].length;
            text = match[2];
            break;
          case 'numbered':
            level = 1;
            text = match[1];
            break;
          case 'colon':
            level = 2;
            text = match[1];
            break;
        }
        
        return { level, text, type: pattern.type };
      }
    }

    return null;
  }

  
  identifySemanticTags(text) {
    const tags = [];
    const lowerText = text.toLowerCase();
    
    for (const [category, keywords] of this.semanticPatterns.entries()) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword)) {
          tags.push(category);
          break; // Only add each category once
        }
      }
    }
    
    return [...new Set(tags)];
  }

  
  calculateImportance(text) {
    if (!text) return 0;
    
    const lowerText = text.toLowerCase();
    let score = 0;
    

    for (const keyword of this.importanceKeywords) {
      if (lowerText.includes(keyword)) {
        score += 2;
      }
    }
    

    if (this.matchHeading(text)) {
      score += 3;
    }
    

    if (text.length > 100) {
      score += 1;
    }
    
    return score;
  }

  
  preserveCodeBlocks(text) {
    const codeBlockRegex = /```[\s\S]*?([\s\S]*?)```/g;
    const codeBlocks = [];
    let blockIndex = 0;
    
    const preserved = text.replace(codeBlockRegex, (match, code) => {
      const placeholder = `__CODE_BLOCK_${blockIndex}__`;
      codeBlocks.push({
        placeholder,
        code,
        language: this.extractCodeLanguage(match)
      });
      blockIndex++;
      return placeholder;
    });
    
    return { text: preserved, codeBlocks };
  }

  
  extractCodeLanguage(codeBlock) {
    const match = codeBlock.match(/```(\w+)?/);
    return match ? match[1] || 'text' : 'text';
  }

  
  normalizeHeadings(text) {

    return text
      .replace(/^([A-Z][^.]*\.)\s/gm, '## $1\n')
      .replace(/^([A-Z][^.]*:)\s/gm, '## $1\n')
      .replace(/^(\d+\.\s)/gm, '### $1');
  }

  
  preserveLists(text) {

    return text.replace(/^(\s*[-*+]\s)/gm, '\n• ');
  }

  
  getOverlapContent(content, overlapTokens) {
    if (overlapTokens <= 0) return '';
    
    const words = content.split(/\s+/);
    const overlapWords = Math.floor(overlapTokens * 0.75); // Approximate words per token
    

    const lastWords = words.slice(-overlapWords);
    return lastWords.join(' ');
  }

  
  deduplicateChunks(chunks) {
    const seen = new Set();
    const deduplicated = [];
    
    for (const chunk of chunks) {
      const hash = this.hashChunk(chunk);
      if (!seen.has(hash)) {
        seen.add(hash);
        deduplicated.push(chunk);
      }
    }
    
    return deduplicated;
  }

  
  compressChunks(chunks) {
    return chunks.map(chunk => ({
      ...chunk,
      compressed: this.compressText(chunk.content),
      originalSize: chunk.content.length,
      compressedSize: this.compressText(chunk.content).length
    }));
  }

  
  enhanceChunkMetadata(chunks) {
    return chunks.map((chunk, index) => ({
      ...chunk,
      metadata: {
        ...chunk.metadata,
        chunkIndex: index,
        totalChunks: chunks.length,
        position: index / chunks.length,
        hasCode: chunk.metadata.codeBlocks.length > 0,
        semanticDensity: this.calculateSemanticDensity(chunk),
        readabilityScore: this.calculateReadability(chunk.content)
      }
    }));
  }

  
  finalizeSection(section) {
    return {
      ...section,
      semanticTags: [...new Set(section.semanticTags)],
      wordCount: section.content.split(/\s+/).length,
      charCount: section.content.length
    };
  }

  
  finalizeChunk(chunk) {
    return {
      id: `chunk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: chunk.content.trim(),
      sections: chunk.sections,
      tokens: chunk.tokens,
      metadata: {
        ...chunk.metadata,
        semanticTags: [...chunk.metadata.semanticTags],
        createdAt: new Date().toISOString(),
        processedAt: new Date().toISOString()
      }
    };
  }

  
  hashChunk(chunk) {
    const content = chunk.content.toLowerCase().replace(/\s+/g, ' ').trim();
    return this.simpleHash(content);
  }

  
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  
  compressText(text) {

    return text.replace(/\s+/g, ' ').trim();
  }

  
  calculateSemanticDensity(chunk) {
    const totalWords = chunk.content.split(/\s+/).length;
    const semanticWords = chunk.metadata.semanticTags.length;
    return totalWords > 0 ? semanticWords / totalWords : 0;
  }

  
  calculateReadability(text) {
    if (!text) return 0;
    
    const sentences = text.split(/[.!?]+/).length;
    const words = text.split(/\s+/).length;
    const avgWordsPerSentence = words / sentences;
    

    return Math.max(0, Math.min(100, 100 - (avgWordsPerSentence - 15) * 2));
  }

  
  estimateTokens(text) {
    if (!text) return 0;
    

    return Math.ceil(text.length / 4);
  }

  
  getStats() {
    return {
      config: this.config,
      semanticPatterns: this.semanticPatterns.size,
      importanceKeywords: this.importanceKeywords.size,
      supportedFeatures: [
        'heading-aware chunking',
        'semantic grouping',
        'overlap chunking',
        'code block preservation',
        'importance scoring',
        'metadata enhancement',
        'deduplication',
        'compression'
      ]
    };
  }

  
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  
  reset() {
    this.headingLevels.clear();
    this.semanticPatterns.clear();
    this.importanceKeywords.clear();
    this.initializePatterns();
  }
}

export const chunkProcessor = new ChunkProcessor();

export const processContent = chunkProcessor.processContent.bind(chunkProcessor);
export const updateConfig = chunkProcessor.updateConfig.bind(chunkProcessor);
export const getStats = chunkProcessor.getStats.bind(chunkProcessor);
export const reset = chunkProcessor.reset.bind(chunkProcessor);

export default chunkProcessor;

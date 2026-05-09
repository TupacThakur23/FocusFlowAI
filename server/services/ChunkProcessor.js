/**
 * ChunkProcessor - Advanced Content Chunking for FocusFlow AI
 * 
 * Provides intelligent chunking strategies:
 * - Heading-aware semantic chunking
 * - Overlap chunking for context preservation
 * - Paragraph and code block preservation
 * - Metadata-aware chunk creation
 * - Token-efficient chunk sizing
 * - Source attribution and importance scoring
 */

class ChunkProcessor {
  constructor(options = {}) {
    this.config = {
      // Chunk sizing
      maxChunkTokens: options.maxChunkTokens || 800,
      minChunkTokens: options.minChunkTokens || 200,
      overlapTokens: options.overlapTokens || 100,
      
      // Content analysis
      preserveHeadings: options.preserveHeadings !== false,
      preserveCodeBlocks: options.preserveCodeBlocks !== false,
      preserveLists: options.preserveLists !== false,
      
      // Semantic analysis
      enableSemanticGrouping: options.enableSemanticGrouping !== false,
      enableImportanceScoring: options.enableImportanceScoring !== false,
      
      // Metadata
      includeSourceMetadata: options.includeSourceMetadata !== false,
      includeTimestamps: options.includeTimestamps !== false,
      
      // Processing
      enableDeduplication: options.enableDeduplication !== false,
      enableCompression: options.enableCompression !== false
    };

    this.headingLevels = new Map();
    this.semanticPatterns = new Map();
    this.importanceKeywords = new Set();
    
    this.initializePatterns();
  }

  /**
   * Initialize semantic patterns and importance keywords
   */
  initializePatterns() {
    // Semantic patterns for intelligent chunking
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

    // Importance keywords for scoring
    this.importanceKeywords = new Set([
      'important', 'critical', 'essential', 'key', 'main', 'primary',
      'significant', 'crucial', 'fundamental', 'core', 'central',
      'conclusion', 'summary', 'finding', 'result', 'outcome'
    ]);
  }

  /**
   * Process content into intelligent chunks
   * @param {Object} content - Content object with text and metadata
   * @returns {Array} Array of processed chunks
   */
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
      // Pre-process content
      const processedText = this.preprocessText(text);
      
      // Extract semantic sections
      const semanticSections = this.extractSemanticSections(processedText, headings);
      
      // Generate chunks
      const chunks = await this.generateChunks(semanticSections, {
        url,
        title,
        workbookId,
        timestamp,
        headings,
        codeBlocks,
        metadata
      });

      // Post-process chunks
      const finalChunks = this.postProcessChunks(chunks);
      
      return finalChunks;
    } catch (error) {
      console.error('Chunk processing failed:', error);
      throw new Error(`Chunk processing failed: ${error.message}`);
    }
  }

  /**
   * Pre-process text for better chunking
   * @param {string} text - Raw text content
   * @returns {string} Pre-processed text
   */
  preprocessText(text) {
    if (!text || typeof text !== 'string') {
      return '';
    }

    let processed = text;

    // Normalize whitespace
    processed = processed.replace(/\s+/g, ' ').trim();
    
    // Preserve code blocks
    if (this.config.preserveCodeBlocks) {
      processed = this.preserveCodeBlocks(processed);
    }
    
    // Normalize headings
    if (this.config.preserveHeadings) {
      processed = this.normalizeHeadings(processed);
    }
    
    // Preserve lists
    if (this.config.preserveLists) {
      processed = this.preserveLists(processed);
    }

    return processed;
  }

  /**
   * Extract semantic sections from content
   * @param {string} text - Processed text
   * @param {Array} headings - Extracted headings
   * @returns {Array} Semantic sections
   */
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
      
      // Check for headings
      const headingMatch = this.matchHeading(line);
      if (headingMatch) {
        // Save previous section
        if (currentSection.content.trim()) {
          sections.push(this.finalizeSection(currentSection));
        }
        
        // Start new section
        currentSection = {
          type: 'heading',
          content: line,
          level: headingMatch.level,
          heading: headingMatch.text,
          semanticTags: this.identifySemanticTags(line),
          importance: this.calculateImportance(line)
        };
      } else {
        // Add to current section
        currentSection.content += line + '\n';
        
        // Update semantic tags and importance
        const tags = this.identifySemanticTags(line);
        const importance = this.calculateImportance(line);
        
        currentSection.semanticTags = [...new Set([...currentSection.semanticTags, ...tags])];
        currentSection.importance = Math.max(currentSection.importance, importance);
      }
    }

    // Add final section
    if (currentSection.content.trim()) {
      sections.push(this.finalizeSection(currentSection));
    }

    return sections;
  }

  /**
   * Generate chunks from semantic sections
   * @param {Array} sections - Semantic sections
   * @param {Object} metadata - Content metadata
   * @returns {Array} Generated chunks
   */
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
      
      // Check if adding section exceeds chunk size
      if (currentChunk.tokens + sectionTokens > this.config.maxChunkTokens) {
        
        // Finalize current chunk if it has content
        if (currentChunk.content.trim()) {
          chunks.push(this.finalizeChunk(currentChunk));
          
          // Create new chunk with overlap
          currentChunk = this.createOverlappedChunk(currentChunk, section, metadata);
        }
      }
      
      // Add section to current chunk
      currentChunk.content += section.content + '\n';
      currentChunk.sections.push(section);
      currentChunk.tokens += sectionTokens;
      
      // Update chunk metadata
      section.semanticTags.forEach(tag => currentChunk.metadata.semanticTags.add(tag));
      currentChunk.metadata.importance = Math.max(currentChunk.metadata.importance, section.importance);
      
      // Add code blocks if present
      if (section.type === 'code' && section.codeBlocks) {
        currentChunk.metadata.codeBlocks.push(...section.codeBlocks);
      }
    }

    // Add final chunk
    if (currentChunk.content.trim()) {
      chunks.push(this.finalizeChunk(currentChunk));
    }

    return chunks;
  }

  /**
   * Create overlapped chunk for context continuity
   * @param {Object} previousChunk - Previous chunk
   * @param {Object} nextSection - Next section
   * @param {Object} metadata - Content metadata
   * @returns {Object} Overlapped chunk
   */
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

  /**
   * Post-process chunks for optimization
   * @param {Array} chunks - Generated chunks
   * @returns {Array} Processed chunks
   */
  postProcessChunks(chunks) {
    let processedChunks = [...chunks];

    // Remove duplicates if enabled
    if (this.config.enableDeduplication) {
      processedChunks = this.deduplicateChunks(processedChunks);
    }

    // Compress chunks if enabled
    if (this.config.enableCompression) {
      processedChunks = this.compressChunks(processedChunks);
    }

    // Add additional metadata
    processedChunks = this.enhanceChunkMetadata(processedChunks);

    return processedChunks;
  }

  /**
   * Match heading pattern
   * @param {string} line - Text line
   * @returns {Object|null} Heading match or null
   */
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

  /**
   * Identify semantic tags for text
   * @param {string} text - Text to analyze
   * @returns {Array} Semantic tags
   */
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

  /**
   * Calculate importance score for text
   * @param {string} text - Text to score
   * @returns {number} Importance score
   */
  calculateImportance(text) {
    if (!text) return 0;
    
    const lowerText = text.toLowerCase();
    let score = 0;
    
    // Check for importance keywords
    for (const keyword of this.importanceKeywords) {
      if (lowerText.includes(keyword)) {
        score += 2;
      }
    }
    
    // Boost score for headings
    if (this.matchHeading(text)) {
      score += 3;
    }
    
    // Boost score for longer content (likely more important)
    if (text.length > 100) {
      score += 1;
    }
    
    return score;
  }

  /**
   * Preserve code blocks in text
   * @param {string} text - Text with code blocks
   * @returns {string} Text with preserved code blocks
   */
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

  /**
   * Extract code language from code block
   * @param {string} codeBlock - Code block match
   * @returns {string} Language identifier
   */
  extractCodeLanguage(codeBlock) {
    const match = codeBlock.match(/```(\w+)?/);
    return match ? match[1] || 'text' : 'text';
  }

  /**
   * Normalize headings in text
   * @param {string} text - Text with headings
   * @returns {string} Normalized text
   */
  normalizeHeadings(text) {
    // Convert various heading formats to markdown
    return text
      .replace(/^([A-Z][^.]*\.)\s/gm, '## $1\n')
      .replace(/^([A-Z][^.]*:)\s/gm, '## $1\n')
      .replace(/^(\d+\.\s)/gm, '### $1');
  }

  /**
   * Preserve lists in text
   * @param {string} text - Text with lists
   * @returns {string} Text with preserved lists
   */
  preserveLists(text) {
    // Ensure list items are properly formatted
    return text.replace(/^(\s*[-*+]\s)/gm, '\n• ');
  }

  /**
   * Get overlap content for continuity
   * @param {string} content - Previous content
   * @param {number} overlapTokens - Number of tokens to overlap
   * @returns {string} Overlap content
   */
  getOverlapContent(content, overlapTokens) {
    if (overlapTokens <= 0) return '';
    
    const words = content.split(/\s+/);
    const overlapWords = Math.floor(overlapTokens * 0.75); // Approximate words per token
    
    // Get last N words from content
    const lastWords = words.slice(-overlapWords);
    return lastWords.join(' ');
  }

  /**
   * Deduplicate chunks
   * @param {Array} chunks - Chunks to deduplicate
   * @returns {Array} Deduplicated chunks
   */
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

  /**
   * Compress chunks for efficiency
   * @param {Array} chunks - Chunks to compress
   * @returns {Array} Compressed chunks
   */
  compressChunks(chunks) {
    return chunks.map(chunk => ({
      ...chunk,
      compressed: this.compressText(chunk.content),
      originalSize: chunk.content.length,
      compressedSize: this.compressText(chunk.content).length
    }));
  }

  /**
   * Enhance chunk metadata
   * @param {Array} chunks - Chunks to enhance
   * @returns {Array} Enhanced chunks
   */
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

  /**
   * Finalize section object
   * @param {Object} section - Section to finalize
   * @returns {Object} Finalized section
   */
  finalizeSection(section) {
    return {
      ...section,
      semanticTags: [...new Set(section.semanticTags)],
      wordCount: section.content.split(/\s+/).length,
      charCount: section.content.length
    };
  }

  /**
   * Finalize chunk object
   * @param {Object} chunk - Chunk to finalize
   * @returns {Object} Finalized chunk
   */
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

  /**
   * Hash chunk for deduplication
   * @param {Object} chunk - Chunk to hash
   * @returns {string} Hash string
   */
  hashChunk(chunk) {
    const content = chunk.content.toLowerCase().replace(/\s+/g, ' ').trim();
    return this.simpleHash(content);
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
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  /**
   * Compress text (simple implementation)
   * @param {string} text - Text to compress
   * @returns {string} Compressed text
   */
  compressText(text) {
    // Simple compression - in production, use proper compression
    return text.replace(/\s+/g, ' ').trim();
  }

  /**
   * Calculate semantic density
   * @param {Object} chunk - Chunk to analyze
   * @returns {number} Semantic density score
   */
  calculateSemanticDensity(chunk) {
    const totalWords = chunk.content.split(/\s+/).length;
    const semanticWords = chunk.metadata.semanticTags.length;
    return totalWords > 0 ? semanticWords / totalWords : 0;
  }

  /**
   * Calculate readability score
   * @param {string} text - Text to analyze
   * @returns {number} Readability score
   */
  calculateReadability(text) {
    if (!text) return 0;
    
    const sentences = text.split(/[.!?]+/).length;
    const words = text.split(/\s+/).length;
    const avgWordsPerSentence = words / sentences;
    
    // Simple readability score based on average sentence length
    return Math.max(0, Math.min(100, 100 - (avgWordsPerSentence - 15) * 2));
  }

  /**
   * Estimate token count
   * @param {string} text - Text to estimate
   * @returns {number} Estimated token count
   */
  estimateTokens(text) {
    if (!text) return 0;
    
    // Simple estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  /**
   * Get processing statistics
   * @returns {Object} Processing statistics
   */
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

  /**
   * Update configuration
   * @param {Object} newConfig - New configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Reset processor state
   */
  reset() {
    this.headingLevels.clear();
    this.semanticPatterns.clear();
    this.importanceKeywords.clear();
    this.initializePatterns();
  }
}

// Export singleton instance
export const chunkProcessor = new ChunkProcessor();

// Export utilities
export const processContent = chunkProcessor.processContent.bind(chunkProcessor);
export const updateConfig = chunkProcessor.updateConfig.bind(chunkProcessor);
export const getStats = chunkProcessor.getStats.bind(chunkProcessor);
export const reset = chunkProcessor.reset.bind(chunkProcessor);

export default chunkProcessor;

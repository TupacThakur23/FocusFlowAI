/**
 * RetrievalEngine - Advanced Semantic Retrieval for FocusFlow AI
 * 
 * Provides intelligent retrieval capabilities:
 * - Cross-workbook semantic search
 * - Metadata-aware filtering
 * - Source-aware retrieval
 * - Retrieval ranking pipeline
 * - Grouped evidence retrieval
 * - Semantic clustering
 * - Duplicate chunk removal
 */

class RetrievalEngine {
  constructor(options = {}) {
    this.config = {
      // Retrieval parameters
      topK: options.topK || 10,
      similarityThreshold: options.similarityThreshold || 0.3,
      maxContextTokens: options.maxContextTokens || 4000,
      enableClustering: options.enableClustering !== false,
      enableDeduplication: options.enableDeduplication !== false,
      
      // Scoring weights
      weights: {
        semanticSimilarity: options.weights?.semanticSimilarity || 0.4,
        recency: options.weights?.recency || 0.2,
        workbookRelevance: options.weights?.workbookRelevance || 0.2,
        userInteraction: options.weights?.userInteraction || 0.1,
        sourceQuality: options.weights?.sourceQuality || 0.1
      },
      
      // Performance
      enableCaching: options.enableCaching !== false,
      cacheTimeout: options.cacheTimeout || 300000, // 5 minutes
      maxRetrievalTime: options.maxRetrievalTime || 5000 // 5 seconds
    };

    this.cache = new Map();
    this.embeddings = new Map();
    this.metadata = new Map();
    this.userInteractions = new Map();
    
    this.retrievalStats = {
      totalQueries: 0,
      cacheHits: 0,
      avgRetrievalTime: 0,
      avgResultsCount: 0
    };
  }

  /**
   * Initialize retrieval engine with data
   * @param {Array} chunks - Processed chunks
   * @param {Array} workbooks - Workbook metadata
   * @param {Array} userHistory - User interaction history
   */
  async initialize(chunks, workbooks, userHistory) {
    try {
      console.log('Initializing retrieval engine...');
      const startTime = Date.now();
      
      // Store metadata
      this.storeMetadata(chunks, workbooks);
      
      // Process user interactions
      this.processUserInteractions(userHistory);
      
      // Generate embeddings for chunks
      await this.generateEmbeddings(chunks);
      
      const initTime = Date.now() - startTime;
      console.log(`Retrieval engine initialized in ${initTime}ms with ${chunks.length} chunks`);
      
      return {
        success: true,
        chunksProcessed: chunks.length,
        embeddingsGenerated: this.embeddings.size,
        initializationTime: initTime
      };
    } catch (error) {
      console.error('Retrieval engine initialization failed:', error);
      throw new Error(`Initialization failed: ${error.message}`);
    }
  }

  /**
   * Perform semantic retrieval
   * @param {string} query - Search query
   * @param {Object} options - Retrieval options
   * @returns {Object} Retrieval results
   */
  async retrieve(query, options = {}) {
    const startTime = Date.now();
    this.retrievalStats.totalQueries++;
    
    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(query, options);
      if (this.config.enableCaching && this.cache.has(cacheKey)) {
        this.retrievalStats.cacheHits++;
        const cached = this.cache.get(cacheKey);
        return {
          ...cached,
          fromCache: true,
          retrievalTime: Date.now() - startTime
        };
      }

      // Generate query embedding
      const queryEmbedding = await this.generateQueryEmbedding(query);
      
      // Perform similarity search
      const candidates = await this.findSimilarChunks(queryEmbedding, options);
      
      // Apply filters
      const filtered = this.applyFilters(candidates, options);
      
      // Score and rank results
      const scored = this.scoreResults(filtered, query, options);
      
      // Remove duplicates
      const deduplicated = this.removeDuplicates(scored);
      
      // Group related results
      const grouped = this.groupRelatedResults(deduplicated);
      
      // Build context
      const context = this.buildContext(grouped, options);
      
      const results = {
        query,
        chunks: grouped,
        context,
        metadata: {
          totalCandidates: candidates.length,
          filteredCount: filtered.length,
          deduplicatedCount: deduplicated.length,
          groupedCount: grouped.length,
          contextTokens: this.estimateTokens(context),
          retrievalTime: Date.now() - startTime,
          fromCache: false
        }
      };

      // Cache results
      if (this.config.enableCaching) {
        this.cache.set(cacheKey, {
          ...results,
          cachedAt: Date.now()
        });
      }

      // Update stats
      this.updateRetrievalStats(results);
      
      return results;
      
    } catch (error) {
      console.error('Retrieval failed:', error);
      throw new Error(`Retrieval failed: ${error.message}`);
    }
  }

  /**
   * Store metadata for chunks and workbooks
   * @param {Array} chunks - Processed chunks
   * @param {Array} workbooks - Workbook metadata
   */
  storeMetadata(chunks, workbooks) {
    // Store chunk metadata
    chunks.forEach(chunk => {
      this.metadata.set(chunk.id, {
        ...chunk.metadata,
        embeddingId: chunk.id,
        storedAt: Date.now()
      });
    });

    // Store workbook metadata
    workbooks.forEach(workbook => {
      this.metadata.set(`workbook_${workbook.id}`, {
        type: 'workbook',
        ...workbook,
        storedAt: Date.now()
      });
    });
  }

  /**
   * Process user interaction history
   * @param {Array} userHistory - User interaction data
   */
  processUserInteractions(userHistory) {
    const interactions = new Map();
    
    userHistory.forEach(interaction => {
      const { chunkId, type, timestamp, relevance } = interaction;
      
      if (!interactions.has(chunkId)) {
        interactions.set(chunkId, {
          views: 0,
          selections: 0,
          copies: 0,
          lastInteraction: timestamp,
          relevanceScore: 0
        });
      }
      
      const chunkInteractions = interactions.get(chunkId);
      chunkInteractions.lastInteraction = Math.max(chunkInteractions.lastInteraction, timestamp);
      chunkInteractions.relevanceScore = Math.max(chunkInteractions.relevanceScore, relevance || 0);
      
      switch (type) {
        case 'view':
          chunkInteractions.views++;
          break;
        case 'select':
          chunkInteractions.selections++;
          break;
        case 'copy':
          chunkInteractions.copies++;
          break;
      }
    });
    
    this.userInteractions = interactions;
  }

  /**
   * Generate embeddings for chunks
   * @param {Array} chunks - Chunks to embed
   */
  async generateEmbeddings(chunks) {
    console.log(`Generating embeddings for ${chunks.length} chunks...`);
    
    for (const chunk of chunks) {
      try {
        // In production, this would call actual embedding service
        const embedding = await this.mockEmbeddingGeneration(chunk.content);
        this.embeddings.set(chunk.id, embedding);
      } catch (error) {
        console.error(`Failed to generate embedding for chunk ${chunk.id}:`, error);
      }
    }
  }

  /**
   * Generate query embedding
   * @param {string} query - Search query
   * @returns {Array} Query embedding
   */
  async generateQueryEmbedding(query) {
    try {
      // In production, this would call actual embedding service
      return await this.mockEmbeddingGeneration(query);
    } catch (error) {
      console.error('Failed to generate query embedding:', error);
      throw new Error(`Query embedding generation failed: ${error.message}`);
    }
  }

  /**
   * Find similar chunks using cosine similarity
   * @param {Array} queryEmbedding - Query embedding
   * @param {Object} options - Search options
   * @returns {Array} Similar chunks
   */
  async findSimilarChunks(queryEmbedding, options) {
    const similarities = [];
    const workbookFilter = options.workbookIds;
    const sourceFilter = options.sourceUrls;
    
    for (const [chunkId, embedding] of this.embeddings.entries()) {
      const metadata = this.metadata.get(chunkId);
      if (!metadata) continue;
      
      // Apply filters
      if (workbookFilter && metadata.workbookId && !workbookFilter.includes(metadata.workbookId)) {
        continue;
      }
      
      if (sourceFilter && metadata.url && !sourceFilter.includes(metadata.url)) {
        continue;
      }
      
      // Calculate cosine similarity
      const similarity = this.cosineSimilarity(queryEmbedding, embedding);
      
      if (similarity >= this.config.similarityThreshold) {
        similarities.push({
          chunkId,
          similarity,
          metadata
        });
      }
    }
    
    // Sort by similarity
    return similarities.sort((a, b) => b.similarity - a.similarity);
  }

  /**
   * Apply additional filters to candidates
   * @param {Array} candidates - Candidate chunks
   * @param {Object} options - Filter options
   * @returns {Array} Filtered candidates
   */
  applyFilters(candidates, options) {
    let filtered = [...candidates];
    
    // Date range filter
    if (options.dateRange) {
      const { start, end } = options.dateRange;
      filtered = filtered.filter(candidate => {
        const timestamp = candidate.metadata.timestamp || candidate.metadata.createdAt;
        return timestamp >= start && timestamp <= end;
      });
    }
    
    // Semantic tags filter
    if (options.semanticTags && options.semanticTags.length > 0) {
      filtered = filtered.filter(candidate => {
        const tags = candidate.metadata.semanticTags || [];
        return options.semanticTags.some(tag => tags.includes(tag));
      });
    }
    
    // Importance score filter
    if (options.minImportance) {
      filtered = filtered.filter(candidate => 
        (candidate.metadata.importance || 0) >= options.minImportance
      );
    }
    
    // Code block filter
    if (options.hasCode !== undefined) {
      filtered = filtered.filter(candidate => 
        (candidate.metadata.hasCode || false) === options.hasCode
      );
    }
    
    return filtered;
  }

  /**
   * Score and rank retrieval results
   * @param {Array} results - Filtered results
   * @param {string} query - Original query
   * @param {Object} options - Scoring options
   * @returns {Array} Scored results
   */
  scoreResults(results, query, options) {
    const weights = this.config.weights;
    const now = Date.now();
    
    return results.map(result => {
      const metadata = result.metadata;
      let score = 0;
      
      // Semantic similarity score
      const semanticScore = result.similarity * weights.semanticSimilarity;
      score += semanticScore;
      
      // Recency score (more recent = higher score)
      const timestamp = metadata.timestamp || metadata.createdAt || 0;
      const daysSinceCreation = (now - timestamp) / (1000 * 60 * 60 * 24);
      const recencyScore = Math.max(0, 1 - daysSinceCreation / 365) * weights.recency;
      score += recencyScore;
      
      // Workbook relevance score
      const workbookRelevance = this.calculateWorkbookRelevance(metadata, options);
      score += workbookRelevance * weights.workbookRelevance;
      
      // User interaction score
      const interactionScore = this.calculateInteractionScore(result.chunkId);
      score += interactionScore * weights.userInteraction;
      
      // Source quality score
      const sourceQuality = this.calculateSourceQuality(metadata);
      score += sourceQuality * weights.sourceQuality;
      
      return {
        ...result,
        totalScore: score,
        scoreBreakdown: {
          semantic: semanticScore,
          recency: recencyScore,
          workbook: workbookRelevance,
          interaction: interactionScore,
          source: sourceQuality
        }
      };
    }).sort((a, b) => b.totalScore - a.totalScore);
  }

  /**
   * Remove duplicate chunks
   * @param {Array} results - Scored results
   * @returns {Array} Deduplicated results
   */
  removeDuplicates(results) {
    if (!this.config.enableDeduplication) return results;
    
    const seen = new Set();
    const deduplicated = [];
    
    for (const result of results) {
      const key = this.generateDeduplicationKey(result);
      if (!seen.has(key)) {
        seen.add(key);
        deduplicated.push(result);
      }
    }
    
    return deduplicated;
  }

  /**
   * Group related results
   * @param {Array} results - Deduplicated results
   * @returns {Array} Grouped results
   */
  groupRelatedResults(results) {
    if (!this.config.enableClustering) return results;
    
    const groups = [];
    const used = new Set();
    
    for (let i = 0; i < results.length && groups.length < this.config.topK; i++) {
      const result = results[i];
      if (used.has(result.chunkId)) continue;
      
      const group = [result];
      used.add(result.chunkId);
      
      // Find related chunks
      for (let j = i + 1; j < results.length; j++) {
        const candidate = results[j];
        if (used.has(candidate.chunkId)) continue;
        
        if (this.areChunksRelated(result, candidate)) {
          group.push(candidate);
          used.add(candidate.chunkId);
        }
      }
      
      groups.push({
        id: `group_${groups.length}`,
        chunks: group,
        relevance: Math.max(...group.map(c => c.totalScore)),
        diversity: this.calculateGroupDiversity(group)
      });
    }
    
    return groups;
  }

  /**
   * Build context from grouped results
   * @param {Array} groups - Grouped results
   * @param {Object} options - Context building options
   * @returns {string} Formatted context
   */
  buildContext(groups, options) {
    const maxTokens = options.maxContextTokens || this.config.maxContextTokens;
    let context = '';
    let usedTokens = 0;
    
    // Add context header
    context += `Query Context for: "${options.query || 'retrieval'}"\n\n`;
    
    for (const group of groups) {
      if (usedTokens >= maxTokens) break;
      
      context += `## Source Group ${group.id} (Relevance: ${group.relevance.toFixed(3)})\n\n`;
      
      for (const chunk of group.chunks) {
        const chunkTokens = this.estimateTokens(chunk.metadata.content || '');
        
        if (usedTokens + chunkTokens > maxTokens) {
          context += `[Content truncated due to token limit]\n\n`;
          break;
        }
        
        context += `**Source:** ${chunk.metadata.url || 'Unknown'}\n`;
        context += `**Workbook:** ${chunk.metadata.workbookTitle || 'Unknown'}\n`;
        context += `**Relevance:** ${chunk.totalScore.toFixed(3)}\n\n`;
        context += `${chunk.metadata.content}\n\n`;
        
        usedTokens += chunkTokens;
      }
    }
    
    return context;
  }

  /**
   * Calculate cosine similarity between embeddings
   * @param {Array} embedding1 - First embedding
   * @param {Array} embedding2 - Second embedding
   * @returns {number} Cosine similarity
   */
  cosineSimilarity(embedding1, embedding2) {
    if (!embedding1 || !embedding2 || embedding1.length !== embedding2.length) {
      return 0;
    }
    
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }
    
    norm1 = Math.sqrt(norm1);
    norm2 = Math.sqrt(norm2);
    
    if (norm1 === 0 || norm2 === 0) return 0;
    
    return dotProduct / (norm1 * norm2);
  }

  /**
   * Calculate workbook relevance score
   * @param {Object} metadata - Chunk metadata
   * @param {Object} options - Retrieval options
   * @returns {number} Workbook relevance score
   */
  calculateWorkbookRelevance(metadata, options) {
    const activeWorkbooks = options.activeWorkbooks || [];
    const currentWorkbook = options.currentWorkbook;
    
    let score = 0.5; // Base score
    
    // Boost for active workbooks
    if (activeWorkbooks.includes(metadata.workbookId)) {
      score += 0.3;
    }
    
    // Boost for current workbook
    if (currentWorkbook && metadata.workbookId === currentWorkbook) {
      score += 0.2;
    }
    
    return Math.min(1, score);
  }

  /**
   * Calculate user interaction score
   * @param {string} chunkId - Chunk ID
   * @returns {number} Interaction score
   */
  calculateInteractionScore(chunkId) {
    const interactions = this.userInteractions.get(chunkId);
    if (!interactions) return 0;
    
    // Calculate interaction frequency and recency
    const totalInteractions = interactions.views + interactions.selections + interactions.copies;
    const daysSinceLastInteraction = (Date.now() - interactions.lastInteraction) / (1000 * 60 * 60 * 24);
    
    // Frequency score (normalized)
    const frequencyScore = Math.min(1, totalInteractions / 10);
    
    // Recency score (more recent = higher)
    const recencyScore = Math.max(0, 1 - daysSinceLastInteraction / 30);
    
    // Combine scores
    return (frequencyScore * 0.7) + (recencyScore * 0.3);
  }

  /**
   * Calculate source quality score
   * @param {Object} metadata - Chunk metadata
   * @returns {number} Source quality score
   */
  calculateSourceQuality(metadata) {
    let score = 0.5; // Base score
    
    // Boost for reputable domains
    if (metadata.url) {
      const domain = new URL(metadata.url).hostname;
      const reputableDomains = ['edu', 'gov', 'org', 'wikipedia.org', 'arxiv.org'];
      
      if (reputableDomains.some(rep => domain.includes(rep))) {
        score += 0.3;
      }
    }
    
    // Boost for recent content
    const timestamp = metadata.timestamp || metadata.createdAt || 0;
    const daysSinceCreation = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
    if (daysSinceCreation < 30) {
      score += 0.2;
    }
    
    return Math.min(1, score);
  }

  /**
   * Check if two chunks are related
   * @param {Object} chunk1 - First chunk
   * @param {Object} chunk2 - Second chunk
   * @returns {boolean} Whether chunks are related
   */
  areChunksRelated(chunk1, chunk2) {
    const metadata1 = chunk1.metadata;
    const metadata2 = chunk2.metadata;
    
    // Same source
    if (metadata1.url === metadata2.url) return true;
    
    // Same workbook
    if (metadata1.workbookId === metadata2.workbookId) return true;
    
    // Semantic tag overlap
    const tags1 = new Set(metadata1.semanticTags || []);
    const tags2 = new Set(metadata2.semanticTags || []);
    const intersection = new Set([...tags1].filter(tag => tags2.has(tag)));
    
    if (intersection.size > 0 && intersection.size / Math.min(tags1.size, tags2.size) > 0.3) {
      return true;
    }
    
    return false;
  }

  /**
   * Calculate group diversity
   * @param {Array} group - Group of chunks
   * @returns {number} Diversity score
   */
  calculateGroupDiversity(group) {
    if (group.length <= 1) return 0;
    
    const allSources = new Set();
    const allWorkbooks = new Set();
    const allTags = new Set();
    
    group.forEach(chunk => {
      if (chunk.metadata.url) allSources.add(chunk.metadata.url);
      if (chunk.metadata.workbookId) allWorkbooks.add(chunk.metadata.workbookId);
      (chunk.metadata.semanticTags || []).forEach(tag => allTags.add(tag));
    });
    
    // Calculate diversity metrics
    const sourceDiversity = allSources.size / group.length;
    const workbookDiversity = allWorkbooks.size / group.length;
    const tagDiversity = allTags.size / group.reduce((sum, chunk) => 
      sum + (chunk.metadata.semanticTags || []).length, 0);
    
    return (sourceDiversity + workbookDiversity + tagDiversity) / 3;
  }

  /**
   * Generate cache key for query
   * @param {string} query - Search query
   * @param {Object} options - Retrieval options
   * @returns {string} Cache key
   */
  generateCacheKey(query, options) {
    const optionsStr = JSON.stringify(options);
    return `${query}:${this.simpleHash(optionsStr)}`;
  }

  /**
   * Generate deduplication key
   * @param {Object} result - Retrieval result
   * @returns {string} Deduplication key
   */
  generateDeduplicationKey(result) {
    const content = (result.metadata.content || '').substring(0, 100);
    return `${result.metadata.url}:${this.simpleHash(content)}`;
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
   * Estimate token count
   * @param {string} text - Text to estimate
   * @returns {number} Estimated token count
   */
  estimateTokens(text) {
    if (!text) return 0;
    return Math.ceil(text.length / 4);
  }

  /**
   * Mock embedding generation (replace with actual service)
   * @param {string} text - Text to embed
   * @returns {Array} Mock embedding
   */
  async mockEmbeddingGeneration(text) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Generate mock embedding (simplified)
    const embedding = [];
    const words = text.toLowerCase().split(/\s+/);
    
    for (let i = 0; i < 384; i++) { // Standard embedding size
      const wordIndex = i % words.length;
      const word = words[wordIndex] || '';
      embedding.push(
        (word.charCodeAt(0) || 0) * Math.sin(i * 0.1) +
        (word.charCodeAt(1) || 0) * Math.cos(i * 0.1) +
        (word.charCodeAt(2) || 0) * Math.sin(i * 0.2)
      );
    }
    
    // Normalize embedding
    const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / norm);
  }

  /**
   * Clean expired cache entries
   */
  cleanCache() {
    const now = Date.now();
    const expiredKeys = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.cachedAt > this.config.cacheTimeout) {
        expiredKeys.push(key);
      }
    }
    
    expiredKeys.forEach(key => this.cache.delete(key));
  }

  /**
   * Get retrieval statistics
   * @returns {Object} Statistics
   */
  getStats() {
    return {
      ...this.retrievalStats,
      cacheHitRate: this.retrievalStats.totalQueries > 0 
        ? (this.retrievalStats.cacheHits / this.retrievalStats.totalQueries * 100).toFixed(2) + '%'
        : '0%',
      cacheSize: this.cache.size,
      embeddingsCount: this.embeddings.size,
      metadataCount: this.metadata.size,
      avgRetrievalTime: this.retrievalStats.avgRetrievalTime.toFixed(2) + 'ms',
      avgResultsCount: this.retrievalStats.avgResultsCount.toFixed(1)
    };
  }

  /**
   * Update retrieval statistics
   * @param {Object} results - Retrieval results
   */
  updateRetrievalStats(results) {
    this.retrievalStats.avgRetrievalTime = 
      (this.retrievalStats.avgRetrievalTime * (this.retrievalStats.totalQueries - 1) + results.metadata.retrievalTime) 
      / this.retrievalStats.totalQueries;
    
    this.retrievalStats.avgResultsCount = 
      (this.retrievalStats.avgResultsCount * (this.retrievalStats.totalQueries - 1) + results.groupedCount) 
      / this.retrievalStats.totalQueries;
  }

  /**
   * Reset retrieval engine
   */
  reset() {
    this.cache.clear();
    this.embeddings.clear();
    this.metadata.clear();
    this.userInteractions.clear();
    
    this.retrievalStats = {
      totalQueries: 0,
      cacheHits: 0,
      avgRetrievalTime: 0,
      avgResultsCount: 0
    };
  }
}

// Export singleton instance
export const retrievalEngine = new RetrievalEngine();

// Export utilities
export const initialize = retrievalEngine.initialize.bind(retrievalEngine);
export const retrieve = retrievalEngine.retrieve.bind(retrievalEngine);
export const getStats = retrievalEngine.getStats.bind(retrievalEngine);
export const cleanCache = retrievalEngine.cleanCache.bind(retrievalEngine);
export const reset = retrievalEngine.reset.bind(retrievalEngine);

export default retrievalEngine;

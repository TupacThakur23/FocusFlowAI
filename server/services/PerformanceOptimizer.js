/**
 * PerformanceOptimizer - Retrieval Speed and Cost Optimization for FocusFlow AI
 * 
 * Provides optimization features:
 * - Retrieval speed optimization
 * - Embedding reuse and caching
 * - Chunk deduplication
 * - Prompt token usage optimization
 * - Retrieval caching
 * - Grouped embedding retrieval
 * - Cost tracking and analysis
 */

class PerformanceOptimizer {
  constructor(options = {}) {
    this.config = {
      // Caching settings
      enableEmbeddingCache: options.enableEmbeddingCache !== false,
      enableRetrievalCache: options.enableRetrievalCache !== false,
      enableChunkCache: options.enableChunkCache !== false,
      embeddingCacheTimeout: options.embeddingCacheTimeout || 3600000, // 1 hour
      retrievalCacheTimeout: options.retrievalCacheTimeout || 300000, // 5 minutes
      chunkCacheTimeout: options.chunkCacheTimeout || 1800000, // 30 minutes
      
      // Performance settings
      enableBatchEmbedding: options.enableBatchEmbedding !== false,
      batchSize: options.batchSize || 50,
      enableParallelProcessing: options.enableParallelProcessing !== false,
      maxConcurrentRequests: options.maxConcurrentRequests || 5,
      
      // Token optimization
      enableTokenOptimization: options.enableTokenOptimization !== false,
      maxContextTokens: options.maxContextTokens || 4000,
      compressionRatio: options.compressionRatio || 0.8,
      enableSmartTruncation: options.enableSmartTruncation !== false,
      
      // Cost tracking
      enableCostTracking: options.enableCostTracking !== false,
      costPerToken: options.costPerToken || 0.00002, // $0.02 per 1K tokens
      costPerEmbedding: options.costPerEmbedding || 0.0001, // $0.10 per 1K embeddings
      
      // Performance monitoring
      enablePerformanceMonitoring: options.enablePerformanceMonitoring !== false,
      performanceHistorySize: options.performanceHistorySize || 1000,
      enableAlerts: options.enableAlerts !== false
    };

    // Caching systems
    this.embeddingCache = new Map();
    this.retrievalCache = new Map();
    this.chunkCache = new Map();
    this.batchQueue = [];
    this.processingBatches = new Set();
    
    // Performance tracking
    this.performanceMetrics = {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageResponseTime: 0,
      totalTokens: 0,
      totalCost: 0,
      embeddingsGenerated: 0,
      chunksDeduplicated: 0
    };
    
    this.performanceHistory = [];
    this.costTracker = new Map();
    
    this.initializeOptimizations();
  }

  /**
   * Initialize optimization systems
   */
  initializeOptimizations() {
    // Setup cache cleanup
    setInterval(() => {
      this.cleanExpiredCaches();
    }, 60000); // Every minute

    // Setup performance monitoring
    if (this.config.enablePerformanceMonitoring) {
      this.setupPerformanceMonitoring();
    }

    // Setup cost tracking
    if (this.config.enableCostTracking) {
      this.setupCostTracking();
    }
  }

  /**
   * Optimize retrieval with caching and batching
   * @param {Array} queries - Queries to retrieve
   * @param {Object} options - Retrieval options
   * @returns {Object} Optimized retrieval results
   */
  async optimizeRetrieval(queries, options = {}) {
    const startTime = Date.now();
    this.performanceMetrics.totalRequests++;

    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(queries, options);
      const cachedResult = this.getFromCache(cacheKey);
      
      if (cachedResult) {
        this.performanceMetrics.cacheHits++;
        return {
          ...cachedResult,
          fromCache: true,
          retrievalTime: Date.now() - startTime
        };
      }

      this.performanceMetrics.cacheMisses++;

      // Optimize queries for batch processing
      const optimizedQueries = this.optimizeQueries(queries);
      
      // Process embeddings in batches if enabled
      const embeddings = this.config.enableBatchEmbedding 
        ? await this.processBatchEmbeddings(optimizedQueries)
        : await this.processIndividualEmbeddings(optimizedQueries);

      // Optimize retrieval strategy
      const retrievalResults = await this.executeOptimizedRetrieval(embeddings, options);

      // Cache results
      this.setCache(cacheKey, retrievalResults);

      const retrievalTime = Date.now() - startTime;
      this.updatePerformanceMetrics(retrievalTime, retrievalResults);

      return {
        ...retrievalResults,
        fromCache: false,
        retrievalTime,
        optimizations: {
          batchProcessing: this.config.enableBatchEmbedding,
          cacheHits: this.performanceMetrics.cacheHits,
          tokensOptimized: this.performanceMetrics.tokensSaved || 0
        }
      };

    } catch (error) {
      console.error('Optimized retrieval failed:', error);
      throw new Error(`Retrieval optimization failed: ${error.message}`);
    }
  }

  /**
   * Optimize token usage in context
   * @param {string} context - Original context
   * @param {Object} options - Optimization options
   * @returns {Object} Optimized context
   */
  optimizeTokenUsage(context, options = {}) {
    const originalTokens = this.estimateTokens(context);
    let optimizedContext = context;

    // Apply compression if enabled
    if (this.config.enableTokenOptimization && this.config.compressionRatio < 1) {
      optimizedContext = this.compressContext(context, this.config.compressionRatio);
    }

    // Apply smart truncation if enabled
    if (this.config.enableSmartTruncation && this.estimateTokens(optimizedContext) > this.config.maxContextTokens) {
      optimizedContext = this.smartTruncateContext(optimizedContext, options);
    }

    const optimizedTokens = this.estimateTokens(optimizedContext);
    const tokensSaved = originalTokens - optimizedTokens;

    // Update metrics
    this.performanceMetrics.tokensSaved = (this.performanceMetrics.tokensSaved || 0) + tokensSaved;

    return {
      context: optimizedContext,
      originalTokens,
      optimizedTokens,
      tokensSaved,
      compressionRatio: optimizedTokens / originalTokens,
      optimizations: {
        compression: this.config.enableTokenOptimization,
        smartTruncation: this.config.enableSmartTruncation,
        tokensSaved
      }
    };
  }

  /**
   * Optimize queries for better retrieval
   * @param {Array} queries - Original queries
   * @returns {Array} Optimized queries
   */
  optimizeQueries(queries) {
    return queries.map(query => ({
      ...query,
      optimized: true,
      keywords: this.extractKeywords(query.text || ''),
      expanded: this.expandQuery(query.text || ''),
      normalized: this.normalizeQuery(query.text || '')
    }));
  }

  /**
   * Process embeddings in batches
   * @param {Array} queries - Optimized queries
   * @returns {Array} Embeddings
   */
  async processBatchEmbeddings(queries) {
    const embeddings = [];
    
    // Process in batches
    for (let i = 0; i < queries.length; i += this.config.batchSize) {
      const batch = queries.slice(i, i + this.config.batchSize);
      const batchId = `batch_${Date.now()}_${i}`;
      
      this.processingBatches.add(batchId);
      
      try {
        const batchEmbeddings = await this.generateBatchEmbeddings(batch, batchId);
        embeddings.push(...batchEmbeddings);
        
        this.performanceMetrics.embeddingsGenerated += batch.length;
      } catch (error) {
        console.error(`Batch ${batchId} failed:`, error);
        // Fallback to individual processing
        const fallbackEmbeddings = await this.processIndividualEmbeddings(batch);
        embeddings.push(...fallbackEmbeddings);
      } finally {
        this.processingBatches.delete(batchId);
      }
    }

    return embeddings;
  }

  /**
   * Process embeddings individually
   * @param {Array} queries - Queries to process
   * @returns {Array} Embeddings
   */
  async processIndividualEmbeddings(queries) {
    const embeddings = [];
    
    if (this.config.enableParallelProcessing) {
      // Process in parallel with concurrency limit
      const semaphore = new Semaphore(this.config.maxConcurrentRequests);
      
      const promises = queries.map(async (query, index) => {
        await semaphore.acquire();
        
        try {
          const embedding = await this.generateEmbedding(query);
          embeddings[index] = embedding;
          this.performanceMetrics.embeddingsGenerated++;
        } finally {
          semaphore.release();
        }
      });

      await Promise.all(promises);
    } else {
      // Process sequentially
      for (let i = 0; i < queries.length; i++) {
        const embedding = await this.generateEmbedding(queries[i]);
        embeddings[i] = embedding;
        this.performanceMetrics.embeddingsGenerated++;
      }
    }

    return embeddings;
  }

  /**
   * Execute optimized retrieval strategy
   * @param {Array} embeddings - Query embeddings
   * @param {Object} options - Retrieval options
   * @returns {Object} Retrieval results
   */
  async executeOptimizedRetrieval(embeddings, options) {
    // Group similar embeddings for batch retrieval
    const groupedEmbeddings = this.groupSimilarEmbeddings(embeddings);
    
    // Execute retrieval with optimized parameters
    const retrievalPromises = groupedEmbeddings.map(async (group) => {
      return this.executeGroupRetrieval(group, options);
    });

    const results = await Promise.all(retrievalPromises);
    
    // Merge and deduplicate results
    const mergedResults = this.mergeRetrievalResults(results);
    const deduplicatedResults = this.deduplicateResults(mergedResults);

    return {
      results: deduplicatedResults,
      groups: groupedEmbeddings.length,
      originalResults: mergedResults.length,
      deduplicatedCount: mergedResults.length - deduplicatedResults.length,
      optimization: {
        groupedRetrieval: true,
        deduplication: true
      }
    };
  }

  /**
   * Generate batch embeddings
   * @param {Array} batch - Query batch
   * @param {string} batchId - Batch identifier
   * @returns {Array} Batch embeddings
   */
  async generateBatchEmbeddings(batch, batchId) {
    // Check cache first
    const uncachedQueries = [];
    const cachedEmbeddings = [];

    for (const query of batch) {
      const cacheKey = this.generateEmbeddingCacheKey(query);
      const cached = this.embeddingCache.get(cacheKey);
      
      if (cached && !this.isCacheExpired(cached, this.config.embeddingCacheTimeout)) {
        cachedEmbeddings.push(cached.embedding);
      } else {
        uncachedQueries.push(query);
      }
    }

    // Generate embeddings for uncached queries
    if (uncachedQueries.length > 0) {
      const newEmbeddings = await this.callEmbeddingService(uncachedQueries);
      
      // Cache new embeddings
      uncachedQueries.forEach((query, index) => {
        const cacheKey = this.generateEmbeddingCacheKey(query);
        this.embeddingCache.set(cacheKey, {
          embedding: newEmbeddings[index],
          timestamp: Date.now(),
          query: query.text
        });
      });
      
      return [...cachedEmbeddings, ...newEmbeddings];
    }

    return cachedEmbeddings;
  }

  /**
   * Generate individual embedding
   * @param {Object} query - Query object
   * @returns {Array} Embedding
   */
  async generateEmbedding(query) {
    const cacheKey = this.generateEmbeddingCacheKey(query);
    const cached = this.embeddingCache.get(cacheKey);
    
    if (cached && !this.isCacheExpired(cached, this.config.embeddingCacheTimeout)) {
      return cached.embedding;
    }

    // Generate new embedding
    const embedding = await this.callEmbeddingService([query]);
    
    // Cache embedding
    this.embeddingCache.set(cacheKey, {
      embedding: embedding[0],
      timestamp: Date.now(),
      query: query.text
    });

    return embedding[0];
  }

  /**
   * Call embedding service
   * @param {Array} queries - Queries to embed
   * @returns {Array} Embeddings
   */
  async callEmbeddingService(queries) {
    // Mock implementation - replace with actual service call
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
    
    return queries.map(query => 
      Array.from({ length: 384 }, () => Math.random() - 0.5)
    );
  }

  /**
   * Group similar embeddings for batch processing
   * @param {Array} embeddings - Query embeddings
   * @returns {Array} Grouped embeddings
   */
  groupSimilarEmbeddings(embeddings) {
    const groups = [];
    const used = new Set();

    for (let i = 0; i < embeddings.length; i++) {
      if (used.has(i)) continue;

      const currentEmbedding = embeddings[i];
      const group = [currentEmbedding];
      used.add(i);

      // Find similar embeddings
      for (let j = i + 1; j < embeddings.length; j++) {
        if (used.has(j)) continue;

        const similarity = this.calculateEmbeddingSimilarity(currentEmbedding, embeddings[j]);
        if (similarity > 0.8) { // High similarity threshold
          group.push(embeddings[j]);
          used.add(j);
        }
      }

      groups.push(group);
    }

    return groups;
  }

  /**
   * Execute group retrieval
   * @param {Array} group - Embedding group
   * @param {Object} options - Retrieval options
   * @returns {Object} Group retrieval results
   */
  async executeGroupRetrieval(group, options) {
    // Combine group queries for batch retrieval
    const combinedQuery = {
      text: group.map(q => q.text).join(' '),
      embeddings: group,
      type: 'grouped',
      size: group.length
    };

    // Mock retrieval - replace with actual service call
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));

    return {
      query: combinedQuery,
      results: this.generateMockResults(group.length * 5), // 5 results per query
      retrievalTime: 50 + Math.random() * 100,
      strategy: 'grouped'
    };
  }

  /**
   * Merge retrieval results
   * @param {Array} results - Multiple result sets
   * @returns {Array} Merged results
   */
  mergeRetrievalResults(results) {
    const merged = [];
    const seen = new Set();

    for (const result of results) {
      for (const item of result.results) {
        const key = this.generateResultKey(item);
        if (!seen.has(key)) {
          seen.add(key);
          merged.push({
            ...item,
            sourceGroup: result.query.type || 'individual'
          });
        }
      }
    }

    return merged;
  }

  /**
   * Deduplicate results
   * @param {Array} results - Results to deduplicate
   * @returns {Array} Deduplicated results
   */
  deduplicateResults(results) {
    const unique = [];
    const seen = new Set();

    for (const result of results) {
      const key = this.generateResultKey(result);
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(result);
      } else {
        this.performanceMetrics.chunksDeduplicated++;
      }
    }

    return unique;
  }

  /**
   * Compress context
   * @param {string} context - Context to compress
   * @param {number} ratio - Compression ratio
   * @returns {string} Compressed context
   */
  compressContext(context, ratio) {
    // Simple compression - remove redundant whitespace and common phrases
    let compressed = context
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\b(the|and|or|but|in|on|at|to|for)\b/gi, '') // Remove common stop words
      .replace(/\s+/g, ' ') // Clean up again
      .trim();

    // Truncate to target ratio
    const targetLength = Math.floor(compressed.length * ratio);
    return compressed.substring(0, targetLength);
  }

  /**
   * Smart truncate context
   * @param {string} context - Context to truncate
   * @param {Object} options - Truncation options
   * @returns {string} Truncated context
   */
  smartTruncateContext(context, options = {}) {
    const maxTokens = this.config.maxContextTokens;
    const currentTokens = this.estimateTokens(context);

    if (currentTokens <= maxTokens) return context;

    // Find optimal truncation point
    const sentences = context.split(/[.!?]+/);
    let truncated = '';
    let tokenCount = 0;

    for (const sentence of sentences) {
      const sentenceTokens = this.estimateTokens(sentence);
      
      if (tokenCount + sentenceTokens > maxTokens) {
        // Add partial sentence if possible
        const remainingTokens = maxTokens - tokenCount;
        const partialSentence = this.truncateToTokens(sentence, remainingTokens);
        truncated += partialSentence;
        break;
      }

      truncated += sentence + '. ';
      tokenCount += sentenceTokens;
    }

    return truncated.trim();
  }

  /**
   * Extract keywords from query
   * @param {string} query - Query text
   * @returns {Array} Keywords
   */
  extractKeywords(query) {
    // Simple keyword extraction
    const words = query.toLowerCase().split(/\s+/);
    const stopWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by']);
    
    return words
      .filter(word => word.length > 2 && !stopWords.has(word))
      .slice(0, 10); // Top 10 keywords
  }

  /**
   * Expand query with synonyms
   * @param {string} query - Original query
   * @returns {string} Expanded query
   */
  expandQuery(query) {
    // Simple query expansion
    const expansions = {
      'ai': ['artificial intelligence', 'machine learning'],
      'ml': ['machine learning', 'artificial intelligence'],
      'research': ['study', 'investigation', 'analysis'],
      'learn': ['understand', 'study', 'comprehend']
    };

    const lowerQuery = query.toLowerCase();
    for (const [term, synonyms] of Object.entries(expansions)) {
      if (lowerQuery.includes(term)) {
        return query + ' ' + synonyms.join(' ');
      }
    }

    return query;
  }

  /**
   * Normalize query
   * @param {string} query - Query to normalize
   * @returns {string} Normalized query
   */
  normalizeQuery(query) {
    return query
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove special characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Generate cache key
   * @param {Array} queries - Queries
   * @param {Object} options - Options
   * @returns {string} Cache key
   */
  generateCacheKey(queries, options) {
    const queryTexts = queries.map(q => q.text).sort().join('|');
    const optionsStr = JSON.stringify(options);
    return this.simpleHash(queryTexts + optionsStr);
  }

  /**
   * Generate embedding cache key
   * @param {Object} query - Query object
   * @returns {string} Cache key
   */
  generateEmbeddingCacheKey(query) {
    return this.simpleHash(query.text + (query.normalized || ''));
  }

  /**
   * Generate result key
   * @param {Object} result - Result object
   * @returns {string} Result key
   */
  generateResultKey(result) {
    return this.simpleHash((result.content || '').substring(0, 100));
  }

  /**
   * Get from cache
   * @param {string} key - Cache key
   * @returns {any|null} Cached value
   */
  getFromCache(key) {
    const cached = this.retrievalCache.get(key);
    if (cached && !this.isCacheExpired(cached, this.config.retrievalCacheTimeout)) {
      return cached.data;
    }
    return null;
  }

  /**
   * Set cache
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   */
  setCache(key, data) {
    this.retrievalCache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Check if cache is expired
   * @param {Object} cached - Cached item
   * @param {number} timeout - Timeout in milliseconds
   * @returns {boolean} Whether expired
   */
  isCacheExpired(cached, timeout) {
    return Date.now() - cached.timestamp > timeout;
  }

  /**
   * Clean expired cache entries
   */
  cleanExpiredCaches() {
    const now = Date.now();

    // Clean embedding cache
    for (const [key, value] of this.embeddingCache.entries()) {
      if (now - value.timestamp > this.config.embeddingCacheTimeout) {
        this.embeddingCache.delete(key);
      }
    }

    // Clean retrieval cache
    for (const [key, value] of this.retrievalCache.entries()) {
      if (now - value.timestamp > this.config.retrievalCacheTimeout) {
        this.retrievalCache.delete(key);
      }
    }

    // Clean chunk cache
    for (const [key, value] of this.chunkCache.entries()) {
      if (now - value.timestamp > this.config.chunkCacheTimeout) {
        this.chunkCache.delete(key);
      }
    }
  }

  /**
   * Calculate embedding similarity
   * @param {Array} embedding1 - First embedding
   * @param {Array} embedding2 - Second embedding
   * @returns {number} Similarity score
   */
  calculateEmbeddingSimilarity(embedding1, embedding2) {
    if (!embedding1 || !embedding2 || embedding1.length !== embedding2.length) {
      return 0;
    }

    // Cosine similarity
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

    return norm1 === 0 || norm2 === 0 ? 0 : dotProduct / (norm1 * norm2);
  }

  /**
   * Truncate to specific token count
   * @param {string} text - Text to truncate
   * @param {number} maxTokens - Maximum tokens
   * @returns {string} Truncated text
   */
  truncateToTokens(text, maxTokens) {
    const words = text.split(/\s+/);
    let truncated = [];
    let tokenCount = 0;

    for (const word of words) {
      const wordTokens = Math.ceil(word.length / 4); // Estimate tokens per word
      
      if (tokenCount + wordTokens > maxTokens) {
        break;
      }

      truncated.push(word);
      tokenCount += wordTokens;
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
   * Generate mock results
   * @param {number} count - Number of results to generate
   * @returns {Array} Mock results
   */
  generateMockResults(count) {
    return Array.from({ length: count }, (_, index) => ({
      id: `result_${index}`,
      content: `Mock result content ${index + 1}`,
      relevance: Math.random() * 0.5 + 0.5,
      source: `https://example.com/source${index + 1}`,
      timestamp: new Date().toISOString()
    }));
  }

  /**
   * Update performance metrics
   * @param {number} responseTime - Response time in ms
   * @param {Object} results - Retrieval results
   */
  updatePerformanceMetrics(responseTime, results) {
    const totalRequests = this.performanceMetrics.totalRequests;
    const currentAvgResponseTime = this.performanceMetrics.averageResponseTime;
    
    this.performanceMetrics.averageResponseTime = 
      (currentAvgResponseTime * (totalRequests - 1) + responseTime) / totalRequests;
    
    // Update token and cost metrics
    if (results.results) {
      const resultTokens = results.results.reduce((sum, result) => 
        sum + this.estimateTokens(result.content || ''), 0);
      this.performanceMetrics.totalTokens += resultTokens;
      
      if (this.config.enableCostTracking) {
        const embeddingCost = resultTokens * this.config.costPerToken;
        this.performanceMetrics.totalCost += embeddingCost;
      }
    }

    // Add to history
    this.performanceHistory.push({
      timestamp: Date.now(),
      responseTime,
      cacheHits: this.performanceMetrics.cacheHits,
      cacheMisses: this.performanceMetrics.cacheMisses,
      tokensUsed: resultTokens || 0,
      cost: this.config.enableCostTracking ? resultTokens * this.config.costPerToken : 0
    });

    // Maintain history size
    if (this.performanceHistory.length > this.config.performanceHistorySize) {
      this.performanceHistory = this.performanceHistory.slice(-this.config.performanceHistorySize);
    }
  }

  /**
   * Setup performance monitoring
   */
  setupPerformanceMonitoring() {
    // Monitor performance metrics and send alerts
    setInterval(() => {
      this.checkPerformanceAlerts();
    }, 60000); // Every minute
  }

  /**
   * Setup cost tracking
   */
  setupCostTracking() {
    // Track costs and send alerts
    setInterval(() => {
      this.checkCostAlerts();
    }, 300000); // Every 5 minutes
  }

  /**
   * Check performance alerts
   */
  checkPerformanceAlerts() {
    if (!this.config.enableAlerts) return;

    const avgResponseTime = this.performanceMetrics.averageResponseTime;
    const cacheHitRate = this.performanceMetrics.cacheHits / 
      (this.performanceMetrics.cacheHits + this.performanceMetrics.cacheMisses);

    // Alert on slow response times
    if (avgResponseTime > 2000) { // 2 seconds
      console.warn('Performance alert: Slow response times detected', {
        averageResponseTime: avgResponseTime,
        threshold: 2000
      });
    }

    // Alert on low cache hit rate
    if (cacheHitRate < 0.7) { // Less than 70% hit rate
      console.warn('Performance alert: Low cache hit rate', {
        cacheHitRate: cacheHitRate,
        threshold: 0.7
      });
    }
  }

  /**
   * Check cost alerts
   */
  checkCostAlerts() {
    if (!this.config.enableCostTracking) return;

    const dailyCost = this.calculateDailyCost();
    
    // Alert on high daily cost
    if (dailyCost > 10) { // $10 per day
      console.warn('Cost alert: High daily cost detected', {
        dailyCost: dailyCost,
        threshold: 10
      });
    }
  }

  /**
   * Calculate daily cost
   * @returns {number} Daily cost
   */
  calculateDailyCost() {
    const now = Date.now();
    const dayStart = new Date(now).setHours(0, 0, 0, 0).getTime();
    
    const dailyEntries = this.performanceHistory.filter(entry => 
      entry.timestamp >= dayStart
    );

    return dailyEntries.reduce((sum, entry) => sum + (entry.cost || 0), 0);
  }

  /**
   * Get optimization statistics
   * @returns {Object} Optimization statistics
   */
  getOptimizationStats() {
    const cacheHitRate = this.performanceMetrics.totalRequests > 0 
      ? (this.performanceMetrics.cacheHits / this.performanceMetrics.totalRequests * 100).toFixed(2) + '%'
      : '0%';

    return {
      performance: {
        ...this.performanceMetrics,
        cacheHitRate,
        averageRequestTime: this.performanceMetrics.averageResponseTime.toFixed(2) + 'ms',
        totalCost: this.performanceMetrics.totalCost.toFixed(4)
      },
      caching: {
        embeddingCache: this.embeddingCache.size,
        retrievalCache: this.retrievalCache.size,
        chunkCache: this.chunkCache.size,
        hitRate: cacheHitRate
      },
      optimization: {
        batchProcessing: this.config.enableBatchEmbedding,
        parallelProcessing: this.config.enableParallelProcessing,
        tokenOptimization: this.config.enableTokenOptimization,
        compressionRatio: this.config.compressionRatio,
        smartTruncation: this.config.enableSmartTruncation
      },
      cost: {
        totalCost: this.performanceMetrics.totalCost,
        costPerToken: this.config.costPerToken,
        costPerEmbedding: this.config.costPerEmbedding,
        dailyCost: this.calculateDailyCost()
      },
      capabilities: [
        'embedding caching and reuse',
        'batch embedding processing',
        'parallel request processing',
        'retrieval result caching',
        'chunk deduplication',
        'token usage optimization',
        'context compression',
        'smart truncation',
        'performance monitoring',
        'cost tracking and alerts'
      ]
    };
  }

  /**
   * Reset optimizer
   */
  reset() {
    this.embeddingCache.clear();
    this.retrievalCache.clear();
    this.chunkCache.clear();
    this.batchQueue = [];
    this.processingBatches.clear();
    
    this.performanceMetrics = {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageResponseTime: 0,
      totalTokens: 0,
      totalCost: 0,
      embeddingsGenerated: 0,
      chunksDeduplicated: 0
    };
    
    this.performanceHistory = [];
    this.costTracker.clear();
  }
}

// Simple semaphore for concurrency control
class Semaphore {
  constructor(maxConcurrency) {
    this.maxConcurrency = maxConcurrency;
    this.currentCount = 0;
    this.queue = [];
  }

  async acquire() {
    return new Promise((resolve) => {
      if (this.currentCount < this.maxConcurrency) {
        this.currentCount++;
        resolve();
      } else {
        this.queue.push(resolve);
      }
    });
  }

  release() {
    this.currentCount--;
    if (this.queue.length > 0) {
      const next = this.queue.shift();
      this.currentCount++;
      next();
    }
  }
}

// Export singleton instance
export const performanceOptimizer = new PerformanceOptimizer();

// Export utilities
export const optimizeRetrieval = performanceOptimizer.optimizeRetrieval.bind(performanceOptimizer);
export const optimizeTokenUsage = performanceOptimizer.optimizeTokenUsage.bind(performanceOptimizer);
export const getOptimizationStats = performanceOptimizer.getOptimizationStats.bind(performanceOptimizer);
export const reset = performanceOptimizer.reset.bind(performanceOptimizer);

export default performanceOptimizer;

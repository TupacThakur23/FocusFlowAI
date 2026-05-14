class PerformanceOptimizer {
  constructor(options = {}) {
    this.config = {
      enableEmbeddingCache: options.enableEmbeddingCache !== false,
      enableRetrievalCache: options.enableRetrievalCache !== false,
      enableChunkCache: options.enableChunkCache !== false,
      embeddingCacheTimeout: options.embeddingCacheTimeout || 3600000,
      retrievalCacheTimeout: options.retrievalCacheTimeout || 300000,
      chunkCacheTimeout: options.chunkCacheTimeout || 1800000,
      enableBatchEmbedding: options.enableBatchEmbedding !== false,
      batchSize: options.batchSize || 50,
      enableParallelProcessing: options.enableParallelProcessing !== false,
      maxConcurrentRequests: options.maxConcurrentRequests || 5,
      enableTokenOptimization: options.enableTokenOptimization !== false,
      maxContextTokens: options.maxContextTokens || 4000,
      compressionRatio: options.compressionRatio || 0.8,
      enableSmartTruncation: options.enableSmartTruncation !== false,
      enableCostTracking: options.enableCostTracking !== false,
      costPerToken: options.costPerToken || 0.00002,
      costPerEmbedding: options.costPerEmbedding || 0.0001,
      enablePerformanceMonitoring: options.enablePerformanceMonitoring !== false,
      performanceHistorySize: options.performanceHistorySize || 1000,
      enableAlerts: options.enableAlerts !== false
    };
    this.embeddingCache = new Map();
    this.retrievalCache = new Map();
    this.chunkCache = new Map();
    this.batchQueue = [];
    this.processingBatches = new Set();
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
  initializeOptimizations() {
    setInterval(() => {
      this.cleanExpiredCaches();
    }, 60000);
    if (this.config.enablePerformanceMonitoring) {
      this.setupPerformanceMonitoring();
    }
    if (this.config.enableCostTracking) {
      this.setupCostTracking();
    }
  }
  async optimizeRetrieval(queries, options = {}) {
    const startTime = Date.now();
    this.performanceMetrics.totalRequests++;
    try {
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
      const optimizedQueries = this.optimizeQueries(queries);
      const embeddings = this.config.enableBatchEmbedding ? await this.processBatchEmbeddings(optimizedQueries) : await this.processIndividualEmbeddings(optimizedQueries);
      const retrievalResults = await this.executeOptimizedRetrieval(embeddings, options);
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
  optimizeTokenUsage(context, options = {}) {
    const originalTokens = this.estimateTokens(context);
    let optimizedContext = context;
    if (this.config.enableTokenOptimization && this.config.compressionRatio < 1) {
      optimizedContext = this.compressContext(context, this.config.compressionRatio);
    }
    if (this.config.enableSmartTruncation && this.estimateTokens(optimizedContext) > this.config.maxContextTokens) {
      optimizedContext = this.smartTruncateContext(optimizedContext, options);
    }
    const optimizedTokens = this.estimateTokens(optimizedContext);
    const tokensSaved = originalTokens - optimizedTokens;
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
  optimizeQueries(queries) {
    return queries.map(query => ({
      ...query,
      optimized: true,
      keywords: this.extractKeywords(query.text || ''),
      expanded: this.expandQuery(query.text || ''),
      normalized: this.normalizeQuery(query.text || '')
    }));
  }
  async processBatchEmbeddings(queries) {
    const embeddings = [];
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
        const fallbackEmbeddings = await this.processIndividualEmbeddings(batch);
        embeddings.push(...fallbackEmbeddings);
      } finally {
        this.processingBatches.delete(batchId);
      }
    }
    return embeddings;
  }
  async processIndividualEmbeddings(queries) {
    const embeddings = [];
    if (this.config.enableParallelProcessing) {
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
      for (let i = 0; i < queries.length; i++) {
        const embedding = await this.generateEmbedding(queries[i]);
        embeddings[i] = embedding;
        this.performanceMetrics.embeddingsGenerated++;
      }
    }
    return embeddings;
  }
  async executeOptimizedRetrieval(embeddings, options) {
    const groupedEmbeddings = this.groupSimilarEmbeddings(embeddings);
    const retrievalPromises = groupedEmbeddings.map(async group => {
      return this.executeGroupRetrieval(group, options);
    });
    const results = await Promise.all(retrievalPromises);
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
  async generateBatchEmbeddings(batch, batchId) {
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
    if (uncachedQueries.length > 0) {
      const newEmbeddings = await this.callEmbeddingService(uncachedQueries);
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
  async generateEmbedding(query) {
    const cacheKey = this.generateEmbeddingCacheKey(query);
    const cached = this.embeddingCache.get(cacheKey);
    if (cached && !this.isCacheExpired(cached, this.config.embeddingCacheTimeout)) {
      return cached.embedding;
    }
    const embedding = await this.callEmbeddingService([query]);
    this.embeddingCache.set(cacheKey, {
      embedding: embedding[0],
      timestamp: Date.now(),
      query: query.text
    });
    return embedding[0];
  }
  async callEmbeddingService(queries) {
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
    return queries.map(query => Array.from({
      length: 384
    }, () => Math.random() - 0.5));
  }
  groupSimilarEmbeddings(embeddings) {
    const groups = [];
    const used = new Set();
    for (let i = 0; i < embeddings.length; i++) {
      if (used.has(i)) continue;
      const currentEmbedding = embeddings[i];
      const group = [currentEmbedding];
      used.add(i);
      for (let j = i + 1; j < embeddings.length; j++) {
        if (used.has(j)) continue;
        const similarity = this.calculateEmbeddingSimilarity(currentEmbedding, embeddings[j]);
        if (similarity > 0.8) {
          group.push(embeddings[j]);
          used.add(j);
        }
      }
      groups.push(group);
    }
    return groups;
  }
  async executeGroupRetrieval(group, options) {
    const combinedQuery = {
      text: group.map(q => q.text).join(' '),
      embeddings: group,
      type: 'grouped',
      size: group.length
    };
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
    return {
      query: combinedQuery,
      results: this.generateMockResults(group.length * 5),
      retrievalTime: 50 + Math.random() * 100,
      strategy: 'grouped'
    };
  }
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
  compressContext(context, ratio) {
    let compressed = context.replace(/\s+/g, ' ').replace(/\b(the|and|or|but|in|on|at|to|for)\b/gi, '').replace(/\s+/g, ' ').trim();
    const targetLength = Math.floor(compressed.length * ratio);
    return compressed.substring(0, targetLength);
  }
  smartTruncateContext(context, options = {}) {
    const maxTokens = this.config.maxContextTokens;
    const currentTokens = this.estimateTokens(context);
    if (currentTokens <= maxTokens) return context;
    const sentences = context.split(/[.!?]+/);
    let truncated = '';
    let tokenCount = 0;
    for (const sentence of sentences) {
      const sentenceTokens = this.estimateTokens(sentence);
      if (tokenCount + sentenceTokens > maxTokens) {
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
  extractKeywords(query) {
    const words = query.toLowerCase().split(/\s+/);
    const stopWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by']);
    return words.filter(word => word.length > 2 && !stopWords.has(word)).slice(0, 10);
  }
  expandQuery(query) {
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
  normalizeQuery(query) {
    return query.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
  }
  generateCacheKey(queries, options) {
    const queryTexts = queries.map(q => q.text).sort().join('|');
    const optionsStr = JSON.stringify(options);
    return this.simpleHash(queryTexts + optionsStr);
  }
  generateEmbeddingCacheKey(query) {
    return this.simpleHash(query.text + (query.normalized || ''));
  }
  generateResultKey(result) {
    return this.simpleHash((result.content || '').substring(0, 100));
  }
  getFromCache(key) {
    const cached = this.retrievalCache.get(key);
    if (cached && !this.isCacheExpired(cached, this.config.retrievalCacheTimeout)) {
      return cached.data;
    }
    return null;
  }
  setCache(key, data) {
    this.retrievalCache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
  isCacheExpired(cached, timeout) {
    return Date.now() - cached.timestamp > timeout;
  }
  cleanExpiredCaches() {
    const now = Date.now();
    for (const [key, value] of this.embeddingCache.entries()) {
      if (now - value.timestamp > this.config.embeddingCacheTimeout) {
        this.embeddingCache.delete(key);
      }
    }
    for (const [key, value] of this.retrievalCache.entries()) {
      if (now - value.timestamp > this.config.retrievalCacheTimeout) {
        this.retrievalCache.delete(key);
      }
    }
    for (const [key, value] of this.chunkCache.entries()) {
      if (now - value.timestamp > this.config.chunkCacheTimeout) {
        this.chunkCache.delete(key);
      }
    }
  }
  calculateEmbeddingSimilarity(embedding1, embedding2) {
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
    return norm1 === 0 || norm2 === 0 ? 0 : dotProduct / (norm1 * norm2);
  }
  truncateToTokens(text, maxTokens) {
    const words = text.split(/\s+/);
    let truncated = [];
    let tokenCount = 0;
    for (const word of words) {
      const wordTokens = Math.ceil(word.length / 4);
      if (tokenCount + wordTokens > maxTokens) {
        break;
      }
      truncated.push(word);
      tokenCount += wordTokens;
    }
    return truncated.join(' ');
  }
  estimateTokens(text) {
    if (!text) return 0;
    return Math.ceil(text.length / 4);
  }
  generateMockResults(count) {
    return Array.from({
      length: count
    }, (_, index) => ({
      id: `result_${index}`,
      content: `Mock result content ${index + 1}`,
      relevance: Math.random() * 0.5 + 0.5,
      source: `https://example.com/source${index + 1}`,
      timestamp: new Date().toISOString()
    }));
  }
  updatePerformanceMetrics(responseTime, results) {
    const totalRequests = this.performanceMetrics.totalRequests;
    const currentAvgResponseTime = this.performanceMetrics.averageResponseTime;
    this.performanceMetrics.averageResponseTime = (currentAvgResponseTime * (totalRequests - 1) + responseTime) / totalRequests;
    if (results.results) {
      const resultTokens = results.results.reduce((sum, result) => sum + this.estimateTokens(result.content || ''), 0);
      this.performanceMetrics.totalTokens += resultTokens;
      if (this.config.enableCostTracking) {
        const embeddingCost = resultTokens * this.config.costPerToken;
        this.performanceMetrics.totalCost += embeddingCost;
      }
    }
    this.performanceHistory.push({
      timestamp: Date.now(),
      responseTime,
      cacheHits: this.performanceMetrics.cacheHits,
      cacheMisses: this.performanceMetrics.cacheMisses,
      tokensUsed: resultTokens || 0,
      cost: this.config.enableCostTracking ? resultTokens * this.config.costPerToken : 0
    });
    if (this.performanceHistory.length > this.config.performanceHistorySize) {
      this.performanceHistory = this.performanceHistory.slice(-this.config.performanceHistorySize);
    }
  }
  setupPerformanceMonitoring() {
    setInterval(() => {
      this.checkPerformanceAlerts();
    }, 60000);
  }
  setupCostTracking() {
    setInterval(() => {
      this.checkCostAlerts();
    }, 300000);
  }
  checkPerformanceAlerts() {
    if (!this.config.enableAlerts) return;
    const avgResponseTime = this.performanceMetrics.averageResponseTime;
    const cacheHitRate = this.performanceMetrics.cacheHits / (this.performanceMetrics.cacheHits + this.performanceMetrics.cacheMisses);
    if (avgResponseTime > 2000) {
      console.warn('Performance alert: Slow response times detected', {
        averageResponseTime: avgResponseTime,
        threshold: 2000
      });
    }
    if (cacheHitRate < 0.7) {
      console.warn('Performance alert: Low cache hit rate', {
        cacheHitRate: cacheHitRate,
        threshold: 0.7
      });
    }
  }
  checkCostAlerts() {
    if (!this.config.enableCostTracking) return;
    const dailyCost = this.calculateDailyCost();
    if (dailyCost > 10) {
      console.warn('Cost alert: High daily cost detected', {
        dailyCost: dailyCost,
        threshold: 10
      });
    }
  }
  calculateDailyCost() {
    const now = Date.now();
    const dayStart = new Date(now).setHours(0, 0, 0, 0).getTime();
    const dailyEntries = this.performanceHistory.filter(entry => entry.timestamp >= dayStart);
    return dailyEntries.reduce((sum, entry) => sum + (entry.cost || 0), 0);
  }
  getOptimizationStats() {
    const cacheHitRate = this.performanceMetrics.totalRequests > 0 ? (this.performanceMetrics.cacheHits / this.performanceMetrics.totalRequests * 100).toFixed(2) + '%' : '0%';
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
      capabilities: ['embedding caching and reuse', 'batch embedding processing', 'parallel request processing', 'retrieval result caching', 'chunk deduplication', 'token usage optimization', 'context compression', 'smart truncation', 'performance monitoring', 'cost tracking and alerts']
    };
  }
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
class Semaphore {
  constructor(maxConcurrency) {
    this.maxConcurrency = maxConcurrency;
    this.currentCount = 0;
    this.queue = [];
  }
  async acquire() {
    return new Promise(resolve => {
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
export const performanceOptimizer = new PerformanceOptimizer();
export const optimizeRetrieval = performanceOptimizer.optimizeRetrieval.bind(performanceOptimizer);
export const optimizeTokenUsage = performanceOptimizer.optimizeTokenUsage.bind(performanceOptimizer);
export const getOptimizationStats = performanceOptimizer.getOptimizationStats.bind(performanceOptimizer);
export const reset = performanceOptimizer.reset.bind(performanceOptimizer);
export default performanceOptimizer;

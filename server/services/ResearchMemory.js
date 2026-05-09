/**
 * ResearchMemory - Lightweight Research Memory System for FocusFlow AI
 * 
 * Provides efficient memory features:
 * - Recent topics tracking
 * - Active workbook context
 * - Current research thread
 * - Recent retrieval history
 * - Session continuity
 * - Lightweight persistence
 */

class ResearchMemory {
  constructor(options = {}) {
    this.config = {
      // Memory limits
      maxRecentTopics: options.maxRecentTopics || 20,
      maxActiveWorkbooks: options.maxActiveWorkbooks || 5,
      maxResearchThreads: options.maxResearchThreads || 10,
      maxRetrievalHistory: options.maxRetrievalHistory || 50,
      maxSessionContext: options.maxSessionContext || 100,
      
      // Persistence settings
      enablePersistence: options.enablePersistence !== false,
      storageKey: options.storageKey || 'focusflow_research_memory',
      persistenceInterval: options.persistenceInterval || 30000, // 30 seconds
      
      // Session management
      sessionTimeout: options.sessionTimeout || 24 * 60 * 60 * 1000, // 24 hours
      enableSessionTracking: options.enableSessionTracking !== false,
      
      // Performance settings
      enableCompression: options.enableCompression !== false,
      compressionRatio: options.compressionRatio || 0.7,
      enableCaching: options.enableCaching !== false,
      cacheTimeout: options.cacheTimeout || 300000 // 5 minutes
    };

    // Memory stores
    this.recentTopics = new Map();
    this.activeWorkbooks = new Map();
    this.researchThreads = new Map();
    this.retrievalHistory = [];
    this.sessionContext = new Map();
    this.userPreferences = new Map();
    
    // Performance
    this.cache = new Map();
    this.compressionCache = new Map();
    
    // Session tracking
    this.currentSession = {
      id: this.generateSessionId(),
      startTime: Date.now(),
      userId: null,
      activity: []
    };

    this.initializeMemory();
    this.setupPersistence();
  }

  /**
   * Initialize research memory from storage
   */
  async initializeMemory() {
    try {
      if (this.config.enablePersistence) {
        const stored = await this.loadFromStorage();
        if (stored) {
          this.recentTopics = new Map(stored.recentTopics || []);
          this.activeWorkbooks = new Map(stored.activeWorkbooks || []);
          this.researchThreads = new Map(stored.researchThreads || []);
          this.retrievalHistory = stored.retrievalHistory || [];
          this.sessionContext = new Map(stored.sessionContext || []);
          this.userPreferences = new Map(stored.userPreferences || []);
          
          // Restore current session if available
          if (stored.currentSession) {
            this.currentSession = stored.currentSession;
          }
        }
      }
    } catch (error) {
      console.error('Failed to initialize research memory:', error);
    }
  }

  /**
   * Setup automatic persistence
   */
  setupPersistence() {
    if (!this.config.enablePersistence) return;

    // Periodic persistence
    setInterval(() => {
      this.persistToStorage();
    }, this.config.persistenceInterval);

    // Persist on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.persistToStorage();
      });
    }
  }

  /**
   * Add recent topic to memory
   * @param {string} topic - Research topic
   * @param {Object} metadata - Topic metadata
   */
  addRecentTopic(topic, metadata = {}) {
    const topicData = {
      topic,
      timestamp: Date.now(),
      frequency: (this.recentTopics.get(topic)?.frequency || 0) + 1,
      lastAccessed: Date.now(),
      metadata: {
        url: metadata.url || window.location.href,
        title: metadata.title || document.title,
        workbookId: metadata.workbookId,
        semanticTags: metadata.semanticTags || [],
        relevance: metadata.relevance || 0.5,
        ...metadata
      }
    };

    this.recentTopics.set(topic, topicData);
    
    // Maintain size limit
    if (this.recentTopics.size > this.config.maxRecentTopics) {
      this.maintainTopicLimit();
    }

    // Update session activity
    this.updateSessionActivity('topic_added', { topic, metadata });
    
    return topicData;
  }

  /**
   * Get recent topics
   * @param {number} limit - Maximum topics to return
   * @param {string} userId - User identifier
   * @returns {Array} Recent topics
   */
  getRecentTopics(limit = 10, userId = null) {
    const topics = Array.from(this.recentTopics.entries())
      .map(([topic, data]) => ({ topic, ...data }))
      .sort((a, b) => b.lastAccessed - a.lastAccessed);

    // Filter by user if specified
    const filtered = userId 
      ? topics.filter(topic => topic.metadata.userId === userId)
      : topics;

    return filtered.slice(0, limit);
  }

  /**
   * Add active workbook
   * @param {string} workbookId - Workbook identifier
   * @param {Object} workbookData - Workbook information
   */
  addActiveWorkbook(workbookId, workbookData) {
    const activeWorkbook = {
      id: workbookId,
      title: workbookData.title || 'Untitled Workbook',
      description: workbookData.description || '',
      lastAccessed: Date.now(),
      accessCount: (this.activeWorkbooks.get(workbookId)?.accessCount || 0) + 1,
      topics: workbookData.topics || [],
      metadata: {
        url: workbookData.url,
        type: workbookData.type || 'research',
        tags: workbookData.tags || [],
        priority: workbookData.priority || 'medium',
        ...workbookData.metadata
      }
    };

    this.activeWorkbooks.set(workbookId, activeWorkbook);
    
    // Maintain size limit
    if (this.activeWorkbooks.size > this.config.maxActiveWorkbooks) {
      this.maintainWorkbookLimit();
    }

    // Update session activity
    this.updateSessionActivity('workbook_activated', { workbookId, workbookData });
    
    return activeWorkbook;
  }

  /**
   * Get active workbooks
   * @param {string} userId - User identifier
   * @returns {Array} Active workbooks
   */
  getActiveWorkbooks(userId = null) {
    const workbooks = Array.from(this.activeWorkbooks.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.lastAccessed - a.lastAccessed);

    // Filter by user if specified
    const filtered = userId 
      ? workbooks.filter(workbook => workbook.metadata.userId === userId)
      : workbooks;

    return filtered;
  }

  /**
   * Start research thread
   * @param {string} threadId - Thread identifier
   * @param {string} topic - Research topic
   * @param {Object} context - Initial context
   */
  startResearchThread(threadId, topic, context = {}) {
    const thread = {
      id: threadId,
      topic,
      startTime: Date.now(),
      lastActivity: Date.now(),
      messages: [],
      context: {
        initialQuery: context.initialQuery || '',
        currentUrl: context.currentUrl || window.location.href,
        pageTitle: context.pageTitle || document.title,
        workbookId: context.workbookId,
        ...context
      },
      status: 'active',
      metadata: {
        userId: context.userId,
        sessionId: this.currentSession.id,
        threadType: context.threadType || 'research'
      }
    };

    this.researchThreads.set(threadId, thread);
    
    // Update session activity
    this.updateSessionActivity('thread_started', { threadId, topic });
    
    return thread;
  }

  /**
   * Add message to research thread
   * @param {string} threadId - Thread identifier
   * @param {Object} message - Message object
   */
  addThreadMessage(threadId, message) {
    const thread = this.researchThreads.get(threadId);
    if (!thread) return null;

    const messageData = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type: message.type || 'user',
      content: message.content,
      metadata: {
        sources: message.sources || [],
        confidence: message.confidence || 0.5,
        tokens: message.tokens || 0,
        ...message.metadata
      }
    };

    thread.messages.push(messageData);
    thread.lastActivity = Date.now();
    
    // Update session activity
    this.updateSessionActivity('message_added', { threadId, message: messageData });
    
    return messageData;
  }

  /**
   * Get research threads
   * @param {string} userId - User identifier
   * @param {string} status - Thread status filter
   * @returns {Array} Research threads
   */
  getResearchThreads(userId = null, status = null) {
    const threads = Array.from(this.researchThreads.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.lastActivity - a.lastActivity);

    // Apply filters
    let filtered = threads;
    
    if (userId) {
      filtered = filtered.filter(thread => thread.metadata.userId === userId);
    }
    
    if (status) {
      filtered = filtered.filter(thread => thread.status === status);
    }

    return filtered;
  }

  /**
   * Add retrieval to history
   * @param {Object} retrieval - Retrieval data
   */
  addRetrieval(retrieval) {
    const retrievalData = {
      id: `retrieval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      query: retrieval.query || '',
      results: retrieval.results || [],
      context: retrieval.context || {},
      metadata: {
        userId: retrieval.userId,
        sessionId: this.currentSession.id,
        workbookId: retrieval.workbookId,
        topic: retrieval.topic,
        relevance: retrieval.relevance || 0.5,
        tokens: retrieval.tokens || 0,
        duration: retrieval.duration || 0,
        ...retrieval.metadata
      }
    };

    this.retrievalHistory.unshift(retrievalData);
    
    // Maintain size limit
    if (this.retrievalHistory.length > this.config.maxRetrievalHistory) {
      this.retrievalHistory = this.retrievalHistory.slice(0, this.config.maxRetrievalHistory);
    }

    // Update session activity
    this.updateSessionActivity('retrieval_completed', { retrieval: retrievalData });
    
    return retrievalData;
  }

  /**
   * Get retrieval history
   * @param {string} userId - User identifier
   * @param {number} limit - Maximum retrievals to return
   * @returns {Array} Retrieval history
   */
  getRetrievalHistory(userId = null, limit = 20) {
    let history = [...this.retrievalHistory];
    
    // Filter by user if specified
    if (userId) {
      history = history.filter(retrieval => retrieval.metadata.userId === userId);
    }
    
    return history.slice(0, limit);
  }

  /**
   * Update session context
   * @param {string} key - Context key
   * @param {any} value - Context value
   */
  updateSessionContext(key, value) {
    const contextData = {
      value,
      timestamp: Date.now(),
      sessionId: this.currentSession.id,
      accessCount: (this.sessionContext.get(key)?.accessCount || 0) + 1
    };

    this.sessionContext.set(key, contextData);
    
    // Maintain size limit
    if (this.sessionContext.size > this.config.maxSessionContext) {
      this.maintainSessionContextLimit();
    }
  }

  /**
   * Get session context
   * @param {string} key - Context key (optional)
   * @returns {any} Context value or full context
   */
  getSessionContext(key = null) {
    if (key) {
      return this.sessionContext.get(key)?.value;
    }
    
    // Return full context if no key specified
    const context = {};
    for (const [contextKey, data] of this.sessionContext.entries()) {
      context[contextKey] = data.value;
    }
    
    return context;
  }

  /**
   * Get current session information
   * @returns {Object} Current session
   */
  getCurrentSession() {
    return {
      ...this.currentSession,
      duration: Date.now() - this.currentSession.startTime,
      isActive: this.isSessionActive(),
      activityCount: this.currentSession.activity.length,
      lastActivity: this.currentSession.activity.length > 0 
        ? this.currentSession.activity[this.currentSession.activity.length - 1].timestamp
        : this.currentSession.startTime
    };
  }

  /**
   * Check if session is active
   * @returns {boolean} Session active status
   */
  isSessionActive() {
    if (!this.config.enableSessionTracking) return true;
    
    const now = Date.now();
    const lastActivity = this.currentSession.activity.length > 0 
      ? this.currentSession.activity[this.currentSession.activity.length - 1].timestamp
      : this.currentSession.startTime;
    
    return (now - lastActivity) < this.config.sessionTimeout;
  }

  /**
   * Update session activity
   * @param {string} type - Activity type
   * @param {Object} data - Activity data
   */
  updateSessionActivity(type, data) {
    const activity = {
      type,
      timestamp: Date.now(),
      data,
      sessionId: this.currentSession.id
    };

    this.currentSession.activity.push(activity);
    
    // Maintain reasonable activity history size
    if (this.currentSession.activity.length > 100) {
      this.currentSession.activity = this.currentSession.activity.slice(-50);
    }
  }

  /**
   * Maintain topic limit by removing least relevant
   */
  maintainTopicLimit() {
    const topics = Array.from(this.recentTopics.entries())
      .map(([topic, data]) => ({ topic, ...data }))
      .sort((a, b) => {
        // Sort by combined relevance score
        const scoreA = (a.frequency * 0.4) + (a.lastAccessed * 0.3) + (a.metadata.relevance * 0.3);
        const scoreB = (b.frequency * 0.4) + (b.lastAccessed * 0.3) + (b.metadata.relevance * 0.3);
        return scoreB - scoreA;
      });

    // Remove least relevant topics
    const toRemove = topics.slice(this.config.maxRecentTopics);
    toRemove.forEach(topic => {
      this.recentTopics.delete(topic.topic);
    });
  }

  /**
   * Maintain workbook limit by removing least accessed
   */
  maintainWorkbookLimit() {
    const workbooks = Array.from(this.activeWorkbooks.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => {
        // Sort by combined access score
        const scoreA = (a.accessCount * 0.6) + (a.lastAccessed * 0.4);
        const scoreB = (b.accessCount * 0.6) + (b.lastAccessed * 0.4);
        return scoreB - scoreA;
      });

    // Remove least accessed workbooks
    const toRemove = workbooks.slice(this.config.maxActiveWorkbooks);
    toRemove.forEach(workbook => {
      this.activeWorkbooks.delete(workbook.id);
    });
  }

  /**
   * Maintain session context limit
   */
  maintainSessionContextLimit() {
    const context = Array.from(this.sessionContext.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);

    // Remove oldest context entries
    const toRemove = context.slice(this.config.maxSessionContext);
    toRemove.forEach(([key]) => {
      this.sessionContext.delete(key);
    });
  }

  /**
   * Generate session ID
   * @returns {string} Session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Compress data for storage
   * @param {Object} data - Data to compress
   * @returns {Object} Compressed data
   */
  compressData(data) {
    if (!this.config.enableCompression) return data;

    const compressed = {
      compressed: true,
      originalSize: JSON.stringify(data).length,
      data: this.simpleCompression(JSON.stringify(data))
    };

    return compressed;
  }

  /**
   * Decompress data from storage
   * @param {Object} compressed - Compressed data
   * @returns {Object} Decompressed data
   */
  decompressData(compressed) {
    if (!compressed.compressed) return compressed;

    try {
      return JSON.parse(this.simpleDecompression(compressed.data));
    } catch (error) {
      console.error('Failed to decompress data:', error);
      return {};
    }
  }

  /**
   * Simple compression algorithm
   * @param {string} str - String to compress
   * @returns {string} Compressed string
   */
  simpleCompression(str) {
    // Simple run-length encoding for demonstration
    return str.replace(/(.)\1+/g, (match, char) => {
      return char + match.length;
    });
  }

  /**
   * Simple decompression algorithm
   * @param {string} str - Compressed string
   * @returns {string} Decompressed string
   */
  simpleDecompression(str) {
    // Reverse of simple compression
    return str.replace(/(.)\d+/g, (match, char, count) => {
      return char.repeat(parseInt(count));
    });
  }

  /**
   * Persist data to storage
   */
  async persistToStorage() {
    if (!this.config.enablePersistence) return;

    try {
      const data = {
        recentTopics: Array.from(this.recentTopics.entries()),
        activeWorkbooks: Array.from(this.activeWorkbooks.entries()),
        researchThreads: Array.from(this.researchThreads.entries()),
        retrievalHistory: this.retrievalHistory,
        sessionContext: Array.from(this.sessionContext.entries()),
        userPreferences: Array.from(this.userPreferences.entries()),
        currentSession: this.currentSession,
        lastSaved: new Date().toISOString()
      };

      // Compress data if enabled
      const finalData = this.config.enableCompression 
        ? this.compressData(data)
        : data;

      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        await chrome.storage.local.set({ [this.config.storageKey]: finalData });
      }

    } catch (error) {
      console.error('Failed to persist research memory:', error);
    }
  }

  /**
   * Load data from storage
   * @returns {Object|null} Stored data
   */
  async loadFromStorage() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        const result = await chrome.storage.local.get(this.config.storageKey);
        const stored = result[this.config.storageKey];
        
        if (stored) {
          // Decompress data if compressed
          return this.config.enableCompression 
            ? this.decompressData(stored)
            : stored;
        }
      }
    } catch (error) {
      console.error('Failed to load research memory:', error);
      return null;
    }
  }

  /**
   * Get memory statistics
   * @returns {Object} Memory statistics
   */
  getMemoryStats() {
    const now = Date.now();
    const sessionDuration = now - this.currentSession.startTime;

    return {
      topics: {
        total: this.recentTopics.size,
        active: Array.from(this.recentTopics.values()).filter(topic => 
          now - topic.lastAccessed < 7 * 24 * 60 * 60 * 1000 // Last 7 days
        ).length,
        mostAccessed: Array.from(this.recentTopics.entries())
          .sort((a, b) => b[1].frequency - a[1].frequency)[0]
      },
      workbooks: {
        active: this.activeWorkbooks.size,
        totalAccesses: Array.from(this.activeWorkbooks.values())
          .reduce((sum, wb) => sum + wb.accessCount, 0),
        mostAccessed: Array.from(this.activeWorkbooks.entries())
          .sort((a, b) => b[1].accessCount - a[1].accessCount)[0]
      },
      threads: {
        active: Array.from(this.researchThreads.values())
          .filter(thread => thread.status === 'active').length,
        total: this.researchThreads.size,
        averageMessages: Array.from(this.researchThreads.values())
          .reduce((sum, thread) => sum + thread.messages.length, 0) / Math.max(1, this.researchThreads.size)
      },
      retrievals: {
        total: this.retrievalHistory.length,
        recent: this.retrievalHistory.filter(retrieval => 
          now - retrieval.timestamp < 24 * 60 * 60 * 1000 // Last 24 hours
        ).length,
        averageRelevance: this.retrievalHistory.length > 0 
          ? this.retrievalHistory.reduce((sum, r) => sum + (r.metadata.relevance || 0.5), 0) / this.retrievalHistory.length
          : 0.5
      },
      session: {
        id: this.currentSession.id,
        duration: sessionDuration,
        isActive: this.isSessionActive(),
        activityCount: this.currentSession.activity.length,
        lastActivity: this.currentSession.activity.length > 0 
          ? this.currentSession.activity[this.currentSession.activity.length - 1].timestamp
          : this.currentSession.startTime
      },
      config: this.config,
      capabilities: [
        'recent topics tracking',
        'active workbook context',
        'current research thread',
        'recent retrieval history',
        'session continuity',
        'lightweight persistence',
        'data compression',
        'performance caching'
      ]
    };
  }

  /**
   * Clear memory
   * @param {Object} options - Clear options
   */
  clearMemory(options = {}) {
    const {
      clearTopics = true,
      clearWorkbooks = true,
      clearThreads = true,
      clearRetrievals = true,
      clearSession = false,
      clearCache = true
    } = options;

    if (clearTopics) {
      this.recentTopics.clear();
    }

    if (clearWorkbooks) {
      this.activeWorkbooks.clear();
    }

    if (clearThreads) {
      this.researchThreads.clear();
    }

    if (clearRetrievals) {
      this.retrievalHistory = [];
    }

    if (clearSession) {
      this.currentSession = {
        id: this.generateSessionId(),
        startTime: Date.now(),
        userId: null,
        activity: []
      };
    }

    if (clearCache) {
      this.cache.clear();
      this.compressionCache.clear();
    }

    // Persist cleared state
    this.persistToStorage();
  }

  /**
   * Export memory data
   * @returns {Object} Exportable memory data
   */
  exportMemoryData() {
    return {
      recentTopics: Array.from(this.recentTopics.entries()),
      activeWorkbooks: Array.from(this.activeWorkbooks.entries()),
      researchThreads: Array.from(this.researchThreads.entries()),
      retrievalHistory: this.retrievalHistory,
      sessionContext: Array.from(this.sessionContext.entries()),
      currentSession: this.currentSession,
      exportedAt: new Date().toISOString(),
      stats: this.getMemoryStats()
    };
  }

  /**
   * Import memory data
   * @param {Object} data - Memory data to import
   * @returns {Object} Import result
   */
  importMemoryData(data) {
    try {
      if (data.recentTopics) {
        this.recentTopics = new Map(data.recentTopics);
      }
      
      if (data.activeWorkbooks) {
        this.activeWorkbooks = new Map(data.activeWorkbooks);
      }
      
      if (data.researchThreads) {
        this.researchThreads = new Map(data.researchThreads);
      }
      
      if (data.retrievalHistory) {
        this.retrievalHistory = data.retrievalHistory;
      }
      
      if (data.sessionContext) {
        this.sessionContext = new Map(data.sessionContext);
      }
      
      if (data.currentSession) {
        this.currentSession = data.currentSession;
      }

      this.persistToStorage();

      return {
        success: true,
        imported: {
          topics: data.recentTopics ? data.recentTopics.length : 0,
          workbooks: data.activeWorkbooks ? data.activeWorkbooks.length : 0,
          threads: data.researchThreads ? data.researchThreads.length : 0,
          retrievals: data.retrievalHistory ? data.retrievalHistory.length : 0
        }
      };
    } catch (error) {
      console.error('Failed to import memory data:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update configuration
   * @param {Object} newConfig - New configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Reset research memory
   */
  reset() {
    this.recentTopics.clear();
    this.activeWorkbooks.clear();
    this.researchThreads.clear();
    this.retrievalHistory = [];
    this.sessionContext.clear();
    this.userPreferences.clear();
    this.cache.clear();
    this.compressionCache.clear();
    
    this.currentSession = {
      id: this.generateSessionId(),
      startTime: Date.now(),
      userId: null,
      activity: []
    };

    if (this.config.enablePersistence) {
      this.persistToStorage();
    }
  }
}

// Export singleton instance
export const researchMemory = new ResearchMemory();

// Export utilities
export const addRecentTopic = researchMemory.addRecentTopic.bind(researchMemory);
export const getRecentTopics = researchMemory.getRecentTopics.bind(researchMemory);
export const addActiveWorkbook = researchMemory.addActiveWorkbook.bind(researchMemory);
export const getActiveWorkbooks = researchMemory.getActiveWorkbooks.bind(researchMemory);
export const startResearchThread = researchMemory.startResearchThread.bind(researchMemory);
export const addThreadMessage = researchMemory.addThreadMessage.bind(researchMemory);
export const getResearchThreads = researchMemory.getResearchThreads.bind(researchMemory);
export const addRetrieval = researchMemory.addRetrieval.bind(researchMemory);
export const getRetrievalHistory = researchMemory.getRetrievalHistory.bind(researchMemory);
export const updateSessionContext = researchMemory.updateSessionContext.bind(researchMemory);
export const getSessionContext = researchMemory.getSessionContext.bind(researchMemory);
export const getCurrentSession = researchMemory.getCurrentSession.bind(researchMemory);
export const getMemoryStats = researchMemory.getMemoryStats.bind(researchMemory);
export const clearMemory = researchMemory.clearMemory.bind(researchMemory);
export const exportMemoryData = researchMemory.exportMemoryData.bind(researchMemory);
export const importMemoryData = researchMemory.importMemoryData.bind(researchMemory);
export const updateConfig = researchMemory.updateConfig.bind(researchMemory);
export const reset = researchMemory.reset.bind(researchMemory);

export default researchMemory;

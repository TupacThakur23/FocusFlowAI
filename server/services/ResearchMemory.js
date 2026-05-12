

class ResearchMemory {
  constructor(options = {}) {
    this.config = {

      maxRecentTopics: options.maxRecentTopics || 20,
      maxActiveWorkbooks: options.maxActiveWorkbooks || 5,
      maxResearchThreads: options.maxResearchThreads || 10,
      maxRetrievalHistory: options.maxRetrievalHistory || 50,
      maxSessionContext: options.maxSessionContext || 100,
      

      enablePersistence: options.enablePersistence !== false,
      storageKey: options.storageKey || 'focusflow_research_memory',
      persistenceInterval: options.persistenceInterval || 30000, // 30 seconds
      

      sessionTimeout: options.sessionTimeout || 24 * 60 * 60 * 1000, // 24 hours
      enableSessionTracking: options.enableSessionTracking !== false,
      

      enableCompression: options.enableCompression !== false,
      compressionRatio: options.compressionRatio || 0.7,
      enableCaching: options.enableCaching !== false,
      cacheTimeout: options.cacheTimeout || 300000 // 5 minutes
    };

    this.recentTopics = new Map();
    this.activeWorkbooks = new Map();
    this.researchThreads = new Map();
    this.retrievalHistory = [];
    this.sessionContext = new Map();
    this.userPreferences = new Map();
    

    this.cache = new Map();
    this.compressionCache = new Map();
    

    this.currentSession = {
      id: this.generateSessionId(),
      startTime: Date.now(),
      userId: null,
      activity: []
    };

    this.initializeMemory();
    this.setupPersistence();
  }

  
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
          

          if (stored.currentSession) {
            this.currentSession = stored.currentSession;
          }
        }
      }
    } catch (error) {
      console.error('Failed to initialize research memory:', error);
    }
  }

  
  setupPersistence() {
    if (!this.config.enablePersistence) return;

    setInterval(() => {
      this.persistToStorage();
    }, this.config.persistenceInterval);

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.persistToStorage();
      });
    }
  }

  
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
    

    if (this.recentTopics.size > this.config.maxRecentTopics) {
      this.maintainTopicLimit();
    }

    this.updateSessionActivity('topic_added', { topic, metadata });
    
    return topicData;
  }

  
  getRecentTopics(limit = 10, userId = null) {
    const topics = Array.from(this.recentTopics.entries())
      .map(([topic, data]) => ({ topic, ...data }))
      .sort((a, b) => b.lastAccessed - a.lastAccessed);

    const filtered = userId 
      ? topics.filter(topic => topic.metadata.userId === userId)
      : topics;

    return filtered.slice(0, limit);
  }

  
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
    

    if (this.activeWorkbooks.size > this.config.maxActiveWorkbooks) {
      this.maintainWorkbookLimit();
    }

    this.updateSessionActivity('workbook_activated', { workbookId, workbookData });
    
    return activeWorkbook;
  }

  
  getActiveWorkbooks(userId = null) {
    const workbooks = Array.from(this.activeWorkbooks.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.lastAccessed - a.lastAccessed);

    const filtered = userId 
      ? workbooks.filter(workbook => workbook.metadata.userId === userId)
      : workbooks;

    return filtered;
  }

  
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
    

    this.updateSessionActivity('thread_started', { threadId, topic });
    
    return thread;
  }

  
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
    

    this.updateSessionActivity('message_added', { threadId, message: messageData });
    
    return messageData;
  }

  
  getResearchThreads(userId = null, status = null) {
    const threads = Array.from(this.researchThreads.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.lastActivity - a.lastActivity);

    let filtered = threads;
    
    if (userId) {
      filtered = filtered.filter(thread => thread.metadata.userId === userId);
    }
    
    if (status) {
      filtered = filtered.filter(thread => thread.status === status);
    }

    return filtered;
  }

  
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
    

    if (this.retrievalHistory.length > this.config.maxRetrievalHistory) {
      this.retrievalHistory = this.retrievalHistory.slice(0, this.config.maxRetrievalHistory);
    }

    this.updateSessionActivity('retrieval_completed', { retrieval: retrievalData });
    
    return retrievalData;
  }

  
  getRetrievalHistory(userId = null, limit = 20) {
    let history = [...this.retrievalHistory];
    

    if (userId) {
      history = history.filter(retrieval => retrieval.metadata.userId === userId);
    }
    
    return history.slice(0, limit);
  }

  
  updateSessionContext(key, value) {
    const contextData = {
      value,
      timestamp: Date.now(),
      sessionId: this.currentSession.id,
      accessCount: (this.sessionContext.get(key)?.accessCount || 0) + 1
    };

    this.sessionContext.set(key, contextData);
    

    if (this.sessionContext.size > this.config.maxSessionContext) {
      this.maintainSessionContextLimit();
    }
  }

  
  getSessionContext(key = null) {
    if (key) {
      return this.sessionContext.get(key)?.value;
    }
    

    const context = {};
    for (const [contextKey, data] of this.sessionContext.entries()) {
      context[contextKey] = data.value;
    }
    
    return context;
  }

  
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

  
  isSessionActive() {
    if (!this.config.enableSessionTracking) return true;
    
    const now = Date.now();
    const lastActivity = this.currentSession.activity.length > 0 
      ? this.currentSession.activity[this.currentSession.activity.length - 1].timestamp
      : this.currentSession.startTime;
    
    return (now - lastActivity) < this.config.sessionTimeout;
  }

  
  updateSessionActivity(type, data) {
    const activity = {
      type,
      timestamp: Date.now(),
      data,
      sessionId: this.currentSession.id
    };

    this.currentSession.activity.push(activity);
    

    if (this.currentSession.activity.length > 100) {
      this.currentSession.activity = this.currentSession.activity.slice(-50);
    }
  }

  
  maintainTopicLimit() {
    const topics = Array.from(this.recentTopics.entries())
      .map(([topic, data]) => ({ topic, ...data }))
      .sort((a, b) => {

        const scoreA = (a.frequency * 0.4) + (a.lastAccessed * 0.3) + (a.metadata.relevance * 0.3);
        const scoreB = (b.frequency * 0.4) + (b.lastAccessed * 0.3) + (b.metadata.relevance * 0.3);
        return scoreB - scoreA;
      });

    const toRemove = topics.slice(this.config.maxRecentTopics);
    toRemove.forEach(topic => {
      this.recentTopics.delete(topic.topic);
    });
  }

  
  maintainWorkbookLimit() {
    const workbooks = Array.from(this.activeWorkbooks.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => {

        const scoreA = (a.accessCount * 0.6) + (a.lastAccessed * 0.4);
        const scoreB = (b.accessCount * 0.6) + (b.lastAccessed * 0.4);
        return scoreB - scoreA;
      });

    const toRemove = workbooks.slice(this.config.maxActiveWorkbooks);
    toRemove.forEach(workbook => {
      this.activeWorkbooks.delete(workbook.id);
    });
  }

  
  maintainSessionContextLimit() {
    const context = Array.from(this.sessionContext.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);

    const toRemove = context.slice(this.config.maxSessionContext);
    toRemove.forEach(([key]) => {
      this.sessionContext.delete(key);
    });
  }

  
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  
  compressData(data) {
    if (!this.config.enableCompression) return data;

    const compressed = {
      compressed: true,
      originalSize: JSON.stringify(data).length,
      data: this.simpleCompression(JSON.stringify(data))
    };

    return compressed;
  }

  
  decompressData(compressed) {
    if (!compressed.compressed) return compressed;

    try {
      return JSON.parse(this.simpleDecompression(compressed.data));
    } catch (error) {
      console.error('Failed to decompress data:', error);
      return {};
    }
  }

  
  simpleCompression(str) {

    return str.replace(/(.)\1+/g, (match, char) => {
      return char + match.length;
    });
  }

  
  simpleDecompression(str) {

    return str.replace(/(.)\d+/g, (match, char, count) => {
      return char.repeat(parseInt(count));
    });
  }

  
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

  
  async loadFromStorage() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        const result = await chrome.storage.local.get(this.config.storageKey);
        const stored = result[this.config.storageKey];
        
        if (stored) {

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

    this.persistToStorage();
  }

  
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

  
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  
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

export const researchMemory = new ResearchMemory();

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

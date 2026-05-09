/**
 * ResearchContinuityEngine - Lightweight Research Memory for FocusFlow AI
 * 
 * Provides research continuity features:
 * - "Continue where I left off" functionality
 * - Related research retrieval
 * - Previous session continuation
 * - Connected source suggestions
 * - Workbook continuity
 * - Research timelines
 * - Related concept linking
 */

class ResearchContinuityEngine {
  constructor(options = {}) {
    this.config = {
      // Memory limits
      maxRecentTopics: options.maxRecentTopics || 20,
      maxRecentWorkbooks: options.maxRecentWorkbooks || 10,
      maxRelatedConcepts: options.maxRelatedConcepts || 15,
      maxTimelineEntries: options.maxTimelineEntries || 50,
      
      // Continuity thresholds
      topicSimilarityThreshold: options.topicSimilarityThreshold || 0.6,
      workbookRelevanceThreshold: options.workbookRelevanceThreshold || 0.4,
      sessionTimeout: options.sessionTimeout || 24 * 60 * 60 * 1000, // 24 hours
      conceptLinkThreshold: options.conceptLinkThreshold || 0.3,
      
      // Persistence
      enablePersistence: options.enablePersistence !== false,
      storageKey: options.storageKey || 'focusflow_research_continuity',
      
      // Quality filters
      minInteractionCount: options.minInteractionCount || 2,
      minRelevanceScore: options.minRelevanceScore || 0.3
    };

    this.researchMemory = new Map();
    this.sessionHistory = [];
    this.conceptGraph = new Map();
    this.workbookConnections = new Map();
    
    this.initializeMemory();
  }

  /**
   * Initialize research memory from storage
   */
  async initializeMemory() {
    try {
      if (this.config.enablePersistence) {
        const stored = await this.loadFromStorage();
        if (stored) {
          this.researchMemory = new Map(stored.topics || []);
          this.sessionHistory = stored.sessionHistory || [];
          this.conceptGraph = new Map(stored.conceptGraph || []);
          this.workbookConnections = new Map(stored.workbookConnections || []);
        }
      }
    } catch (error) {
      console.error('Failed to initialize research memory:', error);
    }
  }

  /**
   * Continue research from previous session
   * @param {string} userId - User identifier
   * @param {string} currentTopic - Current research topic
   * @returns {Object} Continuation context
   */
  async continueResearch(userId, currentTopic) {
    try {
      // Find previous research sessions
      const previousSessions = this.findPreviousSessions(userId, currentTopic);
      
      // Get related concepts
      const relatedConcepts = this.getRelatedConcepts(currentTopic);
      
      // Get active workbooks
      const activeWorkbooks = this.getActiveWorkbooks(userId);
      
      // Build continuation context
      const continuationContext = {
        currentTopic,
        previousSessions,
        relatedConcepts,
        activeWorkbooks,
        suggestions: this.generateContinuationSuggestions(currentTopic, previousSessions),
        timeline: this.buildResearchTimeline(userId, currentTopic),
        lastActivity: this.getLastActivity(userId)
      };

      // Update current session
      this.updateCurrentSession(userId, currentTopic, continuationContext);
      
      return continuationContext;
      
    } catch (error) {
      console.error('Failed to continue research:', error);
      throw new Error(`Research continuation failed: ${error.message}`);
    }
  }

  /**
   * Find previous research sessions
   * @param {string} userId - User identifier
   * @param {string} currentTopic - Current topic
   * @returns {Array} Previous sessions
   */
  findPreviousSessions(userId, currentTopic) {
    const userSessions = this.sessionHistory.filter(session => 
      session.userId === userId && 
      session.topic && 
      this.calculateTopicSimilarity(session.topic, currentTopic) > this.config.topicSimilarityThreshold
    );

    // Sort by recency and relevance
    return userSessions
      .sort((a, b) => {
        const aScore = this.calculateSessionScore(a, currentTopic);
        const bScore = this.calculateSessionScore(b, currentTopic);
        
        if (Math.abs(aScore - bScore) > 0.01) {
          return bScore - aScore;
        }
        
        return new Date(b.timestamp) - new Date(a.timestamp);
      })
      .slice(0, 5); // Top 5 most relevant sessions
  }

  /**
   * Get related concepts for current topic
   * @param {string} topic - Current topic
   * @returns {Array} Related concepts
   */
  getRelatedConcepts(topic) {
    const concepts = [];
    const topicWords = new Set(topic.toLowerCase().split(/\s+/));
    
    // Find conceptually related topics
    for (const [storedTopic, conceptData] of this.researchMemory.entries()) {
      const storedWords = new Set(storedTopic.toLowerCase().split(/\s+/));
      
      // Calculate word overlap
      const intersection = new Set([...topicWords].filter(word => storedWords.has(word)));
      const overlapRatio = intersection.size / Math.max(topicWords.size, storedWords.size);
      
      if (overlapRatio > this.config.conceptLinkThreshold) {
        concepts.push({
          topic: storedTopic,
          similarity: overlapRatio,
          conceptData: conceptData,
          relatedConcepts: conceptData.relatedConcepts || [],
          lastAccessed: conceptData.lastAccessed,
          interactionCount: conceptData.interactionCount || 0
        });
      }
    }
    
    // Sort by similarity and interaction count
    return concepts
      .sort((a, b) => {
        const aScore = a.similarity * 0.7 + (a.interactionCount / 10) * 0.3;
        const bScore = b.similarity * 0.7 + (b.interactionCount / 10) * 0.3;
        return bScore - aScore;
      })
      .slice(0, this.config.maxRelatedConcepts);
  }

  /**
   * Get active workbooks for user
   * @param {string} userId - User identifier
   * @returns {Array} Active workbooks
   */
  getActiveWorkbooks(userId) {
    const userWorkbooks = Array.from(this.workbookConnections.entries())
      .filter(([workbookId, data]) => data.userId === userId)
      .map(([workbookId, data]) => ({
        id: workbookId,
        ...data.workbook,
        lastAccessed: data.lastAccessed,
        relevanceScore: data.relevanceScore || 0.5,
        connectionCount: data.connections || 0
      }));

    // Sort by relevance and recent activity
    return userWorkbooks
      .sort((a, b) => {
        const aScore = a.relevanceScore * 0.6 + (a.lastAccessed ? 1 / (Date.now() - a.lastAccessed) : 0) * 0.4;
        const bScore = b.relevanceScore * 0.6 + (b.lastAccessed ? 1 / (Date.now() - b.lastAccessed) : 0) * 0.4;
        return bScore - aScore;
      })
      .slice(0, this.config.maxRecentWorkbooks);
  }

  /**
   * Generate continuation suggestions
   * @param {string} currentTopic - Current topic
   * @param {Array} previousSessions - Previous sessions
   * @returns {Array} Continuation suggestions
   */
  generateContinuationSuggestions(currentTopic, previousSessions) {
    const suggestions = [];
    
    // Suggest continuing similar topics
    const similarTopics = previousSessions
      .filter(session => session.suggestions)
      .flatMap(session => session.suggestions)
      .filter(suggestion => suggestion.type === 'similar_topic')
      .slice(0, 3);
    
    // Suggest related workbooks
    const relatedWorkbooks = previousSessions
      .filter(session => session.activeWorkbooks)
      .flatMap(session => session.activeWorkbooks)
      .filter(workbook => workbook.relevanceScore > this.config.workbookRelevanceThreshold)
      .slice(0, 2);
    
    // Suggest concept exploration
    const conceptSuggestions = previousSessions
      .filter(session => session.relatedConcepts)
      .flatMap(session => session.relatedConcepts)
      .filter(concept => concept.interactionCount >= this.config.minInteractionCount)
      .slice(0, 3);
    
    // Combine and prioritize suggestions
    const allSuggestions = [
      ...similarTopics.map(topic => ({
        type: 'continue_topic',
        title: `Continue research on "${topic}"`,
        description: `Pick up where you left off with ${topic}`,
        priority: 'high',
        data: topic
      })),
      ...relatedWorkbooks.map(workbook => ({
        type: 'workbook_continuation',
        title: `Review "${workbook.title}" workbook`,
        description: `Continue research in your ${workbook.title} workbook`,
        priority: 'medium',
        data: workbook
      })),
      ...conceptSuggestions.map(concept => ({
        type: 'concept_exploration',
        title: `Explore "${concept.topic}"`,
        description: `Learn more about ${concept.topic}`,
        priority: 'low',
        data: concept
      }))
    ];

    // Sort by priority and relevance
    return allSuggestions
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
      .slice(0, 8);
  }

  /**
   * Build research timeline
   * @param {string} userId - User identifier
   * @param {string} currentTopic - Current topic
   * @returns {Array} Research timeline
   */
  buildResearchTimeline(userId, currentTopic) {
    const timeline = [];
    const now = Date.now();
    
    // Get user's research history
    const userSessions = this.sessionHistory.filter(session => session.userId === userId);
    
    // Build timeline entries
    for (const session of userSessions) {
      timeline.push({
        type: 'research_session',
        timestamp: session.timestamp,
        topic: session.topic,
        duration: session.duration || 0,
        interactions: session.interactionCount || 0,
        sources: session.sourceCount || 0,
        concepts: session.conceptCount || 0,
        relevance: session.relevanceScore || 0.5
      });
    }
    
    // Add concept connections
    const concepts = this.getRelatedConcepts(currentTopic);
    for (const concept of concepts) {
      if (concept.conceptData.lastAccessed) {
        timeline.push({
          type: 'concept_access',
          timestamp: concept.conceptData.lastAccessed,
          concept: concept.topic,
          similarity: concept.similarity,
          interactionCount: concept.interactionCount
        });
      }
    }
    
    // Sort by timestamp (most recent first)
    return timeline
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, this.config.maxTimelineEntries);
  }

  /**
   * Get last activity for user
   * @param {string} userId - User identifier
   * @returns {Object} Last activity
   */
  getLastActivity(userId) {
    const userSessions = this.sessionHistory.filter(session => session.userId === userId);
    
    if (userSessions.length === 0) {
      return {
        timestamp: null,
        type: 'none',
        topic: null
      };
    }
    
    const lastSession = userSessions
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
    
    return {
      timestamp: lastSession.timestamp,
      type: lastSession.type || 'research',
      topic: lastSession.topic,
      duration: lastSession.duration,
      interactions: lastSession.interactionCount
    };
  }

  /**
   * Update current research session
   * @param {string} userId - User identifier
   * @param {string} topic - Current topic
   * @param {Object} context - Session context
   */
  updateCurrentSession(userId, topic, context) {
    const session = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      topic,
      timestamp: new Date().toISOString(),
      type: 'research',
      duration: 0,
      interactionCount: 0,
      sourceCount: context.activeWorkbooks ? context.activeWorkbooks.length : 0,
      conceptCount: context.relatedConcepts ? context.relatedConcepts.length : 0,
      relevanceScore: this.calculateSessionRelevance(topic, context),
      suggestions: context.suggestions,
      timeline: context.timeline,
      lastActivity: context.lastActivity
    };

    // Add to session history
    this.sessionHistory.push(session);
    
    // Update topic in research memory
    this.updateTopicInMemory(topic, {
      lastAccessed: Date.now(),
      interactionCount: (this.researchMemory.get(topic)?.interactionCount || 0) + 1,
      relatedConcepts: context.relatedConcepts?.map(c => c.topic) || [],
      sessions: [session]
    });

    // Persist changes
    this.persistToStorage();
    
    return session;
  }

  /**
   * Add research interaction
   * @param {string} topic - Research topic
   * @param {string} interactionType - Type of interaction
   * @param {Object} interactionData - Interaction data
   */
  addInteraction(topic, interactionType, interactionData = {}) {
    const topicData = this.researchMemory.get(topic) || {
      interactionCount: 0,
      lastAccessed: Date.now(),
      relatedConcepts: [],
      sessions: []
    };

    // Update interaction data
    topicData.lastAccessed = Date.now();
    topicData.interactionCount++;
    
    if (interactionType === 'concept_link') {
      topicData.relatedConcepts.push(interactionData.concept);
    } else if (interactionType === 'workbook_connection') {
      this.updateWorkbookConnection(topic, interactionData.workbook);
    }

    this.researchMemory.set(topic, topicData);
    this.persistToStorage();
  }

  /**
   * Calculate topic similarity
   * @param {string} topic1 - First topic
   * @param {string} topic2 - Second topic
   * @returns {number} Similarity score (0-1)
   */
  calculateTopicSimilarity(topic1, topic2) {
    const words1 = new Set(topic1.toLowerCase().split(/\s+/));
    const words2 = new Set(topic2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  /**
   * Calculate session relevance score
   * @param {string} topic - Session topic
   * @param {Object} context - Session context
   * @returns {number} Relevance score
   */
  calculateSessionRelevance(topic, context) {
    let score = 0.5; // Base score
    
    // Boost for active workbooks
    if (context.activeWorkbooks && context.activeWorkbooks.length > 0) {
      score += 0.2;
    }
    
    // Boost for related concepts
    if (context.relatedConcepts && context.relatedConcepts.length > 2) {
      score += 0.2;
    }
    
    // Boost for recent activity
    if (context.lastActivity && context.lastActivity.timestamp) {
      const hoursSinceActivity = (Date.now() - new Date(context.lastActivity.timestamp)) / (1000 * 60 * 60);
      if (hoursSinceActivity < 24) {
        score += 0.1;
      }
    }
    
    return Math.min(1, score);
  }

  /**
   * Update topic in research memory
   * @param {string} topic - Topic to update
   * @param {Object} data - Topic data
   */
  updateTopicInMemory(topic, data) {
    const existing = this.researchMemory.get(topic) || {};
    const updated = { ...existing, ...data };
    this.researchMemory.set(topic, updated);
  }

  /**
   * Update workbook connection
   * @param {string} topic - Research topic
   * @param {Object} workbook - Workbook data
   */
  updateWorkbookConnection(topic, workbook) {
    const connectionKey = `${topic}:${workbook.id}`;
    const existing = this.workbookConnections.get(connectionKey) || {
      connections: 0,
      lastConnected: Date.now(),
      relevanceScore: 0.5
    };
    
    const updated = {
      ...existing,
      connections: existing.connections + 1,
      lastConnected: Date.now(),
      relevanceScore: Math.min(1, existing.relevanceScore + 0.1),
      workbook: {
        ...workbook,
        connectedTopics: [...(existing.workbook?.connectedTopics || []), topic]
      }
    };
    
    this.workbookConnections.set(connectionKey, updated);
  }

  /**
   * Get research memory statistics
   * @returns {Object} Memory statistics
   */
  getMemoryStats() {
    const topics = Array.from(this.researchMemory.entries());
    const concepts = Array.from(this.conceptGraph.entries());
    const connections = Array.from(this.workbookConnections.entries());
    
    return {
      topics: {
        total: topics.length,
        withInteractions: topics.filter(([_, data]) => data.interactionCount > 0).length,
        averageInteractions: topics.reduce((sum, [_, data]) => sum + data.interactionCount, 0) / topics.length,
        mostAccessed: topics.sort((a, b) => b[1].lastAccessed - a[1].lastAccessed)[0]
      },
      concepts: {
        total: concepts.length,
        linked: concepts.filter(([_, data]) => data.links && data.links.length > 0).length
      },
      connections: {
        total: connections.length,
        activeConnections: connections.filter(([_, data]) => 
          Date.now() - data.lastConnected < this.config.sessionTimeout
        ).length
      },
      sessions: {
        total: this.sessionHistory.length,
        recent: this.sessionHistory.filter(session => 
          Date.now() - new Date(session.timestamp) < this.config.sessionTimeout
        ).length
      },
      config: this.config
    };
  }

  /**
   * Clean up old data
   */
  cleanup() {
    const now = Date.now();
    const cutoff = now - this.config.sessionTimeout;
    
    // Clean old sessions
    this.sessionHistory = this.sessionHistory.filter(session => 
      new Date(session.timestamp) > cutoff
    );
    
    // Clean old concept data
    for (const [concept, data] of this.conceptGraph.entries()) {
      if (data.lastAccessed && data.lastAccessed < cutoff) {
        this.conceptGraph.delete(concept);
      }
    }
    
    // Clean old workbook connections
    for (const [key, data] of this.workbookConnections.entries()) {
      if (data.lastConnected && data.lastConnected < cutoff) {
        this.workbookConnections.delete(key);
      }
    }
    
    this.persistToStorage();
  }

  /**
   * Persist data to storage
   */
  async persistToStorage() {
    if (!this.config.enablePersistence) return;
    
    try {
      const data = {
        topics: Array.from(this.researchMemory.entries()),
        sessionHistory: this.sessionHistory,
        conceptGraph: Array.from(this.conceptGraph.entries()),
        workbookConnections: Array.from(this.workbookConnections.entries()),
        lastSaved: new Date().toISOString()
      };
      
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        await chrome.storage.local.set({ [this.config.storageKey]: data });
      }
    } catch (error) {
      console.error('Failed to persist research continuity data:', error);
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
        return result[this.config.storageKey] || null;
      }
    } catch (error) {
      console.error('Failed to load research continuity data:', error);
      return null;
    }
  }

  /**
   * Reset research continuity engine
   */
  reset() {
    this.researchMemory.clear();
    this.sessionHistory = [];
    this.conceptGraph.clear();
    this.workbookConnections.clear();
    
    if (this.config.enablePersistence) {
      this.persistToStorage();
    }
  }

  /**
   * Export research data
   * @returns {Object} Exportable research data
   */
  exportResearchData() {
    return {
      memory: Array.from(this.researchMemory.entries()),
      sessions: this.sessionHistory,
      concepts: Array.from(this.conceptGraph.entries()),
      connections: Array.from(this.workbookConnections.entries()),
      exportedAt: new Date().toISOString(),
      stats: this.getMemoryStats()
    };
  }

  /**
   * Import research data
   * @param {Object} data - Research data to import
   */
  importResearchData(data) {
    try {
      if (data.memory) {
        this.researchMemory = new Map(data.memory);
      }
      
      if (data.sessions) {
        this.sessionHistory = data.sessions;
      }
      
      if (data.concepts) {
        this.conceptGraph = new Map(data.concepts);
      }
      
      if (data.connections) {
        this.workbookConnections = new Map(data.connections);
      }
      
      this.persistToStorage();
      
      return {
        success: true,
        imported: {
          topics: data.memory ? data.memory.length : 0,
          sessions: data.sessions ? data.sessions.length : 0,
          concepts: data.concepts ? data.concepts.length : 0,
          connections: data.connections ? data.connections.length : 0
        }
      };
    } catch (error) {
      console.error('Failed to import research data:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Export singleton instance
export const researchContinuityEngine = new ResearchContinuityEngine();

// Export utilities
export const continueResearch = researchContinuityEngine.continueResearch.bind(researchContinuityEngine);
export const addInteraction = researchContinuityEngine.addInteraction.bind(researchContinuityEngine);
export const getMemoryStats = researchContinuityEngine.getMemoryStats.bind(researchContinuityEngine);
export const cleanup = researchContinuityEngine.cleanup.bind(researchContinuityEngine);
export const reset = researchContinuityEngine.reset.bind(researchContinuityEngine);
export const exportResearchData = researchContinuityEngine.exportResearchData.bind(researchContinuityEngine);
export const importResearchData = researchContinuityEngine.importResearchData.bind(researchContinuityEngine);

export default researchContinuityEngine;

class ResearchContinuityEngine {
  constructor(options = {}) {
    this.config = {
      maxRecentTopics: options.maxRecentTopics || 20,
      maxRecentWorkbooks: options.maxRecentWorkbooks || 10,
      maxRelatedConcepts: options.maxRelatedConcepts || 15,
      maxTimelineEntries: options.maxTimelineEntries || 50,
      topicSimilarityThreshold: options.topicSimilarityThreshold || 0.6,
      workbookRelevanceThreshold: options.workbookRelevanceThreshold || 0.4,
      sessionTimeout: options.sessionTimeout || 24 * 60 * 60 * 1000,
      conceptLinkThreshold: options.conceptLinkThreshold || 0.3,
      enablePersistence: options.enablePersistence !== false,
      storageKey: options.storageKey || 'focusflow_research_continuity',
      minInteractionCount: options.minInteractionCount || 2,
      minRelevanceScore: options.minRelevanceScore || 0.3
    };
    this.researchMemory = new Map();
    this.sessionHistory = [];
    this.conceptGraph = new Map();
    this.workbookConnections = new Map();
    this.initializeMemory();
  }
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
  async continueResearch(userId, currentTopic) {
    try {
      const previousSessions = this.findPreviousSessions(userId, currentTopic);
      const relatedConcepts = this.getRelatedConcepts(currentTopic);
      const activeWorkbooks = this.getActiveWorkbooks(userId);
      const continuationContext = {
        currentTopic,
        previousSessions,
        relatedConcepts,
        activeWorkbooks,
        suggestions: this.generateContinuationSuggestions(currentTopic, previousSessions),
        timeline: this.buildResearchTimeline(userId, currentTopic),
        lastActivity: this.getLastActivity(userId)
      };
      this.updateCurrentSession(userId, currentTopic, continuationContext);
      return continuationContext;
    } catch (error) {
      console.error('Failed to continue research:', error);
      throw new Error(`Research continuation failed: ${error.message}`);
    }
  }
  findPreviousSessions(userId, currentTopic) {
    const userSessions = this.sessionHistory.filter(session => session.userId === userId && session.topic && this.calculateTopicSimilarity(session.topic, currentTopic) > this.config.topicSimilarityThreshold);
    return userSessions.sort((a, b) => {
      const aScore = this.calculateSessionScore(a, currentTopic);
      const bScore = this.calculateSessionScore(b, currentTopic);
      if (Math.abs(aScore - bScore) > 0.01) {
        return bScore - aScore;
      }
      return new Date(b.timestamp) - new Date(a.timestamp);
    }).slice(0, 5);
  }
  getRelatedConcepts(topic) {
    const concepts = [];
    const topicWords = new Set(topic.toLowerCase().split(/\s+/));
    for (const [storedTopic, conceptData] of this.researchMemory.entries()) {
      const storedWords = new Set(storedTopic.toLowerCase().split(/\s+/));
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
    return concepts.sort((a, b) => {
      const aScore = a.similarity * 0.7 + a.interactionCount / 10 * 0.3;
      const bScore = b.similarity * 0.7 + b.interactionCount / 10 * 0.3;
      return bScore - aScore;
    }).slice(0, this.config.maxRelatedConcepts);
  }
  getActiveWorkbooks(userId) {
    const userWorkbooks = Array.from(this.workbookConnections.entries()).filter(([workbookId, data]) => data.userId === userId).map(([workbookId, data]) => ({
      id: workbookId,
      ...data.workbook,
      lastAccessed: data.lastAccessed,
      relevanceScore: data.relevanceScore || 0.5,
      connectionCount: data.connections || 0
    }));
    return userWorkbooks.sort((a, b) => {
      const aScore = a.relevanceScore * 0.6 + (a.lastAccessed ? 1 / (Date.now() - a.lastAccessed) : 0) * 0.4;
      const bScore = b.relevanceScore * 0.6 + (b.lastAccessed ? 1 / (Date.now() - b.lastAccessed) : 0) * 0.4;
      return bScore - aScore;
    }).slice(0, this.config.maxRecentWorkbooks);
  }
  generateContinuationSuggestions(currentTopic, previousSessions) {
    const suggestions = [];
    const similarTopics = previousSessions.filter(session => session.suggestions).flatMap(session => session.suggestions).filter(suggestion => suggestion.type === 'similar_topic').slice(0, 3);
    const relatedWorkbooks = previousSessions.filter(session => session.activeWorkbooks).flatMap(session => session.activeWorkbooks).filter(workbook => workbook.relevanceScore > this.config.workbookRelevanceThreshold).slice(0, 2);
    const conceptSuggestions = previousSessions.filter(session => session.relatedConcepts).flatMap(session => session.relatedConcepts).filter(concept => concept.interactionCount >= this.config.minInteractionCount).slice(0, 3);
    const allSuggestions = [...similarTopics.map(topic => ({
      type: 'continue_topic',
      title: `Continue research on "${topic}"`,
      description: `Pick up where you left off with ${topic}`,
      priority: 'high',
      data: topic
    })), ...relatedWorkbooks.map(workbook => ({
      type: 'workbook_continuation',
      title: `Review "${workbook.title}" workbook`,
      description: `Continue research in your ${workbook.title} workbook`,
      priority: 'medium',
      data: workbook
    })), ...conceptSuggestions.map(concept => ({
      type: 'concept_exploration',
      title: `Explore "${concept.topic}"`,
      description: `Learn more about ${concept.topic}`,
      priority: 'low',
      data: concept
    }))];
    return allSuggestions.sort((a, b) => {
      const priorityOrder = {
        high: 3,
        medium: 2,
        low: 1
      };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }).slice(0, 8);
  }
  buildResearchTimeline(userId, currentTopic) {
    const timeline = [];
    const now = Date.now();
    const userSessions = this.sessionHistory.filter(session => session.userId === userId);
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
    return timeline.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, this.config.maxTimelineEntries);
  }
  getLastActivity(userId) {
    const userSessions = this.sessionHistory.filter(session => session.userId === userId);
    if (userSessions.length === 0) {
      return {
        timestamp: null,
        type: 'none',
        topic: null
      };
    }
    const lastSession = userSessions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
    return {
      timestamp: lastSession.timestamp,
      type: lastSession.type || 'research',
      topic: lastSession.topic,
      duration: lastSession.duration,
      interactions: lastSession.interactionCount
    };
  }
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
    this.sessionHistory.push(session);
    this.updateTopicInMemory(topic, {
      lastAccessed: Date.now(),
      interactionCount: (this.researchMemory.get(topic)?.interactionCount || 0) + 1,
      relatedConcepts: context.relatedConcepts?.map(c => c.topic) || [],
      sessions: [session]
    });
    this.persistToStorage();
    return session;
  }
  addInteraction(topic, interactionType, interactionData = {}) {
    const topicData = this.researchMemory.get(topic) || {
      interactionCount: 0,
      lastAccessed: Date.now(),
      relatedConcepts: [],
      sessions: []
    };
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
  calculateTopicSimilarity(topic1, topic2) {
    const words1 = new Set(topic1.toLowerCase().split(/\s+/));
    const words2 = new Set(topic2.toLowerCase().split(/\s+/));
    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);
    return union.size > 0 ? intersection.size / union.size : 0;
  }
  calculateSessionRelevance(topic, context) {
    let score = 0.5;
    if (context.activeWorkbooks && context.activeWorkbooks.length > 0) {
      score += 0.2;
    }
    if (context.relatedConcepts && context.relatedConcepts.length > 2) {
      score += 0.2;
    }
    if (context.lastActivity && context.lastActivity.timestamp) {
      const hoursSinceActivity = (Date.now() - new Date(context.lastActivity.timestamp)) / (1000 * 60 * 60);
      if (hoursSinceActivity < 24) {
        score += 0.1;
      }
    }
    return Math.min(1, score);
  }
  updateTopicInMemory(topic, data) {
    const existing = this.researchMemory.get(topic) || {};
    const updated = {
      ...existing,
      ...data
    };
    this.researchMemory.set(topic, updated);
  }
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
        activeConnections: connections.filter(([_, data]) => Date.now() - data.lastConnected < this.config.sessionTimeout).length
      },
      sessions: {
        total: this.sessionHistory.length,
        recent: this.sessionHistory.filter(session => Date.now() - new Date(session.timestamp) < this.config.sessionTimeout).length
      },
      config: this.config
    };
  }
  cleanup() {
    const now = Date.now();
    const cutoff = now - this.config.sessionTimeout;
    this.sessionHistory = this.sessionHistory.filter(session => new Date(session.timestamp) > cutoff);
    for (const [concept, data] of this.conceptGraph.entries()) {
      if (data.lastAccessed && data.lastAccessed < cutoff) {
        this.conceptGraph.delete(concept);
      }
    }
    for (const [key, data] of this.workbookConnections.entries()) {
      if (data.lastConnected && data.lastConnected < cutoff) {
        this.workbookConnections.delete(key);
      }
    }
    this.persistToStorage();
  }
  async persistToStorage() {
    if (!this.config.enablePersistence) return;
    try {
      // Server-side persistence implementation placeholder
      // In production, this would save to a database or local file
    } catch (error) {
      console.error('Failed to persist research continuity data:', error);
    }
  }
  async loadFromStorage() {
    try {
      // Server-side load implementation placeholder
      return null;
    } catch (error) {
      console.error('Failed to load research continuity data:', error);
      return null;
    }
  }
  reset() {
    this.researchMemory.clear();
    this.sessionHistory = [];
    this.conceptGraph.clear();
    this.workbookConnections.clear();
    if (this.config.enablePersistence) {
      this.persistToStorage();
    }
  }
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
export const researchContinuityEngine = new ResearchContinuityEngine();
export const continueResearch = researchContinuityEngine.continueResearch.bind(researchContinuityEngine);
export const addInteraction = researchContinuityEngine.addInteraction.bind(researchContinuityEngine);
export const getMemoryStats = researchContinuityEngine.getMemoryStats.bind(researchContinuityEngine);
export const cleanup = researchContinuityEngine.cleanup.bind(researchContinuityEngine);
export const reset = researchContinuityEngine.reset.bind(researchContinuityEngine);
export const exportResearchData = researchContinuityEngine.exportResearchData.bind(researchContinuityEngine);
export const importResearchData = researchContinuityEngine.importResearchData.bind(researchContinuityEngine);
export default researchContinuityEngine;

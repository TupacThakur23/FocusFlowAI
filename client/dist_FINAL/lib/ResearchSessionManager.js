

export class ResearchSessionManager {
  constructor(options = {}) {
    this.config = {

      enableSessionPersistence: options.enableSessionPersistence !== false,
      sessionTimeout: options.sessionTimeout || 24 * 60 * 60 * 1000, // 24 hours
      maxActiveSessions: options.maxActiveSessions || 5,
      enableSessionRecovery: options.enableSessionRecovery !== false,
      

      enableTopicTracking: options.enableTopicTracking !== false,
      enableActivityTracking: options.enableActivityTracking !== false,
      enableFocusTracking: options.enableFocusTracking !== false,
      

      storageKey: options.storageKey || 'focusflow_research_sessions',
      enableCompression: options.enableCompression !== false,
      

      enableAutoRecovery: options.enableAutoRecovery !== false,
      recoveryPromptDelay: options.recoveryPromptDelay || 30000, // 30 seconds
      enableWorkspaceRestoration: options.enableWorkspaceRestoration !== false
    };

    this.activeSessions = new Map();
    this.sessionHistory = [];
    this.currentSession = null;
    this.focusAreas = new Map();
    this.activityLog = [];
    

    this.interruptedSessions = new Set();
    this.recoveryPrompts = new Map();
  }

  
  async initializeSessionManager() {
    try {

      await this.loadSessions();
      

      this.setupSessionMonitoring();
      

      if (this.config.enableAutoRecovery) {
        this.checkForInterruptedSessions();
      }
      

      if (!this.currentSession) {
        this.startNewSession();
      }
      
    } catch (error) {
      console.error('Failed to initialize session manager:', error);
    }
  }

  
  startNewSession(sessionData = {}) {
    const sessionId = this.generateSessionId();
    const now = Date.now();
    
    const session = {
      id: sessionId,
      startTime: now,
      endTime: null,
      status: 'active',
      topics: new Set(),
      workbooks: new Set(),
      queries: [],
      activities: [],
      focusAreas: new Set(),
      metadata: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        title: document.title,
        ...sessionData
      },
      summary: {
        totalQueries: 0,
        totalTopics: 0,
        totalWorkbooks: 0,
        focusTime: 0,
        productivity: 0
      }
    };

    if (this.currentSession) {
      this.endSession(this.currentSession.id);
    }

    this.currentSession = session;
    this.activeSessions.set(sessionId, session);
    

    this.logActivity('session_started', { sessionId, url: window.location.href });
    

    this.persistSessions();
    
    return session;
  }

  
  endSession(sessionId) {
    const session = this.activeSessions.get(sessionId);
    if (!session) return null;

    const endTime = Date.now();
    const duration = endTime - session.startTime;
    

    session.endTime = endTime;
    session.status = 'completed';
    session.duration = duration;
    

    const summary = this.generateSessionSummary(session);
    session.summary = { ...session.summary, ...summary };
    

    this.activeSessions.delete(sessionId);
    this.sessionHistory.unshift(session);
    

    if (this.sessionHistory.length > this.config.maxActiveSessions * 2) {
      this.sessionHistory = this.sessionHistory.slice(0, this.config.maxActiveSessions * 2);
    }
    

    if (this.currentSession?.id === sessionId) {
      this.currentSession = null;
    }
    

    this.logActivity('session_ended', { sessionId, duration });
    

    this.persistSessions();
    
    return session;
  }

  
  trackTopic(topic, metadata = {}) {
    if (!this.currentSession || !this.config.enableTopicTracking) return;

    const session = this.currentSession;
    const now = Date.now();
    

    session.topics.add(topic);
    session.summary.totalTopics = session.topics.size;
    

    if (!session.topicFocus) {
      session.topicFocus = new Map();
    }
    
    const currentFocus = session.topicFocus.get(topic) || { startTime: now, totalTime: 0 };
    currentFocus.totalTime += now - (currentFocus.lastUpdate || currentFocus.startTime);
    currentFocus.lastUpdate = now;
    session.topicFocus.set(topic, currentFocus);
    

    this.updateFocusAreas(topic, metadata);
    

    this.logActivity('topic_tracked', { topic, metadata });
    

    this.updateSessionSummary();
    

    this.persistSessions();
  }

  
  trackActivity(activityType, activityData = {}) {
    if (!this.currentSession || !this.config.enableActivityTracking) return;

    const session = this.currentSession;
    const activity = {
      id: this.generateActivityId(),
      type: activityType,
      timestamp: Date.now(),
      data: activityData,
      sessionId: session.id
    };

    session.activities.push(activity);
    

    switch (activityType) {
      case 'query':
        session.summary.totalQueries++;
        break;
      case 'workbook_created':
      case 'workbook_opened':
        session.summary.totalWorkbooks = session.workbooks.size;
        break;
      case 'focus_time':
        session.summary.focusTime += activityData.duration || 0;
        break;
    }
    

    this.logActivity('activity_tracked', { activityType, activityData });
    

    this.updateSessionSummary();
    

    this.persistSessions();
  }

  
  trackFocusArea(focusArea, metadata = {}) {
    if (!this.currentSession || !this.config.enableFocusTracking) return;

    const session = this.currentSession;
    const now = Date.now();
    

    session.focusAreas.add(focusArea);
    

    if (!session.focusAreaTime) {
      session.focusAreaTime = new Map();
    }
    
    const currentFocus = session.focusAreaTime.get(focusArea) || { startTime: now, totalTime: 0 };
    currentFocus.totalTime += now - (currentFocus.lastUpdate || currentFocus.startTime);
    currentFocus.lastUpdate = now;
    session.focusAreaTime.set(focusArea, currentFocus);
    

    this.updateFocusAreas(focusArea, metadata);
    

    this.logActivity('focus_tracked', { focusArea, metadata });
    

    this.persistSessions();
  }

  
  getSessionSummary(sessionId = null) {
    const session = sessionId 
      ? this.activeSessions.get(sessionId) || this.sessionHistory.find(s => s.id === sessionId)
      : this.currentSession;
    
    if (!session) return null;

    return {
      id: session.id,
      status: session.status,
      startTime: session.startTime,
      endTime: session.endTime,
      duration: session.duration || (Date.now() - session.startTime),
      topics: Array.from(session.topics),
      workbooks: Array.from(session.workbooks),
      focusAreas: Array.from(session.focusAreas),
      summary: session.summary || {},
      productivity: this.calculateProductivity(session),
      insights: this.generateSessionInsights(session)
    };
  }

  
  resumeSession(sessionId) {
    const session = this.sessionHistory.find(s => s.id === sessionId);
    if (!session) return null;

    session.status = 'resumed';
    session.resumedAt = Date.now();
    

    const resumedSession = this.startNewSession({
      originalSessionId: sessionId,
      resumedFrom: sessionId,
      previousTopics: Array.from(session.topics),
      previousWorkbooks: Array.from(session.workbooks),
      previousFocusAreas: Array.from(session.focusAreas)
    });

    this.interruptedSessions.delete(sessionId);
    

    this.logActivity('session_resumed', { sessionId, newSessionId: resumedSession.id });
    
    return resumedSession;
  }

  
  getActiveTopics(limit = 10) {
    const allTopics = new Map();
    

    if (this.currentSession) {
      this.currentSession.topics.forEach(topic => {
        const focus = this.currentSession.topicFocus?.get(topic);
        allTopics.set(topic, {
          topic,
          focusTime: focus?.totalTime || 0,
          lastUpdate: focus?.lastUpdate || this.currentSession.startTime,
          sessionId: this.currentSession.id,
          sessionStatus: 'active'
        });
      });
    }
    

    this.sessionHistory.slice(0, 5).forEach(session => {
      session.topics.forEach(topic => {
        if (!allTopics.has(topic)) {
          const focus = session.topicFocus?.get(topic);
          allTopics.set(topic, {
            topic,
            focusTime: focus?.totalTime || 0,
            lastUpdate: focus?.lastUpdate || session.startTime,
            sessionId: session.id,
            sessionStatus: session.status
          });
        }
      });
    });
    

    const sortedTopics = Array.from(allTopics.values())
      .sort((a, b) => {
        const aScore = a.focusTime * 0.7 + a.lastUpdate * 0.3;
        const bScore = b.focusTime * 0.7 + b.lastUpdate * 0.3;
        return bScore - aScore;
      });
    
    return sortedTopics.slice(0, limit);
  }

  
  getRecentFocusAreas(limit = 5) {
    const allFocusAreas = new Map();
    

    if (this.currentSession) {
      this.currentSession.focusAreas.forEach(area => {
        const focus = this.currentSession.focusAreaTime?.get(area);
        allFocusAreas.set(area, {
          area,
          focusTime: focus?.totalTime || 0,
          lastUpdate: focus?.lastUpdate || this.currentSession.startTime,
          sessionId: this.currentSession.id
        });
      });
    }
    

    this.sessionHistory.slice(0, 3).forEach(session => {
      session.focusAreas.forEach(area => {
        if (!allFocusAreas.has(area)) {
          const focus = session.focusAreaTime?.get(area);
          allFocusAreas.set(area, {
            area,
            focusTime: focus?.totalTime || 0,
            lastUpdate: focus?.lastUpdate || session.startTime,
            sessionId: session.id
          });
        }
      });
    });
    

    const sortedAreas = Array.from(allFocusAreas.values())
      .sort((a, b) => b.focusTime - a.focusTime);
    
    return sortedAreas.slice(0, limit);
  }

  
  getSessionTimeline(sessionId = null) {
    const session = sessionId 
      ? this.activeSessions.get(sessionId) || this.sessionHistory.find(s => s.id === sessionId)
      : this.currentSession;
    
    if (!session) return [];

    const timeline = [];
    

    timeline.push({
      type: 'session_start',
      timestamp: session.startTime,
      data: { sessionId: session.id, url: session.metadata?.url }
    });
    

    session.activities.forEach(activity => {
      timeline.push({
        type: activity.type,
        timestamp: activity.timestamp,
        data: activity.data
      });
    });
    

    if (session.endTime) {
      timeline.push({
        type: 'session_end',
        timestamp: session.endTime,
        data: { duration: session.duration }
      });
    }
    
    return timeline.sort((a, b) => a.timestamp - b.timestamp);
  }

  
  restoreWorkspaceContext(sessionId) {
    if (!this.config.enableWorkspaceRestoration) return null;

    const session = this.sessionHistory.find(s => s.id === sessionId);
    if (!session) return null;

    const context = {
      sessionId,
      topics: Array.from(session.topics),
      workbooks: Array.from(session.workbooks),
      focusAreas: Array.from(session.focusAreas),
      lastUrl: session.metadata?.url,
      lastTitle: session.metadata?.title,
      timestamp: session.endTime || session.startTime,
      summary: session.summary
    };

    this.logActivity('workspace_restored', { sessionId });

    return context;
  }

  
  updateFocusAreas(focusArea, metadata) {
    const existing = this.focusAreas.get(focusArea) || {
      area: focusArea,
      firstSeen: Date.now(),
      lastSeen: Date.now(),
      totalTime: 0,
      sessionCount: 0,
      metadata: {}
    };

    existing.lastSeen = Date.now();
    existing.totalTime += metadata.duration || 0;
    existing.sessionCount++;
    existing.metadata = { ...existing.metadata, ...metadata };

    this.focusAreas.set(focusArea, existing);
  }

  
  generateSessionSummary(session) {
    const duration = session.duration || (Date.now() - session.startTime);
    
    return {
      duration,
      topicsCount: session.topics.size,
      workbooksCount: session.workbooks.size,
      activitiesCount: session.activities.length,
      focusAreasCount: session.focusAreas.size,
      productivity: this.calculateProductivity(session),
      insights: this.generateSessionInsights(session)
    };
  }

  
  calculateProductivity(session) {
    let score = 0.5; // Base score
    

    const topicsScore = Math.min(0.2, session.topics.size * 0.05);
    score += topicsScore;
    

    const activitiesScore = Math.min(0.2, session.activities.length * 0.02);
    score += activitiesScore;
    

    const focusTime = Array.from(session.focusAreaTime?.values() || [])
      .reduce((sum, focus) => sum + focus.totalTime, 0);
    const focusScore = Math.min(0.2, focusTime / (30 * 60 * 1000)); // 30 minutes max
    score += focusScore;
    
    return Math.min(1, score);
  }

  
  generateSessionInsights(session) {
    const insights = [];
    

    if (session.topicFocus && session.topicFocus.size > 0) {
      const topTopic = Array.from(session.topicFocus.entries())
        .sort((a, b) => b[1].totalTime - a[1].totalTime)[0];
      
      insights.push({
        type: 'top_topic',
        title: 'Primary Focus',
        description: `You spent most time researching "${topTopic[0]}"`,
        data: { topic: topTopic[0], time: topTopic[1].totalTime }
      });
    }
    

    if (session.activities.length > 0) {
      const productiveActivities = session.activities.filter(a => 
        ['query', 'note_created', 'synthesis'].includes(a.type)
      );
      
      if (productiveActivities.length > session.activities.length * 0.7) {
        insights.push({
          type: 'productivity',
          title: 'High Productivity',
          description: 'This session was very productive with many research activities',
          data: { productive: productiveActivities.length, total: session.activities.length }
        });
      }
    }
    

    const duration = session.duration || (Date.now() - session.startTime);
    if (duration > 60 * 60 * 1000) { // More than 1 hour
      insights.push({
        type: 'duration',
        title: 'Extended Research Session',
        description: 'This was a lengthy research session, indicating deep engagement',
        data: { duration }
      });
    }
    
    return insights;
  }

  
  updateSessionSummary() {
    if (!this.currentSession) return;
    
    const summary = this.generateSessionSummary(this.currentSession);
    this.currentSession.summary = { ...this.currentSession.summary, ...summary };
  }

  
  logActivity(activityType, data) {
    const activity = {
      id: this.generateActivityId(),
      type: activityType,
      timestamp: Date.now(),
      data,
      sessionId: this.currentSession?.id
    };

    this.activityLog.unshift(activity);
    

    if (this.activityLog.length > 1000) {
      this.activityLog = this.activityLog.slice(0, 500);
    }
  }

  
  setupSessionMonitoring() {

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.handlePageHidden();
      } else {
        this.handlePageVisible();
      }
    });

    window.addEventListener('beforeunload', () => {
      this.handlePageUnload();
    });

    if (chrome?.tabs?.onActivated) {
      chrome.tabs.onActivated.addListener(() => {
        this.handleTabChange();
      });
    }
  }

  
  handlePageHidden() {
    if (this.currentSession) {
      this.currentSession.status = 'interrupted';
      this.interruptedSessions.add(this.currentSession.id);
      

      setTimeout(() => {
        if (this.interruptedSessions.has(this.currentSession.id)) {
          this.showRecoveryPrompt(this.currentSession.id);
        }
      }, this.config.recoveryPromptDelay);
    }
  }

  
  handlePageVisible() {
    if (this.currentSession && this.currentSession.status === 'interrupted') {
      this.currentSession.status = 'active';
      this.interruptedSessions.delete(this.currentSession.id);
      

      this.clearRecoveryPrompt(this.currentSession.id);
    }
  }

  
  handlePageUnload() {
    if (this.currentSession) {
      this.endSession(this.currentSession.id);
    }
    

    this.persistSessions();
  }

  
  handleTabChange() {

    this.trackFocusArea('tab_navigation', {
      url: window.location.href,
      title: document.title
    });
  }

  
  checkForInterruptedSessions() {
    const now = Date.now();
    
    for (const sessionId of this.interruptedSessions) {
      const session = this.sessionHistory.find(s => s.id === sessionId);
      if (session && (now - session.endTime) < this.config.sessionTimeout) {
        this.showRecoveryPrompt(sessionId);
      }
    }
  }

  
  showRecoveryPrompt(sessionId) {
    if (this.recoveryPrompts.has(sessionId)) return;

    const session = this.sessionHistory.find(s => s.id === sessionId);
    if (!session) return;

    const prompt = document.createElement('div');
    prompt.className = 'session-recovery-prompt';
    prompt.innerHTML = `
      <div class="prompt-content">
        <div class="prompt-header">
          <h3>Resume Research Session?</h3>
          <button class="close-prompt" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
        <div class="prompt-body">
          <p>Continue your research session from ${formatRelativeTime(session.endTime)}?</p>
          <div class="session-summary">
            <span>${session.topics.size} topics</span>
            <span>${session.activities.length} activities</span>
            <span>${formatDuration(session.duration)}</span>
          </div>
        </div>
        <div class="prompt-actions">
          <button class="resume-btn" onclick="window.focusflow?.sessionManager?.resumeSession('${sessionId}')">Resume</button>
          <button class="dismiss-btn" onclick="this.parentElement.parentElement.remove()">Dismiss</button>
        </div>
      </div>
    `;

    this.addRecoveryPromptStyles(prompt);

    document.body.appendChild(prompt);

    setTimeout(() => {
      prompt.classList.add('visible');
    }, 100);

    this.recoveryPrompts.set(sessionId, prompt);
  }

  
  clearRecoveryPrompt(sessionId) {
    const prompt = this.recoveryPrompts.get(sessionId);
    if (prompt) {
      prompt.classList.remove('visible');
      setTimeout(() => {
        if (prompt.parentNode) {
          prompt.parentNode.removeChild(prompt);
        }
      }, 300);
      this.recoveryPrompts.delete(sessionId);
    }
  }

  
  addRecoveryPromptStyles(prompt) {
    const style = document.createElement('style');
    style.textContent = `
      .session-recovery-prompt {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        z-index: 9999;
        max-width: 350px;
        opacity: 0;
        transform: translateY(-20px);
        transition: all 0.3s ease;
      }
      
      .session-recovery-prompt.visible {
        opacity: 1;
        transform: translateY(0);
      }
      
      .prompt-content {
        padding: 16px;
      }
      
      .prompt-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }
      
      .prompt-header h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #1f2937;
      }
      
      .close-prompt {
        background: none;
        border: none;
        font-size: 20px;
        color: #6b7280;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .prompt-body p {
        margin: 0 0 12px 0;
        color: #4b5563;
        font-size: 14px;
      }
      
      .session-summary {
        display: flex;
        gap: 12px;
        font-size: 12px;
        color: #6b7280;
        margin-bottom: 16px;
      }
      
      .prompt-actions {
        display: flex;
        gap: 8px;
      }
      
      .prompt-actions button {
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .resume-btn {
        background: #3b82f6;
        color: white;
        border: none;
      }
      
      .resume-btn:hover {
        background: #2563eb;
      }
      
      .dismiss-btn {
        background: #f3f4f6;
        color: #4b5563;
        border: 1px solid #d1d5db;
      }
      
      .dismiss-btn:hover {
        background: #e5e7eb;
      }
    `;
    
    document.head.appendChild(style);
  }

  
  async loadSessions() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.local.get(this.config.storageKey);
        const stored = result[this.config.storageKey];
        
        if (stored) {
          const data = this.config.enableCompression 
            ? this.decompressData(stored)
            : stored;
          
          this.sessionHistory = data.sessionHistory || [];
          this.focusAreas = new Map(data.focusAreas || []);
          this.activityLog = data.activityLog || [];
        }
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  }

  
  async persistSessions() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const data = {
          sessionHistory: this.sessionHistory,
          focusAreas: Array.from(this.focusAreas.entries()),
          activityLog: this.activityLog,
          lastSaved: new Date().toISOString()
        };

        const finalData = this.config.enableCompression 
          ? this.compressData(data)
          : data;

        await chrome.storage.local.set({ [this.config.storageKey]: finalData });
      }
    } catch (error) {
      console.error('Failed to persist sessions:', error);
    }
  }

  
  compressData(data) {

    const jsonString = JSON.stringify(data);
    return {
      compressed: true,
      data: jsonString.replace(/\s+/g, ' ').trim(),
      originalSize: jsonString.length
    };
  }

  
  decompressData(compressed) {
    if (!compressed.compressed) return compressed;
    
    try {
      return JSON.parse(compressed.data);
    } catch (error) {
      console.error('Failed to decompress data:', error);
      return {};
    }
  }

  
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  
  generateActivityId() {
    return `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  
  getStats() {
    return {
      currentSession: this.currentSession?.id || null,
      activeSessions: this.activeSessions.size,
      sessionHistory: this.sessionHistory.length,
      interruptedSessions: this.interruptedSessions.size,
      focusAreas: this.focusAreas.size,
      activityLog: this.activityLog.length,
      config: this.config,
      capabilities: [
        'session persistence',
        'topic tracking',
        'activity monitoring',
        'focus area analysis',
        'session recovery',
        'workspace restoration',
        'session summaries',
        'productivity calculation',
        'session timeline'
      ]
    };
  }

  
  reset() {

    if (this.currentSession) {
      this.endSession(this.currentSession.id);
    }

    this.activeSessions.clear();
    this.sessionHistory = [];
    this.focusAreas.clear();
    this.activityLog = [];
    this.interruptedSessions.clear();
    this.recoveryPrompts.clear();

    this.startNewSession();
  }
}

// export const researchSessionManager = new ResearchSessionManager();
export const researchSessionManager = null;

// export const startNewSession = researchSessionManager.startNewSession.bind(researchSessionManager);
// export const endSession = researchSessionManager.endSession.bind(researchSessionManager);
// export const trackTopic = researchSessionManager.trackTopic.bind(researchSessionManager);
// export const trackActivity = researchSessionManager.trackActivity.bind(researchSessionManager);
// export const getSessionSummary = researchSessionManager.getSessionSummary.bind(researchSessionManager);
// export const resumeSession = researchSessionManager.resumeSession.bind(researchSessionManager);
// export const getActiveTopics = researchSessionManager.getActiveTopics.bind(researchSessionManager);
// export const getRecentFocusAreas = researchSessionManager.getRecentFocusAreas.bind(researchSessionManager);
// export const getStats = researchSessionManager.getStats.bind(researchSessionManager);
// export const reset = researchSessionManager.reset.bind(researchSessionManager);

export default researchSessionManager;

const formatRelativeTime = (timestamp) => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days > 0) return `${days} day${days !== 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  return 'just now';
};

const formatDuration = (duration) => {
  const minutes = Math.floor(duration / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  return `${minutes}m`;
};



export class PrivacyFirstAnalytics {
  constructor(options = {}) {
    this.config = {

      enableAnalytics: options.enableAnalytics !== false,
      requireConsent: options.requireConsent !== false,
      anonymizeData: options.anonymizeData !== false,
      localOnly: options.localOnly !== false,
      

      enableWorkflowTracking: options.enableWorkflowTracking !== false,
      enableFeatureUsage: options.enableFeatureUsage !== false,
      enablePerformanceMetrics: options.enablePerformanceMetrics !== false,
      enableErrorTracking: options.enableErrorTracking !== false,
      enableSessionQuality: options.enableSessionQuality !== false,
      

      maxSessionDuration: options.maxSessionDuration || 24 * 60 * 60 * 1000, // 24 hours
      dataRetentionDays: options.dataRetentionDays || 30,
      batchSize: options.batchSize || 50,
      enableDifferentialPrivacy: options.enableDifferentialPrivacy !== false,
      

      enableSampling: options.enableSampling !== false,
      samplingRate: options.samplingRate || 0.1, // 10% sampling
      enableAdaptiveSampling: options.enableAdaptiveSampling !== false,
      

      storageKey: options.storageKey || 'focusflow_analytics',
      enableEncryption: options.enableEncryption !== false,
      

      enableReporting: options.enableReporting !== false,
      reportingInterval: options.reportingInterval || 24 * 60 * 60 * 1000, // 24 hours
      enableTelemetry: options.enableTelemetry !== false
    };

    this.isConsented = false;
    this.sessionId = this.generateSessionId();
    this.userId = this.generateUserId();
    this.sessionStart = Date.now();
    this.lastActivity = Date.now();
    

    this.eventBuffer = [];
    this.sessionData = new Map();
    this.aggregatedMetrics = new Map();
    this.errorLog = [];
    

    this.dataProcessor = new DataProcessor(this.config);
    this.samplingController = new SamplingController(this.config);
    this.differentialPrivacy = new DifferentialPrivacy(this.config);
    
    this.initializeAnalytics();
  }

  
  initializeAnalytics() {

    this.checkConsent();
    

    this.initializeSessionTracking();
    

    this.setupPeriodicCleanup();
    

    this.setupErrorTracking();
    

    this.startSessionMonitoring();
  }

  
  checkConsent() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.get(['analytics_consent'], (result) => {
          this.isConsented = result.analytics_consent || false;
          
          if (this.isConsented && this.config.enableAnalytics) {
            this.startAnalytics();
          }
        });
      }
    } catch (error) {
      console.warn('Failed to check analytics consent:', error);
    }
  }

  
  startAnalytics() {

    this.trackEvent('session_start', {
      sessionId: this.sessionId,
      timestamp: this.sessionStart,
      userAgent: this.getSafeUserAgent(),
      extensionVersion: this.getExtensionVersion()
    });
    

    if (this.config.enableReporting) {
      this.setupPeriodicReporting();
    }
  }

  
  trackEvent(eventType, eventData = {}) {
    if (!this.isConsented || !this.config.enableAnalytics) {
      return;
    }

    try {

      if (this.config.enableSampling && !this.samplingController.shouldSample(eventType)) {
        return;
      }

      const processedData = this.dataProcessor.processEvent(eventType, eventData);
      

      const protectedData = this.config.enableDifferentialPrivacy 
        ? this.differentialPrivacy.protect(processedData)
        : processedData;

      const event = {
        id: this.generateEventId(),
        type: eventType,
        data: protectedData,
        timestamp: Date.now(),
        sessionId: this.sessionId
      };

      this.eventBuffer.push(event);
      this.lastActivity = Date.now();

      if (this.eventBuffer.length >= this.config.batchSize) {
        this.processEventBuffer();
      }

    } catch (error) {
      console.warn('Failed to track event:', error);
    }
  }

  
  trackWorkflow(workflowType, workflowData = {}) {
    if (!this.config.enableWorkflowTracking) return;

    this.trackEvent('workflow', {
      workflowType,
      ...workflowData,
      category: 'workflow'
    });
  }

  
  trackFeatureUsage(featureName, featureData = {}) {
    if (!this.config.enableFeatureUsage) return;

    this.trackEvent('feature_usage', {
      featureName,
      ...featureData,
      category: 'feature'
    });
  }

  
  trackPerformance(performanceData = {}) {
    if (!this.config.enablePerformanceMetrics) return;

    this.trackEvent('performance', {
      ...performanceData,
      category: 'performance'
    });
  }

  
  trackError(error, errorContext = {}) {
    if (!this.config.enableErrorTracking) return;

    const errorData = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...errorContext,
      category: 'error'
    };

    this.trackEvent('error', errorData);
    this.errorLog.push({ ...errorData, timestamp: Date.now() });
  }

  
  trackSessionQuality(qualityData = {}) {
    if (!this.config.enableSessionQuality) return;

    this.trackEvent('session_quality', {
      ...qualityData,
      category: 'quality'
    });
  }

  
  trackUserFriction(frictionType, frictionData = {}) {
    this.trackEvent('user_friction', {
      frictionType,
      ...frictionData,
      category: 'friction'
    });
  }

  
  async processEventBuffer() {
    if (this.eventBuffer.length === 0) return;

    const events = this.eventBuffer.splice(0, this.config.batchSize);
    
    try {

      this.aggregateMetrics(events);
      

      if (!this.config.localOnly) {
        await this.storeEvents(events);
      }
      

      if (this.config.enableTelemetry) {
        await this.sendToTelemetry(events);
      }
      
    } catch (error) {
      console.warn('Failed to process event buffer:', error);

      this.eventBuffer.unshift(...events);
    }
  }

  
  aggregateMetrics(events) {
    for (const event of events) {
      const { type, category } = event;
      

      const key = `${category}_${type}`;
      const count = this.aggregatedMetrics.get(key) || 0;
      this.aggregatedMetrics.set(key, count + 1);
      

      const categoryKey = `category_${category}`;
      const categoryCount = this.aggregatedMetrics.get(categoryKey) || 0;
      this.aggregatedMetrics.set(categoryKey, categoryCount + 1);
    }
  }

  
  async storeEvents(events) {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const storageKey = this.config.storageKey;
        const existing = await this.getStoredEvents();
        const updated = [...existing, ...events];
        

        const cutoff = Date.now() - (this.config.dataRetentionDays * 24 * 60 * 60 * 1000);
        const filtered = updated.filter(event => event.timestamp > cutoff);
        
        await chrome.storage.local.set({ [storageKey]: filtered });
      }
    } catch (error) {
      console.warn('Failed to store events:', error);
    }
  }

  
  async getStoredEvents() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.local.get([this.config.storageKey]);
        return result[this.config.storageKey] || [];
      }
    } catch (error) {
      console.warn('Failed to get stored events:', error);
    }
    return [];
  }

  
  async sendToTelemetry(events) {

    console.log('Telemetry data:', {
      eventCount: events.length,
      aggregatedMetrics: Object.fromEntries(this.aggregatedMetrics),
      sessionId: this.sessionId
    });
  }

  
  initializeSessionTracking() {

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackEvent('session_pause', {
          duration: Date.now() - this.lastActivity
        });
      } else {
        this.trackEvent('session_resume', {
          duration: Date.now() - this.lastActivity
        });
      }
    });

    window.addEventListener('beforeunload', () => {
      this.trackEvent('session_end', {
        duration: Date.now() - this.sessionStart,
        eventCount: this.eventBuffer.length
      });
      

      this.processEventBuffer();
    });
  }

  
  setupPeriodicCleanup() {
    setInterval(() => {
      this.cleanupOldData();
    }, 24 * 60 * 60 * 1000); // Daily cleanup
  }

  
  setupErrorTracking() {
    window.addEventListener('error', (event) => {
      this.trackError(event.error, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.trackError(new Error(event.reason), {
        type: 'unhandled_rejection'
      });
    });
  }

  
  startSessionMonitoring() {
    setInterval(() => {
      const now = Date.now();
      const sessionDuration = now - this.sessionStart;
      const inactivityDuration = now - this.lastActivity;
      

      this.trackSessionQuality({
        sessionDuration,
        inactivityDuration,
        eventCount: this.eventBuffer.length,
        errorCount: this.errorLog.length
      });
      

      if (sessionDuration > this.config.maxSessionDuration) {
        this.trackEvent('session_timeout', {
          duration: sessionDuration
        });
      }
      

      if (inactivityDuration > 30 * 60 * 1000) { // 30 minutes
        this.trackUserFriction('long_inactivity', {
          duration: inactivityDuration
        });
      }
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  
  setupPeriodicReporting() {
    setInterval(() => {
      this.generateReport();
    }, this.config.reportingInterval);
  }

  
  generateReport() {
    const now = Date.now();
    const reportPeriod = this.config.reportingInterval;
    
    return {
      reportId: this.generateReportId(),
      timestamp: now,
      period: reportPeriod,
      sessionId: this.sessionId,
      aggregatedMetrics: Object.fromEntries(this.aggregatedMetrics),
      sessionMetrics: {
        duration: now - this.sessionStart,
        eventCount: this.eventBuffer.length,
        errorCount: this.errorLog.length,
        lastActivity: this.lastActivity
      },
      privacyMetrics: {
        anonymized: this.config.anonymizeData,
        sampled: this.config.enableSampling,
        localOnly: this.config.localOnly,
        differentialPrivacy: this.config.enableDifferentialPrivacy
      }
    };
  }

  
  cleanupOldData() {
    const cutoff = Date.now() - (this.config.dataRetentionDays * 24 * 60 * 60 * 1000);
    

    this.eventBuffer = this.eventBuffer.filter(event => event.timestamp > cutoff);
    

    this.errorLog = this.errorLog.filter(error => error.timestamp > cutoff);
    

    const recentMetrics = new Map();
    for (const [key, value] of this.aggregatedMetrics.entries()) {
      if (value > 0) { // Keep active metrics
        recentMetrics.set(key, value);
      }
    }
    this.aggregatedMetrics = recentMetrics;
  }

  
  getAnalyticsSummary() {
    return {
      consentStatus: this.isConsented,
      sessionId: this.sessionId,
      sessionDuration: Date.now() - this.sessionStart,
      eventCount: this.eventBuffer.length,
      errorCount: this.errorLog.length,
      aggregatedMetrics: Object.fromEntries(this.aggregatedMetrics),
      config: this.config,
      capabilities: [
        'privacy-first analytics',
        'workflow tracking',
        'feature usage metrics',
        'performance monitoring',
        'error tracking',
        'session quality insights',
        'user friction detection',
        'differential privacy',
        'data anonymization',
        'local processing',
        'consent management',
        'data retention policies'
      ]
    };
  }

  
  updateConsent(consent) {
    this.isConsented = consent;
    
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.set({ analytics_consent: consent });
      }
      
      if (consent && this.config.enableAnalytics) {
        this.startAnalytics();
      } else {

        this.clearAllData();
      }
    } catch (error) {
      console.warn('Failed to update consent:', error);
    }
  }

  
  clearAllData() {
    this.eventBuffer = [];
    this.sessionData.clear();
    this.aggregatedMetrics.clear();
    this.errorLog = [];
    
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.remove([this.config.storageKey]);
      }
    } catch (error) {
      console.warn('Failed to clear analytics data:', error);
    }
  }

  
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  generateUserId() {

    let userId = localStorage.getItem('focusflow_user_id');
    if (!userId) {
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('focusflow_user_id', userId);
    }
    return userId;
  }

  generateEventId() {
    return 'event_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  generateReportId() {
    return 'report_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  getSafeUserAgent() {
    const userAgent = navigator.userAgent;

    return userAgent.replace(/\([^)]*\)/g, '').replace(/\d+\.\d+/g, 'X.X');
  }

  getExtensionVersion() {
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        return chrome.runtime.getManifest().version;
      }
    } catch (error) {
      return 'unknown';
    }
  }
}

class DataProcessor {
  constructor(config) {
    this.config = config;
  }

  
  processEvent(eventType, eventData) {
    let processed = { ...eventData };
    

    processed = this.removeSensitiveFields(processed);
    

    if (this.config.anonymizeData) {
      processed = this.anonymizeData(processed);
    }
    

    processed.processedAt = Date.now();
    processed.eventType = eventType;
    
    return processed;
  }

  
  removeSensitiveFields(data) {
    const sensitiveFields = [
      'email', 'name', 'username', 'password', 'token', 'key',
      'ip', 'address', 'phone', 'creditCard', 'ssn', 'apiKey'
    ];
    
    const cleaned = { ...data };
    
    for (const field of sensitiveFields) {
      if (cleaned[field]) {
        cleaned[field] = '[REDACTED]';
      }
    }
    
    return cleaned;
  }

  
  anonymizeData(data) {
    const anonymized = { ...data };
    

    for (const [key, value] of Object.entries(anonymized)) {
      if (typeof value === 'string' && value.length > 10) {
        anonymized[key] = this.hashString(value);
      }
    }
    
    return anonymized;
  }

  
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }
}

class SamplingController {
  constructor(config) {
    this.config = config;
    this.adaptiveRates = new Map();
  }

  
  shouldSample(eventType) {
    if (!this.config.enableSampling) {
      return true;
    }
    

    if (this.config.enableAdaptiveSampling) {
      const rate = this.getAdaptiveRate(eventType);
      return Math.random() < rate;
    }
    

    return Math.random() < this.config.samplingRate;
  }

  
  getAdaptiveRate(eventType) {

    const importantEvents = ['session_start', 'session_end', 'error', 'user_friction'];
    if (importantEvents.includes(eventType)) {
      return 1.0; // Always sample important events
    }
    

    const highFrequencyEvents = ['performance', 'feature_usage'];
    if (highFrequencyEvents.includes(eventType)) {
      return 0.1; // 10% sampling for high-frequency events
    }
    

    return this.config.samplingRate;
  }
}

class DifferentialPrivacy {
  constructor(config) {
    this.config = config;
    this.epsilon = 1.0; // Privacy budget
  }

  
  protect(data) {
    const protected = { ...data };
    

    for (const [key, value] of Object.entries(protected)) {
      if (typeof value === 'number') {
        protected[key] = this.addNoise(value);
      }
    }
    
    return protected;
  }

  
  addNoise(value) {

    const noise = this.laplaceNoise(0, 1 / this.epsilon);
    return Math.round(value + noise);
  }

  
  laplaceNoise(mu, b) {
    const u = Math.random() - 0.5;
    return mu - b * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
  }
}

export const privacyFirstAnalytics = new PrivacyFirstAnalytics();

export const analyticsTrackEvent = privacyFirstAnalytics.trackEvent.bind(privacyFirstAnalytics);
export const analyticsTrackWorkflow = privacyFirstAnalytics.trackWorkflow.bind(privacyFirstAnalytics);
export const analyticsTrackFeatureUsage = privacyFirstAnalytics.trackFeatureUsage.bind(privacyFirstAnalytics);
export const analyticsTrackPerformance = privacyFirstAnalytics.trackPerformance.bind(privacyFirstAnalytics);
export const analyticsTrackError = privacyFirstAnalytics.trackError.bind(privacyFirstAnalytics);
export const analyticsTrackSessionQuality = privacyFirstAnalytics.trackSessionQuality.bind(privacyFirstAnalytics);
export const analyticsTrackUserFriction = privacyFirstAnalytics.trackUserFriction.bind(privacyFirstAnalytics);
export const analyticsUpdateConsent = privacyFirstAnalytics.updateConsent.bind(privacyFirstAnalytics);
export const analyticsGetSummary = privacyFirstAnalytics.getAnalyticsSummary.bind(privacyFirstAnalytics);
export const analyticsClearAllData = privacyFirstAnalytics.clearAllData.bind(privacyFirstAnalytics);

export default privacyFirstAnalytics;

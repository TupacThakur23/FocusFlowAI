/**
 * PrivacyFirstAnalytics - Privacy-First Usage Analytics for FocusFlow AI
 * 
 * Provides ethical analytics:
 * - Anonymized usage analytics
 * - Workflow tracking
 * - Feature usage metrics
 * - Performance metrics
 * - Session quality insights
 * - Error tracking
 * - User friction detection
 */

export class PrivacyFirstAnalytics {
  constructor(options = {}) {
    this.config = {
      // Privacy settings
      enableAnalytics: options.enableAnalytics !== false,
      requireConsent: options.requireConsent !== false,
      anonymizeData: options.anonymizeData !== false,
      localOnly: options.localOnly !== false,
      
      // Data collection
      enableWorkflowTracking: options.enableWorkflowTracking !== false,
      enableFeatureUsage: options.enableFeatureUsage !== false,
      enablePerformanceMetrics: options.enablePerformanceMetrics !== false,
      enableErrorTracking: options.enableErrorTracking !== false,
      enableSessionQuality: options.enableSessionQuality !== false,
      
      // Privacy protection
      maxSessionDuration: options.maxSessionDuration || 24 * 60 * 60 * 1000, // 24 hours
      dataRetentionDays: options.dataRetentionDays || 30,
      batchSize: options.batchSize || 50,
      enableDifferentialPrivacy: options.enableDifferentialPrivacy !== false,
      
      // Sampling
      enableSampling: options.enableSampling !== false,
      samplingRate: options.samplingRate || 0.1, // 10% sampling
      enableAdaptiveSampling: options.enableAdaptiveSampling !== false,
      
      // Storage
      storageKey: options.storageKey || 'focusflow_analytics',
      enableEncryption: options.enableEncryption !== false,
      
      // Reporting
      enableReporting: options.enableReporting !== false,
      reportingInterval: options.reportingInterval || 24 * 60 * 60 * 1000, // 24 hours
      enableTelemetry: options.enableTelemetry !== false
    };

    // Analytics state
    this.isConsented = false;
    this.sessionId = this.generateSessionId();
    this.userId = this.generateUserId();
    this.sessionStart = Date.now();
    this.lastActivity = Date.now();
    
    // Data storage
    this.eventBuffer = [];
    this.sessionData = new Map();
    this.aggregatedMetrics = new Map();
    this.errorLog = [];
    
    // Privacy protection
    this.dataProcessor = new DataProcessor(this.config);
    this.samplingController = new SamplingController(this.config);
    this.differentialPrivacy = new DifferentialPrivacy(this.config);
    
    this.initializeAnalytics();
  }

  /**
   * Initialize analytics system
   */
  initializeAnalytics() {
    // Check consent
    this.checkConsent();
    
    // Initialize session tracking
    this.initializeSessionTracking();
    
    // Setup periodic cleanup
    this.setupPeriodicCleanup();
    
    // Setup error tracking
    this.setupErrorTracking();
    
    // Start session monitoring
    this.startSessionMonitoring();
  }

  /**
   * Check user consent
   */
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

  /**
   * Start analytics collection
   */
  startAnalytics() {
    // Track session start
    this.trackEvent('session_start', {
      sessionId: this.sessionId,
      timestamp: this.sessionStart,
      userAgent: this.getSafeUserAgent(),
      extensionVersion: this.getExtensionVersion()
    });
    
    // Setup periodic reporting
    if (this.config.enableReporting) {
      this.setupPeriodicReporting();
    }
  }

  /**
   * Track event with privacy protection
   * @param {string} eventType - Event type
   * @param {Object} eventData - Event data
   */
  trackEvent(eventType, eventData = {}) {
    if (!this.isConsented || !this.config.enableAnalytics) {
      return;
    }

    try {
      // Apply sampling
      if (this.config.enableSampling && !this.samplingController.shouldSample(eventType)) {
        return;
      }

      // Process event data
      const processedData = this.dataProcessor.processEvent(eventType, eventData);
      
      // Apply differential privacy
      const protectedData = this.config.enableDifferentialPrivacy 
        ? this.differentialPrivacy.protect(processedData)
        : processedData;

      // Add to buffer
      const event = {
        id: this.generateEventId(),
        type: eventType,
        data: protectedData,
        timestamp: Date.now(),
        sessionId: this.sessionId
      };

      this.eventBuffer.push(event);
      this.lastActivity = Date.now();

      // Process buffer if full
      if (this.eventBuffer.length >= this.config.batchSize) {
        this.processEventBuffer();
      }

    } catch (error) {
      console.warn('Failed to track event:', error);
    }
  }

  /**
   * Track workflow events
   * @param {string} workflowType - Workflow type
   * @param {Object} workflowData - Workflow data
   */
  trackWorkflow(workflowType, workflowData = {}) {
    if (!this.config.enableWorkflowTracking) return;

    this.trackEvent('workflow', {
      workflowType,
      ...workflowData,
      category: 'workflow'
    });
  }

  /**
   * Track feature usage
   * @param {string} featureName - Feature name
   * @param {Object} featureData - Feature data
   */
  trackFeatureUsage(featureName, featureData = {}) {
    if (!this.config.enableFeatureUsage) return;

    this.trackEvent('feature_usage', {
      featureName,
      ...featureData,
      category: 'feature'
    });
  }

  /**
   * Track performance metrics
   * @param {Object} performanceData - Performance data
   */
  trackPerformance(performanceData = {}) {
    if (!this.config.enablePerformanceMetrics) return;

    this.trackEvent('performance', {
      ...performanceData,
      category: 'performance'
    });
  }

  /**
   * Track errors
   * @param {Error} error - Error object
   * @param {Object} errorContext - Error context
   */
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

  /**
   * Track session quality
   * @param {Object} qualityData - Quality metrics
   */
  trackSessionQuality(qualityData = {}) {
    if (!this.config.enableSessionQuality) return;

    this.trackEvent('session_quality', {
      ...qualityData,
      category: 'quality'
    });
  }

  /**
   * Track user friction
   * @param {string} frictionType - Type of friction
   * @param {Object} frictionData - Friction data
   */
  trackUserFriction(frictionType, frictionData = {}) {
    this.trackEvent('user_friction', {
      frictionType,
      ...frictionData,
      category: 'friction'
    });
  }

  /**
   * Process event buffer
   */
  async processEventBuffer() {
    if (this.eventBuffer.length === 0) return;

    const events = this.eventBuffer.splice(0, this.config.batchSize);
    
    try {
      // Aggregate metrics
      this.aggregateMetrics(events);
      
      // Store locally if configured
      if (!this.config.localOnly) {
        await this.storeEvents(events);
      }
      
      // Send to telemetry if enabled
      if (this.config.enableTelemetry) {
        await this.sendToTelemetry(events);
      }
      
    } catch (error) {
      console.warn('Failed to process event buffer:', error);
      // Put events back in buffer for retry
      this.eventBuffer.unshift(...events);
    }
  }

  /**
   * Aggregate metrics from events
   * @param {Array} events - Events to aggregate
   */
  aggregateMetrics(events) {
    for (const event of events) {
      const { type, category } = event;
      
      // Update event counts
      const key = `${category}_${type}`;
      const count = this.aggregatedMetrics.get(key) || 0;
      this.aggregatedMetrics.set(key, count + 1);
      
      // Update category counts
      const categoryKey = `category_${category}`;
      const categoryCount = this.aggregatedMetrics.get(categoryKey) || 0;
      this.aggregatedMetrics.set(categoryKey, categoryCount + 1);
    }
  }

  /**
   * Store events locally
   * @param {Array} events - Events to store
   */
  async storeEvents(events) {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const storageKey = this.config.storageKey;
        const existing = await this.getStoredEvents();
        const updated = [...existing, ...events];
        
        // Apply retention policy
        const cutoff = Date.now() - (this.config.dataRetentionDays * 24 * 60 * 60 * 1000);
        const filtered = updated.filter(event => event.timestamp > cutoff);
        
        await chrome.storage.local.set({ [storageKey]: filtered });
      }
    } catch (error) {
      console.warn('Failed to store events:', error);
    }
  }

  /**
   * Get stored events
   * @returns {Array} Stored events
   */
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

  /**
   * Send events to telemetry
   * @param {Array} events - Events to send
   */
  async sendToTelemetry(events) {
    // In production, this would send to actual telemetry service
    // For now, we'll just log the aggregated metrics
    console.log('Telemetry data:', {
      eventCount: events.length,
      aggregatedMetrics: Object.fromEntries(this.aggregatedMetrics),
      sessionId: this.sessionId
    });
  }

  /**
   * Initialize session tracking
   */
  initializeSessionTracking() {
    // Track page visibility changes
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

    // Track page unload
    window.addEventListener('beforeunload', () => {
      this.trackEvent('session_end', {
        duration: Date.now() - this.sessionStart,
        eventCount: this.eventBuffer.length
      });
      
      // Process remaining events
      this.processEventBuffer();
    });
  }

  /**
   * Setup periodic cleanup
   */
  setupPeriodicCleanup() {
    setInterval(() => {
      this.cleanupOldData();
    }, 24 * 60 * 60 * 1000); // Daily cleanup
  }

  /**
   * Setup error tracking
   */
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

  /**
   * Start session monitoring
   */
  startSessionMonitoring() {
    setInterval(() => {
      const now = Date.now();
      const sessionDuration = now - this.sessionStart;
      const inactivityDuration = now - this.lastActivity;
      
      // Track session metrics
      this.trackSessionQuality({
        sessionDuration,
        inactivityDuration,
        eventCount: this.eventBuffer.length,
        errorCount: this.errorLog.length
      });
      
      // Check for session timeout
      if (sessionDuration > this.config.maxSessionDuration) {
        this.trackEvent('session_timeout', {
          duration: sessionDuration
        });
      }
      
      // Check for user friction (long inactivity)
      if (inactivityDuration > 30 * 60 * 1000) { // 30 minutes
        this.trackUserFriction('long_inactivity', {
          duration: inactivityDuration
        });
      }
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  /**
   * Setup periodic reporting
   */
  setupPeriodicReporting() {
    setInterval(() => {
      this.generateReport();
    }, this.config.reportingInterval);
  }

  /**
   * Generate analytics report
   * @returns {Object} Analytics report
   */
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

  /**
   * Cleanup old data
   */
  cleanupOldData() {
    const cutoff = Date.now() - (this.config.dataRetentionDays * 24 * 60 * 60 * 1000);
    
    // Clean event buffer
    this.eventBuffer = this.eventBuffer.filter(event => event.timestamp > cutoff);
    
    // Clean error log
    this.errorLog = this.errorLog.filter(error => error.timestamp > cutoff);
    
    // Clean aggregated metrics (keep recent ones)
    const recentMetrics = new Map();
    for (const [key, value] of this.aggregatedMetrics.entries()) {
      if (value > 0) { // Keep active metrics
        recentMetrics.set(key, value);
      }
    }
    this.aggregatedMetrics = recentMetrics;
  }

  /**
   * Get analytics summary
   * @returns {Object} Analytics summary
   */
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

  /**
   * Update consent status
   * @param {boolean} consent - User consent
   */
  updateConsent(consent) {
    this.isConsented = consent;
    
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.set({ analytics_consent: consent });
      }
      
      if (consent && this.config.enableAnalytics) {
        this.startAnalytics();
      } else {
        // Clear data if consent withdrawn
        this.clearAllData();
      }
    } catch (error) {
      console.warn('Failed to update consent:', error);
    }
  }

  /**
   * Clear all analytics data
   */
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

  /**
   * Utility methods
   */
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  generateUserId() {
    // Generate persistent but anonymous user ID
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
    // Remove sensitive information from user agent
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

/**
 * Data Processor - Privacy-focused data processing
 */
class DataProcessor {
  constructor(config) {
    this.config = config;
  }

  /**
   * Process event data for privacy
   * @param {string} eventType - Event type
   * @param {Object} eventData - Raw event data
   * @returns {Object} Processed data
   */
  processEvent(eventType, eventData) {
    let processed = { ...eventData };
    
    // Remove sensitive fields
    processed = this.removeSensitiveFields(processed);
    
    // Anonymize if enabled
    if (this.config.anonymizeData) {
      processed = this.anonymizeData(processed);
    }
    
    // Add metadata
    processed.processedAt = Date.now();
    processed.eventType = eventType;
    
    return processed;
  }

  /**
   * Remove sensitive fields from data
   * @param {Object} data - Data to clean
   * @returns {Object} Cleaned data
   */
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

  /**
   * Anonymize data
   * @param {Object} data - Data to anonymize
   * @returns {Object} Anonymized data
   */
  anonymizeData(data) {
    const anonymized = { ...data };
    
    // Hash string values to prevent identification
    for (const [key, value] of Object.entries(anonymized)) {
      if (typeof value === 'string' && value.length > 10) {
        anonymized[key] = this.hashString(value);
      }
    }
    
    return anonymized;
  }

  /**
   * Hash string for anonymization
   * @param {string} str - String to hash
   * @returns {string} Hashed string
   */
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

/**
 * Sampling Controller - Intelligent event sampling
 */
class SamplingController {
  constructor(config) {
    this.config = config;
    this.adaptiveRates = new Map();
  }

  /**
   * Determine if event should be sampled
   * @param {string} eventType - Event type
   * @returns {boolean} Whether to sample
   */
  shouldSample(eventType) {
    if (!this.config.enableSampling) {
      return true;
    }
    
    // Use adaptive sampling if enabled
    if (this.config.enableAdaptiveSampling) {
      const rate = this.getAdaptiveRate(eventType);
      return Math.random() < rate;
    }
    
    // Use fixed sampling rate
    return Math.random() < this.config.samplingRate;
  }

  /**
   * Get adaptive sampling rate for event type
   * @param {string} eventType - Event type
   * @returns {number} Sampling rate
   */
  getAdaptiveRate(eventType) {
    // Higher sampling for important events
    const importantEvents = ['session_start', 'session_end', 'error', 'user_friction'];
    if (importantEvents.includes(eventType)) {
      return 1.0; // Always sample important events
    }
    
    // Lower sampling for high-frequency events
    const highFrequencyEvents = ['performance', 'feature_usage'];
    if (highFrequencyEvents.includes(eventType)) {
      return 0.1; // 10% sampling for high-frequency events
    }
    
    // Default sampling rate
    return this.config.samplingRate;
  }
}

/**
 * Differential Privacy - Privacy protection through noise
 */
class DifferentialPrivacy {
  constructor(config) {
    this.config = config;
    this.epsilon = 1.0; // Privacy budget
  }

  /**
   * Apply differential privacy to data
   * @param {Object} data - Data to protect
   * @returns {Object} Protected data
   */
  protect(data) {
    const protected = { ...data };
    
    // Add noise to numeric values
    for (const [key, value] of Object.entries(protected)) {
      if (typeof value === 'number') {
        protected[key] = this.addNoise(value);
      }
    }
    
    return protected;
  }

  /**
   * Add Laplace noise to numeric value
   * @param {number} value - Value to add noise to
   * @returns {number} Noisy value
   */
  addNoise(value) {
    // Simple Laplace noise implementation
    const noise = this.laplaceNoise(0, 1 / this.epsilon);
    return Math.round(value + noise);
  }

  /**
   * Generate Laplace noise
   * @param {number} mu - Mean
   * @param {number} b - Scale parameter
   * @returns {number} Noise value
   */
  laplaceNoise(mu, b) {
    const u = Math.random() - 0.5;
    return mu - b * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
  }
}

// Export singleton instance
export const privacyFirstAnalytics = new PrivacyFirstAnalytics();

// Export utilities with different names to avoid redeclaration
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

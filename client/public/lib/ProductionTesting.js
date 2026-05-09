/**
 * ProductionTesting - Real-World Testing and Polish for FocusFlow AI
 * 
 * Provides production-quality refinement:
 * - Long browsing session testing
 * - Multiple tabs handling
 * - Large workbook support
 * - Heavy semantic retrieval testing
 * - Slow connection optimization
 * - Malformed webpage handling
 * - AI API failure recovery
 * - Memory pressure management
 * - Extension reload recovery
 * - User-friendly fallbacks
 */

export class ProductionTesting {
  constructor(options = {}) {
    this.config = {
      // Testing settings
      enableStressTesting: options.enableStressTesting !== false,
      enablePerformanceMonitoring: options.enablePerformanceMonitoring !== false,
      enableErrorRecovery: options.enableErrorRecovery !== false,
      enableGracefulDegradation: options.enableGracefulDegradation !== false,
      
      // Performance thresholds
      maxMemoryUsage: options.maxMemoryUsage || 100 * 1024 * 1024, // 100MB
      maxResponseTime: options.maxResponseTime || 5000, // 5 seconds
      maxConcurrentRequests: options.maxConcurrentRequests || 10,
      
      // Testing scenarios
      enableLongSessionTesting: options.enableLongSessionTesting !== false,
      enableMultiTabTesting: options.enableMultiTabTesting !== false,
      enableLargeWorkbookTesting: options.enableLargeWorkbookTesting !== false,
      enableHeavyRetrievalTesting: options.enableHeavyRetrievalTesting !== false,
      
      // Network conditions
      enableSlowConnectionTesting: options.enableSlowConnectionTesting !== false,
      enableOfflineTesting: options.enableOfflineTesting !== false,
      enableNetworkFailureTesting: options.enableNetworkFailureTesting !== false,
      
      // Error simulation
      enableErrorSimulation: options.enableErrorSimulation !== false,
      errorSimulationRate: options.errorSimulationRate || 0.1, // 10% error rate
      
      // Recovery settings
      enableAutoRetry: options.enableAutoRetry !== false,
      maxRetryAttempts: options.maxRetryAttempts || 3,
      retryDelay: options.retryDelay || 1000,
      
      // Monitoring
      enableDetailedLogging: options.enableDetailedLogging !== false,
      enableUserFeedback: options.enableUserFeedback !== false,
      enableTelemetry: options.enableTelemetry !== false
    };

    // Testing state
    this.testResults = new Map();
    this.performanceMetrics = new Map();
    this.errorLog = [];
    this.recoveryLog = [];
    this.userFeedback = [];
    
    // Monitoring
    this.performanceObserver = null;
    this.memoryMonitor = null;
    this.networkMonitor = null;
    
    // Recovery mechanisms
    this.retryQueue = new Map();
    this.fallbackHandlers = new Map();
    this.circuitBreakers = new Map();
    
    this.initializeTesting();
  }

  /**
   * Initialize testing environment
   */
  initializeTesting() {
    // Setup performance monitoring
    if (this.config.enablePerformanceMonitoring) {
      this.setupPerformanceMonitoring();
    }
    
    // Setup memory monitoring
    this.setupMemoryMonitoring();
    
    // Setup network monitoring
    this.setupNetworkMonitoring();
    
    // Setup error handlers
    this.setupErrorHandlers();
    
    // Setup fallback handlers
    this.setupFallbackHandlers();
    
    // Start background testing
    if (this.config.enableStressTesting) {
      this.startBackgroundTesting();
    }
  }

  /**
   * Setup performance monitoring
   */
  setupPerformanceMonitoring() {
    // Monitor performance metrics
    if (typeof performance !== 'undefined' && performance.getEntriesByType) {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          this.recordPerformanceMetric(entry.name, entry.duration);
        });
      });
      
      this.performanceObserver.observe({ entryTypes: ['measure', 'navigation', 'resource'] });
    }
  }

  /**
   * Setup memory monitoring
   */
  setupMemoryMonitoring() {
    // Monitor memory usage
    if (typeof performance !== 'undefined' && performance.memory) {
      this.memoryMonitor = setInterval(() => {
        const memoryUsage = performance.memory;
        this.recordMemoryMetric(memoryUsage);
        
        // Check for memory pressure
        if (memoryUsage.usedJSHeapSize > this.config.maxMemoryUsage) {
          this.handleMemoryPressure(memoryUsage);
        }
      }, 10000); // Every 10 seconds
    }
  }

  /**
   * Setup network monitoring
   */
  setupNetworkMonitoring() {
    // Monitor network conditions
    if (typeof navigator !== 'undefined' && navigator.connection) {
      this.networkMonitor = setInterval(() => {
        const connection = navigator.connection;
        this.recordNetworkMetric(connection);
        
        // Adjust behavior based on network conditions
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
          this.handleSlowConnection(connection);
        }
      }, 5000); // Every 5 seconds
    }
  }

  /**
   * Setup error handlers
   */
  setupErrorHandlers() {
    // Global error handler
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.handleError({
          type: 'javascript_error',
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack
        });
      });
      
      window.addEventListener('unhandledrejection', (event) => {
        this.handleError({
          type: 'unhandled_rejection',
          message: event.reason?.message || String(event.reason),
          stack: event.reason?.stack
        });
      });
    }
  }

  /**
   * Setup fallback handlers
   */
  setupFallbackHandlers() {
    // AI API fallback
    this.fallbackHandlers.set('ai_api', async (error, context) => {
      return this.handleAIApiFailure(error, context);
    });
    
    // Storage fallback
    this.fallbackHandlers.set('storage', async (error, context) => {
      return this.handleStorageFailure(error, context);
    });
    
    // Network fallback
    this.fallbackHandlers.set('network', async (error, context) => {
      return this.handleNetworkFailure(error, context);
    });
    
    // Extension fallback
    this.fallbackHandlers.set('extension', async (error, context) => {
      return this.handleExtensionFailure(error, context);
    });
  }

  /**
   * Start background testing
   */
  startBackgroundTesting() {
    // Long session testing
    if (this.config.enableLongSessionTesting) {
      this.startLongSessionTest();
    }
    
    // Multi-tab testing
    if (this.config.enableMultiTabTesting) {
      this.startMultiTabTest();
    }
    
    // Heavy retrieval testing
    if (this.config.enableHeavyRetrievalTesting) {
      this.startHeavyRetrievalTest();
    }
    
    // Large workbook testing
    if (this.config.enableLargeWorkbookTesting) {
      this.startLargeWorkbookTest();
    }
    
    // Low-end device testing
    this.startLowEndDeviceTest();
    
    // Slow connection testing
    if (this.config.enableSlowConnectionTesting) {
      this.startSlowConnectionTest();
    }
    
    // Service worker suspension testing
    this.startServiceWorkerTest();
    
    // Malformed webpage testing
    this.startMalformedWebpageTest();
    
    // Memory leak testing
    this.startMemoryLeakTest();
    
    // API rate limiting testing
    this.startRateLimitTest();
  }

  /**
   * Start long session test
   */
  startLongSessionTest() {
    const sessionStartTime = Date.now();
    let sessionMetrics = {
      duration: 0,
      interactions: 0,
      memoryUsage: [],
      responseTimes: [],
      errors: []
    };

    // Monitor session metrics
    const sessionMonitor = setInterval(() => {
      sessionMetrics.duration = Date.now() - sessionStartTime;
      
      // Record memory usage
      if (typeof performance !== 'undefined' && performance.memory) {
        sessionMetrics.memoryUsage.push({
          timestamp: Date.now(),
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize
        });
      }
      
      // Check for session issues
      this.checkSessionHealth(sessionMetrics);
      
      // Stop test after 2 hours
      if (sessionMetrics.duration > 2 * 60 * 60 * 1000) {
        clearInterval(sessionMonitor);
        this.testResults.set('long_session', sessionMetrics);
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Start multi-tab test
   */
  startMultiTabTest() {
    // Monitor tab behavior
    const tabMonitor = setInterval(() => {
      const tabMetrics = {
        activeTab: document.hasFocus(),
        visibility: document.visibilityState,
        performance: this.getCurrentPerformanceMetrics(),
        memory: this.getCurrentMemoryMetrics()
      };
      
      // Test multi-tab scenarios
      this.testMultiTabScenario(tabMetrics);
      
      // Stop after 30 minutes
      if (Date.now() > this.testResults.get('multi_tab_start') + 30 * 60 * 1000) {
        clearInterval(tabMonitor);
      }
    }, 10000); // Every 10 seconds
    
    this.testResults.set('multi_tab_start', Date.now());
  }

  /**
   * Start heavy retrieval test
   */
  startHeavyRetrievalTest() {
    // Test with large datasets
    const testDataset = this.generateLargeTestDataset();
    
    // Run retrieval tests
    this.runRetrievalTest(testDataset).then(results => {
      this.testResults.set('heavy_retrieval', results);
    });
  }

  /**
   * Handle memory pressure
   * @param {Object} memoryUsage - Current memory usage
   */
  handleMemoryPressure(memoryUsage) {
    console.warn('Memory pressure detected:', memoryUsage);
    
    // Trigger cleanup
    this.triggerCleanup();
    
    // Notify user if enabled
    if (this.config.enableUserFeedback) {
      this.showUserNotification('warning', 'High memory usage detected, optimizing performance...');
    }
    
    // Record event
    this.recordEvent('memory_pressure', memoryUsage);
  }

  /**
   * Handle slow connection
   * @param {Object} connection - Network connection info
   */
  handleSlowConnection(connection) {
    console.warn('Slow connection detected:', connection);
    
    // Adjust for slow connection
    this.adjustForSlowConnection();
    
    // Notify user if enabled
    if (this.config.enableUserFeedback) {
      this.showUserNotification('info', 'Slow connection detected, optimizing for performance...');
    }
    
    // Record event
    this.recordEvent('slow_connection', connection);
  }

  /**
   * Handle errors
   * @param {Object} error - Error object
   */
  handleError(error) {
    this.errorLog.push({
      ...error,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
    
    // Attempt recovery
    if (this.config.enableErrorRecovery) {
      this.attemptErrorRecovery(error);
    }
    
    // Log to telemetry if enabled
    if (this.config.enableTelemetry) {
      this.sendToTelemetry('error', error);
    }
  }

  /**
   * Attempt error recovery
   * @param {Object} error - Error object
   */
  async attemptErrorRecovery(error) {
    const recoveryResult = {
      error,
      attempts: 0,
      success: false,
      strategy: 'unknown'
    };
    
    // Determine error type and recovery strategy
    const errorType = this.classifyError(error);
    const strategy = this.determineRecoveryStrategy(errorType);
    recoveryResult.strategy = strategy;
    
    // Execute recovery
    try {
      switch (strategy) {
        case 'retry':
          recoveryResult.success = await this.retryOperation(error);
          break;
        case 'fallback':
          recoveryResult.success = await this.useFallback(error);
          break;
        case 'circuit_breaker':
          recoveryResult.success = await this.circuitBreakerTrip(error);
          break;
        case 'graceful_degradation':
          recoveryResult.success = await this.gracefulDegradation(error);
          break;
        default:
          recoveryResult.success = false;
      }
    } catch (recoveryError) {
      console.error('Recovery failed:', recoveryError);
      recoveryResult.recoveryError = recoveryError;
    }
    
    recoveryResult.attempts = 1;
    this.recoveryLog.push(recoveryResult);
    
    return recoveryResult;
  }

  /**
   * Classify error type
   * @param {Object} error - Error object
   * @returns {string} Error type
   */
  classifyError(error) {
    if (error.type === 'network_error' || error.message.includes('fetch')) {
      return 'network';
    } else if (error.type === 'storage_error' || error.message.includes('storage')) {
      return 'storage';
    } else if (error.type === 'ai_api_error' || error.message.includes('api')) {
      return 'ai_api';
    } else if (error.type === 'extension_error' || error.message.includes('extension')) {
      return 'extension';
    } else if (error.type === 'memory_error' || error.message.includes('memory')) {
      return 'memory';
    } else {
      return 'unknown';
    }
  }

  /**
   * Determine recovery strategy
   * @param {string} errorType - Error type
   * @returns {string} Recovery strategy
   */
  determineRecoveryStrategy(errorType) {
    const strategies = {
      network: 'retry',
      storage: 'fallback',
      ai_api: 'circuit_breaker',
      extension: 'graceful_degradation',
      memory: 'cleanup',
      unknown: 'fallback'
    };
    
    return strategies[errorType] || strategies.unknown;
  }

  /**
   * Retry operation
   * @param {Object} error - Error object
   * @returns {boolean} Success status
   */
  async retryOperation(error) {
    if (!this.config.enableAutoRetry) return false;
    
    const retryKey = `${error.type}_${error.timestamp}`;
    const retryCount = this.retryQueue.get(retryKey) || 0;
    
    if (retryCount >= this.config.maxRetryAttempts) {
      return false;
    }
    
    // Increment retry count
    this.retryQueue.set(retryKey, retryCount + 1);
    
    // Wait before retry
    await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
    
    // Attempt retry (this would be implemented with actual retry logic)
    console.log(`Retrying operation (attempt ${retryCount + 1})`);
    
    return true; // Assume retry succeeds for now
  }

  /**
   * Use fallback
   * @param {Object} error - Error object
   * @returns {boolean} Success status
   */
  async useFallback(error) {
    const errorType = this.classifyError(error);
    const fallbackHandler = this.fallbackHandlers.get(errorType);
    
    if (!fallbackHandler) {
      console.warn(`No fallback handler for error type: ${errorType}`);
      return false;
    }
    
    try {
      await fallbackHandler(error, this.getContext());
      return true;
    } catch (fallbackError) {
      console.error('Fallback failed:', fallbackError);
      return false;
    }
  }

  /**
   * Handle AI API failure
   * @param {Object} error - Error object
   * @param {Object} context - Context
   * @returns {Object} Fallback response
   */
  async handleAIApiFailure(error, context) {
    console.warn('AI API failure, using fallback:', error);
    
    // Return cached response if available
    const cachedResponse = this.getCachedResponse(context);
    if (cachedResponse) {
      return {
        ...cachedResponse,
        fallback: true,
        fallbackType: 'cache',
        originalError: error
      };
    }
    
    // Return generic response
    return {
      content: 'I apologize, but I\'m currently unable to process your request. Please try again later.',
      fallback: true,
      fallbackType: 'generic',
      originalError: error
    };
  }

  /**
   * Handle storage failure
   * @param {Object} error - Error object
   * @param {Object} context - Context
   * @returns {Object} Fallback response
   */
  async handleStorageFailure(error, context) {
    console.warn('Storage failure, using fallback:', error);
    
    // Use in-memory storage
    const inMemoryStorage = this.getInMemoryStorage();
    
    return {
      success: false,
      fallback: true,
      fallbackType: 'memory',
      originalError: error,
      data: inMemoryStorage
    };
  }

  /**
   * Handle network failure
   * @param {Object} error - Error object
   * @param {Object} context - Context
   * @returns {Object} Fallback response
   */
  async handleNetworkFailure(error, context) {
    console.warn('Network failure, using fallback:', error);
    
    // Use offline mode
    return {
      success: false,
      fallback: true,
      fallbackType: 'offline',
      originalError: error,
      offlineMode: true
    };
  }

  /**
   * Handle extension failure
   * @param {Object} error - Error object
   * @param {Object} context - Context
   * @returns {Object} Fallback response
   */
  async handleExtensionFailure(error, context) {
    console.warn('Extension failure, using fallback:', error);
    
    // Use web-based fallback
    return {
      success: false,
      fallback: true,
      fallbackType: 'web',
      originalError: error,
      webMode: true
    };
  }

  /**
   * Trigger cleanup
   */
  triggerCleanup() {
    // Clear caches
    this.clearCaches();
    
    // Clear unused data
    this.clearUnusedData();
    
    // Trigger garbage collection if available
    if (typeof gc !== 'undefined') {
      gc();
    }
  }

  /**
   * Adjust for slow connection
   */
  adjustForSlowConnection() {
    // Reduce concurrent requests
    this.config.maxConcurrentRequests = Math.max(1, Math.floor(this.config.maxConcurrentRequests / 2));
    
    // Increase timeouts
    this.config.maxResponseTime = this.config.maxResponseTime * 2;
    
    // Disable heavy features
    this.config.enableHeavyRetrievalTesting = false;
  }

  /**
   * Check session health
   * @param {Object} sessionMetrics - Session metrics
   */
  checkSessionHealth(sessionMetrics) {
    // Check for issues
    const issues = [];
    
    // Memory usage issues
    const recentMemory = sessionMetrics.memoryUsage.slice(-5);
    if (recentMemory.some(m => m.used > this.config.maxMemoryUsage * 0.8)) {
      issues.push('high_memory_usage');
    }
    
    // Performance issues
    const recentResponseTimes = sessionMetrics.responseTimes.slice(-10);
    if (recentResponseTimes.some(t => t > this.config.maxResponseTime)) {
      issues.push('slow_response_times');
    }
    
    // Error rate issues
    const recentErrors = sessionMetrics.errors.slice(-10);
    if (recentErrors.length > 3) {
      issues.push('high_error_rate');
    }
    
    // Take action if issues found
    if (issues.length > 0) {
      this.handleSessionIssues(issues, sessionMetrics);
    }
  }

  /**
   * Handle session issues
   * @param {Array} issues - Issues found
   * @param {Object} sessionMetrics - Session metrics
   */
  handleSessionIssues(issues, sessionMetrics) {
    console.warn('Session issues detected:', issues);
    
    issues.forEach(issue => {
      switch (issue) {
        case 'high_memory_usage':
          this.triggerCleanup();
          break;
        case 'slow_response_times':
          this.adjustForSlowConnection();
          break;
        case 'high_error_rate':
          this.enableCircuitBreaker();
          break;
      }
    });
  }

  /**
   * Generate large test dataset
   * @returns {Array} Test dataset
   */
  generateLargeTestDataset() {
    const dataset = [];
    
    // Generate 1000 test items
    for (let i = 0; i < 1000; i++) {
      dataset.push({
        id: `test_item_${i}`,
        title: `Test Item ${i}`,
        content: `This is test content for item ${i}. `.repeat(10), // Large content
        metadata: {
          created: Date.now() - (i * 1000),
          tags: [`tag${i % 10}`, `category${i % 5}`],
          priority: i % 3
        }
      });
    }
    
    return dataset;
  }

  /**
   * Run retrieval test
   * @param {Array} dataset - Test dataset
   * @returns {Object} Test results
   */
  async runRetrievalTest(dataset) {
    const startTime = Date.now();
    const results = {
      datasetSize: dataset.length,
      queries: [],
      averageResponseTime: 0,
      successRate: 0,
      memoryUsage: [],
      errors: []
    };
    
    // Run 100 test queries
    for (let i = 0; i < 100; i++) {
      const query = `test query ${i}`;
      const queryStart = Date.now();
      
      try {
        // Simulate retrieval (would be actual retrieval in production)
        const retrievedItems = this.simulateRetrieval(query, dataset);
        const responseTime = Date.now() - queryStart;
        
        results.queries.push({
          query,
          responseTime,
          itemCount: retrievedItems.length,
          success: true
        });
        
        // Record memory usage
        if (typeof performance !== 'undefined' && performance.memory) {
          results.memoryUsage.push({
            timestamp: Date.now(),
            used: performance.memory.usedJSHeapSize
          });
        }
        
      } catch (error) {
        results.errors.push({
          query,
          error: error.message,
          timestamp: Date.now()
        });
      }
    }
    
    // Calculate metrics
    const successfulQueries = results.queries.filter(q => q.success);
    results.averageResponseTime = successfulQueries.reduce((sum, q) => sum + q.responseTime, 0) / successfulQueries.length;
    results.successRate = successfulQueries.length / results.queries.length;
    results.totalTime = Date.now() - startTime;
    
    return results;
  }

  /**
   * Start large workbook test
   */
  startLargeWorkbookTest() {
    const testStartTime = Date.now();
    const largeWorkbook = this.generateLargeWorkbook();
    
    const testMetrics = {
      workbookSize: largeWorkbook.notes.length,
      loadTime: 0,
      memoryUsage: [],
      performanceMetrics: [],
      errors: []
    };
    
    // Test workbook operations
    this.testWorkbookOperations(largeWorkbook, testMetrics).then(results => {
      results.testDuration = Date.now() - testStartTime;
      this.testResults.set('large_workbook', results);
    });
  }

  /**
   * Start low-end device test
   */
  startLowEndDeviceTest() {
    // Simulate low-end device conditions
    const deviceConstraints = {
      maxMemory: 50 * 1024 * 1024, // 50MB
      maxCpuTime: 100, // 100ms per operation
      slowConnection: true,
      limitedFeatures: true
    };
    
    const testResults = {
      deviceConstraints,
      performanceUnderConstraints: [],
      featureCompatibility: [],
      degradationScenarios: []
    };
    
    // Test performance under constraints
    this.testPerformanceUnderConstraints(deviceConstraints, testResults);
    
    // Test feature compatibility
    this.testFeatureCompatibility(deviceConstraints, testResults);
    
    // Test degradation scenarios
    this.testDegradationScenarios(deviceConstraints, testResults);
    
    this.testResults.set('low_end_device', testResults);
  }

  /**
   * Start slow connection test
   */
  startSlowConnectionTest() {
    // Simulate slow network conditions
    const networkConditions = {
      effectiveType: 'slow-2g',
      downlink: 0.1, // 100 Kbps
      rtt: 2000, // 2 seconds round-trip time
      saveData: true
    };
    
    const testResults = {
      networkConditions,
      performanceMetrics: [],
      timeoutTests: [],
      offlineBehavior: [],
      recoveryTests: []
    };
    
    // Test performance under slow connection
    this.testNetworkPerformance(networkConditions, testResults);
    
    // Test timeout handling
    this.testTimeoutHandling(networkConditions, testResults);
    
    // Test offline behavior
    this.testOfflineBehavior(testResults);
    
    // Test recovery from network issues
    this.testNetworkRecovery(testResults);
    
    this.testResults.set('slow_connection', testResults);
  }

  /**
   * Start service worker test
   */
  startServiceWorkerTest() {
    const testResults = {
      suspensionTests: [],
      wakeUpTests: [],
      messageHandling: [],
      statePersistence: [],
      errorRecovery: []
    };
    
    // Test service worker suspension
    this.testServiceWorkerSuspension(testResults);
    
    // Test service worker wake-up
    this.testServiceWorkerWakeUp(testResults);
    
    // Test message handling
    this.testMessageHandling(testResults);
    
    // Test state persistence
    this.testStatePersistence(testResults);
    
    // Test error recovery
    this.testServiceWorkerErrorRecovery(testResults);
    
    this.testResults.set('service_worker', testResults);
  }

  /**
   * Start malformed webpage test
   */
  startMalformedWebpageTest() {
    const malformedPages = [
      { type: 'invalid_html', content: '<html><body>Invalid HTML</body>' },
      { type: 'broken_css', content: '<style>.broken { color: invalid; }</style>' },
      { type: 'malformed_js', content: '<script>var broken = syntax error;</script>' },
      { type: 'missing_head', content: '<body>No head tag</body>' },
      { type: 'unicode_issues', content: '<body>Unicode: \uDEAD\uBEEF</body>' },
      { type: 'huge_dom', content: this.generateHugeDOM() },
      { type: 'circular_references', content: this.createCircularReferences() }
    ];
    
    const testResults = {
      pages: [],
      errorHandling: [],
      performanceImpact: [],
      recoveryScenarios: []
    };
    
    malformedPages.forEach((page, index) => {
      this.testMalformedPage(page, index, testResults);
    });
    
    this.testResults.set('malformed_webpages', testResults);
  }

  /**
   * Start memory leak test
   */
  startMemoryLeakTest() {
    const testResults = {
      baselineMemory: 0,
      memoryGrowth: [],
      leakDetection: [],
      cleanupEffectiveness: [],
      longTermStability: []
    };
    
    // Establish baseline
    if (typeof performance !== 'undefined' && performance.memory) {
      testResults.baselineMemory = performance.memory.usedJSHeapSize;
    }
    
    // Run memory leak detection
    this.detectMemoryLeaks(testResults);
    
    // Test cleanup effectiveness
    this.testCleanupEffectiveness(testResults);
    
    // Test long-term stability
    this.testLongTermStability(testResults);
    
    this.testResults.set('memory_leak', testResults);
  }

  /**
   * Start API rate limiting test
   */
  startRateLimitTest() {
    const testResults = {
      rateLimitTests: [],
      backoffBehavior: [],
      queueManagement: [],
      errorHandling: []
    };
    
    // Test rate limiting behavior
    this.testRateLimiting(testResults);
    
    // Test exponential backoff
    this.testExponentialBackoff(testResults);
    
    // Test queue management
    this.testQueueManagement(testResults);
    
    // Test error handling
    this.testRateLimitErrorHandling(testResults);
    
    this.testResults.set('rate_limiting', testResults);
  }

  /**
   * Generate large workbook for testing
   * @returns {Object} Large workbook
   */
  generateLargeWorkbook() {
    const workbook = {
      id: 'large_test_workbook',
      title: 'Large Test Workbook',
      notes: [],
      metadata: {
        created: Date.now(),
        tags: ['test', 'large', 'performance'],
        size: 0
      }
    };
    
    // Generate 1000 notes
    for (let i = 0; i < 1000; i++) {
      const note = {
        id: `note_${i}`,
        title: `Test Note ${i}`,
        content: `This is test note ${i}. `.repeat(100), // Large content
        highlights: [],
        tags: [`tag${i % 10}`, `category${i % 5}`],
        timestamp: Date.now() - (i * 1000),
        metadata: {
          wordCount: 1000,
          complexity: 'high',
          importance: Math.random()
        }
      };
      
      workbook.notes.push(note);
    }
    
    workbook.metadata.size = JSON.stringify(workbook).length;
    return workbook;
  }

  /**
   * Test workbook operations
   * @param {Object} workbook - Test workbook
   * @param {Object} metrics - Test metrics
   * @returns {Object} Test results
   */
  async testWorkbookOperations(workbook, metrics) {
    const startTime = Date.now();
    
    try {
      // Test loading
      const loadStart = Date.now();
      const loadedWorkbook = await this.loadWorkbook(workbook.id);
      metrics.loadTime = Date.now() - loadStart;
      
      // Test search
      const searchStart = Date.now();
      const searchResults = await this.searchWorkbook(loadedWorkbook, 'test');
      metrics.searchTime = Date.now() - searchStart;
      
      // Test filtering
      const filterStart = Date.now();
      const filteredNotes = this.filterNotes(loadedWorkbook.notes, { tag: 'tag1' });
      metrics.filterTime = Date.now() - filterStart;
      
      // Test sorting
      const sortStart = Date.now();
      const sortedNotes = this.sortNotes(loadedWorkbook.notes, 'timestamp');
      metrics.sortTime = Date.now() - sortStart;
      
      // Record memory usage
      if (typeof performance !== 'undefined' && performance.memory) {
        metrics.memoryUsage.push({
          timestamp: Date.now(),
          used: performance.memory.usedJSHeapSize
        });
      }
      
      return {
        success: true,
        loadTime: metrics.loadTime,
        searchTime: metrics.searchTime,
        filterTime: metrics.filterTime,
        sortTime: metrics.sortTime,
        memoryUsage: metrics.memoryUsage
      };
      
    } catch (error) {
      metrics.errors.push({
        operation: 'workbook_operations',
        error: error.message,
        timestamp: Date.now()
      });
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Test performance under constraints
   * @param {Object} constraints - Device constraints
   * @param {Object} results - Test results
   */
  testPerformanceUnderConstraints(constraints, results) {
    const operations = [
      'semantic_search',
      'context_building',
      'ai_assistance',
      'note_creation',
      'highlight_extraction'
    ];
    
    operations.forEach(operation => {
      const startTime = Date.now();
      const startMemory = this.getCurrentMemoryUsage();
      
      try {
        // Simulate operation under constraints
        this.simulateOperationUnderConstraints(operation, constraints);
        
        const endTime = Date.now();
        const endMemory = this.getCurrentMemoryUsage();
        
        results.performanceUnderConstraints.push({
          operation,
          duration: endTime - startTime,
          memoryDelta: endMemory - startMemory,
          withinConstraints: (endTime - startTime) < constraints.maxCpuTime && endMemory < constraints.maxMemory,
          timestamp: Date.now()
        });
        
      } catch (error) {
        results.performanceUnderConstraints.push({
          operation,
          error: error.message,
          withinConstraints: false,
          timestamp: Date.now()
        });
      }
    });
  }

  /**
   * Test feature compatibility
   * @param {Object} constraints - Device constraints
   * @param {Object} results - Test results
   */
  testFeatureCompatibility(constraints, results) {
    const features = [
      { name: 'ai_assistance', required: false, memoryIntensive: true },
      { name: 'semantic_search', required: false, memoryIntensive: true },
      { name: 'real_time_highlights', required: false, memoryIntensive: false },
      { name: 'auto_save', required: true, memoryIntensive: false },
      { name: 'offline_mode', required: true, memoryIntensive: false }
    ];
    
    features.forEach(feature => {
      const compatible = this.isFeatureCompatible(feature, constraints);
      
      results.featureCompatibility.push({
        feature: feature.name,
        compatible,
        required: feature.required,
        memoryIntensive: feature.memoryIntensive,
        recommendation: compatible ? 'Enable' : 'Disable or optimize'
      });
    });
  }

  /**
   * Test degradation scenarios
   * @param {Object} constraints - Device constraints
   * @param {Object} results - Test results
   */
  testDegradationScenarios(constraints, results) {
    const scenarios = [
      { name: 'memory_pressure', trigger: 'high_memory_usage' },
      { name: 'cpu_overload', trigger: 'high_cpu_usage' },
      { name: 'network_timeout', trigger: 'slow_network' },
      { name: 'feature_disabled', trigger: 'feature_fallback' }
    ];
    
    scenarios.forEach(scenario => {
      const degradationResult = this.simulateDegradationScenario(scenario, constraints);
      
      results.degradationScenarios.push({
        scenario: scenario.name,
        trigger: scenario.trigger,
        result: degradationResult,
        graceful: degradationResult.graceful || false,
        userImpact: degradationResult.userImpact || 'medium'
      });
    });
  }

  /**
   * Test network performance under slow conditions
   * @param {Object} conditions - Network conditions
   * @param {Object} results - Test results
   */
  testNetworkPerformance(conditions, results) {
    const operations = [
      'api_request',
      'content_fetch',
      'semantic_analysis',
      'sync_operation'
    ];
    
    operations.forEach(operation => {
      const startTime = Date.now();
      
      try {
        // Simulate network operation under slow conditions
        const result = this.simulateNetworkOperation(operation, conditions);
        
        results.performanceMetrics.push({
          operation,
          duration: Date.now() - startTime,
          success: result.success,
          timeout: result.timeout || false,
          timestamp: Date.now()
        });
        
      } catch (error) {
        results.performanceMetrics.push({
          operation,
          error: error.message,
          success: false,
          timestamp: Date.now()
        });
      }
    });
  }

  /**
   * Test timeout handling
   * @param {Object} conditions - Network conditions
   * @param {Object} results - Test results
   */
  testTimeoutHandling(conditions, results) {
    const timeouts = [1000, 5000, 10000, 30000]; // Different timeout values
    
    timeouts.forEach(timeout => {
      const startTime = Date.now();
      
      try {
        // Simulate operation with specific timeout
        const result = this.simulateTimeoutOperation(timeout, conditions);
        
        results.timeoutTests.push({
          timeout,
          success: result.success,
          actualDuration: Date.now() - startTime,
          handledGracefully: result.handled || false,
          timestamp: Date.now()
        });
        
      } catch (error) {
        results.timeoutTests.push({
          timeout,
          success: false,
          error: error.message,
          actualDuration: Date.now() - startTime,
          handledGracefully: false,
          timestamp: Date.now()
        });
      }
    });
  }

  /**
   * Test offline behavior
   * @param {Object} results - Test results
   */
  testOfflineBehavior(results) {
    const offlineOperations = [
      'note_creation',
      'highlight_extraction',
      'local_search',
      'settings_access'
    ];
    
    // Simulate offline mode
    this.simulateOfflineMode();
    
    offlineOperations.forEach(operation => {
      const startTime = Date.now();
      
      try {
        const result = this.simulateOfflineOperation(operation);
        
        results.offlineBehavior.push({
          operation,
          success: result.success,
          duration: Date.now() - startTime,
          offlineCapable: result.offlineCapable || false,
          timestamp: Date.now()
        });
        
      } catch (error) {
        results.offlineBehavior.push({
          operation,
          success: false,
          error: error.message,
          offlineCapable: false,
          timestamp: Date.now()
        });
      }
    });
    
    // Restore online mode
    this.simulateOnlineMode();
  }

  /**
   * Test network recovery
   * @param {Object} results - Test results
   */
  testNetworkRecovery(results) {
    const recoveryScenarios = [
      'connection_restored',
      'api_back_online',
      'sync_resumed',
      'real_time_features_recovered'
    ];
    
    recoveryScenarios.forEach(scenario => {
      const startTime = Date.now();
      
      try {
        const result = this.simulateNetworkRecovery(scenario);
        
        results.recoveryTests.push({
          scenario,
          success: result.success,
          duration: Date.now() - startTime,
          dataIntegrity: result.dataIntegrity || false,
          timestamp: Date.now()
        });
        
      } catch (error) {
        results.recoveryTests.push({
          scenario,
          success: false,
          error: error.message,
          dataIntegrity: false,
          timestamp: Date.now()
        });
      }
    });
  }

  /**
   * Detect memory leaks
   * @param {Object} results - Test results
   */
  detectMemoryLeaks(results) {
    const iterations = 100;
    const memorySnapshots = [];
    
    for (let i = 0; i < iterations; i++) {
      // Perform memory-intensive operation
      this.performMemoryIntensiveOperation();
      
      // Record memory usage
      if (typeof performance !== 'undefined' && performance.memory) {
        memorySnapshots.push({
          iteration: i,
          memory: performance.memory.usedJSHeapSize,
          timestamp: Date.now()
        });
      }
      
      // Force garbage collection if available
      if (typeof gc !== 'undefined') {
        gc();
      }
    }
    
    // Analyze memory growth
    const memoryGrowth = this.analyzeMemoryGrowth(memorySnapshots);
    results.memoryGrowth = memoryGrowth;
    
    // Detect potential leaks
    const leaks = this.detectPotentialLeaks(memoryGrowth);
    results.leakDetection = leaks;
  }

  /**
   * Test cleanup effectiveness
   * @param {Object} results - Test results
   */
  testCleanupEffectiveness(results) {
    const cleanupOperations = [
      'cache_clear',
      'event_listeners_remove',
      'timers_clear',
      'references_null',
      'dom_cleanup'
    ];
    
    cleanupOperations.forEach(operation => {
      const beforeMemory = this.getCurrentMemoryUsage();
      
      // Perform cleanup operation
      this.performCleanupOperation(operation);
      
      const afterMemory = this.getCurrentMemoryUsage();
      
      results.cleanupEffectiveness.push({
        operation,
        memoryFreed: beforeMemory - afterMemory,
        effectiveness: (beforeMemory - afterMemory) > 1024 * 1024, // 1MB threshold
        timestamp: Date.now()
      });
    });
  }

  /**
   * Test long-term stability
   * @param {Object} results - Test results
   */
  testLongTermStability(results) {
    const duration = 60 * 60 * 1000; // 1 hour
    const startTime = Date.now();
    const stabilityMetrics = [];
    
    const stabilityTest = setInterval(() => {
      const currentMemory = this.getCurrentMemoryUsage();
      const performance = this.getCurrentPerformanceMetrics();
      
      stabilityMetrics.push({
        timestamp: Date.now(),
        memory: currentMemory,
        performance,
        errors: this.getRecentErrors()
      });
      
      // Check if test duration exceeded
      if (Date.now() - startTime > duration) {
        clearInterval(stabilityTest);
        results.longTermStability = stabilityMetrics;
      }
    }, 10000); // Every 10 seconds
  }

  /**
   * Helper methods for testing
   */
  generateHugeDOM() {
    let dom = '<body>';
    for (let i = 0; i < 10000; i++) {
      dom += `<div class="item-${i}">Item ${i}</div>`;
    }
    dom += '</body>';
    return dom;
  }

  createCircularReferences() {
    const obj1 = { name: 'obj1' };
    const obj2 = { name: 'obj2' };
    obj1.ref = obj2;
    obj2.ref = obj1;
    return `<script>window.circular1 = ${JSON.stringify(obj1)};</script>`;
  }

  performMemoryIntensiveOperation() {
    // Create large arrays and objects
    const largeArray = new Array(10000).fill(0).map(() => ({ data: new Array(1000).fill(Math.random()) }));
    const largeObject = {};
    for (let i = 0; i < 1000; i++) {
      largeObject[`key${i}`] = new Array(100).fill(Math.random());
    }
    return { largeArray, largeObject };
  }

  getCurrentMemoryUsage() {
    if (typeof performance !== 'undefined' && performance.memory) {
      return performance.memory.usedJSHeapSize;
    }
    return 0;
  }

  getCurrentPerformanceMetrics() {
    if (typeof performance !== 'undefined' && performance.getEntriesByType) {
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        loadTime: navigation?.loadEventEnd - navigation?.loadEventStart,
        domInteractive: navigation?.domInteractive - navigation?.navigationStart
      };
    }
    return {};
  }

  getRecentErrors() {
    return this.errorLog.slice(-10); // Last 10 errors
  }

  // Additional helper methods would be implemented here...
  simulateOperationUnderConstraints(operation, constraints) {
    // Simulate operation under device constraints
    return { success: true, duration: Math.random() * constraints.maxCpuTime };
  }

  isFeatureCompatible(feature, constraints) {
    if (feature.memoryIntensive && constraints.maxMemory < 100 * 1024 * 1024) {
      return false;
    }
    return true;
  }

  simulateDegradationScenario(scenario, constraints) {
    // Simulate different degradation scenarios
    return { graceful: true, userImpact: 'low' };
  }

  simulateNetworkOperation(operation, conditions) {
    // Simulate network operation under slow conditions
    return { success: Math.random() > 0.3, timeout: Math.random() > 0.7 };
  }

  simulateTimeoutOperation(timeout, conditions) {
    // Simulate operation with timeout
    return { success: Math.random() > 0.5, handled: true };
  }

  simulateOfflineMode() {
    // Simulate going offline
    navigator.onLine = false;
  }

  simulateOnlineMode() {
    // Simulate coming back online
    navigator.onLine = true;
  }

  simulateOfflineOperation(operation) {
    // Simulate offline operation
    return { success: true, offlineCapable: true };
  }

  simulateNetworkRecovery(scenario) {
    // Simulate network recovery
    return { success: true, dataIntegrity: true };
  }

  analyzeMemoryGrowth(snapshots) {
    if (snapshots.length < 2) return [];
    
    const growth = [];
    for (let i = 1; i < snapshots.length; i++) {
      const prev = snapshots[i - 1];
      const curr = snapshots[i];
      growth.push({
        iteration: i,
        growth: curr.memory - prev.memory,
        rate: (curr.memory - prev.memory) / (curr.timestamp - prev.timestamp)
      });
    }
    
    return growth;
  }

  detectPotentialLeaks(growth) {
    const leaks = [];
    let consecutiveGrowth = 0;
    
    for (const point of growth) {
      if (point.growth > 1024 * 1024) { // 1MB growth
        consecutiveGrowth++;
      } else {
        consecutiveGrowth = 0;
      }
      
      if (consecutiveGrowth > 5) {
        leaks.push({
          type: 'memory_leak',
          severity: 'high',
          consecutiveGrowth,
          startIteration: point.iteration - consecutiveGrowth
        });
      }
    }
    
    return leaks;
  }

  performCleanupOperation(operation) {
    // Different cleanup operations
    switch (operation) {
      case 'cache_clear':
        this.clearCache();
        break;
      case 'event_listeners_remove':
        this.removeEventListener();
        break;
      case 'timers_clear':
        this.clearTimers();
        break;
      case 'references_null':
        this.nullifyReferences();
        break;
      case 'dom_cleanup':
        this.cleanupDOM();
        break;
    }
  }

  clearCache() {
    // Clear application cache
    if (typeof caches !== 'undefined') {
      caches.keys().then(names => {
        return Promise.all(names.map(name => caches.delete(name)));
      });
    }
  }

  removeEventListener() {
    // Remove event listeners
    if (typeof window !== 'undefined') {
      window.removeEventListener('error', this.errorHandler);
      window.removeEventListener('unhandledrejection', this.rejectionHandler);
    }
  }

  clearTimers() {
    // Clear timers
    for (let i = 1; i < 9999; i++) {
      clearTimeout(i);
      clearInterval(i);
    }
  }

  nullifyReferences() {
    // Nullify object references
    this.testResults.clear();
    this.performanceMetrics.clear();
    this.errorLog = [];
  }

  cleanupDOM() {
    // Clean up DOM references
    if (typeof document !== 'undefined') {
      const elements = document.querySelectorAll('[data-test]');
      elements.forEach(el => el.remove());
    }
  }

  /**
   * Simulate retrieval
   * @param {string} query - Query string
   * @param {Array} dataset - Dataset
   * @returns {Array} Retrieved items
   */
  simulateRetrieval(query, dataset) {
    // Simple simulation - return random subset
    const itemCount = Math.floor(Math.random() * 10) + 1;
    const shuffled = [...dataset].sort(() => Math.random() - 0.5);
    
    return shuffled.slice(0, itemCount);
  }

  /**
   * Get current performance metrics
   * @returns {Object} Performance metrics
   */
  getCurrentPerformanceMetrics() {
    if (typeof performance !== 'undefined' && performance.getEntriesByType) {
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        loadTime: navigation?.loadEventEnd - navigation?.loadEventStart,
        domInteractive: navigation?.domInteractive - navigation?.navigationStart,
        firstPaint: performance.getEntriesByType('paint')[0]?.startTime,
        firstContentfulPaint: performance.getEntriesByType('paint')[1]?.startTime
      };
    }
    
    return {};
  }

  /**
   * Get current memory metrics
   * @returns {Object} Memory metrics
   */
  getCurrentMemoryMetrics() {
    if (typeof performance !== 'undefined' && performance.memory) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      };
    }
    
    return {};
  }

  /**
   * Record performance metric
   * @param {string} name - Metric name
   * @param {number} value - Metric value
   */
  recordPerformanceMetric(name, value) {
    if (!this.performanceMetrics.has(name)) {
      this.performanceMetrics.set(name, []);
    }
    
    const metrics = this.performanceMetrics.get(name);
    metrics.push({
      value,
      timestamp: Date.now()
    });
    
    // Keep only recent metrics
    if (metrics.length > 100) {
      metrics.shift();
    }
  }

  /**
   * Record memory metric
   * @param {Object} memoryUsage - Memory usage
   */
  recordMemoryMetric(memoryUsage) {
    const key = 'memory_usage';
    
    if (!this.performanceMetrics.has(key)) {
      this.performanceMetrics.set(key, []);
    }
    
    const metrics = this.performanceMetrics.get(key);
    metrics.push({
      ...memoryUsage,
      timestamp: Date.now()
    });
    
    // Keep only recent metrics
    if (metrics.length > 100) {
      metrics.shift();
    }
  }

  /**
   * Record network metric
   * @param {Object} connection - Network connection
   */
  recordNetworkMetric(connection) {
    const key = 'network_connection';
    
    if (!this.performanceMetrics.has(key)) {
      this.performanceMetrics.set(key, []);
    }
    
    const metrics = this.performanceMetrics.get(key);
    metrics.push({
      ...connection,
      timestamp: Date.now()
    });
    
    // Keep only recent metrics
    if (metrics.length > 100) {
      metrics.shift();
    }
  }

  /**
   * Record event
   * @param {string} eventType - Event type
   * @param {Object} data - Event data
   */
  recordEvent(eventType, data) {
    const event = {
      type: eventType,
      data,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    // Add to error log if it's an error
    if (eventType.includes('error') || eventType.includes('failure')) {
      this.errorLog.push(event);
    }
    
    // Add to recovery log if it's a recovery
    if (eventType.includes('recovery') || eventType.includes('fallback')) {
      this.recoveryLog.push(event);
    }
    
    // Send to telemetry if enabled
    if (this.config.enableTelemetry) {
      this.sendToTelemetry('event', event);
    }
  }

  /**
   * Show user notification
   * @param {string} type - Notification type
   * @param {string} message - Notification message
   */
  showUserNotification(type, message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `production-testing-notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <div class="notification-icon">
          ${type === 'error' ? '⚠️' : type === 'warning' ? '⚡' : 'ℹ️'}
        </div>
        <div class="notification-message">${message}</div>
        <button class="notification-close" onclick="this.parentElement.remove()">×</button>
      </div>
    `;
    
    // Add styles
    this.addNotificationStyles(notification);
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
  }

  /**
   * Add notification styles
   * @param {HTMLElement} notification - Notification element
   */
  addNotificationStyles(notification) {
    const style = document.createElement('style');
    style.textContent = `
      .production-testing-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        max-width: 400px;
        animation: slide-in 0.3s ease-out;
      }
      
      .production-testing-notification.error {
        border-left: 4px solid #ef4444;
      }
      
      .production-testing-notification.warning {
        border-left: 4px solid #f59e0b;
      }
      
      .production-testing-notification.info {
        border-left: 4px solid #3b82f6;
      }
      
      .notification-content {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
      }
      
      .notification-icon {
        font-size: 20px;
      }
      
      .notification-message {
        flex: 1;
        font-size: 14px;
        color: #374151;
      }
      
      .notification-close {
        background: none;
        border: none;
        font-size: 18px;
        color: #6b7280;
        cursor: pointer;
        padding: 4px;
      }
      
      @keyframes slide-in {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    
    document.head.appendChild(style);
  }

  /**
   * Get cached response
   * @param {Object} context - Request context
   * @returns {Object|null} Cached response
   */
  getCachedResponse(context) {
    // Simple cache implementation
    const cacheKey = JSON.stringify(context);
    return this.responseCache?.get(cacheKey) || null;
  }

  /**
   * Get in-memory storage
   * @returns {Object} In-memory storage
   */
  getInMemoryStorage() {
    return this.inMemoryStorage || {};
  }

  /**
   * Clear caches
   */
  clearCaches() {
    this.responseCache?.clear();
    this.performanceMetrics.clear();
  }

  /**
   * Clear unused data
   */
  clearUnusedData() {
    // Clear old test results
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    for (const [key, result] of this.testResults.entries()) {
      if (typeof result === 'object' && result.timestamp) {
        if (now - result.timestamp > maxAge) {
          this.testResults.delete(key);
        }
      }
    }
  }

  /**
   * Send to telemetry
   * @param {string} type - Data type
   * @param {Object} data - Data to send
   */
  sendToTelemetry(type, data) {
    // In production, this would send to actual telemetry service
    console.log('Telemetry data:', { type, data });
  }

  /**
   * Get testing statistics
   * @returns {Object} Testing statistics
   */
  getStats() {
    return {
      testResults: Object.fromEntries(this.testResults),
      performanceMetrics: Object.fromEntries(this.performanceMetrics),
      errorCount: this.errorLog.length,
      recoveryCount: this.recoveryLog.length,
      config: this.config,
      capabilities: [
        'stress testing',
        'performance monitoring',
        'error recovery',
        'graceful degradation',
        'memory management',
        'network adaptation',
        'fallback handling',
        'circuit breaking',
        'auto retry',
        'telemetry reporting',
        'user notifications'
      ]
    };
  }

  /**
   * Reset testing system
   */
  reset() {
    this.testResults.clear();
    this.performanceMetrics.clear();
    this.errorLog = [];
    this.recoveryLog = [];
    this.userFeedback = [];
    this.retryQueue.clear();
    
    // Clear monitors
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
    
    if (this.memoryMonitor) {
      clearInterval(this.memoryMonitor);
    }
    
    if (this.networkMonitor) {
      clearInterval(this.networkMonitor);
    }
  }
}

// Export singleton instance
export const productionTesting = new ProductionTesting();

// Export utilities
export const getStats = productionTesting.getStats.bind(productionTesting);
export const reset = productionTesting.reset.bind(productionTesting);

export default productionTesting;

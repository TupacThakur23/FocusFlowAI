/**
 * DebugManager - Testing and Debugging Tools for FocusFlow AI
 * 
 * Provides debugging utilities for:
 * - Extension health monitoring
 * - Performance tracking
 * - Error logging and reporting
 * - State inspection
 * - API testing
 * - Component debugging
 * - Network monitoring
 */

export class DebugManager {
  constructor() {
    this.debugMode = process.env.NODE_ENV === 'development';
    this.logs = [];
    this.metrics = {
      startTime: Date.now(),
      errors: 0,
      warnings: 0,
      apiCalls: 0,
      messageCount: 0,
      memorySnapshots: []
    };
    
    this.testResults = new Map();
    this.performanceData = new Map();
    this.networkRequests = [];
    
    this.initializeDebugging();
  }

  /**
   * Initialize debugging tools
   */
  initializeDebugging() {
    if (!this.debugMode) return;

    // Setup global error handling
    this.setupGlobalErrorHandling();
    
    // Setup performance monitoring
    this.setupPerformanceMonitoring();
    
    // Setup network monitoring
    this.setupNetworkMonitoring();
    
    // Create debug panel
    this.createDebugPanel();
    
    // Setup keyboard shortcuts for debugging
    this.setupDebugShortcuts();
    
    this.log('info', 'Debug manager initialized');
  }

  /**
   * Setup global error handling
   */
  setupGlobalErrorHandling() {
    // Override console methods to capture all logs
    const originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info
    };

    console.log = (...args) => {
      this.log('log', ...args);
      originalConsole.log(...args);
    };

    console.error = (...args) => {
      this.log('error', ...args);
      this.metrics.errors++;
      originalConsole.error(...args);
    };

    console.warn = (...args) => {
      this.log('warn', ...args);
      this.metrics.warnings++;
      originalConsole.warn(...args);
    };

    console.info = (...args) => {
      this.log('info', ...args);
      originalConsole.info(...args);
    };

    // Setup unhandled error handlers
    window.addEventListener('error', (event) => {
      this.log('error', 'Unhandled error:', event.error);
      this.metrics.errors++;
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.log('error', 'Unhandled promise rejection:', event.reason);
      this.metrics.errors++;
    });
  }

  /**
   * Setup performance monitoring
   */
  setupPerformanceMonitoring() {
    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          if (entry.duration > 100) { // Log tasks taking >100ms
            this.log('warn', `Long task detected: ${entry.name} took ${entry.duration.toFixed(2)}ms`);
          }
        });
      });

      try {
        observer.observe({ entryTypes: ['measure', 'navigation'] });
      } catch (error) {
        this.log('warn', 'Performance observer not available:', error);
      }
    }

    // Monitor memory usage
    setInterval(() => {
      if (performance.memory) {
        const memory = {
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize,
          limit: performance.memory.jsHeapSizeLimit,
          timestamp: Date.now()
        };

        this.metrics.memorySnapshots.push(memory);
        
        // Keep only last 50 snapshots
        if (this.metrics.memorySnapshots.length > 50) {
          this.metrics.memorySnapshots = this.metrics.memorySnapshots.slice(-50);
        }

        // Warn about high memory usage
        if (memory.used > memory.limit * 0.9) {
          this.log('warn', 'High memory usage detected:', memory);
        }
      }
    }, 10000); // Every 10 seconds
  }

  /**
   * Setup network monitoring
   */
  setupNetworkMonitoring() {
    // Override fetch to monitor API calls
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const url = args[0];
      
      this.metrics.apiCalls++;
      
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        this.networkRequests.push({
          url,
          method: args[1]?.method || 'GET',
          status: response.status,
          duration,
          timestamp: Date.now(),
          success: response.ok
        });

        // Keep only last 100 requests
        if (this.networkRequests.length > 100) {
          this.networkRequests = this.networkRequests.slice(-100);
        }

        // Log slow requests
        if (duration > 2000) {
          this.log('warn', `Slow API call: ${url} took ${duration.toFixed(2)}ms`);
        }

        return response;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        this.networkRequests.push({
          url,
          method: args[1]?.method || 'GET',
          status: 0,
          duration,
          timestamp: Date.now(),
          success: false,
          error: error.message
        });

        this.log('error', `API call failed: ${url}`, error);
        throw error;
      }
    };
  }

  /**
   * Create debug panel UI
   */
  createDebugPanel() {
    // Create debug panel container
    const debugPanel = document.createElement('div');
    debugPanel.id = 'focusflow-debug-panel';
    debugPanel.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      width: 400px;
      max-height: 600px;
      background: #1a1a1a;
      border: 1px solid #333;
      border-radius: 8px;
      color: #fff;
      font-family: monospace;
      font-size: 12px;
      z-index: 999999;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
      overflow: hidden;
      display: none;
    `;

    // Create panel header
    const header = document.createElement('div');
    header.style.cssText = `
      background: #333;
      padding: 10px;
      border-bottom: 1px solid #444;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
    
    const title = document.createElement('span');
    title.textContent = 'FocusFlow Debug Panel';
    title.style.fontWeight = 'bold';
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.cssText = `
      background: none;
      border: none;
      color: #fff;
      font-size: 18px;
      cursor: pointer;
      padding: 0;
      width: 20px;
      height: 20px;
    `;
    closeBtn.onclick = () => {
      debugPanel.style.display = 'none';
    };

    header.appendChild(title);
    header.appendChild(closeBtn);

    // Create panel content
    const content = document.createElement('div');
    content.style.cssText = `
      padding: 10px;
      max-height: 500px;
      overflow-y: auto;
    `;

    // Add debug tabs
    const tabs = ['Metrics', 'Logs', 'Network', 'Tests', 'State'];
    const tabContainer = document.createElement('div');
    tabContainer.style.cssText = `
      display: flex;
      border-bottom: 1px solid #444;
      margin-bottom: 10px;
    `;

    const tabContent = document.createElement('div');
    tabContent.id = 'debug-tab-content';

    tabs.forEach((tab, index) => {
      const tabBtn = document.createElement('button');
      tabBtn.textContent = tab;
      tabBtn.style.cssText = `
        background: ${index === 0 ? '#444' : 'transparent'};
        border: none;
        color: #fff;
        padding: 8px 12px;
        cursor: pointer;
        border-right: 1px solid #555;
      `;
      
      tabBtn.onclick = () => {
        // Update active tab
        Array.from(tabContainer.children).forEach(btn => {
          btn.style.background = 'transparent';
        });
        tabBtn.style.background = '#444';
        
        // Update tab content
        this.updateTabContent(tab, tabContent);
      };

      tabContainer.appendChild(tabBtn);
    });

    content.appendChild(tabContainer);
    content.appendChild(tabContent);

    debugPanel.appendChild(header);
    debugPanel.appendChild(content);
    document.body.appendChild(debugPanel);

    // Make debug panel globally accessible
    window.debugPanel = {
      show: () => {
        debugPanel.style.display = 'block';
        this.updateTabContent('Metrics', tabContent);
      },
      hide: () => {
        debugPanel.style.display = 'none';
      },
      toggle: () => {
        debugPanel.style.display = debugPanel.style.display === 'none' ? 'block' : 'none';
      }
    };
  }

  /**
   * Update tab content in debug panel
   */
  updateTabContent(tab, contentElement) {
    let content = '';

    switch (tab) {
      case 'Metrics':
        content = this.getMetricsContent();
        break;
      case 'Logs':
        content = this.getLogsContent();
        break;
      case 'Network':
        content = this.getNetworkContent();
        break;
      case 'Tests':
        content = this.getTestsContent();
        break;
      case 'State':
        content = this.getStateContent();
        break;
    }

    contentElement.innerHTML = content;
  }

  /**
   * Get metrics content for debug panel
   */
  getMetricsContent() {
    const uptime = Date.now() - this.metrics.startTime;
    const memoryInfo = this.metrics.memorySnapshots[this.metrics.memorySnapshots.length - 1];
    
    return `
      <div style="margin-bottom: 15px;">
        <h4 style="color: #4CAF50; margin-bottom: 10px;">Extension Metrics</h4>
        <div>Uptime: ${(uptime / 1000).toFixed(2)}s</div>
        <div>Errors: ${this.metrics.errors}</div>
        <div>Warnings: ${this.metrics.warnings}</div>
        <div>API Calls: ${this.metrics.apiCalls}</div>
        <div>Messages: ${this.metrics.messageCount}</div>
        ${memoryInfo ? `
          <div style="margin-top: 10px;">
            <h5 style="color: #FF9800; margin-bottom: 5px;">Memory Usage</h5>
            <div>Used: ${(memoryInfo.used / 1024 / 1024).toFixed(2)} MB</div>
            <div>Total: ${(memoryInfo.total / 1024 / 1024).toFixed(2)} MB</div>
            <div>Limit: ${(memoryInfo.limit / 1024 / 1024).toFixed(2)} MB</div>
            <div>Usage: ${((memoryInfo.used / memoryInfo.limit) * 100).toFixed(1)}%</div>
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Get logs content for debug panel
   */
  getLogsContent() {
    const recentLogs = this.logs.slice(-50);
    
    return `
      <h4 style="color: #4CAF50; margin-bottom: 10px;">Recent Logs</h4>
      <div style="max-height: 300px; overflow-y: auto; background: #222; padding: 10px; border-radius: 4px;">
        ${recentLogs.map(log => `
          <div style="margin-bottom: 5px; padding: 5px; border-left: 3px solid ${this.getLogLevelColor(log.level)};">
            <div style="font-weight: bold; color: ${this.getLogLevelColor(log.level)};">[${log.level.toUpperCase()}]</div>
            <div style="margin-top: 2px;">${new Date(log.timestamp).toLocaleTimeString()}: ${log.message}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * Get network content for debug panel
   */
  getNetworkContent() {
    const recentRequests = this.networkRequests.slice(-20);
    
    return `
      <h4 style="color: #4CAF50; margin-bottom: 10px;">Recent Network Requests</h4>
      <div style="max-height: 300px; overflow-y: auto; background: #222; padding: 10px; border-radius: 4px;">
        ${recentRequests.map(req => `
          <div style="margin-bottom: 8px; padding: 8px; border: 1px solid ${req.success ? '#4CAF50' : '#F44336'};">
            <div style="font-weight: bold;">${req.method} ${req.url}</div>
            <div style="color: ${req.success ? '#4CAF50' : '#F44336'};">Status: ${req.status} (${req.duration.toFixed(2)}ms)</div>
            ${req.error ? `<div style="color: #F44336;">Error: ${req.error}</div>` : ''}
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * Get tests content for debug panel
   */
  getTestsContent() {
    return `
      <h4 style="color: #4CAF50; margin-bottom: 10px;">Extension Tests</h4>
      <div style="background: #222; padding: 10px; border-radius: 4px;">
        <button onclick="window.debugManager.runHealthCheck()" style="background: #2196F3; color: white; border: none; padding: 8px 16px; margin: 5px; cursor: pointer; border-radius: 4px;">
          Run Health Check
        </button>
        <button onclick="window.debugManager.testAPI()" style="background: #FF9800; color: white; border: none; padding: 8px 16px; margin: 5px; cursor: pointer; border-radius: 4px;">
          Test API Connection
        </button>
        <button onclick="window.debugManager.testMessageBus()" style="background: #9C27B0; color: white; border: none; padding: 8px 16px; margin: 5px; cursor: pointer; border-radius: 4px;">
          Test Message Bus
        </button>
        <button onclick="window.debugManager.clearDebugData()" style="background: #F44336; color: white; border: none; padding: 8px 16px; margin: 5px; cursor: pointer; border-radius: 4px;">
          Clear Debug Data
        </button>
      </div>
      <div id="test-results" style="margin-top: 10px; padding: 10px; background: #333; border-radius: 4px;">
        <div>Test results will appear here...</div>
      </div>
    `;
  }

  /**
   * Get state content for debug panel
   */
  getStateContent() {
    return `
      <h4 style="color: #4CAF50; margin-bottom: 10px;">Extension State</h4>
      <div style="background: #222; padding: 10px; border-radius: 4px;">
        <button onclick="window.debugManager.exportState()" style="background: #2196F3; color: white; border: none; padding: 8px 16px; margin: 5px; cursor: pointer; border-radius: 4px;">
          Export State
        </button>
        <button onclick="window.debugManager.inspectComponents()" style="background: #FF9800; color: white; border: none; padding: 8px 16px; margin: 5px; cursor: pointer; border-radius: 4px;">
          Inspect Components
        </button>
        <div id="state-inspection" style="margin-top: 10px; padding: 10px; background: #333; border-radius: 4px;">
          <div>State inspection results will appear here...</div>
        </div>
      </div>
    `;
  }

  /**
   * Get log level color
   */
  getLogLevelColor(level) {
    const colors = {
      error: '#F44336',
      warn: '#FF9800',
      info: '#2196F3',
      log: '#9E9E9E'
    };
    return colors[level] || '#9E9E9E';
  }

  /**
   * Setup debug keyboard shortcuts
   */
  setupDebugShortcuts() {
    document.addEventListener('keydown', (event) => {
      // Ctrl+Shift+D to toggle debug panel
      if (event.ctrlKey && event.shiftKey && event.key === 'D') {
        event.preventDefault();
        if (window.debugPanel) {
          window.debugPanel.toggle();
        }
      }
      
      // Ctrl+Shift+H to run health check
      if (event.ctrlKey && event.shiftKey && event.key === 'H') {
        event.preventDefault();
        this.runHealthCheck();
      }
      
      // Ctrl+Shift+E to export debug data
      if (event.ctrlKey && event.shiftKey && event.key === 'E') {
        event.preventDefault();
        this.exportDebugData();
      }
    });
  }

  /**
   * Log message with timestamp
   */
  log(level, ...args) {
    const logEntry = {
      level,
      message: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' '),
      timestamp: Date.now(),
      stack: new Error().stack
    };

    this.logs.push(logEntry);
    
    // Keep only last 200 logs
    if (this.logs.length > 200) {
      this.logs = this.logs.slice(-200);
    }

    // Update message count
    this.metrics.messageCount++;
  }

  /**
   * Run comprehensive health check
   */
  async runHealthCheck() {
    const results = {
      timestamp: Date.now(),
      checks: {}
    };

    // Check Chrome extension APIs
    results.checks.chromeAPIs = this.checkChromeAPIs();
    
    // Check storage access
    results.checks.storage = await this.checkStorageAccess();
    
    // Check message bus
    results.checks.messageBus = this.checkMessageBus();
    
    // Check performance
    results.checks.performance = this.checkPerformance();
    
    // Check security
    results.checks.security = this.checkSecurity();
    
    const overall = Object.values(results.checks).every(check => check.status === 'pass');
    results.overall = overall ? 'HEALTHY' : 'ISSUES_DETECTED';

    this.testResults.set('healthCheck', results);
    this.displayTestResults('Health Check', results);
    
    return results;
  }

  /**
   * Check Chrome extension APIs
   */
  checkChromeAPIs() {
    const checks = [
      { name: 'chrome.runtime', available: !!chrome.runtime },
      { name: 'chrome.tabs', available: !!chrome.tabs },
      { name: 'chrome.storage', available: !!chrome.storage },
      { name: 'chrome.scripting', available: !!chrome.scripting },
      { name: 'chrome.webNavigation', available: !!chrome.webNavigation }
    ];

    const allAvailable = checks.every(check => check.available);
    
    return {
      status: allAvailable ? 'pass' : 'fail',
      details: checks,
      message: allAvailable ? 'All Chrome APIs available' : 'Some Chrome APIs not available'
    };
  }

  /**
   * Check storage access
   */
  async checkStorageAccess() {
    try {
      // Test local storage
      const testKey = 'focusflow_debug_test';
      await chrome.storage.local.set({ [testKey]: 'test' });
      const localValue = await chrome.storage.local.get(testKey);
      await chrome.storage.local.remove(testKey);

      // Test session storage
      await chrome.storage.session.set({ [testKey]: 'test' });
      const sessionValue = await chrome.storage.session.get(testKey);
      await chrome.storage.session.remove(testKey);

      const localWorking = localValue[testKey] === 'test';
      const sessionWorking = sessionValue[testKey] === 'test';

      return {
        status: localWorking && sessionWorking ? 'pass' : 'fail',
        details: { localWorking, sessionWorking },
        message: 'Storage access test'
      };
    } catch (error) {
      return {
        status: 'fail',
        details: { error: error.message },
        message: 'Storage access failed'
      };
    }
  }

  /**
   * Check message bus functionality
   */
  checkMessageBus() {
    try {
      // Check if message bus is available
      const messageBusAvailable = typeof window.messageBus !== 'undefined';
      
      return {
        status: messageBusAvailable ? 'pass' : 'fail',
        details: { available: messageBusAvailable },
        message: messageBusAvailable ? 'Message bus available' : 'Message bus not available'
      };
    } catch (error) {
      return {
        status: 'fail',
        details: { error: error.message },
        message: 'Message bus check failed'
      };
    }
  }

  /**
   * Check performance metrics
   */
  checkPerformance() {
    const memoryInfo = performance.memory;
    const navigation = performance.getEntriesByType?.('navigation')?.[0];
    
    const checks = [];
    
    if (memoryInfo) {
      const memoryUsage = memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit;
      checks.push({
        name: 'Memory Usage',
        status: memoryUsage < 0.8 ? 'pass' : 'warn',
        value: `${(memoryUsage * 100).toFixed(1)}%`
      });
    }

    if (navigation) {
      const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
      checks.push({
        name: 'Page Load Time',
        status: loadTime < 3000 ? 'pass' : 'warn',
        value: `${loadTime.toFixed(2)}ms`
      });
    }

    const hasWarnings = checks.some(check => check.status === 'warn');
    
    return {
      status: hasWarnings ? 'warn' : 'pass',
      details: checks,
      message: hasWarnings ? 'Performance issues detected' : 'Performance looks good'
    };
  }

  /**
   * Check security settings
   */
  checkSecurity() {
    const checks = [];
    
    // Check for HTTPS
    const isHTTPS = window.location.protocol === 'https:';
    checks.push({
      name: 'HTTPS Connection',
      status: isHTTPS ? 'pass' : 'fail',
      value: isHTTPS ? 'Secure' : 'Insecure'
    });

    // Check for CSP
    const hasCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    checks.push({
      name: 'CSP Header',
      status: hasCSP ? 'pass' : 'warn',
      value: hasCSP ? 'Present' : 'Missing'
    });

    return {
      status: checks.every(check => check.status === 'pass') ? 'pass' : 'warn',
      details: checks,
      message: 'Security configuration check'
    };
  }

  /**
   * Test API connectivity
   */
  async testAPI() {
    const results = {
      timestamp: Date.now(),
      tests: {}
    };

    try {
      // Test API endpoint
      const response = await fetch('/api/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      results.tests.apiHealth = {
        status: response.ok ? 'pass' : 'fail',
        details: {
          status: response.status,
          responseTime: Date.now() - results.timestamp
        },
        message: response.ok ? 'API is responding' : 'API not responding'
      };

      // Test API with authentication
      const authResponse = await fetch('/api/auth/test', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });

      results.tests.apiAuth = {
        status: authResponse.ok ? 'pass' : 'fail',
        details: {
          status: authResponse.status
        },
        message: authResponse.ok ? 'API auth working' : 'API auth issues'
      };

    } catch (error) {
      results.tests.apiHealth = {
        status: 'fail',
        details: { error: error.message },
        message: 'API connection failed'
      };
    }

    this.testResults.set('apiTest', results);
    this.displayTestResults('API Test', results);
    
    return results;
  }

  /**
   * Test message bus functionality
   */
  async testMessageBus() {
    const results = {
      timestamp: Date.now(),
      tests: {}
    };

    try {
      if (!window.messageBus) {
        throw new Error('Message bus not available');
      }

      // Test message sending
      const testMessage = {
        type: 'DEBUG_TEST',
        data: { test: true, timestamp: Date.now() }
      };

      const response = await window.messageBus.sendMessage('background', testMessage);
      
      results.tests.messageSend = {
        status: response.success ? 'pass' : 'fail',
        details: response,
        message: response.success ? 'Message sending works' : 'Message sending failed'
      };

      // Test message subscription
      let messageReceived = false;
      const unsubscribe = window.messageBus.onMessage('DEBUG_RESPONSE', () => {
        messageReceived = true;
      });

      // Trigger test message
      setTimeout(() => {
        unsubscribe();
        
        results.tests.messageReceive = {
          status: messageReceived ? 'pass' : 'fail',
          details: { received: messageReceived },
          message: messageReceived ? 'Message receiving works' : 'Message receiving failed'
        };
      }, 1000);

    } catch (error) {
      results.tests.messageSend = {
        status: 'fail',
        details: { error: error.message },
        message: 'Message bus test failed'
      };
    }

    this.testResults.set('messageBusTest', results);
    this.displayTestResults('Message Bus Test', results);
    
    return results;
  }

  /**
   * Display test results in debug panel
   */
  displayTestResults(testName, results) {
    const resultsElement = document.getElementById('test-results');
    if (resultsElement) {
      const statusColor = results.overall === 'HEALTHY' || results.overall === 'pass' ? '#4CAF50' : '#F44336';
      
      resultsElement.innerHTML = `
        <div style="margin-bottom: 10px;">
          <h5 style="color: ${statusColor};">${testName} Results</h5>
          <div style="color: ${statusColor}; font-weight: bold; margin-bottom: 10px;">
            Status: ${results.overall}
          </div>
          <pre style="background: #1a1a1a; padding: 10px; border-radius: 4px; overflow-x: auto; font-size: 11px;">
            ${JSON.stringify(results, null, 2)}
          </pre>
        </div>
      `;
    }
  }

  /**
   * Export current extension state
   */
  exportState() {
    const state = {
      timestamp: Date.now(),
      metrics: this.metrics,
      logs: this.logs.slice(-50),
      networkRequests: this.networkRequests.slice(-20),
      testResults: Object.fromEntries(this.testResults),
      memory: performance.memory,
      navigation: performance.getEntriesByType?.('navigation')?.[0],
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Download as JSON file
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focusflow-debug-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    this.log('info', 'Debug state exported');
  }

  /**
   * Inspect React components
   */
  inspectComponents() {
    const inspectionElement = document.getElementById('state-inspection');
    if (inspectionElement) {
      let componentInfo = 'React component inspection:\n\n';
      
      if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        componentInfo += 'React DevTools detected\n';
        componentInfo += 'Components can be inspected via React DevTools\n';
      } else {
        componentInfo += 'React DevTools not detected\n';
      }

      // Check for extension components
      if (window.contentScript) {
        componentInfo += '\nContent Script State:\n';
        componentInfo += JSON.stringify(window.contentScript.getState(), null, 2);
      }

      if (window.messageBus) {
        componentInfo += '\nMessage Bus State:\n';
        componentInfo += JSON.stringify(window.messageBus.getStats(), null, 2);
      }

      inspectionElement.innerHTML = `<pre style="background: #1a1a1a; padding: 10px; border-radius: 4px; overflow-x: auto; font-size: 11px; white-space: pre-wrap;">${componentInfo}</pre>`;
    }
  }

  /**
   * Clear all debug data
   */
  clearDebugData() {
    this.logs = [];
    this.metrics = {
      startTime: Date.now(),
      errors: 0,
      warnings: 0,
      apiCalls: 0,
      messageCount: 0,
      memorySnapshots: []
    };
    this.networkRequests = [];
    this.testResults.clear();
    
    this.log('info', 'Debug data cleared');
    
    // Clear test results display
    const resultsElement = document.getElementById('test-results');
    if (resultsElement) {
      resultsElement.innerHTML = '<div>All debug data cleared</div>';
    }
  }

  /**
   * Export all debug data
   */
  exportDebugData() {
    this.exportState();
  }

  /**
   * Get comprehensive debug report
   */
  getDebugReport() {
    return {
      timestamp: Date.now(),
      uptime: Date.now() - this.metrics.startTime,
      metrics: this.metrics,
      recentLogs: this.logs.slice(-20),
      recentNetworkRequests: this.networkRequests.slice(-10),
      testResults: Object.fromEntries(this.testResults),
      systemInfo: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        screen: {
          width: screen.width,
          height: screen.height,
          colorDepth: screen.colorDepth
        }
      }
    };
  }

  /**
   * Cleanup debug resources
   */
  cleanup() {
    this.logs = [];
    this.metrics.memorySnapshots = [];
    this.networkRequests = [];
    this.testResults.clear();
    
    // Remove debug panel if exists
    const debugPanel = document.getElementById('focusflow-debug-panel');
    if (debugPanel) {
      debugPanel.remove();
    }
    
    this.log('info', 'Debug manager cleaned up');
  }
}

// Export singleton instance
export const debugManager = new DebugManager();

// Export utilities
export const log = debugManager.log.bind(debugManager);
export const runHealthCheck = debugManager.runHealthCheck.bind(debugManager);
export const testAPI = debugManager.testAPI.bind(debugManager);
export const testMessageBus = debugManager.testMessageBus.bind(debugManager);
export const exportState = debugManager.exportState.bind(debugManager);
export const inspectComponents = debugManager.inspectComponents.bind(debugManager);
export const clearDebugData = debugManager.clearDebugData.bind(debugManager);
export const getDebugReport = debugManager.getDebugReport.bind(debugManager);
export const cleanup = debugManager.cleanup.bind(debugManager);

export default debugManager;

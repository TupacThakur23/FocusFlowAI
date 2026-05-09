/**
 * ErrorHandler - Global Error Handling for FocusFlow AI Extension
 * 
 * Provides centralized error handling, logging, and recovery mechanisms:
 * - Global error capture for unhandled exceptions
 * - Structured logging with context information
 * - Extension-safe error reporting
 * - Async error handling for promises
 * - Recovery strategies for common errors
 * - Optional user-facing notifications
 */

export class ErrorHandler {
  constructor(options = {}) {
    this.logLevel = options.logLevel || 'error'; // 'debug', 'info', 'warn', 'error'
    this.maxLogEntries = options.maxLogEntries || 100;
    this.enableUserNotifications = options.enableUserNotifications || false;
    this.errorLog = [];
    this.setupGlobalHandlers();
  }

  /**
   * Setup global error handlers
   */
  setupGlobalHandlers() {
    // Handle unhandled promise rejections
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', (event) => {
        this.log(event.reason, 'Unhandled Promise Rejection', {
          type: 'unhandledRejection',
          stack: event.reason?.stack
        });
      });

      // Handle global errors
      window.addEventListener('error', (event) => {
        this.log(event.error || new Error(event.message), 'Global Error', {
          type: 'globalError',
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        });
      });
    }

    // Handle Chrome runtime errors
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.onSuspend?.addListener(() => {
        this.log(null, 'Extension suspending', { type: 'suspend' });
      });
    }
  }

  /**
   * Log error with context information
   * @param {Error|string} error - Error object or message
   * @param {string} context - Context where error occurred
   * @param {Object} metadata - Additional metadata
   */
  log(error, context = 'Unknown', metadata = {}) {
    const errorEntry = {
      timestamp: new Date().toISOString(),
      context,
      message: error?.message || error || 'Unknown error',
      stack: error?.stack,
      metadata,
      url: typeof window !== 'undefined' ? window.location?.href : 'background',
      level: this.determineLogLevel(error)
    };

    // Add to log
    this.errorLog.push(errorEntry);

    // Trim log if too long
    if (this.errorLog.length > this.maxLogEntries) {
      this.errorLog = this.errorLog.slice(-this.maxLogEntries);
    }

    // Log to console based on level
    this.logToConsole(errorEntry);

    // Store in extension storage for persistence
    this.persistError(errorEntry);

    // Show user notification if enabled and error is critical
    if (this.enableUserNotifications && this.isCriticalError(errorEntry)) {
      this.showUserNotification(errorEntry);
    }
  }

  /**
   * Determine log level based on error
   * @param {Error|string} error - Error to evaluate
   * @returns {string} Log level
   */
  determineLogLevel(error) {
    if (error?.name === 'CriticalError') return 'error';
    if (error?.name === 'WarningError') return 'warn';
    if (typeof error === 'string' && error.includes('timeout')) return 'warn';
    return 'error';
  }

  /**
   * Log to console with appropriate level
   * @param {Object} errorEntry - Error entry to log
   */
  logToConsole(errorEntry) {
    const { level, context, message, stack, metadata } = errorEntry;
    const logMessage = `[${context}] ${message}`;
    
    switch (level) {
      case 'debug':
        if (this.logLevel === 'debug') {
          console.debug(logMessage, { stack, ...metadata });
        }
        break;
      case 'info':
        if (['debug', 'info'].includes(this.logLevel)) {
          console.info(logMessage, { stack, ...metadata });
        }
        break;
      case 'warn':
        if (['debug', 'info', 'warn'].includes(this.logLevel)) {
          console.warn(logMessage, { stack, ...metadata });
        }
        break;
      case 'error':
      default:
        console.error(logMessage, { stack, ...metadata });
        break;
    }
  }

  /**
   * Persist error to Chrome storage
   * @param {Object} errorEntry - Error entry to persist
   */
  async persistError(errorEntry) {
    try {
      const storage = typeof chrome !== 'undefined' && chrome.storage 
        ? chrome.storage.local 
        : null;

      if (storage) {
        const key = 'focusflow_error_log';
        const result = await storage.get([key]);
        const existingLog = result[key] || [];
        
        // Add new error and trim
        existingLog.push(errorEntry);
        const trimmedLog = existingLog.slice(-this.maxLogEntries);
        
        await storage.set({ [key]: trimmedLog });
      }
    } catch (persistError) {
      // Avoid infinite recursion if storage fails
      console.error('Failed to persist error:', persistError);
    }
  }

  /**
   * Check if error is critical and needs user notification
   * @param {Object} errorEntry - Error entry to evaluate
   * @returns {boolean} Whether error is critical
   */
  isCriticalError(errorEntry) {
    const criticalContexts = [
      'SidebarManager',
      'MessageBus',
      'StateManager'
    ];

    const criticalMessages = [
      'injection failed',
      'timeout',
      'connection failed',
      'storage quota exceeded'
    ];

    return criticalContexts.includes(errorEntry.context) ||
           criticalMessages.some(msg => errorEntry.message.toLowerCase().includes(msg));
  }

  /**
   * Show user notification for critical errors
   * @param {Object} errorEntry - Error entry to display
   */
  showUserNotification(errorEntry) {
    if (typeof chrome !== 'undefined' && chrome.notifications) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon.png',
        title: 'FocusFlow AI Error',
        message: `${errorEntry.context}: ${errorEntry.message}`
      });
    }
  }

  /**
   * Create recoverable error
   * @param {string} message - Error message
   * @param {Function} recovery - Recovery function
   * @param {Object} metadata - Additional metadata
   * @returns {Error} Recoverable error
   */
  createRecoverableError(message, recovery = null, metadata = {}) {
    const error = new Error(message);
    error.name = 'RecoverableError';
    error.recovery = recovery;
    error.metadata = metadata;
    return error;
  }

  /**
   * Handle recoverable error with automatic recovery
   * @param {Error} error - Recoverable error
   * @param {string} context - Error context
   */
  async handleRecoverableError(error, context = 'Unknown') {
    this.log(error, context, { recoverable: true });

    if (error.recovery && typeof error.recovery === 'function') {
      try {
        console.log(`Attempting recovery for ${context}`);
        await error.recovery();
        console.log(`Recovery successful for ${context}`);
        return true;
      } catch (recoveryError) {
        this.log(recoveryError, `${context} Recovery Failed`, {
          originalError: error.message
        });
        return false;
      }
    }

    return false;
  }

  /**
   * Get error statistics
   * @returns {Object} Error statistics
   */
  getErrorStats() {
    const stats = {
      total: this.errorLog.length,
      byLevel: {},
      byContext: {},
      recent: this.errorLog.slice(-10)
    };

    this.errorLog.forEach(entry => {
      // Count by level
      stats.byLevel[entry.level] = (stats.byLevel[entry.level] || 0) + 1;
      
      // Count by context
      stats.byContext[entry.context] = (stats.byContext[entry.context] || 0) + 1;
    });

    return stats;
  }

  /**
   * Clear error log
   */
  clearLog() {
    this.errorLog = [];
    
    // Also clear persisted log
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.remove('focusflow_error_log');
    }
  }

  /**
   * Get recent errors
   * @param {number} limit - Number of recent errors to return
   * @returns {Array} Recent errors
   */
  getRecentErrors(limit = 10) {
    return this.errorLog.slice(-limit);
  }

  /**
   * Export error log for debugging
   * @returns {Object} Complete error log
   */
  exportLog() {
    return {
      timestamp: new Date().toISOString(),
      stats: this.getErrorStats(),
      errors: this.errorLog,
      environment: this.getEnvironmentInfo()
    };
  }

  /**
   * Get environment information for debugging
   * @returns {Object} Environment info
   */
  getEnvironmentInfo() {
    const info = {
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'background',
      url: typeof window !== 'undefined' ? window.location?.href : 'background',
      timestamp: new Date().toISOString()
    };

    if (typeof chrome !== 'undefined' && chrome.runtime) {
      info.extensionVersion = chrome.runtime.getManifest?.()?.version;
      info.extensionId = chrome.runtime.id;
    }

    return info;
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.clearLog();
    
    // Remove global event listeners
    if (typeof window !== 'undefined') {
      window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
      window.removeEventListener('error', this.handleGlobalError);
    }
  }
}

// Export singleton instance for easy usage
export const errorHandler = new ErrorHandler();

// Export default
export default ErrorHandler;

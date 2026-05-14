

export class ErrorHandler {
  constructor(options = {}) {
    this.logLevel = options.logLevel || 'error'; // 'debug', 'info', 'warn', 'error'
    this.maxLogEntries = options.maxLogEntries || 100;
    this.enableUserNotifications = options.enableUserNotifications || false;
    this.errorLog = [];
    this.setupGlobalHandlers();
  }

  
  setupGlobalHandlers() {

    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', (event) => {
        this.log(event.reason, 'Unhandled Promise Rejection', {
          type: 'unhandledRejection',
          stack: event.reason?.stack
        });
      });

      window.addEventListener('error', (event) => {
        this.log(event.error || new Error(event.message), 'Global Error', {
          type: 'globalError',
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        });
      });
    }

    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.onSuspend?.addListener(() => {
        this.log(null, 'Extension suspending', { type: 'suspend' });
      });
    }
  }

  
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

    this.errorLog.push(errorEntry);

    if (this.errorLog.length > this.maxLogEntries) {
      this.errorLog = this.errorLog.slice(-this.maxLogEntries);
    }

    this.logToConsole(errorEntry);

    this.persistError(errorEntry);

    if (this.enableUserNotifications && this.isCriticalError(errorEntry)) {
      this.showUserNotification(errorEntry);
    }
  }

  
  determineLogLevel(error) {
    if (error?.name === 'CriticalError') return 'error';
    if (error?.name === 'WarningError') return 'warn';
    if (typeof error === 'string' && error.includes('timeout')) return 'warn';
    return 'error';
  }

  
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

  
  async persistError(errorEntry) {
    try {
      const storage = typeof chrome !== 'undefined' && chrome.storage 
        ? chrome.storage.local 
        : null;

      if (storage) {
        const key = 'focusflow_error_log';
        const result = await storage.get([key]);
        const existingLog = result[key] || [];
        

        existingLog.push(errorEntry);
        const trimmedLog = existingLog.slice(-this.maxLogEntries);
        
        await storage.set({ [key]: trimmedLog });
      }
    } catch (persistError) {

      console.error('Failed to persist error:', persistError);
    }
  }

  
  isCriticalError(errorEntry) {
    const criticalContexts = [
      'SidebarManager',
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

  
  createRecoverableError(message, recovery = null, metadata = {}) {
    const error = new Error(message);
    error.name = 'RecoverableError';
    error.recovery = recovery;
    error.metadata = metadata;
    return error;
  }

  
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

  
  getErrorStats() {
    const stats = {
      total: this.errorLog.length,
      byLevel: {},
      byContext: {},
      recent: this.errorLog.slice(-10)
    };

    this.errorLog.forEach(entry => {

      stats.byLevel[entry.level] = (stats.byLevel[entry.level] || 0) + 1;
      

      stats.byContext[entry.context] = (stats.byContext[entry.context] || 0) + 1;
    });

    return stats;
  }

  
  clearLog() {
    this.errorLog = [];
    

    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.remove('focusflow_error_log');
    }
  }

  
  getRecentErrors(limit = 10) {
    return this.errorLog.slice(-limit);
  }

  
  exportLog() {
    return {
      timestamp: new Date().toISOString(),
      stats: this.getErrorStats(),
      errors: this.errorLog,
      environment: this.getEnvironmentInfo()
    };
  }

  
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

  
  cleanup() {
    this.clearLog();
    

    if (typeof window !== 'undefined') {
      window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
      window.removeEventListener('error', this.handleGlobalError);
    }
  }
}

export const errorHandler = new ErrorHandler();

export default ErrorHandler;

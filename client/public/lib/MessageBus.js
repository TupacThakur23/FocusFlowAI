/**
 * MessageBus - Centralized Communication Layer for FocusFlow AI Extension
 * 
 * Provides reliable, async-safe messaging between:
 * - Content scripts
 * - Background service worker
 * - React frontend (iframe)
 * 
 * Features:
 * - Promise-based messaging with timeout protection
 * - Automatic retry logic for failed messages
 * - Message ID tracking and response validation
 * - Chrome runtime error handling
 * - Listener registration and cleanup
 */

export class MessageBus {
  constructor(options = {}) {
    this.messageId = 0;
    this.pendingMessages = new Map();
    this.subscribers = new Map();
    this.defaultTimeout = options.timeout || 5000;
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 1000;
    
    this.setupMessageListener();
  }

  /**
   * Generate unique message ID
   * @returns {string} Unique message identifier
   */
  generateId() {
    return `msg_${Date.now()}_${++this.messageId}`;
  }

  /**
   * Send message to specified target with retry logic
   * @param {string|number} target - 'background', tabId, or 'runtime'
   * @param {Object} message - Message payload
   * @param {Object} options - Send options
   * @returns {Promise} Message response
   */
  async sendMessage(target, message, options = {}) {
    const messageId = this.generateId();
    const timeout = options.timeout || this.defaultTimeout;
    const maxRetries = options.maxRetries || this.maxRetries;
    
    const messagePayload = {
      ...message,
      messageId,
      timestamp: Date.now(),
      source: this.getSourceContext()
    };

    return new Promise((resolve, reject) => {
      const attemptSend = async (attempt = 1) => {
        try {
          const response = await this.performSend(target, messagePayload);
          
          // Handle graceful no-op responses
          if (response === null) {
            // Clean up pending message
            if (this.pendingMessages.has(messageId)) {
              this.pendingMessages.delete(messageId);
            }
            resolve(null); // Graceful success (no listener)
            return;
          }
          
          // Validate response
          if (!response || typeof response !== 'object') {
            throw new Error('Invalid response format');
          }

          // Clean up pending message
          if (this.pendingMessages.has(messageId)) {
            this.pendingMessages.delete(messageId);
          }

          resolve(response);
          
        } catch (error) {
          console.error(`MessageBus send attempt ${attempt} failed:`, error);
          
          // Do NOT retry receiving end errors (normal in Chrome extensions)
          if (error.message.includes('Receiving end does not exist') || 
              error.message.includes('Could not establish connection')) {
            console.log('🔌 MessageBus: Skipping retries for receiving end error');
            if (this.pendingMessages.has(messageId)) {
              this.pendingMessages.delete(messageId);
            }
            resolve(null); // Graceful no-op
            return;
          }
          
          if (attempt < maxRetries) {
            // Retry with exponential backoff
            const delay = this.retryDelay * Math.pow(2, attempt - 1);
            setTimeout(() => attemptSend(attempt + 1), delay);
          } else {
            // Final failure
            if (this.pendingMessages.has(messageId)) {
              this.pendingMessages.delete(messageId);
            }
            reject(new Error(`Message failed after ${maxRetries} attempts: ${error.message}`));
          }
        }
      };

      // Store pending message for timeout handling
      this.pendingMessages.set(messageId, { resolve, reject, timeout });
      
      // Start sending
      attemptSend();

      // Set timeout for the entire operation
      setTimeout(() => {
        if (this.pendingMessages.has(messageId)) {
          const { reject } = this.pendingMessages.get(messageId);
          this.pendingMessages.delete(messageId);
          reject(new Error(`Message timeout: ${messageId}`));
        }
      }, timeout * maxRetries);
    });
  }

  /**
   * Perform the actual message send based on target
   * @param {string|number} target - Message target
   * @param {Object} message - Message payload
   * @returns {Promise} Send response
   */
  async performSend(target, message) {
    return new Promise((resolve, reject) => {
      const handleResponse = (response) => {
        if (chrome.runtime.lastError) {
          const errorMsg = chrome.runtime.lastError.message;
          
          // Gracefully handle receiving end errors (normal in Chrome extensions)
          if (errorMsg.includes('Receiving end does not exist') || 
              errorMsg.includes('Could not establish connection')) {
            console.log('🔌 MessageBus: No content script listener (normal)');
            resolve(null); // Graceful no-op
            return;
          }
          
          reject(new Error(errorMsg));
        } else {
          resolve(response);
        }
      };

      try {
        if (target === 'background' || target === 'runtime') {
          chrome.runtime.sendMessage(message, handleResponse);
        } else if (typeof target === 'number') {
          // Check if tab exists before sending
          chrome.tabs.get(target, (tab) => {
            if (chrome.runtime.lastError) {
              console.log('🔌 MessageBus: Tab does not exist');
              resolve(null); // Graceful no-op
              return;
            }
            
            // Send to specific tab
            chrome.tabs.sendMessage(target, message, handleResponse);
          });
        } else {
          reject(new Error(`Invalid target: ${target}`));
        }
      } catch (error) {
        // Handle synchronous errors gracefully
        if (error.message.includes('Receiving end does not exist')) {
          console.log('🔌 MessageBus: No content script listener (sync)');
          resolve(null); // Graceful no-op
          return;
        }
        reject(error);
      }
    });
  }

  /**
   * Register handler for specific message type
   * @param {string} type - Message type to handle
   * @param {Function} handler - Handler function
   * @param {Object} options - Handler options
   */
  onMessage(type, handler, options = {}) {
    if (!this.subscribers.has(type)) {
      this.subscribers.set(type, []);
    }

    const handlerWrapper = {
      handler,
      options,
      id: this.generateId()
    };

    this.subscribers.get(type).push(handlerWrapper);

    // Return unsubscribe function
    return () => {
      const handlers = this.subscribers.get(type);
      if (handlers) {
        const index = handlers.findIndex(h => h.id === handlerWrapper.id);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }

  /**
   * Remove message handler
   * @param {string} type - Message type
   * @param {Function} handler - Handler function to remove
   */
  offMessage(type, handler) {
    if (!this.subscribers.has(type)) return;

    const handlers = this.subscribers.get(type);
    const index = handlers.findIndex(h => h.handler === handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  }

  /**
   * Setup global message listener
   */
  setupMessageListener() {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        const { type, messageId } = message;

        if (!type || !this.subscribers.has(type)) {
          return false; // No handlers for this message type
        }

        const handlers = this.subscribers.get(type);
        
        // Execute all handlers for this message type
        const executeHandlers = async () => {
          try {
            const results = await Promise.allSettled(
              handlers.map(({ handler, options }) => 
                Promise.resolve(handler(message, sender, options))
              )
            );

            // Process results
            const successfulResults = results
              .filter(result => result.status === 'fulfilled')
              .map(result => result.value);

            const errors = results
              .filter(result => result.status === 'rejected')
              .map(result => result.reason);

            // Send response
            sendResponse({
              success: errors.length === 0,
              results: successfulResults,
              errors: errors.length > 0 ? errors : undefined,
              messageId
            });

            // Log errors if any
            if (errors.length > 0) {
              console.error('Message handler errors:', errors);
            }

          } catch (error) {
            console.error('MessageBus handler execution error:', error);
            sendResponse({
              success: false,
              error: error.message,
              messageId
            });
          }
        };

        // Execute handlers asynchronously
        executeHandlers();
        
        // Return true to indicate async response
        return true;
      });
    }
  }

  /**
   * Get source context for messages
   * @returns {string} Source context
   */
  getSourceContext() {
    if (typeof window !== 'undefined' && window.location) {
      if (window.location.href.includes('index.html')) {
        return 'popup';
      } else if (window.location.href.includes('mode=sidebar')) {
        return 'sidebar';
      } else {
        return 'content';
      }
    }
    return 'background';
  }

  /**
   * Clean up all pending messages and subscribers
   */
  cleanup() {
    // Reject all pending messages
    for (const [messageId, { reject }] of this.pendingMessages) {
      reject(new Error(`MessageBus cleanup: ${messageId}`));
    }
    this.pendingMessages.clear();

    // Clear all subscribers
    this.subscribers.clear();
  }

  /**
   * Get statistics for debugging
   * @returns {Object} Statistics object
   */
  getStats() {
    return {
      pendingMessages: this.pendingMessages.size,
      subscriberTypes: Array.from(this.subscribers.keys()),
      totalSubscribers: Array.from(this.subscribers.values())
        .reduce((total, handlers) => total + handlers.length, 0)
    };
  }
}

// Export singleton instance for easy usage
export const messageBus = new MessageBus();

// Export default
export default MessageBus;

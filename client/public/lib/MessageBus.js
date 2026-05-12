

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

  
  generateId() {
    return `msg_${Date.now()}_${++this.messageId}`;
  }

  
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
          

          if (response === null) {

            if (this.pendingMessages.has(messageId)) {
              this.pendingMessages.delete(messageId);
            }
            resolve(null); // Graceful success (no listener)
            return;
          }
          

          if (!response || typeof response !== 'object') {
            throw new Error('Invalid response format');
          }

          if (this.pendingMessages.has(messageId)) {
            this.pendingMessages.delete(messageId);
          }

          resolve(response);
          
        } catch (error) {
          console.error(`MessageBus send attempt ${attempt} failed:`, error);
          

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

            const delay = this.retryDelay * Math.pow(2, attempt - 1);
            setTimeout(() => attemptSend(attempt + 1), delay);
          } else {

            if (this.pendingMessages.has(messageId)) {
              this.pendingMessages.delete(messageId);
            }
            reject(new Error(`Message failed after ${maxRetries} attempts: ${error.message}`));
          }
        }
      };

      this.pendingMessages.set(messageId, { resolve, reject, timeout });
      

      attemptSend();

      setTimeout(() => {
        if (this.pendingMessages.has(messageId)) {
          const { reject } = this.pendingMessages.get(messageId);
          this.pendingMessages.delete(messageId);
          reject(new Error(`Message timeout: ${messageId}`));
        }
      }, timeout * maxRetries);
    });
  }

  
  async performSend(target, message) {
    return new Promise((resolve, reject) => {
      const handleResponse = (response) => {
        if (chrome.runtime.lastError) {
          const errorMsg = chrome.runtime.lastError.message;
          

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

          chrome.tabs.get(target, (tab) => {
            if (chrome.runtime.lastError) {
              console.log('🔌 MessageBus: Tab does not exist');
              resolve(null); // Graceful no-op
              return;
            }
            

            chrome.tabs.sendMessage(target, message, handleResponse);
          });
        } else {
          reject(new Error(`Invalid target: ${target}`));
        }
      } catch (error) {

        if (error.message.includes('Receiving end does not exist')) {
          console.log('🔌 MessageBus: No content script listener (sync)');
          resolve(null); // Graceful no-op
          return;
        }
        reject(error);
      }
    });
  }

  
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

  
  offMessage(type, handler) {
    if (!this.subscribers.has(type)) return;

    const handlers = this.subscribers.get(type);
    const index = handlers.findIndex(h => h.handler === handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  }

  
  setupMessageListener() {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        const { type, messageId } = message;

        if (!type || !this.subscribers.has(type)) {
          return false; // No handlers for this message type
        }

        const handlers = this.subscribers.get(type);
        

        const executeHandlers = async () => {
          try {
            const results = await Promise.allSettled(
              handlers.map(({ handler, options }) => 
                Promise.resolve(handler(message, sender, options))
              )
            );

            const successfulResults = results
              .filter(result => result.status === 'fulfilled')
              .map(result => result.value);

            const errors = results
              .filter(result => result.status === 'rejected')
              .map(result => result.reason);

            sendResponse({
              success: errors.length === 0,
              results: successfulResults,
              errors: errors.length > 0 ? errors : undefined,
              messageId
            });

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

        executeHandlers();
        

        return true;
      });
    }
  }

  
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

  
  cleanup() {

    for (const [messageId, { reject }] of this.pendingMessages) {
      reject(new Error(`MessageBus cleanup: ${messageId}`));
    }
    this.pendingMessages.clear();

    this.subscribers.clear();
  }

  
  getStats() {
    return {
      pendingMessages: this.pendingMessages.size,
      subscriberTypes: Array.from(this.subscribers.keys()),
      totalSubscribers: Array.from(this.subscribers.values())
        .reduce((total, handlers) => total + handlers.length, 0)
    };
  }
}

export const messageBus = new MessageBus();

export default MessageBus;

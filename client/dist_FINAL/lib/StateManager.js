/**
 * StateManager - Event-Driven State Management for FocusFlow AI Extension
 * 
 * Replaces storage polling with event-driven architecture:
 * - Centralized state management
 * - Event-driven updates using chrome.storage.onChanged
 * - Subscriber pattern for reactive updates
 * - Support for both local and session storage
 * - Automatic synchronization across extension components
 * - Memory-efficient state caching
 * - Proper cleanup and memory management
 */

export class StateManager {
  constructor(options = {}) {
    this.state = new Map();
    this.subscribers = new Map();
    this.cache = new Map();
    this.cacheTimeout = options.cacheTimeout || 30000; // 30 seconds
    this.enablePersistence = options.enablePersistence !== false;
    
    this.setupStorageListener();
    this.initializeState();
  }

  /**
   * Initialize state from storage
   */
  async initializeState() {
    try {
      // Load initial state from both storage areas
      await this.loadFromStorage('local');
      await this.loadFromStorage('session');
    } catch (error) {
      console.error('StateManager initialization failed:', error);
    }
  }

  /**
   * Load state from specific storage area
   * @param {string} storageArea - 'local' or 'session'
   */
  async loadFromStorage(storageArea) {
    const storage = this.getStorage(storageArea);
    if (!storage) return;

    try {
      const keys = await this.getStorageKeys(storageArea);
      const result = await storage.get(keys);
      
      for (const [key, value] of Object.entries(result)) {
        this.state.set(`${storageArea}:${key}`, value);
        this.updateCache(`${storageArea}:${key}`, value);
      }
    } catch (error) {
      console.error(`Failed to load from ${storageArea} storage:`, error);
    }
  }

  /**
   * Get storage keys for a specific storage area
   * @param {string} storageArea - 'local' or 'session'
   * @returns {Promise<Array>} Storage keys
   */
  async getStorageKeys(storageArea) {
    // Define keys that should be loaded from each storage area
    const localKeys = [
      'aideIsCollapsed',
      'aideCommand',
      'focusflow_settings',
      'focusflow_user_preferences'
    ];

    const sessionKeys = [
      'aideCurrentTab',
      'aideCurrentSelection',
      'aideActiveTabId',
      'focusflow_temp_data'
    ];

    return storageArea === 'local' ? localKeys : sessionKeys;
  }

  /**
   * Set state value with automatic persistence
   * @param {string} key - State key
   * @param {*} value - State value
   * @param {Object} options - Options for storage
   */
  async setState(key, value, options = {}) {
    const storageArea = options.storage || 'local';
    const storageKey = options.storageKey || key;
    const fullKey = `${storageArea}:${storageKey}`;
    
    try {
      // Validate value
      if (!this.isValidStateValue(value)) {
        throw new Error(`Invalid state value for key: ${key}`);
      }

      // Update in-memory state
      this.state.set(fullKey, value);
      
      // Update cache
      this.updateCache(fullKey, value);

      // Persist to storage if enabled
      if (this.enablePersistence) {
        const storage = this.getStorage(storageArea);
        if (storage) {
          await storage.set({ [storageKey]: value });
        }
      }

      // Notify subscribers
      this.notifySubscribers(fullKey, value, options);

      return true;
    } catch (error) {
      console.error(`StateManager.setState failed for ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get state value with caching
   * @param {string} key - State key
   * @param {Object} options - Options for retrieval
   * @returns {*} State value
   */
  async getState(key, options = {}) {
    const storageArea = options.storage || 'local';
    const storageKey = options.storageKey || key;
    const fullKey = `${storageArea}:${storageKey}`;
    
    try {
      // Check cache first
      if (this.cache.has(fullKey)) {
        const cached = this.cache.get(fullKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.value;
        }
      }

      // Load from storage if not in cache or cache expired
      const storage = this.getStorage(storageArea);
      if (storage) {
        const result = await storage.get([storageKey]);
        const value = result[storageKey];
        
        if (value !== undefined) {
          this.state.set(fullKey, value);
          this.updateCache(fullKey, value);
          return value;
        }
      }

      // Return in-memory state if available
      if (this.state.has(fullKey)) {
        return this.state.get(fullKey);
      }

      return undefined;
    } catch (error) {
      console.error(`StateManager.getState failed for ${key}:`, error);
      return this.state.get(fullKey);
    }
  }

  /**
   * Subscribe to state changes
   * @param {string} key - State key to subscribe to
   * @param {Function} callback - Callback function
   * @param {Object} options - Subscription options
   * @returns {Function} Unsubscribe function
   */
  subscribe(key, callback, options = {}) {
    const storageArea = options.storage || 'local';
    const storageKey = options.storageKey || key;
    const fullKey = `${storageArea}:${storageKey}`;
    
    if (!this.subscribers.has(fullKey)) {
      this.subscribers.set(fullKey, new Set());
    }

    const subscriber = {
      callback,
      options,
      id: this.generateSubscriberId()
    };

    this.subscribers.get(fullKey).add(subscriber);

    // Return unsubscribe function
    return () => {
      const subscribers = this.subscribers.get(fullKey);
      if (subscribers) {
        subscribers.delete(subscriber);
        if (subscribers.size === 0) {
          this.subscribers.delete(fullKey);
        }
      }
    };
  }

  /**
   * Unsubscribe from state changes
   * @param {string} key - State key
   * @param {Function} callback - Callback function to remove
   */
  unsubscribe(key, callback) {
    for (const [fullKey, subscribers] of this.subscribers.entries()) {
      if (fullKey.includes(key)) {
        for (const subscriber of subscribers) {
          if (subscriber.callback === callback) {
            subscribers.delete(subscriber);
            break;
          }
        }
        
        if (subscribers.size === 0) {
          this.subscribers.delete(fullKey);
        }
      }
    }
  }

  /**
   * Setup storage change listener
   */
  setupStorageListener() {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.onChanged.addListener((changes, areaName) => {
        for (const [key, change] of Object.entries(changes)) {
          const fullKey = `${areaName}:${key}`;
          const newValue = change.newValue;
          
          // Update in-memory state
          this.state.set(fullKey, newValue);
          
          // Update cache
          this.updateCache(fullKey, newValue);
          
          // Notify subscribers
          this.notifySubscribers(fullKey, newValue, { 
            source: 'storage',
            oldValue: change.oldValue
          });
        }
      });
    }
  }

  /**
   * Update cache with timeout
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   */
  updateCache(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  /**
   * Notify subscribers of state change
   * @param {string} key - State key
   * @param {*} value - New value
   * @param {Object} options - Notification options
   */
  notifySubscribers(key, value, options = {}) {
    const subscribers = this.subscribers.get(key);
    if (!subscribers) return;

    const notification = {
      key,
      value,
      oldValue: options.oldValue,
      source: options.source || 'direct',
      timestamp: Date.now()
    };

    // Notify all subscribers asynchronously
    subscribers.forEach(subscriber => {
      try {
        if (subscriber.options.immediate) {
          subscriber.callback(notification);
        } else {
          // Use setTimeout to avoid blocking
          setTimeout(() => subscriber.callback(notification), 0);
        }
      } catch (error) {
        console.error('Subscriber callback error:', error);
      }
    });
  }

  /**
   * Get storage object for area
   * @param {string} storageArea - 'local' or 'session'
   * @returns {Object} Storage object
   */
  getStorage(storageArea) {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      return chrome.storage[storageArea] || null;
    }
    return null;
  }

  /**
   * Validate state value
   * @param {*} value - Value to validate
   * @returns {boolean} Whether value is valid
   */
  isValidStateValue(value) {
    // Check for circular references
    try {
      JSON.stringify(value);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate unique subscriber ID
   * @returns {string} Subscriber ID
   */
  generateSubscriberId() {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear state for specific key or all state
   * @param {string} key - Key to clear (optional)
   * @param {Object} options - Clear options
   */
  async clearState(key = null, options = {}) {
    const storageArea = options.storage || 'local';
    
    try {
      if (key) {
        // Clear specific key
        const fullKey = `${storageArea}:${key}`;
        this.state.delete(fullKey);
        this.cache.delete(fullKey);
        
        if (this.enablePersistence) {
          const storage = this.getStorage(storageArea);
          if (storage) {
            await storage.remove(key);
          }
        }
        
        // Remove subscribers
        this.subscribers.delete(fullKey);
      } else {
        // Clear all state for storage area
        const keysToRemove = [];
        for (const stateKey of this.state.keys()) {
          if (stateKey.startsWith(`${storageArea}:`)) {
            keysToRemove.push(stateKey);
            this.cache.delete(stateKey);
            this.subscribers.delete(stateKey);
          }
        }
        
        keysToRemove.forEach(k => this.state.delete(k));
        
        if (this.enablePersistence) {
          const storage = this.getStorage(storageArea);
          if (storage) {
            const storageKeys = await this.getStorageKeys(storageArea);
            await storage.remove(storageKeys);
          }
        }
      }
    } catch (error) {
      console.error(`StateManager.clearState failed:`, error);
      throw error;
    }
  }

  /**
   * Get state statistics
   * @returns {Object} State statistics
   */
  getStats() {
    return {
      stateSize: this.state.size,
      cacheSize: this.cache.size,
      subscriberCount: Array.from(this.subscribers.values())
        .reduce((total, subscribers) => total + subscribers.size, 0),
      subscribedKeys: Array.from(this.subscribers.keys())
    };
  }

  /**
   * Export all state for debugging
   * @returns {Object} Complete state export
   */
  exportState() {
    const exported = {};
    
    for (const [key, value] of this.state.entries()) {
      exported[key] = value;
    }
    
    return {
      timestamp: new Date().toISOString(),
      stats: this.getStats(),
      state: exported
    };
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.state.clear();
    this.cache.clear();
    this.subscribers.clear();
  }
}

// Export singleton instance for easy usage
export const stateManager = new StateManager();

// Export default
export default StateManager;

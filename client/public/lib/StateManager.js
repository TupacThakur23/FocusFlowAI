

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

  
  async initializeState() {
    try {
      await this.loadFromStorage('local');
      // session storage load disabled for demo stability
    } catch (error) {
      console.error('StateManager initialization failed:', error);
    }
  }

  
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

  
  async getStorageKeys(storageArea) {

    const localKeys = [
      'aideIsCollapsed',
      'aideCommand',
      'focusflow_settings',
      'focusflow_user_preferences',
      'aideCurrentTab',
      'aideCurrentSelection',
      'aideActiveTabId',
      'focusflow_temp_data',
      'aideExtractedContent'
    ];

    return localKeys;
  }

  
  async setState(key, value, options = {}) {
    const storageArea = options.storage || 'local';
    const storageKey = options.storageKey || key;
    const fullKey = `${storageArea}:${storageKey}`;
    
    try {

      if (!this.isValidStateValue(value)) {
        throw new Error(`Invalid state value for key: ${key}`);
      }

      this.state.set(fullKey, value);
      

      this.updateCache(fullKey, value);

      if (this.enablePersistence) {
        const storage = this.getStorage(storageArea);
        if (storage) {
          await storage.set({ [storageKey]: value });
        }
      }

      this.notifySubscribers(fullKey, value, options);

      return true;
    } catch (error) {
      console.error(`StateManager.setState failed for ${key}:`, error);
      throw error;
    }
  }

  
  async getState(key, options = {}) {
    const storageArea = options.storage || 'local';
    const storageKey = options.storageKey || key;
    const fullKey = `${storageArea}:${storageKey}`;
    
    try {

      if (this.cache.has(fullKey)) {
        const cached = this.cache.get(fullKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.value;
        }
      }

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

      if (this.state.has(fullKey)) {
        return this.state.get(fullKey);
      }

      return undefined;
    } catch (error) {
      console.error(`StateManager.getState failed for ${key}:`, error);
      return this.state.get(fullKey);
    }
  }

  
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

  
  setupStorageListener() {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.onChanged.addListener((changes, areaName) => {
        for (const [key, change] of Object.entries(changes)) {
          const fullKey = `${areaName}:${key}`;
          const newValue = change.newValue;
          

          this.state.set(fullKey, newValue);
          

          this.updateCache(fullKey, newValue);
          

          this.notifySubscribers(fullKey, newValue, { 
            source: 'storage',
            oldValue: change.oldValue
          });
        }
      });
    }
  }

  
  updateCache(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  
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

    subscribers.forEach(subscriber => {
      try {
        if (subscriber.options.immediate) {
          subscriber.callback(notification);
        } else {

          setTimeout(() => subscriber.callback(notification), 0);
        }
      } catch (error) {
        console.error('Subscriber callback error:', error);
      }
    });
  }

  
  getStorage(storageArea) {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      // Force all storage to local to avoid MV3 session context errors
      return chrome.storage.local || null;
    }
    return null;
  }

  
  isValidStateValue(value) {

    try {
      JSON.stringify(value);
      return true;
    } catch (error) {
      return false;
    }
  }

  
  generateSubscriberId() {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  
  async clearState(key = null, options = {}) {
    const storageArea = options.storage || 'local';
    
    try {
      if (key) {

        const fullKey = `${storageArea}:${key}`;
        this.state.delete(fullKey);
        this.cache.delete(fullKey);
        
        if (this.enablePersistence) {
          const storage = this.getStorage(storageArea);
          if (storage) {
            await storage.remove(key);
          }
        }
        

        this.subscribers.delete(fullKey);
      } else {

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

  
  getStats() {
    return {
      stateSize: this.state.size,
      cacheSize: this.cache.size,
      subscriberCount: Array.from(this.subscribers.values())
        .reduce((total, subscribers) => total + subscribers.size, 0),
      subscribedKeys: Array.from(this.subscribers.keys())
    };
  }

  
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

  
  cleanup() {
    this.state.clear();
    this.cache.clear();
    this.subscribers.clear();
  }
}

export const stateManager = new StateManager();

export default StateManager;

/**
 * useExtensionState - React Hook for Extension State Management
 * 
 * Provides React components with access to extension's StateManager
 * for event-driven state updates without polling.
 * 
 * Features:
 * - Automatic subscription cleanup on component unmount
 * - Event-driven state updates
 * - Multiple storage area support (local/session)
 * - Debounced updates to prevent excessive re-renders
 * - TypeScript-ready interface
 * - Performance optimized with dependency arrays
 */

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook for using extension state in React components
 * @param {string} key - State key to subscribe to
 * @param {Object} options - Subscription options
 * @returns {Array} [stateValue, setState, { loading, error }]
 */
export const useExtensionState = (key, options = {}) => {
  const {
    storage = 'session',
    storageKey,
    defaultValue,
    immediate = true,
    debounceMs = 0
  } = options;

  const [state, setState] = useState(defaultValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const unsubscribeRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const stateManagerRef = useRef(null);

  // Initialize StateManager connection
  useEffect(() => {
    const initializeStateManager = async () => {
      try {
        // Check if running in extension context
        if (typeof chrome !== 'undefined' && chrome.storage) {
          // Try to access extension's StateManager
          if (window.stateManager) {
            stateManagerRef.current = window.stateManager;
          } else {
            // Fallback: create simple state interface
            stateManagerRef.current = createFallbackStateManager();
          }
        } else {
          // Development mode - create mock interface
          stateManagerRef.current = createMockStateManager();
        }

        // Load initial state
        if (immediate) {
          await loadInitialState();
        }

        setLoading(false);
      } catch (err) {
        console.error('StateManager initialization failed:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    initializeStateManager();

    return () => {
      // Cleanup subscription
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      
      // Clear debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [key, immediate]);

  /**
   * Load initial state from storage
   */
  const loadInitialState = useCallback(async () => {
    if (!stateManagerRef.current) return;

    try {
      const value = await stateManagerRef.current.getState(
        storageKey || key, 
        { storage }
      );
      
      setState(value !== undefined ? value : defaultValue);
      setError(null);
    } catch (err) {
      console.error('Failed to load initial state:', err);
      setError(err.message);
    }
  }, [key, storageKey, defaultValue, storage]);

  // Subscribe to state changes
  useEffect(() => {
    if (!stateManagerRef.current || !immediate) return;

    const fullKey = `${storage}:${storageKey || key}`;
    
    const unsubscribe = stateManagerRef.current.subscribe(
      fullKey,
      (notification) => {
        const newValue = notification.value;
        
        // Apply debouncing if specified
        if (debounceMs > 0) {
          if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
          }
          
          debounceTimerRef.current = setTimeout(() => {
            setState(newValue);
            setError(null);
          }, debounceMs);
        } else {
          setState(newValue);
          setError(null);
        }
      },
      { immediate: true }
    );

    unsubscribeRef.current = unsubscribe;

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [key, storageKey, storage, immediate, debounceMs]);

  /**
   * Set state value
   * @param {*} value - New state value
   */
  const setExtensionState = useCallback(async (value) => {
    if (!stateManagerRef.current) {
      throw new Error('StateManager not initialized');
    }

    try {
      setError(null);
      await stateManagerRef.current.setState(
        storageKey || key,
        value,
        { storage }
      );
      
      // Update local state immediately for better UX
      setState(value);
    } catch (err) {
      console.error('Failed to set state:', err);
      setError(err.message);
      throw err;
    }
  }, [key, storageKey, storage]);

  /**
   * Clear state value
   */
  const clearExtensionState = useCallback(async () => {
    if (!stateManagerRef.current) {
      throw new Error('StateManager not initialized');
    }

    try {
      setError(null);
      await stateManagerRef.current.clearState(
        storageKey || key,
        { storage }
      );
      
      setState(defaultValue);
    } catch (err) {
      console.error('Failed to clear state:', err);
      setError(err.message);
      throw err;
    }
  }, [key, storageKey, defaultValue, storage]);

  return [
    state,
    setExtensionState,
    {
      loading,
      error,
      clearState: clearExtensionState,
      refresh: loadInitialState
    }
  ];
};

/**
 * Hook for managing multiple extension state keys
 * @param {Object} config - Configuration object with key: options pairs
 * @returns {Object} State object with setters and meta
 */
export const useExtensionStateMap = (config) => {
  const [states, setStates] = useState({});
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const unsubscribersRef = useRef(new Map());

  useEffect(() => {
    const initializeStates = async () => {
      try {
        let stateManager;
        
        if (typeof chrome !== 'undefined' && chrome.storage) {
          stateManager = window.stateManager || createFallbackStateManager();
        } else {
          stateManager = createMockStateManager();
        }

        const newStates = {};
        const newErrors = {};
        const unsubscribers = new Map();

        // Initialize all states
        for (const [key, options] of Object.entries(config)) {
          try {
            const value = await stateManager.getState(
              options.storageKey || key,
              { storage: options.storage || 'session' }
            );
            
            newStates[key] = value !== undefined ? value : options.defaultValue;
            
            // Subscribe to changes
            const fullKey = `${options.storage || 'session'}:${options.storageKey || key}`;
            const unsubscribe = stateManager.subscribe(
              fullKey,
              (notification) => {
                setStates(prev => ({
                  ...prev,
                  [key]: notification.value
                }));
                setErrors(prev => ({
                  ...prev,
                  [key]: null
                }));
              }
            );
            
            unsubscribers.set(key, unsubscribe);
          } catch (err) {
            newErrors[key] = err.message;
          }
        }

        setStates(newStates);
        setErrors(newErrors);
        setLoading(false);
        unsubscribersRef.current = unsubscribers;

      } catch (err) {
        console.error('Failed to initialize state map:', err);
        setLoading(false);
      }
    };

    initializeStates();

    return () => {
      // Cleanup all subscriptions
      for (const unsubscribe of unsubscribersRef.current.values()) {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      }
      unsubscribersRef.current.clear();
    };
  }, [config]);

  /**
   * Set multiple state values
   */
  const setMultipleStates = useCallback(async (updates) => {
    try {
      const newErrors = { ...errors };
      
      for (const [key, value] of Object.entries(updates)) {
        try {
          const options = config[key];
          if (window.stateManager) {
            await window.stateManager.setState(
              options.storageKey || key,
              value,
              { storage: options.storage || 'session' }
            );
          }
          
          delete newErrors[key];
        } catch (err) {
          newErrors[key] = err.message;
        }
      }

      setStates(prev => ({ ...prev, ...updates }));
      setErrors(newErrors);
    } catch (err) {
      console.error('Failed to set multiple states:', err);
    }
  }, [config, errors]);

  return {
    states,
    setStates: setMultipleStates,
    loading,
    errors,
    hasErrors: Object.values(errors).some(Boolean)
  };
};

/**
 * Create fallback StateManager interface for development
 */
function createFallbackStateManager() {
  const state = new Map();
  const listeners = new Map();

  return {
    async getState(key, options = {}) {
      const fullKey = `${options.storage || 'session'}:${key}`;
      return state.get(fullKey);
    },

    async setState(key, value, options = {}) {
      const fullKey = `${options.storage || 'session'}:${key}`;
      state.set(fullKey, value);
      
      // Notify listeners
      if (listeners.has(fullKey)) {
        listeners.get(fullKey).forEach(callback => {
          try {
            callback({ value, oldValue: state.get(fullKey), source: 'direct' });
          } catch (err) {
            console.error('State listener error:', err);
          }
        });
      }
    },

    subscribe(key, callback) {
      if (!listeners.has(key)) {
        listeners.set(key, new Set());
      }
      listeners.get(key).add(callback);
      
      return () => {
        const keyListeners = listeners.get(key);
        if (keyListeners) {
          keyListeners.delete(callback);
          if (keyListeners.size === 0) {
            listeners.delete(key);
          }
        }
      };
    },

    clearState(key, options = {}) {
      const fullKey = `${options.storage || 'session'}:${key}`;
      state.delete(fullKey);
      listeners.delete(fullKey);
    },

    getStats() {
      return {
        stateSize: state.size,
        listenerCount: Array.from(listeners.values())
          .reduce((total, set) => total + set.size, 0)
      };
    }
  };
}

/**
 * Create mock StateManager for development/testing
 */
function createMockStateManager() {
  const state = new Map();
  const listeners = new Map();

  return {
    async getState(key, options = {}) {
      const fullKey = `${options.storage || 'session'}:${key}`;
      return state.get(fullKey);
    },

    async setState(key, value, options = {}) {
      const fullKey = `${options.storage || 'session'}:${key}`;
      const oldValue = state.get(fullKey);
      state.set(fullKey, value);
      
      // Simulate async behavior
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Notify listeners
      if (listeners.has(fullKey)) {
        listeners.get(fullKey).forEach(callback => {
          try {
            callback({ value, oldValue, source: 'mock' });
          } catch (err) {
            console.error('Mock state listener error:', err);
          }
        });
      }
    },

    subscribe(key, callback) {
      if (!listeners.has(key)) {
        listeners.set(key, new Set());
      }
      listeners.get(key).add(callback);
      
      return () => {
        const keyListeners = listeners.get(key);
        if (keyListeners) {
          keyListeners.delete(callback);
          if (keyListeners.size === 0) {
            listeners.delete(key);
          }
        }
      };
    },

    clearState(key, options = {}) {
      const fullKey = `${options.storage || 'session'}:${key}`;
      state.delete(fullKey);
      listeners.delete(fullKey);
    },

    getStats() {
      return {
        mock: true,
        stateSize: state.size,
        listenerCount: Array.from(listeners.values())
          .reduce((total, set) => total + set.size, 0)
      };
    }
  };
}

export default useExtensionState;

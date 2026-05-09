/**
 * useMessageBus - React Hook for Extension Communication
 * 
 * Provides React components with access to the extension's MessageBus
 * for reliable communication between content scripts, background, and popup.
 * 
 * Features:
 * - Automatic cleanup on component unmount
 * - Message subscription with callback handling
 * - Safe message sending with error handling
 * - TypeScript-ready interface
 * - React dependency array optimization
 */

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook for using MessageBus in React components
 * @returns {Object} MessageBus interface
 */
export const useMessageBus = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastError, setLastError] = useState(null);
  const subscriptions = useRef(new Map());
  const messageBusRef = useRef(null);

  // Initialize MessageBus connection
  useEffect(() => {
    const initializeMessageBus = async () => {
      try {
        // Check if running in extension context
        if (typeof chrome !== 'undefined' && chrome.runtime) {
          // Try to access extension's MessageBus
          if (window.messageBus) {
            messageBusRef.current = window.messageBus;
            setIsConnected(true);
          } else {
            // Fallback: create simple message interface
            messageBusRef.current = createFallbackMessageBus();
            setIsConnected(true);
          }
        } else {
          // Development mode - create mock interface
          messageBusRef.current = createMockMessageBus();
          setIsConnected(true);
        }
      } catch (error) {
        console.error('MessageBus initialization failed:', error);
        setLastError(error.message);
        setIsConnected(false);
      }
    };

    initializeMessageBus();

    return () => {
      // Cleanup all subscriptions
      subscriptions.current.forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
      subscriptions.current.clear();
    };
  }, []);

  /**
   * Send message to specified target
   * @param {string|number} target - Message target
   * @param {Object} message - Message payload
   * @param {Object} options - Send options
   * @returns {Promise} Message response
   */
  const sendMessage = useCallback(async (target, message, options = {}) => {
    if (!messageBusRef.current) {
      throw new Error('MessageBus not initialized');
    }

    try {
      setLastError(null);
      return await messageBusRef.current.sendMessage(target, message, options);
    } catch (error) {
      console.error('MessageBus sendMessage error:', error);
      setLastError(error.message);
      throw error;
    }
  }, []);

  /**
   * Subscribe to message type
   * @param {string} messageType - Message type to subscribe to
   * @param {Function} callback - Callback function
   * @param {Object} options - Subscription options
   * @returns {Function} Unsubscribe function
   */
  const onMessage = useCallback((messageType, callback, options = {}) => {
    if (!messageBusRef.current) {
      console.warn('MessageBus not initialized, subscription deferred');
      return () => {};
    }

    const unsubscribe = messageBusRef.current.onMessage(messageType, callback, options);
    subscriptions.current.set(messageType, unsubscribe);

    return unsubscribe;
  }, []);

  /**
   * Unsubscribe from message type
   * @param {string} messageType - Message type to unsubscribe from
   */
  const offMessage = useCallback((messageType) => {
    const unsubscribe = subscriptions.current.get(messageType);
    if (unsubscribe) {
      unsubscribe();
      subscriptions.current.delete(messageType);
    }
  }, []);

  /**
   * Send message to background service worker
   * @param {Object} message - Message payload
   * @param {Object} options - Send options
   * @returns {Promise} Message response
   */
  const sendToBackground = useCallback((message, options = {}) => {
    return sendMessage('background', message, options);
  }, [sendMessage]);

  /**
   * Send message to content script
   * @param {number} tabId - Tab ID (optional, defaults to active tab)
   * @param {Object} message - Message payload
   * @param {Object} options - Send options
   * @returns {Promise} Message response
   */
  const sendToContentScript = useCallback(async (tabId, message, options = {}) => {
    // If tabId is omitted, treat first parameter as message
    if (typeof tabId === 'object' && tabId !== null) {
      message = tabId;
      tabId = null;
    }

    if (tabId) {
      return sendMessage(tabId, message, options);
    } else {
      // Send to active tab via background
      return sendToBackground({
        type: 'RELAY_TO_CONTENT',
        payload: message
      }, options);
    }
  }, [sendMessage, sendToBackground]);

  /**
   * Get MessageBus statistics for debugging
   * @returns {Object} MessageBus stats
   */
  const getStats = useCallback(() => {
    if (!messageBusRef.current) {
      return { connected: false };
    }

    if (typeof messageBusRef.current.getStats === 'function') {
      return {
        connected: isConnected,
        subscriptions: subscriptions.current.size,
        ...messageBusRef.current.getStats()
      };
    }

    return { connected: isConnected, subscriptions: subscriptions.current.size };
  }, [isConnected]);

  return {
    // State
    isConnected,
    lastError,
    
    // Methods
    sendMessage,
    onMessage,
    offMessage,
    sendToBackground,
    sendToContentScript,
    getStats,
    
    // Reference to underlying MessageBus (advanced usage)
    messageBus: messageBusRef.current
  };
};

/**
 * Create fallback MessageBus interface for development
 */
function createFallbackMessageBus() {
  const listeners = new Map();
  let messageId = 0;

  return {
    async sendMessage(target, message) {
      console.log('Fallback MessageBus - sendMessage:', { target, message });
      return { success: true, fallback: true };
    },
    
    onMessage(type, callback) {
      if (!listeners.has(type)) {
        listeners.set(type, new Set());
      }
      listeners.get(type).add(callback);
      
      return () => {
        const typeListeners = listeners.get(type);
        if (typeListeners) {
          typeListeners.delete(callback);
          if (typeListeners.size === 0) {
            listeners.delete(type);
          }
        }
      };
    },
    
    getStats() {
      return {
        listenerTypes: Array.from(listeners.keys()),
        totalListeners: Array.from(listeners.values())
          .reduce((total, set) => total + set.size, 0)
      };
    }
  };
}

/**
 * Create mock MessageBus for development/testing
 */
function createMockMessageBus() {
  const listeners = new Map();
  let messageId = 0;

  return {
    async sendMessage(target, message) {
      // Simulate async behavior
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('Mock MessageBus - sendMessage:', { target, message });
      return { success: true, mock: true, messageId: `mock_${++messageId}` };
    },
    
    onMessage(type, callback) {
      if (!listeners.has(type)) {
        listeners.set(type, new Set());
      }
      listeners.get(type).add(callback);
      
      return () => {
        const typeListeners = listeners.get(type);
        if (typeListeners) {
          typeListeners.delete(callback);
          if (typeListeners.size === 0) {
            listeners.delete(type);
          }
        }
      };
    },
    
    getStats() {
      return {
        mock: true,
        listenerTypes: Array.from(listeners.keys()),
        totalListeners: Array.from(listeners.values())
          .reduce((total, set) => total + set.size, 0)
      };
    }
  };
}

export default useMessageBus;



import { useState, useEffect, useCallback, useRef } from 'react';

export const useMessageBus = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastError, setLastError] = useState(null);
  const subscriptions = useRef(new Map());
  const messageBusRef = useRef(null);

  useEffect(() => {
    const initializeMessageBus = async () => {
      try {

        if (typeof chrome !== 'undefined' && chrome.runtime) {

          if (window.messageBus) {
            messageBusRef.current = window.messageBus;
            setIsConnected(true);
          } else {

            messageBusRef.current = createFallbackMessageBus();
            setIsConnected(true);
          }
        } else {

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

      subscriptions.current.forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
      subscriptions.current.clear();
    };
  }, []);

  
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

  
  const onMessage = useCallback((messageType, callback, options = {}) => {
    if (!messageBusRef.current) {
      console.warn('MessageBus not initialized, subscription deferred');
      return () => {};
    }

    const unsubscribe = messageBusRef.current.onMessage(messageType, callback, options);
    subscriptions.current.set(messageType, unsubscribe);

    return unsubscribe;
  }, []);

  
  const offMessage = useCallback((messageType) => {
    const unsubscribe = subscriptions.current.get(messageType);
    if (unsubscribe) {
      unsubscribe();
      subscriptions.current.delete(messageType);
    }
  }, []);

  
  const sendToBackground = useCallback((message, options = {}) => {
    return sendMessage('background', message, options);
  }, [sendMessage]);

  
  const sendToContentScript = useCallback(async (tabId, message, options = {}) => {

    if (typeof tabId === 'object' && tabId !== null) {
      message = tabId;
      tabId = null;
    }

    if (tabId) {
      return sendMessage(tabId, message, options);
    } else {

      return sendToBackground({
        type: 'RELAY_TO_CONTENT',
        payload: message
      }, options);
    }
  }, [sendMessage, sendToBackground]);

  
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

    isConnected,
    lastError,
    

    sendMessage,
    onMessage,
    offMessage,
    sendToBackground,
    sendToContentScript,
    getStats,
    

    messageBus: messageBusRef.current
  };
};

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

function createMockMessageBus() {
  const listeners = new Map();
  let messageId = 0;

  return {
    async sendMessage(target, message) {

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

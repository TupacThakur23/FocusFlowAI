/**
 * ExtensionProvider - React Context Provider for Extension Integration
 * 
 * Provides global extension state and functionality to all React components
 * through React Context, eliminating the need for prop drilling.
 * 
 * Features:
 * - Global extension state management
 * - MessageBus integration
 * - Error boundary handling
 * - Performance optimization with memoization
 * - Development/production mode detection
 * - Automatic cleanup on unmount
 */

import React, { createContext, useContext, useReducer, useCallback, useMemo, useEffect } from 'react';
import { useMessageBus } from './useMessageBus';
import { useExtensionState } from './useExtensionState';
import { useSidebarState } from './useSidebarState';

// Initial state
const initialState = {
  // Extension state
  isConnected: false,
  isLoading: true,
  error: null,
  
  // Tab and content state
  currentTab: null,
  selectedText: '',
  extractedContent: '',
  
  // Sidebar state
  sidebarOpen: false,
  sidebarAnimating: false,
  isMobile: false,
  
  // UI state
  activeView: 'launcher', // launcher, dashboard, research, aide
  theme: 'dark',
  
  // Performance and debugging
  debugMode: false,
  performance: {
    messageCount: 0,
    lastActivity: null,
    errors: []
  }
};

// Action types
const actionTypes = {
  // Connection actions
  SET_CONNECTED: 'SET_CONNECTED',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  
  // Content actions
  SET_CURRENT_TAB: 'SET_CURRENT_TAB',
  SET_SELECTED_TEXT: 'SET_SELECTED_TEXT',
  SET_EXTRACTED_CONTENT: 'SET_EXTRACTED_CONTENT',
  CLEAR_CONTENT: 'CLEAR_CONTENT',
  
  // Sidebar actions
  SET_SIDEBAR_OPEN: 'SET_SIDEBAR_OPEN',
  SET_SIDEBAR_ANIMATING: 'SET_SIDEBAR_ANIMATING',
  SET_MOBILE: 'SET_MOBILE',
  
  // UI actions
  SET_ACTIVE_VIEW: 'SET_ACTIVE_VIEW',
  SET_THEME: 'SET_THEME',
  
  // Performance actions
  INCREMENT_MESSAGE_COUNT: 'INCREMENT_MESSAGE_COUNT',
  UPDATE_LAST_ACTIVITY: 'UPDATE_LAST_ACTIVITY',
  ADD_ERROR: 'ADD_ERROR',
  CLEAR_ERRORS: 'CLEAR_ERRORS'
};

// Reducer function
function extensionReducer(state, action) {
  switch (action.type) {
    case actionTypes.SET_CONNECTED:
      return { ...state, isConnected: action.payload };
      
    case actionTypes.SET_LOADING:
      return { ...state, isLoading: action.payload };
      
    case actionTypes.SET_ERROR:
      return { 
        ...state, 
        error: action.payload,
        performance: {
          ...state.performance,
          errors: [...state.performance.errors, action.payload].slice(-10) // Keep last 10 errors
        }
      };
      
    case actionTypes.CLEAR_ERROR:
      return { ...state, error: null };
      
    case actionTypes.SET_CURRENT_TAB:
      return { ...state, currentTab: action.payload };
      
    case actionTypes.SET_SELECTED_TEXT:
      return { ...state, selectedText: action.payload };
      
    case actionTypes.SET_EXTRACTED_CONTENT:
      return { ...state, extractedContent: action.payload };
      
    case actionTypes.CLEAR_CONTENT:
      return { 
        ...state, 
        selectedText: '', 
        extractedContent: '' 
      };
      
    case actionTypes.SET_SIDEBAR_OPEN:
      return { ...state, sidebarOpen: action.payload };
      
    case actionTypes.SET_SIDEBAR_ANIMATING:
      return { ...state, sidebarAnimating: action.payload };
      
    case actionTypes.SET_MOBILE:
      return { ...state, isMobile: action.payload };
      
    case actionTypes.SET_ACTIVE_VIEW:
      return { ...state, activeView: action.payload };
      
    case actionTypes.SET_THEME:
      return { ...state, theme: action.payload };
      
    case actionTypes.INCREMENT_MESSAGE_COUNT:
      return {
        ...state,
        performance: {
          ...state.performance,
          messageCount: state.performance.messageCount + 1
        }
      };
      
    case actionTypes.UPDATE_LAST_ACTIVITY:
      return {
        ...state,
        performance: {
          ...state.performance,
          lastActivity: action.payload
        }
      };
      
    case actionTypes.ADD_ERROR:
      return {
        ...state,
        performance: {
          ...state.performance,
          errors: [...state.performance.errors, action.payload].slice(-10)
        }
      };
      
    case actionTypes.CLEAR_ERRORS:
      return {
        ...state,
        performance: {
          ...state.performance,
          errors: []
        }
      };
      
    default:
      return state;
  }
}

// Create context
const ExtensionContext = createContext();

/**
 * ExtensionProvider component
 */
export const ExtensionProvider = ({ children }) => {
  const [state, dispatch] = useReducer(extensionReducer, initialState);
  
  // Extension hooks
  const { isConnected, lastError, sendToBackground, sendToContentScript, onMessage } = useMessageBus();
  const sidebarState = useSidebarState();
  
  // Extension state subscriptions
  const [currentTab] = useExtensionState('aideCurrentTab', {
    storage: 'session',
    defaultValue: null
  });
  
  const [selectedText] = useExtensionState('aideCurrentSelection', {
    storage: 'session',
    defaultValue: ''
  });
  
  const [extractedContent] = useExtensionState('aideExtractedContent', {
    storage: 'session',
    defaultValue: ''
  });

  // Update state when extension connection changes
  useEffect(() => {
    dispatch({ type: actionTypes.SET_CONNECTED, payload: isConnected });
  }, [isConnected]);

  // Update state when extension errors occur
  useEffect(() => {
    if (lastError) {
      dispatch({ type: actionTypes.SET_ERROR, payload: lastError });
    }
  }, [lastError]);

  // Update state when extension data changes
  useEffect(() => {
    dispatch({ type: actionTypes.SET_CURRENT_TAB, payload: currentTab });
  }, [currentTab]);

  useEffect(() => {
    dispatch({ type: actionTypes.SET_SELECTED_TEXT, payload: selectedText });
  }, [selectedText]);

  useEffect(() => {
    dispatch({ type: actionTypes.SET_EXTRACTED_CONTENT, payload: extractedContent });
  }, [extractedContent]);

  // Update sidebar state - useSidebarState returns object with properties, not nested object
  useEffect(() => {
    console.log('🔍 ExtensionProvider: Updating sidebar state', {
      sidebarState,
      isOpen: sidebarState?.isOpen,
      isVisible: sidebarState?.isVisible,
      timestamp: Date.now()
    });
    
    // useSidebarState returns object with direct properties, not nested object
    if (sidebarState && typeof sidebarState.isOpen === 'boolean' && typeof sidebarState.isVisible === 'boolean') {
      dispatch({ type: actionTypes.SET_SIDEBAR_OPEN, payload: sidebarState.isOpen });
      dispatch({ type: actionTypes.SET_SIDEBAR_ANIMATING, payload: sidebarState.isAnimating });
      dispatch({ type: actionTypes.SET_MOBILE, payload: sidebarState.isMobile });
    } else {
      console.warn('⚠️ ExtensionProvider: sidebarState properties not available', {
        sidebarState,
        isOpen: sidebarState?.isOpen,
        isVisible: sidebarState?.isVisible,
        isAnimating: sidebarState?.isAnimating,
        isMobile: sidebarState?.isMobile
      });
    }
  }, [sidebarState?.isOpen, sidebarState?.isVisible, sidebarState?.isAnimating, sidebarState?.isMobile]);

  // Setup message listeners
  useEffect(() => {
    const unsubscribers = [];

    // Listen for tab changes
    unsubscribers.push(
      onMessage('TAB_CHANGED', (message) => {
        dispatch({ type: actionTypes.SET_CURRENT_TAB, payload: message.tab });
        dispatch({ type: actionTypes.UPDATE_LAST_ACTIVITY, payload: Date.now() });
      })
    );

    // Listen for text selection
    unsubscribers.push(
      onMessage('TEXT_SELECTED', (message) => {
        dispatch({ type: actionTypes.SET_SELECTED_TEXT, payload: message.text });
        dispatch({ type: actionTypes.UPDATE_LAST_ACTIVITY, payload: Date.now() });
      })
    );

    // Listen for content extraction
    unsubscribers.push(
      onMessage('CONTENT_EXTRACTED', (message) => {
        dispatch({ type: actionTypes.SET_EXTRACTED_CONTENT, payload: message.content });
        dispatch({ type: actionTypes.UPDATE_LAST_ACTIVITY, payload: Date.now() });
      })
    );

    // Listen for sidebar state changes
    unsubscribers.push(
      onMessage('SIDEBAR_STATE_CHANGED', (message) => {
        dispatch({ type: actionTypes.SET_SIDEBAR_OPEN, payload: message.isOpen });
        dispatch({ type: actionTypes.UPDATE_LAST_ACTIVITY, payload: Date.now() });
      })
    );

    // Performance monitoring
    unsubscribers.push(
      onMessage('*', () => {
        dispatch({ type: actionTypes.INCREMENT_MESSAGE_COUNT });
      })
    );

    return () => {
      unsubscribers.forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
    };
  }, [onMessage]);

  // Action creators
  const actions = useMemo(() => ({
    // Connection actions
    setConnected: (connected) => 
      dispatch({ type: actionTypes.SET_CONNECTED, payload: connected }),
    
    setLoading: (loading) => 
      dispatch({ type: actionTypes.SET_LOADING, payload: loading }),
    
    setError: (error) => 
      dispatch({ type: actionTypes.SET_ERROR, payload: error }),
    
    clearError: () => 
      dispatch({ type: actionTypes.CLEAR_ERROR }),
    
    // Content actions
    setCurrentTab: (tab) => 
      dispatch({ type: actionTypes.SET_CURRENT_TAB, payload: tab }),
    
    setSelectedText: (text) => 
      dispatch({ type: actionTypes.SET_SELECTED_TEXT, payload: text }),
    
    setExtractedContent: (content) => 
      dispatch({ type: actionTypes.SET_EXTRACTED_CONTENT, payload: content }),
    
    clearContent: () => 
      dispatch({ type: actionTypes.CLEAR_CONTENT }),
    
    // Sidebar actions
    setSidebarOpen: (open) => 
      dispatch({ type: actionTypes.SET_SIDEBAR_OPEN, payload: open }),
    
    setSidebarAnimating: (animating) => 
      dispatch({ type: actionTypes.SET_SIDEBAR_ANIMATING, payload: animating }),
    
    // UI actions
    setActiveView: (view) => 
      dispatch({ type: actionTypes.SET_ACTIVE_VIEW, payload: view }),
    
    setTheme: (theme) => 
      dispatch({ type: actionTypes.SET_THEME, payload: theme }),
    
    // Performance actions
    clearErrors: () => 
      dispatch({ type: actionTypes.CLEAR_ERRORS }),
    
    // Extension communication
    sendMessage: sendToBackground,
    sendToContent: sendToContentScript,
    
    // Sidebar controls
    toggleSidebar: sidebarState.toggleSidebar,
    openSidebar: sidebarState.openSidebar,
    closeSidebar: sidebarState.closeSidebar,
    
    // Debug actions
    exportState: () => ({
      context: state,
      sidebar: sidebarState.getState(),
      timestamp: new Date().toISOString()
    })
  }), [dispatch, sendToBackground, sendToContentScript, sidebarState]);

  // Context value
  const contextValue = useMemo(() => ({
    ...state,
    ...sidebarState,
    actions,
    // Computed values
    isReady: state.isConnected && !state.isLoading,
    hasContent: !!(state.extractedContent || state.selectedText),
    hasError: !!state.error,
    isProduction: process.env.NODE_ENV === 'production'
  }), [state, sidebarState, actions]);

  return (
    <ExtensionContext.Provider value={contextValue}>
      {children}
    </ExtensionContext.Provider>
  );
};

/**
 * Hook to use extension context
 * @returns {Object} Extension context value
 */
export const useExtension = () => {
  const context = useContext(ExtensionContext);
  
  if (!context) {
    throw new Error('useExtension must be used within an ExtensionProvider');
  }
  
  return context;
};

/**
 * Hook to use extension actions only
 * @returns {Object} Extension actions
 */
export const useExtensionActions = () => {
  const { actions } = useExtension();
  return actions;
};


/**
 * Hook to use extension performance monitoring
 * @returns {Object} Performance state and actions
 */
export const useExtensionPerformance = () => {
  const { performance, actions } = useExtension();
  
  return {
    ...performance,
    clearErrors: actions.clearErrors,
    exportPerformance: () => ({
      ...performance,
      timestamp: new Date().toISOString()
    })
  };
};

export default ExtensionProvider;

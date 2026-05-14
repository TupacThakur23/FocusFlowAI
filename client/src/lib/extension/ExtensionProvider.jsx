import React, { createContext, useContext, useReducer, useCallback, useMemo, useEffect } from 'react';
import { useExtensionState } from './useExtensionState';
import { useSidebarState } from './useSidebarState';
const initialState = {
  isConnected: true,
  isLoading: false,
  error: null,
  currentTab: null,
  selectedText: '',
  researchSession: null,
  sidebarOpen: false,
  sidebarAnimating: false,
  isMobile: false,
  activeView: 'launcher',
  theme: 'dark',
  debugMode: false,
  performance: {
    messageCount: 0,
    lastActivity: null,
    errors: []
  }
};
const actionTypes = {
  SET_CONNECTED: 'SET_CONNECTED',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_CURRENT_TAB: 'SET_CURRENT_TAB',
  SET_SELECTED_TEXT: 'SET_SELECTED_TEXT',
  SET_RESEARCH_SESSION: 'SET_RESEARCH_SESSION',
  CLEAR_CONTENT: 'CLEAR_CONTENT',
  SET_SIDEBAR_OPEN: 'SET_SIDEBAR_OPEN',
  SET_SIDEBAR_ANIMATING: 'SET_SIDEBAR_ANIMATING',
  SET_MOBILE: 'SET_MOBILE',
  SET_ACTIVE_VIEW: 'SET_ACTIVE_VIEW',
  SET_THEME: 'SET_THEME',
  INCREMENT_MESSAGE_COUNT: 'INCREMENT_MESSAGE_COUNT',
  UPDATE_LAST_ACTIVITY: 'UPDATE_LAST_ACTIVITY',
  ADD_ERROR: 'ADD_ERROR',
  CLEAR_ERRORS: 'CLEAR_ERRORS'
};
function extensionReducer(state, action) {
  switch (action.type) {
    case actionTypes.SET_CONNECTED:
      return {
        ...state,
        isConnected: action.payload
      };
    case actionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };
    case actionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        performance: {
          ...state.performance,
          errors: [...state.performance.errors, action.payload].slice(-10)
        }
      };
    case actionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    case actionTypes.SET_CURRENT_TAB:
      return {
        ...state,
        currentTab: action.payload
      };
    case actionTypes.SET_SELECTED_TEXT:
      return {
        ...state,
        selectedText: action.payload
      };
    case actionTypes.SET_RESEARCH_SESSION:
      return {
        ...state,
        researchSession: action.payload
      };
    case actionTypes.CLEAR_CONTENT:
      return {
        ...state,
        selectedText: '',
        researchSession: null
      };
    case actionTypes.SET_SIDEBAR_OPEN:
      return {
        ...state,
        sidebarOpen: action.payload
      };
    case actionTypes.SET_SIDEBAR_ANIMATING:
      return {
        ...state,
        sidebarAnimating: action.payload
      };
    case actionTypes.SET_MOBILE:
      return {
        ...state,
        isMobile: action.payload
      };
    case actionTypes.SET_ACTIVE_VIEW:
      return {
        ...state,
        activeView: action.payload
      };
    case actionTypes.SET_THEME:
      return {
        ...state,
        theme: action.payload
      };
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
const ExtensionContext = createContext();
export const ExtensionProvider = ({
  children
}) => {
  const [state, dispatch] = useReducer(extensionReducer, initialState);
  const sidebarState = useSidebarState();
  const [currentTab] = useExtensionState('aideCurrentTab', {
    storage: 'local',
    defaultValue: null
  });
  const [selectedText] = useExtensionState('aideCurrentSelection', {
    storage: 'local',
    defaultValue: ''
  });
  useEffect(() => {
    const fetchActiveTab = async () => {
      try {
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
          chrome.runtime.sendMessage({
            type: 'AIDE_GET_ACTIVE_TAB'
          }, response => {
            if (chrome.runtime.lastError) return;
            if (response && response.success && response.tab) {
              dispatch({
                type: actionTypes.SET_CURRENT_TAB,
                payload: response.tab
              });
            }
          });
        }
      } catch (err) {}
    };
    fetchActiveTab();
  }, []);
  useEffect(() => {
    if (typeof chrome === 'undefined' || !chrome.storage) return;
    chrome.storage.local.get(['aideResearchSession'], data => {
      if (data.aideResearchSession) {
        try {
          const session = JSON.parse(data.aideResearchSession);
          dispatch({
            type: actionTypes.SET_RESEARCH_SESSION,
            payload: session
          });
        } catch (e) {}
      }
    });
    const storageListener = (changes, area) => {
      if (area === 'local' && changes.aideResearchSession) {
        try {
          const raw = changes.aideResearchSession.newValue;
          if (!raw) {
            dispatch({
              type: actionTypes.SET_RESEARCH_SESSION,
              payload: null
            });
            return;
          }
          const session = typeof raw === 'string' ? JSON.parse(raw) : raw;
          dispatch({
            type: actionTypes.SET_RESEARCH_SESSION,
            payload: session
          });
        } catch (e) {}
      }
    };
    chrome.storage.onChanged.addListener(storageListener);
    return () => chrome.storage.onChanged.removeListener(storageListener);
  }, []);
  useEffect(() => {
    if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.onMessage) return;
    const listener = message => {
      if (message.type === 'TAB_CHANGED' && message.tab) {
        dispatch({
          type: actionTypes.SET_CURRENT_TAB,
          payload: message.tab
        });
      }
      if (message.type === 'SESSION_UPDATED' && message.session) {
        dispatch({
          type: actionTypes.SET_RESEARCH_SESSION,
          payload: message.session
        });
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);
  useEffect(() => {
    dispatch({
      type: actionTypes.SET_CURRENT_TAB,
      payload: currentTab
    });
  }, [currentTab]);
  useEffect(() => {
    dispatch({
      type: actionTypes.SET_SELECTED_TEXT,
      payload: selectedText
    });
  }, [selectedText]);
  useEffect(() => {
    if (sidebarState && typeof sidebarState.isOpen === 'boolean') {
      dispatch({
        type: actionTypes.SET_SIDEBAR_OPEN,
        payload: sidebarState.isOpen
      });
      dispatch({
        type: actionTypes.SET_SIDEBAR_ANIMATING,
        payload: sidebarState.isAnimating
      });
      dispatch({
        type: actionTypes.SET_MOBILE,
        payload: sidebarState.isMobile
      });
    }
  }, [sidebarState?.isOpen, sidebarState?.isVisible, sidebarState?.isAnimating, sidebarState?.isMobile]);
  const _sendToBackground = useCallback(message => {
    return new Promise(resolve => {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage(message, res => {
          if (chrome.runtime.lastError) console.warn(chrome.runtime.lastError.message);
          resolve(res);
        });
      } else resolve(null);
    });
  }, []);
  const _sendToContent = useCallback(message => {
    return new Promise(resolve => {
      if (typeof chrome !== 'undefined' && chrome.tabs) {
        chrome.tabs.query({
          active: true,
          currentWindow: true
        }, tabs => {
          if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, message, res => {
              if (chrome.runtime.lastError) console.warn(chrome.runtime.lastError.message);
              resolve(res);
            });
          } else resolve(null);
        });
      } else resolve(null);
    });
  }, []);
  const actions = useMemo(() => ({
    setConnected: connected => dispatch({
      type: actionTypes.SET_CONNECTED,
      payload: connected
    }),
    setLoading: loading => dispatch({
      type: actionTypes.SET_LOADING,
      payload: loading
    }),
    setError: error => dispatch({
      type: actionTypes.SET_ERROR,
      payload: error
    }),
    clearError: () => dispatch({
      type: actionTypes.CLEAR_ERROR
    }),
    setCurrentTab: tab => dispatch({
      type: actionTypes.SET_CURRENT_TAB,
      payload: tab
    }),
    setSelectedText: text => dispatch({
      type: actionTypes.SET_SELECTED_TEXT,
      payload: text
    }),
    clearContent: () => dispatch({
      type: actionTypes.CLEAR_CONTENT
    }),
    setSidebarOpen: open => dispatch({
      type: actionTypes.SET_SIDEBAR_OPEN,
      payload: open
    }),
    setSidebarAnimating: animating => dispatch({
      type: actionTypes.SET_SIDEBAR_ANIMATING,
      payload: animating
    }),
    setActiveView: view => dispatch({
      type: actionTypes.SET_ACTIVE_VIEW,
      payload: view
    }),
    setTheme: theme => dispatch({
      type: actionTypes.SET_THEME,
      payload: theme
    }),
    clearErrors: () => dispatch({
      type: actionTypes.CLEAR_ERRORS
    }),
    sendMessage: _sendToBackground,
    sendToContent: _sendToContent,
    extractContent: async () => {
      try {
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
          return new Promise(resolve => {
            chrome.runtime.sendMessage({
              type: 'EXTRACT_CONTENT_REQUEST'
            }, response => {
              if (chrome.runtime.lastError) console.warn('Extraction chrome message failed', chrome.runtime.lastError.message);
              resolve(response);
            });
          });
        }
        return null;
      } catch (err) {
        console.error('Extraction request failed', err);
      }
    },
    removeSource: async url => {
      if (typeof chrome === 'undefined' || !chrome.storage) return;
      chrome.storage.local.get(['aideResearchSession'], data => {
        if (data.aideResearchSession) {
          let session = JSON.parse(data.aideResearchSession);
          session.extractedPages = session.extractedPages.filter(p => p.url !== url);
          session.updatedAt = new Date().toISOString();
          chrome.storage.local.set({
            aideResearchSession: JSON.stringify(session)
          });
        }
      });
    },
    clearSession: async () => {
      if (typeof chrome === 'undefined' || !chrome.storage) return;
      chrome.storage.local.remove('aideResearchSession');
    },
    toggleSidebar: sidebarState.toggleSidebar,
    openSidebar: sidebarState.openSidebar,
    closeSidebar: sidebarState.closeSidebar,
    exportState: () => ({
      context: state,
      sidebar: sidebarState.getState?.() || {},
      timestamp: new Date().toISOString()
    })
  }), [dispatch, _sendToBackground, _sendToContent, sidebarState]);
  const contextValue = useMemo(() => ({
    ...state,
    ...sidebarState,
    actions,
    isReady: state.isConnected && !state.isLoading,
    hasContent: !!(state.researchSession?.extractedPages?.length > 0 || state.selectedText),
    hasError: !!state.error,
    isProduction: process.env.NODE_ENV === 'production'
  }), [state, sidebarState, actions]);
  return <ExtensionContext.Provider value={contextValue}>{children}</ExtensionContext.Provider>;
};
export const useExtension = () => {
  const context = useContext(ExtensionContext);
  if (!context) throw new Error('useExtension must be used within an ExtensionProvider');
  return context;
};
export const useExtensionActions = () => useExtension().actions;
export default ExtensionProvider;

/**
 * GlobalStatusProvider - Global Loading and Error State Management
 * 
 * Provides centralized state management for:
 * - Loading states for different operations
 * - Error states with recovery options
 * - Toast notifications
 * - Progress indicators
 * - User feedback
 * - Graceful degradation
 */

import React, { createContext, useContext, useReducer, useCallback } from 'react';

// Initial state
const initialState = {
  // Loading states
  loading: {
    extracting: false,
    summarizing: false,
    querying: false,
    saving: false,
    embedding: false,
    syncing: false,
    sidebar: false
  },
  
  // Error states
  errors: {
    extracting: null,
    summarizing: null,
    querying: null,
    saving: null,
    embedding: null,
    syncing: null,
    sidebar: null,
    global: null
  },
  
  // Toast notifications
  toasts: [],
  
  // Progress tracking
  progress: {
    extracting: 0,
    summarizing: 0,
    querying: 0,
    saving: 0,
    embedding: 0
  },
  
  // Connection state
  connection: {
    online: navigator.onLine,
    api: true,
    extension: true
  },
  
  // Performance metrics
  performance: {
    lastActivity: null,
    operationCount: 0,
    errorCount: 0
  }
};

// Action types
const actionTypes = {
  // Loading actions
  SET_LOADING: 'SET_LOADING',
  CLEAR_LOADING: 'CLEAR_LOADING',
  CLEAR_ALL_LOADING: 'CLEAR_ALL_LOADING',
  
  // Error actions
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  CLEAR_ALL_ERRORS: 'CLEAR_ALL_ERRORS',
  
  // Toast actions
  ADD_TOAST: 'ADD_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
  CLEAR_TOASTS: 'CLEAR_TOASTS',
  
  // Progress actions
  SET_PROGRESS: 'SET_PROGRESS',
  CLEAR_PROGRESS: 'CLEAR_PROGRESS',
  
  // Connection actions
  SET_CONNECTION: 'SET_CONNECTION',
  
  // Performance actions
  UPDATE_ACTIVITY: 'UPDATE_ACTIVITY',
  INCREMENT_OPERATION: 'INCREMENT_OPERATION',
  INCREMENT_ERROR: 'INCREMENT_ERROR'
};

// Reducer function
function globalStatusReducer(state, action) {
  switch (action.type) {
    case actionTypes.SET_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.operation]: action.payload.loading
        }
      };
      
    case actionTypes.CLEAR_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload]: false
        }
      };
      
    case actionTypes.CLEAR_ALL_LOADING:
      return {
        ...state,
        loading: Object.keys(state.loading).reduce((acc, key) => ({
          ...acc,
          [key]: false
        }), {})
      };
      
    case actionTypes.SET_ERROR:
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.operation]: action.payload.error
        },
        performance: {
          ...state.performance,
          errorCount: state.performance.errorCount + 1
        }
      };
      
    case actionTypes.CLEAR_ERROR:
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload]: null
        }
      };
      
    case actionTypes.CLEAR_ALL_ERRORS:
      return {
        ...state,
        errors: Object.keys(state.errors).reduce((acc, key) => ({
          ...acc,
          [key]: null
        }), {})
      };
      
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [...state.toasts, action.payload]
      };
      
    case actionTypes.REMOVE_TOAST:
      return {
        ...state,
        toasts: state.toasts.filter(toast => toast.id !== action.payload)
      };
      
    case actionTypes.CLEAR_TOASTS:
      return {
        ...state,
        toasts: []
      };
      
    case actionTypes.SET_PROGRESS:
      return {
        ...state,
        progress: {
          ...state.progress,
          [action.payload.operation]: action.payload.value
        }
      };
      
    case actionTypes.CLEAR_PROGRESS:
      return {
        ...state,
        progress: {
          ...state.progress,
          [action.payload]: 0
        }
      };
      
    case actionTypes.SET_CONNECTION:
      return {
        ...state,
        connection: {
          ...state.connection,
          ...action.payload
        }
      };
      
    case actionTypes.UPDATE_ACTIVITY:
      return {
        ...state,
        performance: {
          ...state.performance,
          lastActivity: action.payload
        }
      };
      
    case actionTypes.INCREMENT_OPERATION:
      return {
        ...state,
        performance: {
          ...state.performance,
          operationCount: state.performance.operationCount + 1
        }
      };
      
    case actionTypes.INCREMENT_ERROR:
      return {
        ...state,
        performance: {
          ...state.performance,
          errorCount: state.performance.errorCount + 1
        }
      };
      
    default:
      return state;
  }
}

// Create context
const GlobalStatusContext = createContext();

/**
 * GlobalStatusProvider component
 */
export const GlobalStatusProvider = ({ children }) => {
  const [state, dispatch] = useReducer(globalStatusReducer, initialState);

  // Monitor connection status
  React.useEffect(() => {
    const handleOnline = () => {
      dispatch({
        type: actionTypes.SET_CONNECTION,
        payload: { online: true }
      });
    };

    const handleOffline = () => {
      dispatch({
        type: actionTypes.SET_CONNECTION,
        payload: { online: false }
      });
      
      dispatch({
        type: actionTypes.ADD_TOAST,
        payload: {
          id: Date.now(),
          type: 'error',
          title: 'Connection Lost',
          message: 'You appear to be offline. Some features may not work correctly.',
          duration: 5000
        }
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-remove old toasts
  React.useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      state.toasts.forEach(toast => {
        if (toast.duration && now - toast.timestamp > toast.duration) {
          dispatch({
            type: actionTypes.REMOVE_TOAST,
            payload: toast.id
          });
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.toasts]);

  // Action creators
  const actions = {
    // Loading actions
    setLoading: (operation, loading) => {
      dispatch({
        type: actionTypes.SET_LOADING,
        payload: { operation, loading }
      });
      
      if (loading) {
        dispatch({
          type: actionTypes.UPDATE_ACTIVITY,
          payload: Date.now()
        });
        
        dispatch({
          type: actionTypes.INCREMENT_OPERATION
        });
      }
    },
    
    clearLoading: (operation) => {
      dispatch({
        type: actionTypes.CLEAR_LOADING,
        payload: operation
      });
    },
    
    clearAllLoading: () => {
      dispatch({
        type: actionTypes.CLEAR_ALL_LOADING
      });
    },
    
    // Error actions
    setError: (operation, error, options = {}) => {
      dispatch({
        type: actionTypes.SET_ERROR,
        payload: { operation, error }
      });
      
      // Auto-toast for errors
      if (options.showToast !== false) {
        dispatch({
          type: actionTypes.ADD_TOAST,
          payload: {
            id: Date.now(),
            type: 'error',
            title: options.title || 'Error',
            message: error?.message || error || 'An unknown error occurred',
            duration: options.duration || 5000,
            action: options.action
          }
        });
      }
    },
    
    clearError: (operation) => {
      dispatch({
        type: actionTypes.CLEAR_ERROR,
        payload: operation
      });
    },
    
    clearAllErrors: () => {
      dispatch({
        type: actionTypes.CLEAR_ALL_ERRORS
      });
    },
    
    // Toast actions
    addToast: (toast) => {
      const newToast = {
        id: Date.now(),
        timestamp: Date.now(),
        duration: 4000,
        ...toast
      };
      
      dispatch({
        type: actionTypes.ADD_TOAST,
        payload: newToast
      });
    },
    
    removeToast: (id) => {
      dispatch({
        type: actionTypes.REMOVE_TOAST,
        payload: id
      });
    },
    
    clearToasts: () => {
      dispatch({
        type: actionTypes.CLEAR_TOASTS
      });
    },
    
    // Progress actions
    setProgress: (operation, value) => {
      dispatch({
        type: actionTypes.SET_PROGRESS,
        payload: { operation, value }
      });
    },
    
    clearProgress: (operation) => {
      dispatch({
        type: actionTypes.CLEAR_PROGRESS,
        payload: operation
      });
    },
    
    // Connection actions
    setConnection: (connection) => {
      dispatch({
        type: actionTypes.SET_CONNECTION,
        payload: connection
      });
    },
    
    // Performance actions
    updateActivity: () => {
      dispatch({
        type: actionTypes.UPDATE_ACTIVITY,
        payload: Date.now()
      });
    },
    
    // Utility actions
    startOperation: (operation, options = {}) => {
      actions.setLoading(operation, true);
      actions.clearError(operation);
      if (options.progress !== undefined) {
        actions.setProgress(operation, options.progress);
      }
    },
    
    completeOperation: (operation, options = {}) => {
      actions.setLoading(operation, false);
      actions.clearError(operation);
      actions.clearProgress(operation);
      
      if (options.success && options.message) {
        actions.addToast({
          type: 'success',
          title: 'Success',
          message: options.message,
          duration: 3000
        });
      }
    },
    
    failOperation: (operation, error, options = {}) => {
      actions.setLoading(operation, false);
      actions.setError(operation, error, options);
      actions.clearProgress(operation);
    }
  };

  const contextValue = {
    ...state,
    actions,
    // Computed values
    isLoadingAny: Object.values(state.loading).some(Boolean),
    hasAnyErrors: Object.values(state.errors).some(Boolean),
    isOnline: state.connection.online,
    hasActiveOperations: Object.values(state.loading).some(Boolean)
  };

  return (
    <GlobalStatusContext.Provider value={contextValue}>
      {children}
    </GlobalStatusContext.Provider>
  );
};

/**
 * Hook to use global status context
 * @returns {Object} Global status context
 */
export const useGlobalStatus = () => {
  const context = useContext(GlobalStatusContext);
  
  if (!context) {
    throw new Error('useGlobalStatus must be used within a GlobalStatusProvider');
  }
  
  return context;
};

/**
 * Hook to use loading states
 * @returns {Object} Loading states and actions
 */
export const useLoadingStates = () => {
  const { loading, actions } = useGlobalStatus();
  
  return {
    loading,
    isLoading: (operation) => loading[operation] || false,
    setLoading: actions.setLoading,
    clearLoading: actions.clearLoading,
    clearAllLoading: actions.clearAllLoading
  };
};

/**
 * Hook to use error states
 * @returns {Object} Error states and actions
 */
export const useErrorStates = () => {
  const { errors, actions } = useGlobalStatus();
  
  return {
    errors,
    hasError: (operation) => errors[operation] || null,
    setError: actions.setError,
    clearError: actions.clearError,
    clearAllErrors: actions.clearAllErrors
  };
};

/**
 * Hook to use toast notifications
 * @returns {Object} Toast state and actions
 */
export const useToasts = () => {
  const { toasts, actions } = useGlobalStatus();
  
  return {
    toasts,
    addToast: actions.addToast,
    removeToast: actions.removeToast,
    clearToasts: actions.clearToasts
  };
};

/**
 * Hook to use progress tracking
 * @returns {Object} Progress state and actions
 */
export const useProgress = () => {
  const { progress, actions } = useGlobalStatus();
  
  return {
    progress,
    getProgress: (operation) => progress[operation] || 0,
    setProgress: actions.setProgress,
    clearProgress: actions.clearProgress
  };
};

/**
 * Hook to use connection status
 * @returns {Object} Connection state and actions
 */
export const useConnection = () => {
  const { connection, actions } = useGlobalStatus();
  
  return {
    connection,
    isOnline: connection.online,
    setConnection: actions.setConnection
  };
};

export default GlobalStatusProvider;

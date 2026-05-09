/**
 * useSidebarState - React Hook for Sidebar Management
 * 
 * Provides React components with sidebar state and control methods
 * for managing the FocusFlow AI sidebar interface.
 * 
 * Features:
 * - Sidebar open/close state management
 * - Smooth animation control
 * - Mobile responsiveness
 * - Keyboard shortcuts
 * - Auto-hide on navigation
 * - Persistent user preferences
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useMessageBus } from './useMessageBus';
import { useExtensionState } from './useExtensionState';

/**
 * Hook for managing sidebar state and interactions
 * @param {Object} options - Configuration options
 * @returns {Object} Sidebar state and control methods
 */
export const useSidebarState = (options = {}) => {
  const {
    autoHideOnNavigation = true,
    keyboardShortcut = true,
    mobileBreakpoint = 768,
    animationDuration = 300
  } = options;

  const { sendToBackground, sendToContentScript, onMessage } = useMessageBus();
  
  console.log('🔍 useSidebarState: Initializing with options', options);
  
  // Sidebar state - Initialize with safe defaults
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 400, height: '100vh' });
  
  console.log('🔍 useSidebarState: State initialized', {
    isOpen,
    isAnimating,
    isVisible,
    position,
    size,
    timestamp: Date.now()
  });
  
  // Mobile and responsive state
  const [isMobile, setIsMobile] = useState(false);
  const [hasOverlay, setHasOverlay] = useState(false);
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Persistent preferences
  const [collapsedState, setCollapsedState] = useExtensionState('aideIsCollapsed', {
    defaultValue: true,
    storage: 'local'
  });
  
  // Refs for cleanup
  const animationTimeoutRef = useRef(null);
  const resizeObserverRef = useRef(null);
  const unsubscribeRef = useRef(null);

  // Initialize sidebar state
  useEffect(() => {
    const initializeSidebar = async () => {
      try {
        console.log('🔍 Step 1: Starting sidebar initialization');
        setIsLoading(true);
        setError(null);
        
        console.log('🔍 Step 2: Loading state set to true');
        const isSidebarMode = window.location.search.includes('mode=sidebar');
        
        if (isSidebarMode) {
          console.log('🔍 Step 3: Detected sidebar mode');
          // We're running inside the sidebar iframe
          setIsVisible(true);
          setIsOpen(!collapsedState[0]);
          
          console.log('🔍 Step 4: Sidebar state initialized in sidebar mode');
          // Listen for sidebar state changes from content script
          unsubscribeRef.current = onMessage('SIDEBAR_TOGGLED', (message) => {
            setIsOpen(message.isVisible);
            setIsVisible(message.isVisible);
            setCollapsedState[1](!message.isVisible);
          });
        } else {
          console.log('🔍 Step 3: Detected popup mode');
          // We're in popup mode, sync with sidebar state
          const response = await sendToBackground({
            type: 'GET_SIDEBAR_STATE'
          });
          
          if (response.success) {
            console.log('🔍 Step 4: Successfully retrieved sidebar state from background');
            console.log('🔍 RAW RETRIEVED STATE:', response);
            console.log('🔍 STATE TYPE:', typeof response.state);
            console.log('🔍 STATE KEYS:', Object.keys(response.state || {}));
            console.log('🔍 RESPONSE.STATE:', response.state);
            console.log('🔍 RESPONSE.STATE.ISVISIBLE:', response.state?.isVisible);
            console.log('🔍 RESPONSE.STATE.ISOPEN:', response.state?.isOpen);
            console.log('🔍 RESPONSE.SIDEBAR:', response.sidebar);
            console.log('🔍 RESPONSE.SIDEBARSTATE:', response.sidebarState);
            
            // Normalize state structure before using
            const normalizeSidebarState = (rawState) => {
              console.log('🔍 Normalizing sidebar state:', rawState);
              
              // Extract state from different possible structures
              const state = rawState?.state || rawState?.sidebar || rawState?.sidebarState || rawState;
              
              const normalized = {
                isVisible: Boolean(state?.isVisible),
                isOpen: Boolean(state?.isOpen),
                isCollapsed: Boolean(state?.isCollapsed),
                activeView: state?.activeView || 'launcher',
                width: state?.width || 400
              };
              
              console.log('🔍 Normalized sidebar state:', normalized);
              return normalized;
            };
            
            const normalizedState = normalizeSidebarState(response);
            
            console.log('� Using normalized sidebar state');
            setIsOpen(normalizedState.isOpen);
            setIsVisible(normalizedState.isVisible);
            setIsOpen(!collapsedState[0]);
            
            // Listen for sidebar state changes from content script
            unsubscribeRef.current = onMessage('SIDEBAR_TOGGLED', (message) => {
              setIsOpen(message.isVisible);
              setIsVisible(message.isVisible);
              setCollapsedState[1](!message.isVisible);
            });
          }
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('🚨 Sidebar initialization failed:', err);
        console.error('🚨 Error name:', err?.name);
        console.error('🚨 Error message:', err?.message);
        console.error('🚨 Error stack:', err?.stack);
        console.error('🚨 Error timestamp:', Date.now());
        setError(err?.message || 'Unknown error during sidebar initialization');
        setIsLoading(false);
      }
    };

    initializeSidebar();

    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [collapsedState, sendToBackground, onMessage]);

  // Handle mobile responsiveness
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= mobileBreakpoint;
      setIsMobile(mobile);
      
      if (mobile && isOpen) {
        setHasOverlay(true);
      } else {
        setHasOverlay(false);
      }
    };

    checkMobile();
    
    const handleResize = () => {
      checkMobile();
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [mobileBreakpoint, isOpen]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!keyboardShortcut) return;

    const handleKeyDown = (event) => {
      // Ctrl/Cmd + Shift + F to toggle sidebar
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'F') {
        event.preventDefault();
        toggleSidebar();
      }
      
      // Escape to close sidebar
      if (event.key === 'Escape' && isOpen) {
        closeSidebar();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [keyboardShortcut, isOpen]);

  /**
   * Toggle sidebar open/closed
   */
  const toggleSidebar = useCallback(async () => {
    if (isAnimating || isLoading) return;

    try {
      setIsAnimating(true);
      setError(null);
      
      const newState = !isOpen;
      
      if (window.location.search.includes('mode=sidebar')) {
        // We're in sidebar mode - update parent
        await sendToBackground({
          type: 'TOGGLE_SIDEBAR_REQUEST'
        });
      } else {
        // We're in popup mode - send command to content script
        const response = await sendToContentScript({
          type: 'TOGGLE_SIDEBAR'
        });
        
        if (response.success) {
          setIsOpen(response.visible);
          setCollapsedState[1](!response.visible);
        } else {
          throw new Error(response.error || 'Failed to toggle sidebar');
        }
      }
      
      // Handle animation timing
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      
      animationTimeoutRef.current = setTimeout(() => {
        setIsAnimating(false);
      }, animationDuration);
      
    } catch (err) {
      console.error('Toggle sidebar failed:', err);
      setError(err.message);
      setIsAnimating(false);
    }
  }, [isAnimating, isLoading, isOpen, sendToBackground, sendToContentScript, setCollapsedState, animationDuration]);

  /**
   * Open sidebar
   */
  const openSidebar = useCallback(async () => {
    if (isOpen || isAnimating || isLoading) return;

    try {
      setIsAnimating(true);
      setError(null);
      
      if (window.location.search.includes('mode=sidebar')) {
        await sendToBackground({
          type: 'OPEN_SIDEBAR_REQUEST'
        });
      } else {
        const response = await sendToContentScript({
          type: 'OPEN_SIDEBAR'
        });
        
        if (response.success) {
          setIsOpen(true);
          setCollapsedState[1](false);
        } else {
          throw new Error(response.error || 'Failed to open sidebar');
        }
      }
      
      setTimeout(() => {
        setIsAnimating(false);
      }, animationDuration);
      
    } catch (err) {
      console.error('Open sidebar failed:', err);
      setError(err.message);
      setIsAnimating(false);
    }
  }, [isOpen, isAnimating, isLoading, sendToBackground, sendToContentScript, setCollapsedState, animationDuration]);

  /**
   * Close sidebar
   */
  const closeSidebar = useCallback(async () => {
    if (!isOpen || isAnimating || isLoading) return;

    try {
      setIsAnimating(true);
      setError(null);
      
      if (window.location.search.includes('mode=sidebar')) {
        await sendToBackground({
          type: 'CLOSE_SIDEBAR_REQUEST'
        });
      } else {
        const response = await sendToContentScript({
          type: 'CLOSE_SIDEBAR'
        });
        
        if (response.success) {
          setIsOpen(false);
          setCollapsedState[1](true);
        } else {
          throw new Error(response.error || 'Failed to close sidebar');
        }
      }
      
      setTimeout(() => {
        setIsAnimating(false);
      }, animationDuration);
      
    } catch (err) {
      console.error('Close sidebar failed:', err);
      setError(err.message);
      setIsAnimating(false);
    }
  }, [isOpen, isAnimating, isLoading, sendToBackground, sendToContentScript, setCollapsedState, animationDuration]);

  /**
   * Update sidebar position
   */
  const updatePosition = useCallback((x, y) => {
    setPosition({ x, y });
  }, []);

  /**
   * Update sidebar size
   */
  const updateSize = useCallback((width, height) => {
    setSize({ width, height });
  }, []);

  /**
   * Reset sidebar to default state
   */
  const resetSidebar = useCallback(async () => {
    try {
      setIsLoading(true);
      
      await closeSidebar();
      setPosition({ x: 0, y: 0 });
      setSize({ width: 400, height: '100vh' });
      
      setIsLoading(false);
    } catch (err) {
      console.error('Reset sidebar failed:', err);
      setError(err.message);
      setIsLoading(false);
    }
  }, [closeSidebar]);

  /**
   * Get sidebar CSS classes
   */
  const getSidebarClasses = useCallback(() => {
    const classes = ['focusflow-sidebar'];
    
    if (isOpen) classes.push('focusflow-sidebar--open');
    if (isAnimating) classes.push('focusflow-sidebar--animating');
    if (isVisible) classes.push('focusflow-sidebar--visible');
    if (isMobile) classes.push('focusflow-sidebar--mobile');
    if (hasOverlay) classes.push('focusflow-sidebar--overlay');
    
    return classes.join(' ');
  }, [isOpen, isAnimating, isVisible, isMobile, hasOverlay]);

  /**
   * Get sidebar inline styles
   */
  const getSidebarStyles = useCallback(() => {
    return {
      '--sidebar-width': `${size.width}px`,
      '--sidebar-height': typeof size.height === 'number' ? `${size.height}px` : size.height,
      '--sidebar-x': `${position.x}px`,
      '--sidebar-y': `${position.y}px`,
      '--animation-duration': `${animationDuration}ms`,
      transform: `translate(${isOpen ? '0' : '100%'}, 0)`,
      transition: isAnimating ? `transform ${animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)` : 'none'
    };
  }, [isOpen, isAnimating, size, position, animationDuration]);

  return {
    // State
    isOpen,
    isVisible,
    isAnimating,
    isLoading,
    error,
    isMobile,
    hasOverlay,
    position,
    size,
    
    // Computed
    isCollapsed: !isOpen,
    canToggle: !isAnimating && !isLoading,
    
    // Methods
    toggleSidebar,
    openSidebar,
    closeSidebar,
    resetSidebar,
    updatePosition,
    updateSize,
    
    // Utilities
    getSidebarClasses,
    getSidebarStyles,
    
    // Preferences
    collapsedState
  };
};

/**
 * Hook for sidebar-specific keyboard shortcuts
 * @param {Object} shortcuts - Shortcut configuration
 * @returns {Object} Shortcut state and methods
 */
export const useSidebarShortcuts = (shortcuts = {}) => {
  const [activeShortcuts, setActiveShortcuts] = useState({});
  const { onMessage } = useMessageBus();

  const defaultShortcuts = {
    toggle: ['ctrl+shift+f', 'meta+shift+f'],
    close: ['escape'],
    focus: ['ctrl+shift+a', 'meta+shift+a']
  };

  const mergedShortcuts = { ...defaultShortcuts, ...shortcuts };

  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = [
        event.ctrlKey && 'ctrl',
        event.metaKey && 'meta',
        event.shiftKey && 'shift',
        event.altKey && 'alt',
        event.key.toLowerCase()
      ].filter(Boolean).join('+');

      // Check against all shortcuts
      Object.entries(mergedShortcuts).forEach(([action, keys]) => {
        if (keys.includes(key)) {
          event.preventDefault();
          setActiveShortcuts(prev => ({ ...prev, [action]: true }));
          
          // Clear the active state after a short delay
          setTimeout(() => {
            setActiveShortcuts(prev => ({ ...prev, [action]: false }));
          }, 200);
        }
      });
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [mergedShortcuts]);

  return {
    activeShortcuts,
    shortcuts: mergedShortcuts
  };
};

export default useSidebarState;

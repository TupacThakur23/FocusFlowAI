import { useState, useEffect, useCallback, useRef } from 'react';
import { useExtensionState } from './useExtensionState';

export const useSidebarState = (options = {}) => {
  const {
    autoHideOnNavigation = true,
    keyboardShortcut = true,
    mobileBreakpoint = 768,
    animationDuration = 300
  } = options;

  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 400, height: '100vh' });
  const [isMobile, setIsMobile] = useState(false);
  const [hasOverlay, setHasOverlay] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [collapsedState, setCollapsedState] = useExtensionState('aideIsCollapsed', {
    defaultValue: true,
    storage: 'local'
  });

  const animationTimeoutRef = useRef(null);

  useEffect(() => {
    const initializeSidebar = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const isSidebarMode = window.location.search.includes('mode=sidebar');
        
        if (isSidebarMode) {
          setIsVisible(true);
          setIsOpen(!collapsedState);
        } else {
          if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
            chrome.runtime.sendMessage({ type: 'GET_SIDEBAR_STATE' }, (response) => {
              if (chrome.runtime.lastError) {
                console.warn('GET_SIDEBAR_STATE failed:', chrome.runtime.lastError.message);
                return;
              }
              if (response && response.success) {
                const state = response.state || response.sidebar || response;
                setIsOpen(Boolean(state?.isOpen));
                setIsVisible(Boolean(state?.isVisible));
              }
            });
          }
        }
        setIsLoading(false);
      } catch (err) {
        setError(err?.message || 'Unknown error during sidebar initialization');
        setIsLoading(false);
      }
    };

    initializeSidebar();

    const messageListener = (message) => {
      if (message.type === 'SIDEBAR_TOGGLED') {
        setIsOpen(message.isVisible);
        setIsVisible(message.isVisible);
        setCollapsedState(!message.isVisible);
      }
    };

    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
      chrome.runtime.onMessage.addListener(messageListener);
    }

    return () => {
      if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
        chrome.runtime.onMessage.removeListener(messageListener);
      }
    };
  }, [collapsedState]);

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
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [mobileBreakpoint, isOpen]);

  useEffect(() => {
    if (!keyboardShortcut) return;
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'f') {
        event.preventDefault();
        toggleSidebar();
      }
      if (event.key === 'Escape' && isOpen) {
        closeSidebar();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [keyboardShortcut, isOpen]);

  const _sendSidebarMessage = async (type) => {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        if (window.location.search.includes('mode=sidebar')) {
          chrome.runtime.sendMessage({ type: type + '_REQUEST' }, (res) => {
            if (chrome.runtime.lastError) console.warn(chrome.runtime.lastError.message);
            resolve(res);
          });
        } else {
          // Send to active tab content script
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
              chrome.tabs.sendMessage(tabs[0].id, { type: type }, (res) => {
                if (chrome.runtime.lastError) console.warn(chrome.runtime.lastError.message);
                resolve(res);
              });
            } else {
              resolve(null);
            }
          });
        }
      } else {
        resolve(null);
      }
    });
  };

  const toggleSidebar = useCallback(async () => {
    if (isAnimating || isLoading) return;
    try {
      setIsAnimating(true);
      setError(null);
      
      const response = await _sendSidebarMessage('TOGGLE_SIDEBAR');
      if (response && response.success) {
        setIsOpen(response.visible);
        setCollapsedState(!response.visible);
      }
      
      if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = setTimeout(() => setIsAnimating(false), animationDuration);
    } catch (err) {
      setError(err.message);
      setIsAnimating(false);
    }
  }, [isAnimating, isLoading, setCollapsedState, animationDuration]);

  const openSidebar = useCallback(async () => {
    if (isOpen || isAnimating || isLoading) return;
    try {
      setIsAnimating(true);
      setError(null);
      
      const response = await _sendSidebarMessage('OPEN_SIDEBAR');
      if (response && response.success) {
        setIsOpen(true);
        setCollapsedState(false);
      }
      
      setTimeout(() => setIsAnimating(false), animationDuration);
    } catch (err) {
      setError(err.message);
      setIsAnimating(false);
    }
  }, [isOpen, isAnimating, isLoading, setCollapsedState, animationDuration]);

  const closeSidebar = useCallback(async () => {
    if (!isOpen || isAnimating || isLoading) return;
    try {
      setIsAnimating(true);
      setError(null);
      
      const response = await _sendSidebarMessage('CLOSE_SIDEBAR');
      if (response && response.success) {
        setIsOpen(false);
        setCollapsedState(true);
      }
      
      setTimeout(() => setIsAnimating(false), animationDuration);
    } catch (err) {
      setError(err.message);
      setIsAnimating(false);
    }
  }, [isOpen, isAnimating, isLoading, setCollapsedState, animationDuration]);

  const updatePosition = useCallback((x, y) => setPosition({ x, y }), []);
  const updateSize = useCallback((width, height) => setSize({ width, height }), []);
  const resetSidebar = useCallback(async () => {
    try {
      setIsLoading(true);
      await closeSidebar();
      setPosition({ x: 0, y: 0 });
      setSize({ width: 400, height: '100vh' });
      setIsLoading(false);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  }, [closeSidebar]);

  const getSidebarClasses = useCallback(() => {
    const classes = ['focusflow-sidebar'];
    if (isOpen) classes.push('focusflow-sidebar--open');
    if (isAnimating) classes.push('focusflow-sidebar--animating');
    if (isVisible) classes.push('focusflow-sidebar--visible');
    if (isMobile) classes.push('focusflow-sidebar--mobile');
    if (hasOverlay) classes.push('focusflow-sidebar--overlay');
    return classes.join(' ');
  }, [isOpen, isAnimating, isVisible, isMobile, hasOverlay]);

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
    isOpen, isVisible, isAnimating, isLoading, error, isMobile, hasOverlay, position, size,
    isCollapsed: !isOpen, canToggle: !isAnimating && !isLoading,
    toggleSidebar, openSidebar, closeSidebar, resetSidebar, updatePosition, updateSize,
    getSidebarClasses, getSidebarStyles, collapsedState
  };
};

export const useSidebarShortcuts = (shortcuts = {}) => {
  const [activeShortcuts, setActiveShortcuts] = useState({});
  const defaultShortcuts = { toggle: ['ctrl+shift+f', 'meta+shift+f'], close: ['escape'], focus: ['ctrl+shift+a', 'meta+shift+a'] };
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

      Object.entries(mergedShortcuts).forEach(([action, keys]) => {
        if (keys.includes(key)) {
          event.preventDefault();
          setActiveShortcuts(prev => ({ ...prev, [action]: true }));
          setTimeout(() => setActiveShortcuts(prev => ({ ...prev, [action]: false })), 200);
        }
      });
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mergedShortcuts]);

  return { activeShortcuts, shortcuts: mergedShortcuts };
};

export default useSidebarState;


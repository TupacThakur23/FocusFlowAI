/**
 * App Mode Detection - Centralized mode handling for FocusFlow AI
 * 
 * Detects and standardizes app rendering modes across the extension
 */

export function getAppMode() {
  const url = window.location.href;
  const search = window.location.search;
  const pathname = window.location.pathname;
  
  const isSidebar = search.includes('mode=sidebar');
  const isPopup = !isSidebar && (pathname.includes('index.html') || pathname.includes('popup.html'));
  const isStandalone = !isSidebar && !isPopup;
  
  return {
    isSidebar,
    isPopup,
    isStandalone,
    mode: isSidebar ? 'sidebar' : isPopup ? 'popup' : 'standalone',
    url,
    search,
    pathname
  };
}

export function enforceSidebarMode() {
  const mode = getAppMode();
  
  // Force sidebar constraints
  if (mode.isSidebar) {
    // Add sidebar-specific classes to root
    document.documentElement.classList.add('focusflow-sidebar-mode');
    document.body.classList.add('focusflow-sidebar-mode');
    
    // Remove any viewport-based sizing
    const style = document.createElement('style');
    style.id = 'focusflow-sidebar-constraints';
    style.textContent = `
      .focusflow-sidebar-mode * {
        box-sizing: border-box !important;
      }
      
      .focusflow-sidebar-mode {
        width: 100% !important;
        height: 100% !important;
        overflow: hidden !important;
        position: relative !important;
      }
      
      .focusflow-sidebar-mode body,
      .focusflow-sidebar-mode #root {
        width: 100% !important;
        height: 100% !important;
        overflow: hidden !important;
        position: relative !important;
      }
      
      /* Prevent viewport units in sidebar mode */
      .focusflow-sidebar-mode * {
        min-height: unset !important;
        min-width: unset !important;
        max-height: unset !important;
        max-width: unset !important;
      }
    `;
    
    // Remove existing constraints
    const existing = document.getElementById('focusflow-sidebar-constraints');
    if (existing) existing.remove();
    
    document.head.appendChild(style);
  }
  
  return mode;
}

export function validateSidebarRendering() {
  const mode = getAppMode();
  
  if (mode.isSidebar) {
    console.log('🔍 SIDEBAR VALIDATION:', {
      mode,
      documentReady: document.readyState,
      bodyExists: !!document.body,
      rootExists: !!document.getElementById('root'),
      bodyClasses: document.body.className,
      rootClasses: document.documentElement.className,
      computedBodyStyle: window.getComputedStyle(document.body),
      timestamp: Date.now()
    });
    
    // Check for problematic viewport units
    const allElements = document.querySelectorAll('*');
    const viewportElements = [];
    
    allElements.forEach(el => {
      const style = window.getComputedStyle(el);
      if (style.height.includes('vh') || style.width.includes('vw') || 
          style.minHeight.includes('vh') || style.minWidth.includes('vw')) {
        viewportElements.push({
          element: el.tagName + (el.className ? '.' + el.className : ''),
          height: style.height,
          width: style.width,
          minHeight: style.minHeight,
          minWidth: style.minWidth
        });
      }
    });
    
    if (viewportElements.length > 0) {
      console.warn('⚠️ SIDEBAR VALIDATION: Found viewport units:', viewportElements);
    }
    
    return {
      valid: viewportElements.length === 0,
      viewportElements,
      mode
    };
  }
  
  return { valid: true, mode };
}

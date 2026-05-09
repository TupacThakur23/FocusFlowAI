/**
 * SidebarManager - Robust Sidebar Injection for FocusFlow AI Extension
 * 
 * Handles reliable sidebar creation and management:
 * - DOM readiness verification
 * - Duplicate injection prevention
 * - Iframe load validation and error handling
 * - Shadow DOM isolation with debugging support
 * - Toggle functionality with smooth animations
 * - Cleanup support for navigation changes
 * - Retry mechanism for failed injections
 * - Extension-safe CSS injection
 * - Responsive design considerations
 */

export class SidebarManager {
  constructor(options = {}) {
    this.host = null;
    this.iframe = null;
    this.shadowRoot = null;
    this.toggleButton = null;
    this.isInjected = false;
    this.isVisible = false;
    this.retryCount = 0;
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 1000;
    this.iframeTimeout = options.iframeTimeout || 5000;
    this.animationDuration = options.animationDuration || 300;
    
    // Configuration
    this.config = {
      width: options.width || '400px',
      height: options.height || '100vh',
      zIndex: options.zIndex || '2147483647',
      backgroundColor: options.backgroundColor || '#0a0a0b',
      borderColor: options.borderColor || '#26272b',
      toggleWidth: options.toggleWidth || '40px',
      toggleHeight: options.toggleHeight || '60px'
    };

    // State tracking
    this.state = {
      isCollapsed: true,
      isAnimating: false,
      lastToggleTime: 0,
      injectionAttempts: 0,
      loadTime: null
    };

    // Event handlers cleanup
    this.eventHandlers = new Map();
  }

  /**
   * Inject sidebar with proper error handling and retry logic
   * @returns {Promise<boolean>} Success status
   */
  async injectSidebar() {
    try {
      console.log('SidebarManager: Starting injection', {
        host: this.host,
        iframe: this.iframe,
        shadowRoot: this.shadowRoot,
        isInjected: this.isInjected,
        config: this.config
      });
      
      // Wait for DOM readiness
      await this.waitForDOMReady();
      
      // Check for existing sidebar
      if (this.isSidebarInjected()) {
        console.log('SidebarManager: Sidebar already injected');
        return true;
      }

      // Create sidebar components
      await this.createSidebar();
      
      // Debug DOM structure
      this.debugDOMStructure();
      
      // Verify injection success
      if (!this.verifyInjection()) {
        throw new Error('Sidebar injection verification failed');
      }

      // Setup event listeners
      this.setupEventListeners();
      
      // Initialize state
      this.isInjected = true;
      this.state.loadTime = Date.now();
      this.retryCount = 0;
      this.state.injectionAttempts++;

      console.log('SidebarManager: Injection successful', this.getState());
      return true;

    } catch (error) {
      console.error('SidebarManager: Injection failed:', error);
      return await this.handleInjectionError(error);
    }
  }

  /**
   * Wait for DOM to be ready with timeout
   */
  async waitForDOMReady() {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('DOM ready timeout'));
      }, 10000);

      const checkReady = () => {
        if (document.readyState === 'complete' && document.body) {
          clearTimeout(timeout);
          resolve();
        } else {
          setTimeout(checkReady, 100);
        }
      };

      checkReady();
    });
  }

  /**
   * Create sidebar with all components
   */
  async createSidebar() {
    // Create host element
    this.host = document.createElement('div');
    this.host.id = 'focusflow-aide-host';
    this.applyHostStyles();
    /**
   * Remove Shadow DOM - use direct DOM for compatibility
   */
    this.shadowRoot = this.host; // Direct DOM instead of Shadow DOM
    
    console.log('🔍 SidebarManager: Using direct DOM (no Shadow DOM)');
    
    // Create and inject styles
    this.injectStyles();
    
    // Create toggle button
    this.toggleButton = this.createToggleButton();
    
    // Create iframe with load handling
    this.iframe = await this.createIframe();
    
    // Assemble sidebar in direct DOM
    this.shadowRoot.appendChild(this.toggleButton);
    this.shadowRoot.appendChild(this.iframe);
    
    // Inject styles into document head
    document.head.appendChild(this.shadowRoot.querySelector('style'));
    
    // Inject into DOM
    document.body.appendChild(this.host);
    
    // Wait for iframe to fully load
    await this.waitForIframeLoad();
  }

  /**
   * Apply styles to host element
   */
  applyHostStyles() {
    this.host.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 420px;
      height: 100vh;
      background: #050816;
      z-index: ${this.config.zIndex};
      transform: translateX(-100%);
      transition: transform 300ms ease-in-out;
      display: flex;
      flex-direction: column;
      border-right: 1px solid rgba(255,255,255,0.08);
      box-shadow: 0 0 30px rgba(0,0,0,0.45);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      backdrop-filter: blur(10px);
    `;
  }

  /**
   * Inject CSS styles into direct DOM
   */
  injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      #focusflow-aide-host {
        all: initial;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .toggle-button {
        position: absolute;
        bottom: 20px;
        right: -20px;
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, #3b82f6, #2563eb);
        border: 2px solid rgba(59, 130, 246, 0.3);
        border-radius: 50%;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.3);
        z-index: 2147483648;
        transition: all 0.3s ease;
        font-family: inherit;
      }
      
      .toggle-button:hover {
        background: linear-gradient(135deg, #2563eb, #1d4ed8);
        box-shadow: 0 0 30px rgba(59, 130, 246, 0.7), 0 0 60px rgba(59, 130, 246, 0.4);
        transform: scale(1.1);
      }
      
      .toggle-button.active {
        background: linear-gradient(135deg, #10b981, #059669);
        border-color: rgba(16, 185, 129, 0.3);
        box-shadow: 0 0 20px rgba(16, 185, 129, 0.5), 0 0 40px rgba(16, 185, 129, 0.3);
      }
      
      .toggle-button.active svg {
        transform: rotate(180deg);
      }
      
      .toggle-button svg {
        width: 20px;
        height: 20px;
        transition: transform 0.3s ease;
        filter: drop-shadow(0 0 2px rgba(255,255,255,0.3));
      }
      
      .sidebar-iframe {
        width: 100%;
        height: 100%;
        border: none;
        background: #050816;
        flex: 1;
      }
      
      /* Sidebar container constraints */
      .focusflow-sidebar-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 420px;
        height: 100vh;
        background: #050816;
        z-index: 2147483647;
        transition: transform 300ms ease-in-out;
        display: flex;
        flex-direction: column;
        border-right: 1px solid rgba(255,255,255,0.08);
        box-shadow: 0 0 30px rgba(0,0,0,0.45);
        backdrop-filter: blur(10px);
      }
      
      .focusflow-sidebar-container.collapsed {
        transform: translateX(-390px);
      }
      
      .focusflow-sidebar-container.expanded {
        transform: translateX(0);
      }
    `;
    this.shadowRoot.appendChild(style);
  }

  /**
   * Create toggle button with proper styling
   */
  createToggleButton() {
    const button = document.createElement('button');
    button.className = 'toggle-button';
    button.title = 'Toggle FocusFlow AI';
    button.setAttribute('aria-label', 'Toggle FocusFlow AI');
    
    // Create arrow SVG
    const arrowSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    arrowSvg.setAttribute('viewBox', '0 0 24 24');
    arrowSvg.setAttribute('fill', 'none');
    arrowSvg.setAttribute('stroke', 'currentColor');
    arrowSvg.setAttribute('stroke-width', '2');
    arrowSvg.setAttribute('stroke-linecap', 'round');
    arrowSvg.setAttribute('stroke-linejoin', 'round');
    
    const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    polyline.setAttribute('points', '15 18 9 12 15 6');
    
    arrowSvg.appendChild(polyline);
    button.appendChild(arrowSvg);
    
    return button;
  }

  /**
   * Create iframe with load event handling
   */
  async createIframe() {
    return new Promise((resolve, reject) => {
      const iframe = document.createElement('iframe');
      iframe.className = 'sidebar-iframe';
      
      const iframeSrc = chrome.runtime.getURL('index.html?mode=sidebar');
      console.log('🔗 SidebarManager: Creating iframe with src:', iframeSrc);
      
      iframe.src = iframeSrc;
      iframe.setAttribute('sandbox', 'allow-scripts');
      iframe.setAttribute('loading', 'lazy');
      
      const cleanup = () => {
        clearTimeout(timeout);
        iframe.onload = null;
        iframe.onerror = null;
      };
      
      iframe.onload = () => {
        console.log('✅ SidebarManager: Iframe loaded successfully', {
          src: iframe.src,
          timestamp: Date.now()
        });
        cleanup();
        resolve(iframe);
      };
      
      iframe.onerror = (error) => {
        console.error('❌ SidebarManager: Iframe load error', {
          src: iframe.src,
          error: error,
          timestamp: Date.now()
        });
        cleanup();
        reject(new Error('Iframe load failed'));
      };
      
      // Set timeout
      const timeout = setTimeout(() => {
        console.error('⏰ SidebarManager: Iframe load timeout', {
          src: iframe.src,
          timeout: this.iframeTimeout,
          timestamp: Date.now()
        });
        cleanup();
        reject(new Error('Iframe load timeout'));
      }, this.iframeTimeout);
      
      // Start loading
      console.log('🚀 SidebarManager: Appending iframe to shadow root');
      this.shadowRoot.appendChild(iframe);
    });
  }

  /**
   * Wait for iframe to fully load
   */
  async waitForIframeLoad() {
    return new Promise((resolve, reject) => {
      if (!this.iframe?.contentWindow) {
        reject(new Error('Iframe not available'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Iframe content load timeout'));
      }, this.iframeTimeout);

      const checkLoad = () => {
        try {
          const doc = this.iframe.contentWindow.document;
          if (doc.readyState === 'complete' && doc.body) {
            clearTimeout(timeout);
            resolve();
          } else {
            setTimeout(checkLoad, 100);
          }
        } catch (error) {
          clearTimeout(timeout);
          reject(new Error('Cannot access iframe content'));
        }
      };

      checkLoad();
    });
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Toggle button click
    const toggleHandler = (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggleSidebar();
    };
    
    this.toggleButton.addEventListener('click', toggleHandler);
    this.eventHandlers.set('toggle', toggleHandler);
    
    // Keyboard shortcuts
    const keyHandler = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        this.toggleSidebar();
      }
    };
    
    document.addEventListener('keydown', keyHandler);
    this.eventHandlers.set('keyboard', keyHandler);
    
    // Handle page navigation
    const navigationHandler = () => {
      this.cleanup();
    };
    
    window.addEventListener('beforeunload', navigationHandler);
    this.eventHandlers.set('navigation', navigationHandler);
  }

  /**
   * Toggle sidebar visibility with animation
   */
  async toggleSidebar() {
    if (this.state.isAnimating) return;
    
    const now = Date.now();
    if (now - this.state.lastToggleTime < this.animationDuration) return;
    
    this.state.isAnimating = true;
    this.state.lastToggleTime = now;
    
    try {
      this.state.isCollapsed = !this.state.isCollapsed;
      this.isVisible = !this.state.isCollapsed;
      
      // Update UI
      this.updateSidebarUI();
      
      // Update toggle button state
      this.updateToggleButton();
      
      // Create/remove overlay
      this.updateOverlay();
      
      // Notify state manager
      if (typeof window.stateManager !== 'undefined') {
        await window.stateManager.setState('aideIsCollapsed', this.state.isCollapsed);
      }
      
      // Send message to background
      if (typeof window.messageBus !== 'undefined') {
        await window.messageBus.sendMessage('background', {
          type: 'SIDEBAR_TOGGLED',
          isVisible: this.isVisible,
          collapsed: this.state.isCollapsed
        });
      }
      
    } catch (error) {
      console.error('SidebarManager: Toggle failed:', error);
    } finally {
      this.state.isAnimating = false;
    }
  }

  /**
   * Update sidebar UI based on state
   */
  updateSidebarUI() {
    if (!this.host) return;
    
    // Left-side positioning: -390px when collapsed, 0 when expanded
    const transform = this.state.isCollapsed ? 'translateX(-390px)' : 'translateX(0)';
    this.host.style.transform = transform;
    
    // Update host class for CSS transitions
    if (this.state.isCollapsed) {
      this.host.classList.add('collapsed');
      this.host.classList.remove('expanded');
    } else {
      this.host.classList.add('expanded');
      this.host.classList.remove('collapsed');
    }
  }

  /**
   * Update toggle button appearance
   */
  updateToggleButton() {
    if (!this.toggleButton) return;
    
    if (this.state.isCollapsed) {
      this.toggleButton.classList.remove('active');
      this.toggleButton.querySelector('svg polyline').setAttribute('points', '15 18 9 12 15 6'); // Right arrow ">"
    } else {
      this.toggleButton.classList.add('active');
      this.toggleButton.querySelector('svg polyline').setAttribute('points', '9 18 15 12 9 6'); // Left arrow "<"
    }
  }

  /**
   * Update overlay for mobile/desktop
   */
  updateOverlay() {
    // Remove existing overlay
    const existingOverlay = document.getElementById('focusflow-sidebar-overlay');
    if (existingOverlay) {
      existingOverlay.remove();
    }
    
    // Create overlay for mobile or when sidebar is open
    if (!this.state.isCollapsed && this.isMobile()) {
      const overlay = document.createElement('div');
      overlay.id = 'focusflow-sidebar-overlay';
      overlay.className = 'sidebar-overlay active';
      overlay.addEventListener('click', () => this.toggleSidebar());
      document.body.appendChild(overlay);
    }
  }

  /**
   * Check if device is mobile
   */
  isMobile() {
    return window.innerWidth <= 768;
  }

  /**
   * Verify sidebar injection was successful
   */
  verifyInjection() {
    return (
      document.getElementById('focusflow-aide-host') !== null &&
      this.host !== null &&
      this.iframe !== null &&
      this.shadowRoot !== null &&
      this.toggleButton !== null
    );
  }

  /**
   * Check if sidebar is already injected
   */
  isSidebarInjected() {
    return document.getElementById('focusflow-aide-host') !== null;
  }

  /**
   * Handle injection errors with retry logic
   */
  async handleInjectionError(error) {
    console.error(`SidebarManager: Injection attempt ${this.retryCount + 1} failed:`, error);
    
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      
      // Cleanup before retry
      await this.cleanup();
      
      // Wait before retry with exponential backoff
      const delay = this.retryDelay * Math.pow(2, this.retryCount - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      console.log(`SidebarManager: Retrying injection (${this.retryCount}/${this.maxRetries})`);
      return await this.injectSidebar();
    } else {
      // Final failure - notify background
      if (typeof window.messageBus !== 'undefined') {
        await window.messageBus.sendMessage('background', {
          type: 'SIDEBAR_INJECTION_FAILED',
          error: error.message,
          url: window.location.href,
          attempts: this.retryCount + 1
        });
      }
      
      return false;
    }
  }

  /**
   * Remove sidebar and cleanup resources
   */
  async cleanup() {
    console.log('SidebarManager: Starting cleanup');
    
    // Remove event listeners
    for (const [event, handler] of this.eventHandlers.entries()) {
      if (event === 'keyboard' || event === 'navigation') {
        document.removeEventListener(event, handler);
      }
    }
    this.eventHandlers.clear();
    
    // Remove overlay
    const overlay = document.getElementById('focusflow-sidebar-overlay');
    if (overlay) {
      overlay.remove();
    }
    
    // Remove host element
    if (this.host) {
      this.host.remove();
      this.host = null;
    }
    
    // Reset state
    this.iframe = null;
    this.shadowRoot = null;
    this.toggleButton = null;
    this.isInjected = false;
    this.isVisible = false;
    this.state.isCollapsed = true;
    this.state.isAnimating = false;
    
    console.log('SidebarManager: Cleanup complete');
  }

  /**
   * Debug DOM structure for troubleshooting
   */
  debugDOMStructure() {
    console.log('🔍 SidebarManager: DOM Structure Debug', {
      hostElement: this.host,
      hostStyles: this.host ? this.host.style.cssText : 'null',
      hostComputedStyles: this.host ? window.getComputedStyle(this.host) : 'null',
      shadowRoot: this.shadowRoot,
      iframe: this.iframe,
      iframeSrc: this.iframe ? this.iframe.src : 'null',
      iframeStyles: this.iframe ? this.iframe.style.cssText : 'null',
      iframeComputedStyles: this.iframe ? window.getComputedStyle(this.iframe) : 'null',
      toggleButton: this.toggleButton,
      documentReadyState: document.readyState,
      bodyExists: !!document.body,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      configWidth: this.config.width,
      configHeight: this.config.height
    });

    // Debug iframe content if available
    if (this.iframe && this.iframe.contentWindow) {
      try {
        const iframeDoc = this.iframe.contentWindow.document;
        console.log('📄 SidebarManager: Iframe Content Debug', {
          iframeReadyState: iframeDoc.readyState,
          iframeBody: iframeDoc.body,
          iframeRoot: iframeDoc.getElementById('root'),
          renderStatus: this.iframe.contentWindow.FOCUSFLOW_RENDER_STATUS,
          iframeConsole: this.iframe.contentWindow.console ? 'available' : 'blocked'
        });
      } catch (error) {
        console.warn('⚠️ SidebarManager: Cannot access iframe content:', error.message);
      }
    }
  }

  /**
   * Get sidebar state for debugging
   */
  getState() {
    return {
      isInjected: this.isInjected,
      isVisible: this.isVisible,
      isCollapsed: this.state.isCollapsed,
      isAnimating: this.state.isAnimating,
      injectionAttempts: this.state.injectionAttempts,
      loadTime: this.state.loadTime,
      retryCount: this.retryCount,
      hasHost: this.host !== null,
      hasIframe: this.iframe !== null,
      hasShadowRoot: this.shadowRoot !== null,
      hasToggleButton: this.toggleButton !== null
    };
  }

  /**
   * Force sidebar open (for programmatic control)
   */
  async forceOpen() {
    if (!this.isInjected) {
      await this.injectSidebar();
    }
    
    if (this.state.isCollapsed) {
      await this.toggleSidebar();
    }
  }

  /**
   * Force sidebar closed (for programmatic control)
   */
  async forceClose() {
    if (!this.state.isCollapsed) {
      await this.toggleSidebar();
    }
  }
}

// Export singleton instance for easy usage
export const sidebarManager = new SidebarManager();

// Expose to window for content script access
if (typeof window !== 'undefined') {
  window.sidebarManager = sidebarManager;
}

// Export default
export default SidebarManager;

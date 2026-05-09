/**
 * Background Service Worker - Refactored for FocusFlow AI Extension
 * 
 * Uses modular architecture with:
 * - MessageBus for centralized message routing
 * - StateManager for event-driven state management
 * - ErrorHandler for global error handling
 * - Improved tab lifecycle management
 * - Async-safe operations
 * - Proper cleanup and memory management
 */

// Import modules (will be loaded via manifest)
import { messageBus } from './lib/MessageBus.js';
import { stateManager } from './lib/StateManager.js';
import { errorHandler } from './lib/ErrorHandler.js';

class BackgroundService {
  constructor() {
    this.isInitialized = false;
    this.activeTabId = null;
    this.tabStates = new Map();
    this.keepAliveInterval = null;
  }

  /**
   * Initialize background service
   */
  async initialize() {
    try {
      console.log('Background Service: Starting initialization');
      
      // Setup global error handling
      errorHandler.setupGlobalHandlers();
      
      // Initialize state manager
      await this.initializeStateManager();
      
      // Setup message handlers
      this.setupMessageHandlers();
      
      // Setup tab event listeners
      this.setupTabListeners();
      
      // Setup service worker lifecycle
      this.setupServiceWorkerLifecycle();
      
      // Initialize with current active tab
      await this.initializeActiveTab();
      
      this.isInitialized = true;
      console.log('Background Service: Initialization complete');
      
    } catch (error) {
      errorHandler.log(error, 'BackgroundService.initialize');
    }
  }

  /**
   * Initialize state manager with default values
   */
  async initializeStateManager() {
    try {
      // Set initial state
      await stateManager.setState('aideCurrentTab', null, { storage: 'session' });
      await stateManager.setState('aideCurrentSelection', '', { storage: 'session' });
      await stateManager.setState('aideActiveTabId', null, { storage: 'session' });
      
      console.log('Background Service: State manager initialized');
    } catch (error) {
      errorHandler.log(error, 'BackgroundService.initializeStateManager');
    }
  }

  /**
   * Setup message handlers for communication with content scripts and popup
   */
  setupMessageHandlers() {
    // Handle active tab requests
    messageBus.onMessage('AIDE_GET_ACTIVE_TAB', async (message, sender) => {
      try {
        const tab = await this.getActiveTab();
        if (tab) {
          const tabInfo = { title: tab.title, url: tab.url, id: tab.id };
          await stateManager.setState('aideCurrentTab', tabInfo, { storage: 'session' });
          await stateManager.setState('aideActiveTabId', tab.id, { storage: 'session' });
          return { success: true, tab: tabInfo };
        }
        return { success: false, error: 'No active tab found' };
      } catch (error) {
        errorHandler.log(error, 'BackgroundService.AIDE_GET_ACTIVE_TAB');
        return { success: false, error: error.message };
      }
    });

    // Handle sidebar toggle requests
    messageBus.onMessage('TOGGLE_SIDEBAR', async (message, sender) => {
      try {
        const activeTab = await this.getActiveTab();
        if (activeTab) {
          const response = await messageBus.sendMessage(activeTab.id, {
            type: 'TOGGLE_SIDEBAR',
            source: 'background'
          });
          return response;
        }
        return { success: false, error: 'No active tab' };
      } catch (error) {
        errorHandler.log(error, 'BackgroundService.TOGGLE_SIDEBAR');
        return { success: false, error: error.message };
      }
    });

    // Handle sidebar open requests
    messageBus.onMessage('OPEN_SIDEBAR', async (message, sender) => {
      try {
        const activeTab = await this.getActiveTab();
        if (activeTab) {
          const response = await messageBus.sendMessage(activeTab.id, {
            type: 'OPEN_SIDEBAR',
            source: 'background'
          });
          return response;
        }
        return { success: false, error: 'No active tab' };
      } catch (error) {
        errorHandler.log(error, 'BackgroundService.OPEN_SIDEBAR');
        return { success: false, error: error.message };
      }
    });

    // Handle sidebar close requests
    messageBus.onMessage('CLOSE_SIDEBAR', async (message, sender) => {
      try {
        const activeTab = await this.getActiveTab();
        if (activeTab) {
          const response = await messageBus.sendMessage(activeTab.id, {
            type: 'CLOSE_SIDEBAR',
            source: 'background'
          });
          return response;
        }
        return { success: false, error: 'No active tab' };
      } catch (error) {
        errorHandler.log(error, 'BackgroundService.CLOSE_SIDEBAR');
        return { success: false, error: error.message };
      }
    });

    // Handle sidebar state retrieval requests
    messageBus.onMessage('GET_SIDEBAR_STATE', async (message, sender) => {
      try {
        console.log('🔍 Background: GET_SIDEBAR_STATE request received');
        
        // Get sidebar state from StateManager
        const sidebarState = await stateManager.get('sidebar');
        console.log('🔍 Background: Retrieved sidebar state from StateManager:', sidebarState);
        
        // Return consistent state structure
        const response = {
          success: true,
          state: {
            isVisible: Boolean(sidebarState?.isVisible),
            isOpen: Boolean(sidebarState?.isOpen),
            isCollapsed: Boolean(sidebarState?.isCollapsed),
            activeView: sidebarState?.activeView || 'launcher',
            width: sidebarState?.width || 400
          }
        };
        
        console.log('🔍 Background: Returning sidebar state response:', response);
        return response;
      } catch (error) {
        console.error('🚨 Background: Failed to get sidebar state:', error);
        errorHandler.log(error, 'BackgroundService.GET_SIDEBAR_STATE');
        return { 
          success: false, 
          error: error.message,
          state: {
            isVisible: false,
            isOpen: false,
            isCollapsed: false,
            activeView: 'launcher',
            width: 400
          }
        };
      }
    });

    // Handle content script ready notifications
    messageBus.onMessage('CONTENT_SCRIPT_READY', async (message, sender) => {
      try {
        console.log('Background Service: Content script ready for tab:', sender.tab?.id);
        
        if (sender.tab?.id) {
          this.tabStates.set(sender.tab.id, {
            ready: true,
            url: message.url,
            timestamp: message.timestamp
          });
        }
        
        return { success: true };
      } catch (error) {
        errorHandler.log(error, 'BackgroundService.CONTENT_SCRIPT_READY');
        return { success: false, error: error.message };
      }
    });

    // Handle text selection updates
    messageBus.onMessage('TEXT_SELECTED', async (message, sender) => {
      try {
        await stateManager.setState('aideCurrentSelection', message.text, { storage: 'session' });
        return { success: true };
      } catch (error) {
        errorHandler.log(error, 'BackgroundService.TEXT_SELECTED');
        return { success: false, error: error.message };
      }
    });

    // Handle URL change notifications
    messageBus.onMessage('URL_CHANGED', async (message, sender) => {
      try {
        console.log('Background Service: URL changed:', message.newUrl);
        
        // Update current tab info
        if (sender.tab?.id) {
          const tabInfo = {
            id: sender.tab.id,
            url: message.newUrl,
            title: sender.tab.title || 'Unknown'
          };
          
          await stateManager.setState('aideCurrentTab', tabInfo, { storage: 'session' });
          
          // Request content extraction
          await messageBus.sendMessage(sender.tab.id, {
            type: 'EXTRACT_CONTENT',
            source: 'background'
          });
        }
        
        return { success: true };
      } catch (error) {
        errorHandler.log(error, 'BackgroundService.URL_CHANGED');
        return { success: false, error: error.message };
      }
    });

    // Handle page visibility changes
    messageBus.onMessage('PAGE_VISIBLE', async (message, sender) => {
      try {
        console.log('Background Service: Page visible:', message.url);
        return { success: true };
      } catch (error) {
        errorHandler.log(error, 'BackgroundService.PAGE_VISIBLE');
        return { success: false, error: error.message };
      }
    });

    // Handle sidebar injection failures
    messageBus.onMessage('SIDEBAR_INJECTION_FAILED', async (message, sender) => {
      try {
        console.error('Background Service: Sidebar injection failed:', message);
        
        // Log for debugging and potential retry logic
        errorHandler.log(new Error(message.error), 'BackgroundService.SIDEBAR_INJECTION_FAILED', {
          url: message.url,
          attempts: message.attempts,
          tabId: sender.tab?.id
        });
        
        return { success: true };
      } catch (error) {
        errorHandler.log(error, 'BackgroundService.SIDEBAR_INJECTION_FAILED');
        return { success: false, error: error.message };
      }
    });

    console.log('Background Service: Message handlers setup complete');
  }

  /**
   * Setup tab event listeners
   */
  setupTabListeners() {
    // Handle tab activation
    chrome.tabs.onActivated.addListener(async (activeInfo) => {
      try {
        this.activeTabId = activeInfo.tabId;
        
        const tab = await chrome.tabs.get(activeInfo.tabId);
        if (tab?.url) {
          const tabInfo = { title: tab.title, url: tab.url, id: tab.id };
          
          await stateManager.setState('aideCurrentTab', tabInfo, { storage: 'session' });
          await stateManager.setState('aideActiveTabId', tab.id, { storage: 'session' });
          
          // Request content extraction from content script
          await messageBus.sendMessage(activeInfo.tabId, {
            type: 'EXTRACT_CONTENT',
            source: 'background'
          }).catch(() => {
            // Content script may not be ready, that's okay
          });
        }
      } catch (error) {
        errorHandler.log(error, 'BackgroundService.onActivated');
      }
    });

    // Handle tab updates (URL changes, etc.)
    chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
      try {
        if (changeInfo.status === 'complete' && tab.url) {
          // Update tab state if this is the active tab
          if (tab.active) {
            const tabInfo = { title: tab.title, url: tab.url, id: tab.id };
            
            await stateManager.setState('aideCurrentTab', tabInfo, { storage: 'session' });
            await stateManager.setState('aideActiveTabId', tab.id, { storage: 'session' });
          }
          
          // Request content extraction
          await messageBus.sendMessage(tabId, {
            type: 'EXTRACT_CONTENT',
            source: 'background'
          }).catch(() => {
            // Content script may not be ready
          });
        }
      } catch (error) {
        errorHandler.log(error, 'BackgroundService.onUpdated');
      }
    });

    // Handle tab removal
    chrome.tabs.onRemoved.addListener(async (tabId) => {
      try {
        // Clean up tab state
        this.tabStates.delete(tabId);
        
        // If this was the active tab, clear active tab state
        if (this.activeTabId === tabId) {
          await stateManager.setState('aideCurrentTab', null, { storage: 'session' });
          await stateManager.setState('aideActiveTabId', null, { storage: 'session' });
          this.activeTabId = null;
        }
        
        console.log('Background Service: Tab removed:', tabId);
      } catch (error) {
        errorHandler.log(error, 'BackgroundService.onRemoved');
      }
    });

    console.log('Background Service: Tab listeners setup complete');
  }

  /**
   * Setup service worker lifecycle management
   */
  setupServiceWorkerLifecycle() {
    // Keep service worker alive
    this.keepAliveInterval = setInterval(() => {
      chrome.runtime.getPlatformInfo?.().catch(() => {});
    }, 20000);

    // Handle service worker suspend
    chrome.runtime.onSuspend.addListener(async () => {
      try {
        console.log('Background Service: Service worker suspending');
        
        // Clear keep alive interval
        if (this.keepAliveInterval) {
          clearInterval(this.keepAliveInterval);
          this.keepAliveInterval = null;
        }
        
        // Cleanup modules
        if (messageBus) messageBus.cleanup();
        if (stateManager) stateManager.cleanup();
        if (errorHandler) errorHandler.cleanup();
        
        this.isInitialized = false;
      } catch (error) {
        console.error('Background Service: Suspend cleanup error:', error);
      }
    });

    console.log('Background Service: Service worker lifecycle setup complete');
  }

  /**
   * Initialize with current active tab
   */
  async initializeActiveTab() {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const activeTab = tabs[0];
      
      if (activeTab?.url) {
        this.activeTabId = activeTab.id;
        const tabInfo = { title: activeTab.title, url: activeTab.url, id: activeTab.id };
        
        await stateManager.setState('aideCurrentTab', tabInfo, { storage: 'session' });
        await stateManager.setState('aideActiveTabId', activeTab.id, { storage: 'session' });
        
        console.log('Background Service: Active tab initialized:', tabInfo);
      }
    } catch (error) {
      errorHandler.log(error, 'BackgroundService.initializeActiveTab');
    }
  }

  /**
   * Get current active tab
   */
  async getActiveTab() {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      return tabs[0] || null;
    } catch (error) {
      errorHandler.log(error, 'BackgroundService.getActiveTab');
      return null;
    }
  }

  /**
   * Get service statistics
   */
  getStats() {
    return {
      initialized: this.isInitialized,
      activeTabId: this.activeTabId,
      tabStatesCount: this.tabStates.size,
      messageBusStats: messageBus.getStats(),
      stateManagerStats: stateManager.getStats()
    };
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    try {
      console.log('Background Service: Starting cleanup');
      
      // Clear intervals
      if (this.keepAliveInterval) {
        clearInterval(this.keepAliveInterval);
        this.keepAliveInterval = null;
      }
      
      // Clear tab states
      this.tabStates.clear();
      
      // Cleanup modules
      if (messageBus) messageBus.cleanup();
      if (stateManager) stateManager.cleanup();
      if (errorHandler) errorHandler.cleanup();
      
      this.isInitialized = false;
      console.log('Background Service: Cleanup complete');
    } catch (error) {
      console.error('Background Service: Cleanup error:', error);
    }
  }
}

// Initialize background service
const backgroundService = new BackgroundService();
backgroundService.initialize();

// Make service available globally for debugging
globalThis.backgroundService = backgroundService;
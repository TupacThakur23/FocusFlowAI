


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

  
  async initialize() {
    try {
      console.log('Background Service: Starting initialization');
      

      errorHandler.setupGlobalHandlers();
      

      await this.initializeStateManager();
      

      this.setupMessageHandlers();
      

      this.setupTabListeners();
      

      this.setupServiceWorkerLifecycle();
      

      await this.initializeActiveTab();
      
      this.isInitialized = true;
      console.log('Background Service: Initialization complete');
      
    } catch (error) {
      errorHandler.log(error, 'BackgroundService.initialize');
    }
  }

  
  async initializeStateManager() {
    try {

      await stateManager.setState('aideCurrentTab', null, { storage: 'session' });
      await stateManager.setState('aideCurrentSelection', '', { storage: 'session' });
      await stateManager.setState('aideActiveTabId', null, { storage: 'session' });
      
      console.log('Background Service: State manager initialized');
    } catch (error) {
      errorHandler.log(error, 'BackgroundService.initializeStateManager');
    }
  }

  
  setupMessageHandlers() {

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


    messageBus.onMessage('GET_SIDEBAR_STATE', async (message, sender) => {
      try {
        console.log('🔍 Background: GET_SIDEBAR_STATE request received');
        

        const sidebarState = await stateManager.get('sidebar');
        console.log('🔍 Background: Retrieved sidebar state from StateManager:', sidebarState);
        

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


    messageBus.onMessage('TEXT_SELECTED', async (message, sender) => {
      try {
        await stateManager.setState('aideCurrentSelection', message.text, { storage: 'session' });
        return { success: true };
      } catch (error) {
        errorHandler.log(error, 'BackgroundService.TEXT_SELECTED');
        return { success: false, error: error.message };
      }
    });


    messageBus.onMessage('URL_CHANGED', async (message, sender) => {
      try {
        console.log('Background Service: URL changed:', message.newUrl);
        

        if (sender.tab?.id) {
          const tabInfo = {
            id: sender.tab.id,
            url: message.newUrl,
            title: sender.tab.title || 'Unknown'
          };
          
          await stateManager.setState('aideCurrentTab', tabInfo, { storage: 'session' });
          

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


    messageBus.onMessage('PAGE_VISIBLE', async (message, sender) => {
      try {
        console.log('Background Service: Page visible:', message.url);
        return { success: true };
      } catch (error) {
        errorHandler.log(error, 'BackgroundService.PAGE_VISIBLE');
        return { success: false, error: error.message };
      }
    });


    messageBus.onMessage('SIDEBAR_INJECTION_FAILED', async (message, sender) => {
      try {
        console.error('Background Service: Sidebar injection failed:', message);
        

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

  
  setupTabListeners() {

    chrome.tabs.onActivated.addListener(async (activeInfo) => {
      try {
        this.activeTabId = activeInfo.tabId;
        
        const tab = await chrome.tabs.get(activeInfo.tabId);
        if (tab?.url) {
          const tabInfo = { title: tab.title, url: tab.url, id: tab.id };
          
          await stateManager.setState('aideCurrentTab', tabInfo, { storage: 'session' });
          await stateManager.setState('aideActiveTabId', tab.id, { storage: 'session' });
          

          await messageBus.sendMessage(activeInfo.tabId, {
            type: 'EXTRACT_CONTENT',
            source: 'background'
          }).catch(() => {

          });
        }
      } catch (error) {
        errorHandler.log(error, 'BackgroundService.onActivated');
      }
    });


    chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
      try {
        if (changeInfo.status === 'complete' && tab.url) {

          if (tab.active) {
            const tabInfo = { title: tab.title, url: tab.url, id: tab.id };
            
            await stateManager.setState('aideCurrentTab', tabInfo, { storage: 'session' });
            await stateManager.setState('aideActiveTabId', tab.id, { storage: 'session' });
          }
          

          await messageBus.sendMessage(tabId, {
            type: 'EXTRACT_CONTENT',
            source: 'background'
          }).catch(() => {

          });
        }
      } catch (error) {
        errorHandler.log(error, 'BackgroundService.onUpdated');
      }
    });


    chrome.tabs.onRemoved.addListener(async (tabId) => {
      try {

        this.tabStates.delete(tabId);
        

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

  
  setupServiceWorkerLifecycle() {

    this.keepAliveInterval = setInterval(() => {
      chrome.runtime.getPlatformInfo?.().catch(() => {});
    }, 20000);


    chrome.runtime.onSuspend.addListener(async () => {
      try {
        console.log('Background Service: Service worker suspending');
        

        if (this.keepAliveInterval) {
          clearInterval(this.keepAliveInterval);
          this.keepAliveInterval = null;
        }
        

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

  
  async getActiveTab() {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      return tabs[0] || null;
    } catch (error) {
      errorHandler.log(error, 'BackgroundService.getActiveTab');
      return null;
    }
  }

  
  getStats() {
    return {
      initialized: this.isInitialized,
      activeTabId: this.activeTabId,
      tabStatesCount: this.tabStates.size,
      messageBusStats: messageBus.getStats(),
      stateManagerStats: stateManager.getStats()
    };
  }

  
  async cleanup() {
    try {
      console.log('Background Service: Starting cleanup');
      

      if (this.keepAliveInterval) {
        clearInterval(this.keepAliveInterval);
        this.keepAliveInterval = null;
      }
      

      this.tabStates.clear();
      

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


const backgroundService = new BackgroundService();
backgroundService.initialize();


globalThis.backgroundService = backgroundService;
(async function () {
  'use strict';

  const safeSendMessage = (payload, callback = () => {}) => {
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage(payload, response => {
          if (chrome.runtime.lastError) return;
          if (typeof callback === 'function') callback(response);
        });
      }
    } catch (err) {}
  };
  const PageContextManager = {
    context: {
      url: window.location.href,
      title: document.title,
      extractionId: null,
      extractedAt: null,
      isExtracting: false,
      abortController: null
    },
    reset() {
      if (this.context.abortController) {
        this.context.abortController.abort();
      }
      this.context = {
        url: window.location.href,
        title: document.title,
        extractionId: crypto.randomUUID(),
        extractedAt: null,
        isExtracting: false,
        abortController: new AbortController()
      };
      safeSendMessage({
        type: 'CONTENT_SCRIPT_READY'
      });
    },
    update(data) {
      this.context = {
        ...this.context,
        ...data
      };
    }
  };
  const restoreSidebarFromPreference = async () => {
    try {
      chrome.storage.local.get(['sidebarPreference'], data => {
        const pref = data.sidebarPreference || {};
        if (!pref.hasUserOpenedSidebar || !pref.isSidebarEnabled || pref.sidebarMode === 'closed') return;
        if (pref.sidebarMode === 'minimized') {
          sidebarManager.minimizeSidebar();
        } else {
          sidebarManager.forceOpen();
        }
      });
    } catch (err) {}
  };
  try {
    const {
      sidebarManager
    } = await import(chrome.runtime.getURL('lib/SidebarManager.js'));
    const {
      stateManager
    } = await import(chrome.runtime.getURL('lib/StateManager.js'));
    const {
      contentExtractor
    } = await import(chrome.runtime.getURL('lib/ContentExtractor.js'));
    window.sidebarManager = sidebarManager;
    window.stateManager = stateManager;
    window.contentExtractor = contentExtractor;
    PageContextManager.reset();
    const handleUrlChange = () => {
      if (window.location.href !== PageContextManager.context.url) {
        PageContextManager.reset();
        safeSendMessage({
          type: 'PAGE_CONTEXT_RESET',
          url: window.location.href
        });
        restoreSidebarFromPreference();
      }
    };
    const originalPush = history.pushState;
    history.pushState = function (...args) {
      originalPush.apply(this, args);
      handleUrlChange();
    };
    const originalReplace = history.replaceState;
    history.replaceState = function (...args) {
      originalReplace.apply(this, args);
      handleUrlChange();
    };
    window.addEventListener('popstate', handleUrlChange);
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      const type = request.type || request.action;
      switch (type) {
        case 'OPEN_SIDEBAR':
        case 'OPEN_AIDE_SIDEBAR':
          sidebarManager.openSidebar();
          sendResponse({
            success: true
          });
          break;
        case 'MINIMIZE_SIDEBAR':
          sidebarManager.minimizeSidebar();
          sendResponse({
            success: true
          });
          break;
        case 'CLOSE_SIDEBAR':
          sidebarManager.forceClose();
          sendResponse({
            success: true
          });
          break;
        case 'TOGGLE_SIDEBAR':
          sidebarManager.toggleSidebar();
          sendResponse({
            success: true,
            visible: sidebarManager.isVisible
          });
          break;
        case 'EXTRACT_CONTENT':
          if (PageContextManager.context.isExtracting) {
            PageContextManager.context.abortController.abort();
            PageContextManager.reset();
          }
          PageContextManager.update({
            isExtracting: true
          });
          (async () => {
            try {
              const result = await window.contentExtractor.extractWithTimeout(5000);
              PageContextManager.update({
                isExtracting: false,
                extractedAt: new Date().toISOString()
              });
              sendResponse({
                success: true,
                content: {
                  ...result,
                  url: window.location.href,
                  extractionId: PageContextManager.context.extractionId
                }
              });
            } catch (err) {
              PageContextManager.update({
                isExtracting: false
              });
              sendResponse({
                success: false,
                error: err.message
              });
            }
          })();
          return true;
      }
      return false;
    });
    restoreSidebarFromPreference();
    safeSendMessage({
      type: 'CONTENT_SCRIPT_READY',
      url: window.location.href,
      timestamp: Date.now()
    });
  } catch (error) {}
})();


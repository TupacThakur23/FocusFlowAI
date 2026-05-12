
(async function() {
  'use strict';
  
  console.log('🔍 FocusFlow Content Script: Initializing...');

  try {
    const buster = `?v=${Date.now()}`;
    const { sidebarManager } = await import(chrome.runtime.getURL(`lib/SidebarManager.js${buster}`));
    const { messageBus }     = await import(chrome.runtime.getURL(`lib/MessageBus.js${buster}`));
    const { stateManager }   = await import(chrome.runtime.getURL(`lib/StateManager.js${buster}`));
    const { errorHandler }   = await import(chrome.runtime.getURL(`lib/ErrorHandler.js${buster}`));

    window.sidebarManager = sidebarManager;
    window.messageBus     = messageBus;
    window.stateManager   = stateManager;
    window.errorHandler   = errorHandler;

    console.log('✅ FocusFlow: Dependencies loaded');

    chrome.storage.local.get(['ff_action'], (data) => {
      if (data.ff_action === 'open_panel') {
        console.log('🎯 FocusFlow: Pending open_panel action found, opening panel...');
        sidebarManager.forceOpen();

        chrome.storage.local.remove('ff_action');
      }
    });

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== 'local') return;
      if (changes.ff_action && changes.ff_action.newValue === 'open_panel') {
        console.log('🎯 FocusFlow: Storage trigger -> open_panel');
        sidebarManager.forceOpen();
        chrome.storage.local.remove('ff_action');
      }
      if (changes.ff_action && changes.ff_action.newValue === 'close_panel') {
        sidebarManager.forceClose();
        chrome.storage.local.remove('ff_action');
      }
      if (changes.ff_action && changes.ff_action.newValue === 'toggle_panel') {
        sidebarManager.toggleSidebar();
        chrome.storage.local.remove('ff_action');
      }
    });

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'OPEN_AIDE_SIDEBAR') {
        console.log('🎯 FocusFlow: Runtime message -> open panel');
        sidebarManager.forceOpen();
        sendResponse({ success: true });
      } else if (request.action === 'DESTROY_AIDE_SIDEBAR') {
        sidebarManager.cleanup();
        sendResponse({ success: true });
      }
      return false;
    });

    document.addEventListener('mouseup', () => {
      const text = window.getSelection()?.toString().trim();
      if (text && text.length > 0) {
        messageBus.sendMessage('background', { type: 'TEXT_SELECTED', text }).catch(() => {});
      }
    });

    messageBus.onMessage('EXTRACT_CONTENT', () => {
      const content = {
        title: document.title,
        url:   window.location.href,
        text:  document.body.innerText.substring(0, 5000)
      };
      messageBus.sendMessage('background', { type: 'CONTENT_EXTRACTED', content }).catch(() => {});
      return { success: true, content };
    });

    messageBus.sendMessage('background', {
      type: 'CONTENT_SCRIPT_READY',
      url:  window.location.href,
      timestamp: Date.now()
    }).catch(() => {});

    console.log('✅ FocusFlow Content Script: Fully initialized');
  } catch (error) {
    console.error('❌ FocusFlow Content Script: Failed to load dependencies', error);
  }
})();

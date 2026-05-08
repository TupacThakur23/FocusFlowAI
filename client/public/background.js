// Background service worker — handles active tab detection and tab change tracking

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "AIDE_GET_ACTIVE_TAB") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0] || null;
      if (tab) {
        chrome.storage.session.set({
          aideCurrentTab: { title: tab.title, url: tab.url },
        });
      }
      sendResponse({ tab });
    });
    return true; // Keep message channel open for async response
  }

  // OPEN_SIDEBAR: use storage to communicate with content script
  if (request.type === "OPEN_SIDEBAR") {
    chrome.storage.local.set({ aideCommand: 'open' });
    return false;
  }

  // CLOSE_SIDEBAR: use storage to communicate with content script
  if (request.type === "CLOSE_SIDEBAR") {
    chrome.storage.local.set({ aideCommand: 'close' });
    return false;
  }
});

// Track tab changes so the popup always has the latest active tab
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab?.url) {
      chrome.storage.session.set({
        aideCurrentTab: { title: tab.title, url: tab.url },
      });
      // Tell content script to extract content
      chrome.tabs.sendMessage(activeInfo.tabId, { type: "EXTRACT_CONTENT" }).catch(() => {});
    }
  } catch (err) {
    // Tab may have been closed
  }
});

// Track URL changes within the same tab
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.active && tab.url) {
    chrome.storage.session.set({
      aideCurrentTab: { title: tab.title, url: tab.url },
    });
    // Tell content script to extract content
    chrome.tabs.sendMessage(tabId, { type: "EXTRACT_CONTENT" }).catch(() => {});
  }
});
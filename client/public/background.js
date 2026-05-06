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
});

// Track tab changes so the popup always has the latest active tab
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab?.url) {
      chrome.storage.session.set({
        aideCurrentTab: { title: tab.title, url: tab.url },
      });
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
  }
});
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "AIDE_GET_ACTIVE_TAB") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      sendResponse({ tab: tabs[0] || null });
    });
    return true;
  }
});
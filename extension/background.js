chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "OPEN_RESULT") {

    
    chrome.storage.local.set({ pageData: message.data }, () => {

      
      chrome.tabs.create({
        url: chrome.runtime.getURL("popup/result.html")
      });

    });
  }
});
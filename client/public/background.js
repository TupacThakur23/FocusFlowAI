const rawContentCache = new Map();
const pageCache = new Map();
const contentScriptRegistry = new Map();
const getActiveTab = async () => {
  try {
    const tabs = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });
    return tabs[0] || null;
  } catch (err) {
    return null;
  }
};
const updateTabState = async tab => {
  if (!tab || !tab.url) return;
  const tabInfo = {
    title: tab.title,
    url: tab.url,
    id: tab.id
  };
  chrome.storage.local.set({
    [`focus_tab_${tab.id}`]: JSON.stringify(tabInfo),
    'lastActiveTabId': tab.id
  }, () => {
    chrome.runtime.sendMessage({
      type: 'TAB_CHANGED',
      tab: tabInfo
    });
  });
};
async function safeSendMessage(tabId, message, retry = true) {
  try {
    const tab = await chrome.tabs.get(tabId);
    if (!tab || tab.status !== 'complete') return {
      success: false,
      error: 'Tab not ready'
    };
    const lastSeen = contentScriptRegistry.get(tabId);
    const isStale = !lastSeen || Date.now() - lastSeen > 30000;
    if (isStale && retry) {
      await chrome.scripting.executeScript({
        target: {
          tabId
        },
        files: ['content.js']
      });
      await new Promise(r => setTimeout(r, 100));
      return safeSendMessage(tabId, message, false);
    }
    return new Promise(resolve => {
      chrome.tabs.sendMessage(tabId, message, response => {
        if (chrome.runtime.lastError) {
          if (retry) {
            chrome.scripting.executeScript({
              target: {
                tabId
              },
              files: ['content.js']
            }, () => {
              chrome.tabs.sendMessage(tabId, message, r2 => resolve(r2 || {
                success: false
              }));
            });
          } else {
            resolve({
              success: false,
              error: chrome.runtime.lastError.message
            });
          }
        } else {
          resolve(response || {
            success: true
          });
        }
      });
    });
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
}
const manageSession = async (content, tabId) => {
  if (!content || !content.url) return null;
  return new Promise(resolve => {
    chrome.storage.local.get(['aideResearchSession'], data => {
      let session = data.aideResearchSession ? JSON.parse(data.aideResearchSession) : {
        id: `session_${Date.now()}`,
        pages: [],
        createdAt: new Date().toISOString()
      };
      rawContentCache.set(content.url, content.text || content.content);
      const metadataOnly = {
        ...content
      };
      delete metadataOnly.text;
      delete metadataOnly.content;
      pageCache.set(content.url, {
        ...metadataOnly,
        cachedAt: Date.now()
      });
      const existingIndex = session.pages.findIndex(p => p.url === content.url);
      const pageEntry = {
        ...metadataOnly,
        timestamp: new Date().toISOString()
      };
      if (existingIndex > -1) session.pages[existingIndex] = pageEntry;else session.pages.push(pageEntry);
      session.updatedAt = new Date().toISOString();
      chrome.storage.local.set({
        aideResearchSession: JSON.stringify(session)
      }, () => {
        chrome.runtime.sendMessage({
          type: 'SESSION_UPDATED',
          session
        });
        resolve(session);
      });
    });
  });
};
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const type = request.type || request.action;
  if (type === 'CONTENT_SCRIPT_READY') {
    if (sender.tab?.id) contentScriptRegistry.set(sender.tab.id, Date.now());
    return false;
  }
  if (type === 'EXTRACT_CONTENT_REQUEST') {
    (async () => {
      const targetTab = sender.tab || (await getActiveTab());
      const targetId = targetTab?.id;
      const targetUrl = targetTab?.url;
      if (!targetId) {
        sendResponse({
          success: false,
          error: 'No active tab available for extraction'
        });
        return;
      }
      if (targetUrl && pageCache.has(targetUrl)) {
        const cached = pageCache.get(targetUrl);
        if (Date.now() - cached.cachedAt < 600000) {
          const rawText = rawContentCache.get(targetUrl);
          sendResponse({
            success: true,
            content: {
              ...cached,
              text: rawText,
              content: rawText
            },
            cached: true
          });
          return;
        }
      }
      const response = await safeSendMessage(targetId, {
        type: 'EXTRACT_CONTENT'
      });
      sendResponse(response);
    })();
    return true;
  }
  if (type === 'SAVE_TO_SESSION' && request.content) {
    manageSession(request.content, sender.tab?.id).then(session => {
      sendResponse({
        success: true,
        session
      });
    });
    return true;
  }
  if (type === 'GET_RAW_CONTENT' && request.url) {
    sendResponse({
      success: rawContentCache.has(request.url),
      text: rawContentCache.get(request.url)
    });
    return false;
  }
  if (type === 'AIDE_GET_ACTIVE_TAB') {
    if (sender.tab) {
      sendResponse({
        success: true,
        tab: {
          title: sender.tab.title,
          url: sender.tab.url,
          id: sender.tab.id
        }
      });
    } else {
      getActiveTab().then(tab => sendResponse(tab ? {
        success: true,
        tab
      } : {
        success: false
      }));
    }
    return true;
  }
  return false;
});
chrome.tabs.onActivated.addListener(info => {
  chrome.tabs.get(info.tabId, tab => {
    if (!chrome.runtime.lastError && tab) updateTabState(tab);
  });
});
chrome.tabs.onUpdated.addListener((tabId, change, tab) => {
  if (change.status === 'complete') {
    contentScriptRegistry.set(tabId, Date.now());
    updateTabState(tab);
  }
});

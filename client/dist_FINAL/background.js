const rawContentCache = new Map();
const pageCache = new Map();
const contentScriptRegistry = new Map();
const SIDEBAR_PREF_KEY = 'sidebarPreference';
const SOURCE_NAV_KEY = 'focusflowSourceNavigation';
const STOP_WORDS = new Set(['the', 'and', 'for', 'with', 'that', 'this', 'from', 'are', 'was', 'were', 'page', 'content', 'research', 'source', 'article', 'what', 'which', 'about']);
const cleanContextText = value => String(value || '').toLowerCase().replace(/https?:\/\/\S+/g, ' ').replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, ' ').trim();
const contextTerms = content => {
  const source = cleanContextText(`${content.title || ''} ${(content.topics || []).join(' ')} ${content.text || content.content || content.summary || ''}`.slice(0, 12000));
  const counts = new Map();
  source.split(/\s+/).filter(word => word.length > 2 && !STOP_WORDS.has(word)).forEach(word => counts.set(word, (counts.get(word) || 0) + 1));
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 18).map(([term]) => term);
};
const termSimilarity = (a = [], b = []) => {
  const left = new Set(a);
  const right = new Set(b);
  if (!left.size || !right.size) return 0;
  let overlap = 0;
  left.forEach(term => {
    if (right.has(term)) overlap++;
  });
  return overlap / Math.sqrt(left.size * right.size);
};
const fingerprintFor = content => {
  const terms = contextTerms(content);
  const seed = (terms.slice(0, 2).join('_') || cleanContextText(content.title).split(/\s+/).slice(0, 2).join('_') || 'context_general').replace(/[^a-z0-9]+/g, '_').slice(0, 48);
  return {
    id: `context_${seed}`,
    terms,
    label: terms.slice(0, 3).join(' ') || content.title || 'Active context'
  };
};
const assignContext = (session, content) => {
  const fingerprint = fingerprintFor(content);
  const clusters = session.contextClusters || {};
  let bestId = null;
  let bestScore = 0;
  Object.entries(clusters).forEach(([id, cluster]) => {
    const score = termSimilarity(fingerprint.terms, cluster.terms || []);
    if (score > bestScore) {
      bestScore = score;
      bestId = id;
    }
  });
  const threshold = 0.28;
  const contextId = bestScore >= threshold && bestId ? bestId : `${fingerprint.id}_${Date.now().toString(36)}`;
  const existing = clusters[contextId] || {
    id: contextId,
    fingerprint: fingerprint.id,
    terms: fingerprint.terms,
    label: fingerprint.label,
    pages: [],
    createdAt: new Date().toISOString()
  };
  const mergedTerms = [...new Set([...(existing.terms || []), ...fingerprint.terms])].slice(0, 22);
  clusters[contextId] = {
    ...existing,
    terms: mergedTerms,
    label: existing.label || fingerprint.label,
    lastSimilarity: bestScore,
    updatedAt: new Date().toISOString()
  };
  session.contextClusters = clusters;
  session.activeContextId = contextId;
  session.contextFingerprint = fingerprint.id;
  return {
    contextId,
    fingerprint,
    similarity: bestScore
  };
};
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
  chrome.storage.local.get([SIDEBAR_PREF_KEY, SOURCE_NAV_KEY], data => {
    const sourceNav = data[SOURCE_NAV_KEY];
    if (sourceNav?.url && Date.now() < sourceNav.expiresAt && (tab.url.startsWith(sourceNav.url) || sourceNav.host && (() => { try { return new URL(tab.url).hostname === sourceNav.host; } catch { return false; } })())) {
      const sidebarPreference = {
        hasUserOpenedSidebar: true,
        isSidebarEnabled: true,
        sidebarMode: 'full',
        isMinimized: false
      };
      chrome.storage.local.set({
        [SIDEBAR_PREF_KEY]: sidebarPreference,
        [SOURCE_NAV_KEY]: null
      });
      safeSendMessage(tab.id, {
        type: 'OPEN_SIDEBAR',
        reason: 'source_navigation',
        sidebarPreference
      });
    }
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
        contextClusters: {},
        activeContextId: null,
        createdAt: new Date().toISOString()
      };
      const assigned = assignContext(session, content);
      rawContentCache.set(content.url, content.text || content.content);
      const metadataOnly = {
        ...content,
        contextId: assigned.contextId,
        contextFingerprint: assigned.fingerprint.id,
        contextTerms: assigned.fingerprint.terms,
        contextSimilarity: assigned.similarity
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
      const clusterPages = session.contextClusters[assigned.contextId].pages || [];
      session.contextClusters[assigned.contextId].pages = [...new Set([...clusterPages, content.url])];
      session.updatedAt = new Date().toISOString();
      chrome.storage.local.set({
        aideResearchSession: JSON.stringify(session),
        activeContextId: assigned.contextId
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
  if (['OPEN_SIDEBAR_REQUEST', 'MINIMIZE_SIDEBAR_REQUEST', 'CLOSE_SIDEBAR_REQUEST', 'TOGGLE_SIDEBAR_REQUEST'].includes(type)) {
    (async () => {
      const tab = await getActiveTab();
      if (!tab?.id) {
        sendResponse({ success: false, error: 'No active tab available' });
        return;
      }
      const contentType = type.replace('_REQUEST', '');
      if (contentType === 'CLOSE_SIDEBAR') {
        chrome.storage.local.set({
          [SOURCE_NAV_KEY]: null
        });
      }
      const response = await safeSendMessage(tab.id, { type: contentType });
      sendResponse(response || { success: true });
    })();
    return true;
  }
  if (type === 'OPEN_SOURCE_WITH_SIDEBAR' && request.url) {
    chrome.storage.local.set({
      [SOURCE_NAV_KEY]: {
        url: request.url,
        host: (() => { try { return new URL(request.url).hostname; } catch { return null; } })(),
        createdAt: Date.now(),
        expiresAt: Date.now() + 30000
      }
    }, () => {
      chrome.tabs.create({
        url: request.url
      }, tab => sendResponse({
        success: !chrome.runtime.lastError,
        tabId: tab?.id
      }));
    });
    return true;
  }  if (type === 'SIDEBAR_STATE_CHANGED') {
    const hasExplicitPreference = Boolean(request.sidebarPreference || request.sidebarMode);
    chrome.storage.local.get([SIDEBAR_PREF_KEY], data => {
      const existingPreference = data[SIDEBAR_PREF_KEY] || {
        hasUserOpenedSidebar: false,
        isSidebarEnabled: false,
        sidebarMode: 'closed',
        isMinimized: false
      };
      const sidebarPreference = hasExplicitPreference ? request.sidebarPreference || {
        hasUserOpenedSidebar: request.sidebarMode !== 'closed',
        isSidebarEnabled: request.sidebarMode !== 'closed',
        sidebarMode: request.sidebarMode,
        isMinimized: request.sidebarMode === 'minimized'
      } : existingPreference;
      chrome.storage.local.set({
        [SIDEBAR_PREF_KEY]: sidebarPreference,
        activeSidebarState: request.state || {},
        currentFeatureView: request.currentFeatureView || request.state?.currentFeatureView || 'HOME',
        activeContextId: request.activeContextId || request.state?.activeContextId || null
      }, () => sendResponse({ success: true }));
    });
    return true;
  }
  if (type === 'GET_SIDEBAR_STATE') {
    chrome.storage.local.get([SIDEBAR_PREF_KEY, 'activeSidebarState', 'currentFeatureView', 'activeContextId'], data => {
      const pref = data[SIDEBAR_PREF_KEY] || {};
      sendResponse({
        success: true,
        state: {
          isOpen: pref.sidebarMode === 'full',
          isVisible: pref.sidebarMode === 'full' || pref.sidebarMode === 'minimized',
          sidebarMode: pref.sidebarMode || 'closed',
          hasUserOpenedSidebar: Boolean(pref.hasUserOpenedSidebar),
          isSidebarEnabled: Boolean(pref.isSidebarEnabled),
          isMinimized: pref.sidebarMode === 'minimized',
          sidebarPreference: pref,
          activeSidebarState: data.activeSidebarState || {},
          currentFeatureView: data.currentFeatureView || 'HOME',
          activeContextId: data.activeContextId || null
        }
      });
    });
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






// Content script — captures selected text on web pages and sends it to the extension
(function () {
  document.addEventListener("mouseup", () => {
    const selection = window.getSelection().toString().trim();
    if (selection.length > 0) {
      chrome.storage.session.set({ aideCurrentSelection: selection });
    }
  });

  // Create floating sidebar
  const initSidebar = () => {
    if (document.getElementById('focusflow-aide-host')) return;

    const host = document.createElement('div');
    host.id = 'focusflow-aide-host';
    host.style.cssText = 'position:fixed; top:0; right:0; width:400px; height:100vh; z-index:2147483647; transform:translateX(100%); transition:transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);';
    
    const shadow = host.attachShadow({ mode: 'closed' });
    
    const toggleBtn = document.createElement('button');
    toggleBtn.title = "Toggle FocusFlow Aide";
    toggleBtn.style.cssText = 'position:absolute; left:-40px; top:50%; transform:translateY(-50%); width:40px; height:60px; background:#111214; border:1px solid #26272b; border-right:none; border-radius:8px 0 0 8px; color:#9ca3af; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:-4px 0 15px rgba(0,0,0,0.5); z-index:10;';
    
    const arrowSvg = document.createElement('div');
    arrowSvg.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>';
    arrowSvg.style.cssText = 'color:#9ca3af; transition:color 0.2s;';
    
    toggleBtn.appendChild(arrowSvg);
    
    const iframe = document.createElement('iframe');
    iframe.src = chrome.runtime.getURL('index.html?mode=sidebar');
    iframe.style.cssText = 'width:100%; height:100%; border:none; background:#0a0a0b;';
    
    shadow.appendChild(toggleBtn);
    shadow.appendChild(iframe);
    document.body.appendChild(host);

    let isCollapsed = true;

    const setCollapsed = (collapsed) => {
      isCollapsed = collapsed;
      host.style.transform = collapsed ? 'translateX(100%)' : 'translateX(0)';
      arrowSvg.style.color = collapsed ? '#9ca3af' : '#3b82f6';
      arrowSvg.innerHTML = collapsed 
        ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>'
        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>';
      chrome.storage.local.set({ aideIsCollapsed: collapsed });
    };

    toggleBtn.addEventListener('click', () => setCollapsed(!isCollapsed));

    // Listen for storage changes from popup
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes.aideCommand) {
        const cmd = changes.aideCommand.newValue;
        if (cmd === 'open') setCollapsed(false);
        if (cmd === 'close') setCollapsed(true);
      }
    });
  };

  if (document.readyState === "complete" || document.readyState === "interactive") {
    initSidebar();
  } else {
    document.addEventListener("DOMContentLoaded", initSidebar);
  }
})();

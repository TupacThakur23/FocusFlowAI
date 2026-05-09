// Content script - Aide sidebar injection for FocusFlow AI
(function() {
  'use strict';
  
  console.log('🔍 Content Script: Initializing...');
  
  let sidebarInstance = null;
  
  // Create Aide sidebar
  const createAideSidebar = () => {
    // Remove existing sidebar if present
    if (sidebarInstance) {
      sidebarInstance.remove();
      sidebarInstance = null;
    }

    // Create sidebar root container
    const host = document.createElement('div');
    host.id = 'focusflow-aide-sidebar';
    host.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 420px;
      height: 100vh;
      z-index: 2147483647;
      background: #050816;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform 0.3s ease-in-out;
      border-right: 1px solid rgba(255,255,255,0.08);
      box-shadow: 0 0 30px rgba(0,0,0,0.45);
      backdrop-filter: blur(10px);
      transform: translateX(0);
    `;
    
    // Create collapse button
    const collapseBtn = document.createElement('button');
    collapseBtn.innerHTML = '×';
    collapseBtn.style.cssText = `
      position: absolute;
      top: 20px;
      right: 20px;
      width: 32px;
      height: 32px;
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 50%;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: bold;
      z-index: 2147483648;
      transition: all 0.3s ease;
    `;
    
    // Create iframe for Aide
    const iframe = document.createElement('iframe');
    iframe.src = chrome.runtime.getURL('index.html?mode=sidebar');
    iframe.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
      background: #050816;
      display: block;
    `;
    
    // Collapse functionality
    collapseBtn.addEventListener('click', () => {
      const isCollapsed = host.style.transform === 'translateX(-390px)';
      const transform = isCollapsed ? 'translateX(0)' : 'translateX(-390px)';
      host.style.transform = transform;
      collapseBtn.innerHTML = isCollapsed ? '×' : '◀';
      console.log('🎯 Aide Sidebar: Toggle -', isCollapsed ? 'Expanded' : 'Collapsed');
    });
    
    // Append elements
    host.appendChild(iframe);
    host.appendChild(collapseBtn);
    document.body.appendChild(host);
    
    sidebarInstance = host;
    console.log('✅ Aide Sidebar: Created successfully');
  };
  
  // Listen for popup messages
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'OPEN_AIDE_SIDEBAR') {
      console.log('🎯 Content Script: Received OPEN_AIDE_SIDEBAR request');
      createAideSidebar();
      sendResponse({ success: true });
    }
  });
  
  console.log('✅ Content Script: Initialized');
})();

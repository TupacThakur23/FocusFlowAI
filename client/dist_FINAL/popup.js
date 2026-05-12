// Popup script - Simple launcher for FocusFlow AI
(function() {
  'use strict';
  
  console.log('🚀 Popup: Initializing launcher...');
  
  // Open Aide sidebar
  document.getElementById('openAide').addEventListener('click', () => {
    console.log('🎯 Popup: Opening Aide sidebar...');
    
    // Send message to content script to open sidebar
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { 
        action: 'OPEN_AIDE_SIDEBAR' 
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.log('🚨 Popup: Error sending message:', chrome.runtime.lastError);
        } else {
          console.log('✅ Popup: Aide sidebar opened');
        }
        // Close popup immediately
        window.close();
      });
    });
  });
  
  // Open Research Hub workspace
  document.getElementById('openResearchHub').addEventListener('click', () => {
    console.log('🎯 Popup: Opening Research Hub workspace...');
    
    // Open full-page workspace
    chrome.tabs.create({
      url: chrome.runtime.getURL('index.html#/research')
    }, (tab) => {
      console.log('✅ Popup: Research Hub workspace opened');
      // Close popup immediately
      window.close();
    });
  });
  
  console.log('✅ Popup: Launcher initialized');
})();

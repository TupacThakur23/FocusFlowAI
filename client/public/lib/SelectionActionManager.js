

export class SelectionActionManager {
  constructor() {
    this.isInitialized = false;
    this.currentSelection = '';
    this.toolbar = null;
    this.contextMenu = null;
    this.actionHandlers = new Map();
    this.keyboardShortcuts = new Map();
    
    this.config = {
      enableToolbar: true,
      enableContextMenu: true,
      toolbarDelay: 500,
      minSelectionLength: 3,
      maxSelectionLength: 1000,
      toolbarPosition: 'top-right', // top-right, top-left, bottom-right, bottom-left
      animationDuration: 200
    };

    this.setupActionHandlers();
  }

  
  initialize() {
    if (this.isInitialized) return;

    this.setupTextSelection();
    this.setupContextMenu();
    this.setupKeyboardShortcuts();
    this.setupMessageListener();
    
    this.isInitialized = true;
    console.log('SelectionActionManager initialized');
  }

  
  setupTextSelection() {
    let selectionTimeout;

    document.addEventListener('mouseup', (event) => {
      clearTimeout(selectionTimeout);
      
      selectionTimeout = setTimeout(() => {
        const selection = window.getSelection().toString().trim();
        
        if (this.isValidSelection(selection)) {
          this.currentSelection = selection;
          this.showToolbar(event);
          this.notifySelectionChange(selection);
        } else {
          this.hideToolbar();
        }
      }, 100);
    });

    document.addEventListener('selectionchange', () => {
      const selection = window.getSelection().toString().trim();
      
      if (!this.isValidSelection(selection)) {
        this.hideToolbar();
      }
    });

    document.addEventListener('click', (event) => {
      if (!this.toolbar || this.toolbar.contains(event.target)) {
        this.hideToolbar();
      }
    });
  }

  
  setupContextMenu() {
    if (!this.config.enableContextMenu) return;

    document.addEventListener('contextmenu', (event) => {
      const selection = window.getSelection().toString().trim();
      
      if (this.isValidSelection(selection)) {
        event.preventDefault();
        this.showContextMenu(event.pageX, event.pageY, selection);
      }
    });

    document.addEventListener('click', () => {
      this.hideContextMenu();
    });
  }

  
  setupKeyboardShortcuts() {
    this.keyboardShortcuts.set('explain', {
      keys: ['ctrl', 'shift', 'e'],
      action: 'explain',
      description: 'Explain selected text'
    });

    this.keyboardShortcuts.set('summarize', {
      keys: ['ctrl', 'shift', 's'],
      action: 'summarize',
      description: 'Summarize selected text'
    });

    this.keyboardShortcuts.set('save', {
      keys: ['ctrl', 'shift', 'r'],
      action: 'save',
      description: 'Save to research'
    });

    this.keyboardShortcuts.set('flashcard', {
      keys: ['ctrl', 'shift', 'f'],
      action: 'flashcard',
      description: 'Create flashcard'
    });

    document.addEventListener('keydown', (event) => {
      const selection = window.getSelection().toString().trim();
      
      if (!this.isValidSelection(selection)) return;

      for (const [name, shortcut] of this.keyboardShortcuts.entries()) {
        if (this.matchesShortcut(event, shortcut.keys)) {
          event.preventDefault();
          this.executeAction(shortcut.action, selection);
          break;
        }
      }
    });
  }

  
  setupMessageListener() {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'SELECTION_ACTION') {
          this.executeAction(message.action, message.selection);
          sendResponse({ success: true });
        }
      });
    }
  }

  
  setupActionHandlers() {
    this.actionHandlers.set('explain', (selection) => {
      this.sendActionToExtension('explainSelection', { selection });
    });

    this.actionHandlers.set('summarize', (selection) => {
      this.sendActionToExtension('summarizeSelection', { selection });
    });

    this.actionHandlers.set('save', (selection) => {
      this.sendActionToExtension('saveToResearch', { selection, url: window.location.href });
    });

    this.actionHandlers.set('flashcard', (selection) => {
      this.sendActionToExtension('createFlashcard', { selection });
    });

    this.actionHandlers.set('simplify', (selection) => {
      this.sendActionToExtension('simplifyContent', { selection });
    });

    this.actionHandlers.set('translate', (selection) => {
      this.sendActionToExtension('translateContent', { selection });
    });

    this.actionHandlers.set('citation', (selection) => {
      this.sendActionToExtension('generateCitation', { selection });
    });
  }

  
  isValidSelection(selection) {
    if (!selection || typeof selection !== 'string') return false;
    
    const length = selection.length;
    return length >= this.config.minSelectionLength && 
           length <= this.config.maxSelectionLength &&
           !selection.match(/^\s+$/); // Not just whitespace
  }

  
  showToolbar(event) {
    if (!this.config.enableToolbar) return;

    this.hideToolbar(); // Hide existing toolbar first

    this.toolbar = this.createToolbar();
    document.body.appendChild(this.toolbar);

    this.positionToolbar(event);

    setTimeout(() => {
      this.toolbar.classList.add('focusflow-toolbar-visible');
    }, 50);
  }

  
  createToolbar() {
    const toolbar = document.createElement('div');
    toolbar.id = 'focusflow-selection-toolbar';
    toolbar.className = 'focusflow-toolbar';

    toolbar.innerHTML = `
      <div class="focusflow-toolbar-content">
        <div class="focusflow-toolbar-actions">
          <button class="focusflow-action-btn focusflow-action-explain" data-action="explain" title="Explain (Ctrl+Shift+E)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 0 0v6a3 3 0 0 1 0 0v-6"></path>
            </svg>
            <span>Explain</span>
          </button>
          <button class="focusflow-action-btn focusflow-action-summarize" data-action="summarize" title="Summarize (Ctrl+Shift+S)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"></path>
              <polyline points="14,2 14,22 8,22 8,2"></polyline>
            </svg>
            <span>Summarize</span>
          </button>
          <button class="focusflow-action-btn focusflow-action-save" data-action="save" title="Save to Research (Ctrl+Shift+R)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 0 1-2 2v-14a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2z"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
            </svg>
            <span>Save</span>
          </button>
          <button class="focusflow-action-btn focusflow-action-flashcard" data-action="flashcard" title="Create Flashcard (Ctrl+Shift+F)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="10" x2="16" y2="10"></line>
              <line x1="8" y1="14" x2="16" y2="14"></line>
            </svg>
            <span>Flashcard</span>
          </button>
        </div>
        <div class="focusflow-toolbar-more">
          <button class="focusflow-action-btn focusflow-action-more" title="More actions">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="19" cy="12" r="1"></circle>
              <circle cx="5" cy="12" r="1"></circle>
            </svg>
          </button>
        </div>
      </div>
    `;

    toolbar.addEventListener('click', (event) => {
      const action = event.target.closest('[data-action]')?.dataset.action;
      if (action) {
        event.preventDefault();
        this.executeAction(action, this.currentSelection);
        this.hideToolbar();
      }
    });

    const moreBtn = toolbar.querySelector('.focusflow-action-more');
    if (moreBtn) {
      moreBtn.addEventListener('click', (event) => {
        event.preventDefault();
        this.showMoreActions(event.target);
      });
    }

    return toolbar;
  }

  
  positionToolbar(event) {
    if (!this.toolbar) return;

    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    let left, top;
    
    switch (this.config.toolbarPosition) {
      case 'top-right':
        left = rect.right + window.scrollX;
        top = rect.top + window.scrollY - this.toolbar.offsetHeight - 10;
        break;
      case 'top-left':
        left = rect.left + window.scrollX - this.toolbar.offsetWidth;
        top = rect.top + window.scrollY - this.toolbar.offsetHeight - 10;
        break;
      case 'bottom-right':
        left = rect.right + window.scrollX;
        top = rect.bottom + window.scrollY + 10;
        break;
      case 'bottom-left':
        left = rect.left + window.scrollX - this.toolbar.offsetWidth;
        top = rect.bottom + window.scrollY + 10;
        break;
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    if (left < 0) left = 10;
    if (left + this.toolbar.offsetWidth > viewportWidth) {
      left = viewportWidth - this.toolbar.offsetWidth - 10;
    }
    
    if (top < 0) top = 10;
    if (top + this.toolbar.offsetHeight > viewportHeight) {
      top = viewportHeight - this.toolbar.offsetHeight - 10;
    }

    this.toolbar.style.left = `${left}px`;
    this.toolbar.style.top = `${top}px`;
  }

  
  showMoreActions(button) {

    this.hideMoreActions();

    const dropdown = document.createElement('div');
    dropdown.className = 'focusflow-more-dropdown';
    dropdown.innerHTML = `
      <div class="focusflow-more-actions-list">
        <button class="focusflow-more-action" data-action="simplify" title="Simplify">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M7 7h10M12 7v10M17 7v10"></path>
          </svg>
          Simplify
        </button>
        <button class="focusflow-more-action" data-action="translate" title="Translate">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 8l6 6M4 13l6 6M9 3v18"></path>
          </svg>
          Translate
        </button>
        <button class="focusflow-more-action" data-action="citation" title="Generate Citation">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
          Cite
        </button>
      </div>
    `;

    const buttonRect = button.getBoundingClientRect();
    dropdown.style.left = `${buttonRect.left}px`;
    dropdown.style.top = `${buttonRect.bottom + 5}px`;

    document.body.appendChild(dropdown);

    dropdown.addEventListener('click', (event) => {
      const action = event.target.closest('[data-action]')?.dataset.action;
      if (action) {
        event.preventDefault();
        this.executeAction(action, this.currentSelection);
        this.hideMoreActions();
        this.hideToolbar();
      }
    });

    setTimeout(() => {
      this.hideMoreActions();
    }, 3000);

    setTimeout(() => {
      document.addEventListener('click', this.hideMoreActions, { once: true });
    }, 100);
  }

  
  showContextMenu(x, y, selection) {
    this.hideContextMenu(); // Hide existing menu first

    this.contextMenu = this.createContextMenu(selection);
    document.body.appendChild(this.contextMenu);

    this.contextMenu.style.left = `${x}px`;
    this.contextMenu.style.top = `${y}px`;

    const rect = this.contextMenu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (rect.right > viewportWidth) {
      this.contextMenu.style.left = `${viewportWidth - rect.width - 10}px`;
    }
    
    if (rect.bottom > viewportHeight) {
      this.contextMenu.style.top = `${viewportHeight - rect.height - 10}px`;
    }

    setTimeout(() => {
      this.contextMenu.classList.add('focusflow-context-menu-visible');
    }, 50);
  }

  
  createContextMenu(selection) {
    const menu = document.createElement('div');
    menu.id = 'focusflow-context-menu';
    menu.className = 'focusflow-context-menu';

    menu.innerHTML = `
      <div class="focusflow-context-menu-content">
        <div class="focusflow-context-header">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9.09 9a3 3 0 0 1 0 0v6a3 3 0 0 1 0 0v-6"></path>
          </svg>
          <span>FocusFlow AI</span>
        </div>
        <div class="focusflow-context-actions">
          <button class="focusflow-context-action" data-action="explain">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 0 0v6a3 3 0 0 1 0 0v-6"></path>
            </svg>
            Explain Selection
          </button>
          <button class="focusflow-context-action" data-action="summarize">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"></path>
              <polyline points="14,2 14,22 8,22 8,2"></polyline>
            </svg>
            Summarize
          </button>
          <button class="focusflow-context-action" data-action="save">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 0 1-2 2v-14a2 2 0 0 1 2 2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2z"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
            </svg>
            Save to Research
          </button>
          <button class="focusflow-context-action" data-action="flashcard">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="10" x2="16" y2="10"></line>
              <line x1="8" y1="14" x2="16" y2="14"></line>
            </svg>
            Create Flashcard
          </button>
        </div>
        <div class="focusflow-context-footer">
          <div class="focusflow-selection-preview">
            ${this.escapeHtml(selection.substring(0, 100))}${selection.length > 100 ? '...' : ''}
          </div>
        </div>
      </div>
    `;

    menu.addEventListener('click', (event) => {
      const action = event.target.closest('[data-action]')?.dataset.action;
      if (action) {
        event.preventDefault();
        this.executeAction(action, selection);
        this.hideContextMenu();
      }
    });

    return menu;
  }

  
  executeAction(action, selection) {
    const handler = this.actionHandlers.get(action);
    if (handler) {
      try {
        handler(selection);
        

        this.sendAnalyticsEvent('action_executed', {
          action,
          selectionLength: selection.length,
          url: window.location.href
        });
      } catch (error) {
        console.error(`Error executing action ${action}:`, error);
        

        this.sendAnalyticsEvent('action_error', {
          action,
          error: error.message
        });
      }
    }
  }

  
  hideToolbar() {
    if (this.toolbar) {
      this.toolbar.classList.remove('focusflow-toolbar-visible');
      setTimeout(() => {
        if (this.toolbar && this.toolbar.parentNode) {
          this.toolbar.parentNode.removeChild(this.toolbar);
          this.toolbar = null;
        }
      }, this.config.animationDuration);
    }
  }

  
  hideContextMenu() {
    if (this.contextMenu) {
      this.contextMenu.classList.remove('focusflow-context-menu-visible');
      setTimeout(() => {
        if (this.contextMenu && this.contextMenu.parentNode) {
          this.contextMenu.parentNode.removeChild(this.contextMenu);
          this.contextMenu = null;
        }
      }, this.config.animationDuration);
    }
  }

  
  hideMoreActions() {
    const dropdown = document.querySelector('.focusflow-more-dropdown');
    if (dropdown && dropdown.parentNode) {
      dropdown.parentNode.removeChild(dropdown);
    }
  }

  
  matchesShortcut(event, keys) {
    return keys.every(key => {
      switch (key) {
        case 'ctrl': return event.ctrlKey;
        case 'shift': return event.shiftKey;
        case 'alt': return event.altKey;
        case 'meta': return event.metaKey;
        default: return event.key.toLowerCase() === key.toLowerCase();
      }
    });
  }

  
  sendActionToExtension(type, data) {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({
        type: 'SELECTION_ACTION',
        action: type,
        data,
        timestamp: Date.now(),
        url: window.location.href
      });
    }
  }

  
  sendAnalyticsEvent(event, data) {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({
        type: 'ANALYTICS_EVENT',
        event,
        data,
        timestamp: Date.now()
      });
    }
  }

  
  notifySelectionChange(selection) {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({
        type: 'SELECTION_CHANGED',
        selection,
        length: selection.length,
        timestamp: Date.now(),
        url: window.location.href
      });
    }
  }

  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    

    if (newConfig.enableToolbar !== undefined || newConfig.enableContextMenu !== undefined) {
      this.cleanup();
      this.initialize();
    }
  }

  
  getConfig() {
    return { ...this.config };
  }

  
  getCurrentSelection() {
    return this.currentSelection;
  }

  
  cleanup() {
    this.hideToolbar();
    this.hideContextMenu();
    this.hideMoreActions();
    
    this.isInitialized = false;
    console.log('SelectionActionManager cleaned up');
  }
}

// export const selectionActionManager = new SelectionActionManager();
export const selectionActionManager = null;

// export const initialize = selectionActionManager.initialize.bind(selectionActionManager);
// export const cleanup = selectionActionManager.cleanup.bind(selectionActionManager);
// export const updateConfig = selectionActionManager.updateConfig.bind(selectionActionManager);
// export const getConfig = selectionActionManager.getConfig.bind(selectionActionManager);
// export const getCurrentSelection = selectionActionManager.getCurrentSelection.bind(selectionActionManager);

export default selectionActionManager;

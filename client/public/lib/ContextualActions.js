/**
 * ContextualActions - Enhanced Cross-Page Actions for FocusFlow AI
 * 
 * Provides intelligent contextual actions:
 * - Compare with saved research
 * - Find related notes
 * - Continue topic research
 * - Summarize across sources
 * - Generate combined notes
 * - Compare viewpoints
 * - Build revision sheets
 */

export class ContextualActions {
  constructor(options = {}) {
    this.config = {
      // Action configuration
      enableComparison: options.enableComparison !== false,
      enableRelatedResearch: options.enableRelatedResearch !== false,
      enableContinuation: options.enableContinuation !== false,
      enableCrossSourceSummary: options.enableCrossSourceSummary !== false,
      enableCombinedNotes: options.enableCombinedNotes !== false,
      enableViewpointComparison: options.enableViewpointComparison !== false,
      enableRevisionSheets: options.enableRevisionSheets !== false,
      
      // UI settings
      showActionPreviews: options.showActionPreviews !== false,
      enableKeyboardShortcuts: options.enableKeyboardShortcuts !== false,
      actionTimeout: options.actionTimeout || 30000, // 30 seconds
      maxResultsPerAction: options.maxResultsPerAction || 5,
      
      // Integration
      researchApi: options.researchApi || '/api/research',
      notesApi: options.notesApi || '/api/notes',
      aiApi: options.aiApi || '/api/ai/actions'
    };

    this.actionHistory = new Map();
    this.actionCache = new Map();
    this.shortcuts = new Map();
    
    this.initializeShortcuts();
    this.setupEventListeners();
  }

  /**
   * Initialize keyboard shortcuts
   */
  initializeShortcuts() {
    if (!this.config.enableKeyboardShortcuts) return;

    this.shortcuts.set('compare_research', {
      keys: ['ctrl', 'shift', 'c'],
      description: 'Compare with saved research',
      action: 'compareWithResearch'
    });

    this.shortcuts.set('find_related', {
      keys: ['ctrl', 'shift', 'r'],
      description: 'Find related research',
      action: 'findRelatedResearch'
    });

    this.shortcuts.set('continue_topic', {
      keys: ['ctrl', 'shift', 't'],
      description: 'Continue topic research',
      action: 'continueTopicResearch'
    });

    this.shortcuts.set('cross_source_summary', {
      keys: ['ctrl', 'shift', 's'],
      description: 'Summarize across sources',
      action: 'crossSourceSummary'
    });

    this.shortcuts.set('combined_notes', {
      keys: ['ctrl', 'shift', 'n'],
      description: 'Generate combined notes',
      action: 'generateCombinedNotes'
    });

    this.shortcuts.set('compare_viewpoints', {
      keys: ['ctrl', 'shift', 'v'],
      description: 'Compare viewpoints',
      action: 'compareViewpoints'
    });

    this.shortcuts.set('revision_sheet', {
      keys: ['ctrl', 'shift', 'e'],
      description: 'Build revision sheet',
      action: 'buildRevisionSheet'
    });
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Listen for text selection
    document.addEventListener('mouseup', this.handleTextSelection.bind(this));
    document.addEventListener('selectionchange', this.handleSelectionChange.bind(this));
    
    // Listen for keyboard shortcuts
    document.addEventListener('keydown', this.handleKeyboardShortcut.bind(this));
    
    // Listen for page navigation
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.onMessage.addListener(this.handleChromeMessage.bind(this));
    }
  }

  /**
   * Handle text selection for contextual actions
   * @param {Event} event - Mouse event
   */
  handleTextSelection(event) {
    setTimeout(() => {
      const selection = window.getSelection().toString().trim();
      
      if (selection.length > 10 && selection.length < 1000) {
        this.showContextualActions(selection, event);
      }
    }, 100);
  }

  /**
   * Handle selection change
   * @param {Event} event - Selection event
   */
  handleSelectionChange(event) {
    const selection = window.getSelection().toString().trim();
    
    // Hide actions if selection is cleared
    if (selection.length === 0) {
      this.hideContextualActions();
    }
  }

  /**
   * Handle keyboard shortcuts
   * @param {Event} event - Keyboard event
   */
  handleKeyboardShortcut(event) {
    const pressedKeys = [
      event.ctrlKey && 'ctrl',
      event.shiftKey && 'shift',
      event.altKey && 'alt',
      event.metaKey && 'meta'
    ].filter(Boolean);

    for (const [shortcut, config] of this.shortcuts.entries()) {
      const keysMatch = config.keys.every(key => {
        switch (key) {
          case 'ctrl': return event.ctrlKey;
          case 'shift': return event.shiftKey;
          case 'alt': return event.altKey;
          case 'meta': return event.metaKey;
          default: return event.key.toLowerCase() === key;
        }
      });

      if (keysMatch && pressedKeys.length === config.keys.length) {
        event.preventDefault();
        this.executeAction(config.action, window.getSelection().toString().trim());
        break;
      }
    }
  }

  /**
   * Handle Chrome extension messages
   * @param {Object} message - Chrome message
   * @param {Object} sender - Message sender
   * @param {Function} sendResponse - Response callback
   */
  handleChromeMessage(message, sender, sendResponse) {
    switch (message.type) {
      case 'SELECTION_CONTEXT_ACTIONS':
        this.showContextualActions(message.selection, message.event);
        break;
      case 'EXECUTE_CONTEXTUAL_ACTION':
        this.executeAction(message.action, message.selection);
        break;
      case 'HIDE_CONTEXTUAL_ACTIONS':
        this.hideContextualActions();
        break;
    }
  }

  /**
   * Show contextual actions menu
   * @param {string} selection - Selected text
   * @param {Event} event - Triggering event
   */
  showContextualActions(selection, event) {
    // Remove existing action menu
    this.hideContextualActions();

    // Create action menu
    const actionMenu = this.createActionMenu(selection);
    document.body.appendChild(actionMenu);

    // Position menu near selection
    this.positionActionMenu(actionMenu, event);
    
    // Show with animation
    setTimeout(() => {
      actionMenu.classList.add('contextual-actions-visible');
    }, 50);

    // Auto-hide after timeout
    setTimeout(() => {
      this.hideContextualActions();
    }, this.config.actionTimeout);
  }

  /**
   * Hide contextual actions menu
   */
  hideContextualActions() {
    const existingMenu = document.querySelector('.contextual-actions-menu');
    if (existingMenu) {
      existingMenu.classList.remove('contextual-actions-visible');
      setTimeout(() => {
        if (existingMenu.parentNode) {
          existingMenu.parentNode.removeChild(existingMenu);
        }
      }, 200);
    }
  }

  /**
   * Create action menu element
   * @param {string} selection - Selected text
   * @returns {HTMLElement} Action menu element
   */
  createActionMenu(selection) {
    const menu = document.createElement('div');
    menu.className = 'contextual-actions-menu';
    menu.innerHTML = `
      <div class="contextual-actions-header">
        <div class="contextual-actions-title">FocusFlow AI Actions</div>
        <div class="contextual-actions-subtitle">"${this.truncateText(selection, 50)}"</div>
      </div>
      <div class="contextual-actions-content">
        ${this.generateActionItems(selection)}
      </div>
      <div class="contextual-actions-footer">
        <div class="contextual-actions-shortcuts">Press Ctrl+Shift+[C,R,T,S,N,V,E] for shortcuts</div>
        <button class="contextual-actions-close" onclick="this.parentElement.remove()">×</button>
      </div>
    `;

    // Add styles
    this.addMenuStyles(menu);

    return menu;
  }

  /**
   * Generate action items for menu
   * @param {string} selection - Selected text
   * @returns {string} Action items HTML
   */
  generateActionItems(selection) {
    const actions = [];

    if (this.config.enableComparison) {
      actions.push({
        id: 'compare_research',
        icon: '🔍',
        title: 'Compare with Saved Research',
        description: 'Find related research and compare viewpoints',
        shortcut: 'Ctrl+Shift+C'
      });
    }

    if (this.config.enableRelatedResearch) {
      actions.push({
        id: 'find_related',
        icon: '🔗',
        title: 'Find Related Research',
        description: 'Discover connected topics and concepts',
        shortcut: 'Ctrl+Shift+R'
      });
    }

    if (this.config.enableContinuation) {
      actions.push({
        id: 'continue_topic',
        icon: '▶️',
        title: 'Continue Topic Research',
        description: 'Deep dive into this topic with related sources',
        shortcut: 'Ctrl+Shift+T'
      });
    }

    if (this.config.enableCrossSourceSummary) {
      actions.push({
        id: 'cross_source_summary',
        icon: '📝',
        title: 'Summarize Across Sources',
        description: 'Create comprehensive summary from multiple sources',
        shortcut: 'Ctrl+Shift+S'
      });
    }

    if (this.config.enableCombinedNotes) {
      actions.push({
        id: 'combined_notes',
        icon: '📋',
        title: 'Generate Combined Notes',
        description: 'Create unified notes from multiple research sources',
        shortcut: 'Ctrl+Shift+N'
      });
    }

    if (this.config.enableViewpointComparison) {
      actions.push({
        id: 'compare_viewpoints',
        icon: '⚖️',
        title: 'Compare Viewpoints',
        description: 'Analyze different perspectives on this topic',
        shortcut: 'Ctrl+Shift+V'
      });
    }

    if (this.config.enableRevisionSheets) {
      actions.push({
        id: 'revision_sheet',
        icon: '📚',
        title: 'Build Revision Sheet',
        description: 'Create study guide for exam preparation',
        shortcut: 'Ctrl+Shift+E'
      });
    }

    return actions.map(action => `
      <div class="contextual-action-item" data-action="${action.id}">
        <div class="action-icon">${action.icon}</div>
        <div class="action-content">
          <div class="action-title">${action.title}</div>
          <div class="action-description">${action.description}</div>
          <div class="action-shortcut">${action.shortcut}</div>
        </div>
      </div>
    `).join('');
  }

  /**
   * Position action menu
   * @param {HTMLElement} menu - Action menu element
   * @param {Event} event - Triggering event
   */
  positionActionMenu(menu, event) {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    
    if (range) {
      const rect = range.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Calculate position
      let left = rect.left + rect.width / 2;
      let top = rect.bottom + 10;
      
      // Adjust if menu would go off-screen
      const menuRect = menu.getBoundingClientRect();
      
      if (left + menuRect.width > viewportWidth) {
        left = viewportWidth - menuRect.width - 20;
      }
      
      if (top + menuRect.height > viewportHeight) {
        top = rect.top - menuRect.height - 10;
      }
      
      menu.style.left = `${left}px`;
      menu.style.top = `${top}px`;
    } else {
      // Fallback position
      menu.style.left = '50%';
      menu.style.top = '50%';
      menu.style.transform = 'translate(-50%, -50%)';
    }
  }

  /**
   * Execute contextual action
   * @param {string} action - Action to execute
   * @param {string} selection - Selected text
   */
  async executeAction(action, selection) {
    try {
      // Check cache first
      const cacheKey = `${action}:${this.simpleHash(selection)}`;
      if (this.actionCache.has(cacheKey)) {
        console.log('Action already in progress:', action);
        return;
      }

      // Set cache to prevent duplicate executions
      this.actionCache.set(cacheKey, {
        action,
        selection,
        timestamp: Date.now()
      });

      // Execute action based on type
      let result;
      switch (action) {
        case 'compare_research':
          result = await this.compareWithResearch(selection);
          break;
        case 'find_related':
          result = await this.findRelatedResearch(selection);
          break;
        case 'continue_topic':
          result = await this.continueTopicResearch(selection);
          break;
        case 'cross_source_summary':
          result = await this.crossSourceSummary(selection);
          break;
        case 'combined_notes':
          result = await this.generateCombinedNotes(selection);
          break;
        case 'compare_viewpoints':
          result = await this.compareViewpoints(selection);
          break;
        case 'revision_sheet':
          result = await this.buildRevisionSheet(selection);
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }

      // Clear cache
      this.actionCache.delete(cacheKey);

      // Show result notification
      this.showActionResult(result);
      
      // Log action for analytics
      this.logAction(action, selection, result);

    } catch (error) {
      console.error(`Failed to execute action ${action}:`, error);
      this.showActionError(action, error);
      
      // Clear cache on error
      this.actionCache.delete(cacheKey);
    }
  }

  /**
   * Compare with saved research
   * @param {string} selection - Selected text
   * @returns {Object} Comparison result
   */
  async compareWithResearch(selection) {
    const response = await fetch(`${this.config.researchApi}/compare`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        selection,
        currentUrl: window.location.href,
        pageTitle: document.title
      })
    });

    const result = await response.json();
    
    return {
      action: 'compare_research',
      success: result.success,
      data: result.data,
      message: result.message
    };
  }

  /**
   * Find related research
   * @param {string} selection - Selected text
   * @returns {Object} Related research result
   */
  async findRelatedResearch(selection) {
    const response = await fetch(`${this.config.researchApi}/related`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        selection,
        currentUrl: window.location.href,
        pageTitle: document.title,
        maxResults: this.config.maxResultsPerAction
      })
    });

    const result = await response.json();
    
    return {
      action: 'find_related',
      success: result.success,
      data: result.data,
      message: result.message
    };
  }

  /**
   * Continue topic research
   * @param {string} selection - Selected text
   * @returns {Object} Continuation result
   */
  async continueTopicResearch(selection) {
    const response = await fetch(`${this.config.aiApi}/continue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        selection,
        currentUrl: window.location.href,
        pageTitle: document.title,
        depth: 'deep'
      })
    });

    const result = await response.json();
    
    return {
      action: 'continue_topic',
      success: result.success,
      data: result.data,
      message: result.message
    };
  }

  /**
   * Create cross-source summary
   * @param {string} selection - Selected text
   * @returns {Object} Summary result
   */
  async crossSourceSummary(selection) {
    const response = await fetch(`${this.config.aiApi}/summary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        selection,
        currentUrl: window.location.href,
        pageTitle: document.title,
        sources: 'cross_page'
      })
    });

    const result = await response.json();
    
    return {
      action: 'cross_source_summary',
      success: result.success,
      data: result.data,
      message: result.message
    };
  }

  /**
   * Generate combined notes
   * @param {string} selection - Selected text
   * @returns {Object} Combined notes result
   */
  async generateCombinedNotes(selection) {
    const response = await fetch(`${this.config.notesApi}/combined`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        selection,
        currentUrl: window.location.href,
        pageTitle: document.title,
        format: 'structured'
      })
    });

    const result = await response.json();
    
    return {
      action: 'combined_notes',
      success: result.success,
      data: result.data,
      message: result.message
    };
  }

  /**
   * Compare viewpoints
   * @param {string} selection - Selected text
   * @returns {Object} Viewpoint comparison result
   */
  async compareViewpoints(selection) {
    const response = await fetch(`${this.config.aiApi}/compare-viewpoints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        selection,
        currentUrl: window.location.href,
        pageTitle: document.title,
        analysisType: 'viewpoint'
      })
    });

    const result = await response.json();
    
    return {
      action: 'compare_viewpoints',
      success: result.success,
      data: result.data,
      message: result.message
    };
  }

  /**
   * Build revision sheet
   * @param {string} selection - Selected text
   * @returns {Object} Revision sheet result
   */
  async buildRevisionSheet(selection) {
    const response = await fetch(`${this.config.notesApi}/revision-sheet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        selection,
        currentUrl: window.location.href,
        pageTitle: document.title,
        format: 'exam'
      })
    });

    const result = await response.json();
    
    return {
      action: 'revision_sheet',
      success: result.success,
      data: result.data,
      message: result.message
    };
  }

  /**
   * Show action result notification
   * @param {Object} result - Action result
   */
  showActionResult(result) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'contextual-action-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <div class="notification-icon">${result.success ? '✅' : '❌'}</div>
        <div class="notification-message">
          <div class="notification-title">${result.action.replace('_', ' ').toUpperCase()}</div>
          <div class="notification-description">${result.message}</div>
        </div>
      </div>
      <div class="notification-close" onclick="this.parentElement.remove()">×</div>
    `;

    // Add to page
    document.body.appendChild(notification);

    // Position notification
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '999999';

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
  }

  /**
   * Show action error notification
   * @param {string} action - Action that failed
   * @param {Error} error - Error object
   */
  showActionError(action, error) {
    const notification = document.createElement('div');
    notification.className = 'contextual-action-notification error';
    notification.innerHTML = `
      <div class="notification-content">
        <div class="notification-icon">❌</div>
        <div class="notification-message">
          <div class="notification-title">Action Failed</div>
          <div class="notification-description">${action} failed: ${error.message}</div>
        </div>
      </div>
      <div class="notification-close" onclick="this.parentElement.remove()">×</div>
    `;

    document.body.appendChild(notification);
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '999999';

    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
  }

  /**
   * Log action for analytics
   * @param {string} action - Action executed
   * @param {string} selection - Text selection
   * @param {Object} result - Action result
   */
  logAction(action, selection, result) {
    const logEntry = {
      action,
      selection: this.truncateText(selection, 100),
      url: window.location.href,
      pageTitle: document.title,
      timestamp: new Date().toISOString(),
      success: result.success,
      result: result.data || null,
      duration: result.duration || 0,
      userAgent: navigator.userAgent
    };

    // Send to analytics service
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({
        type: 'CONTEXTUAL_ACTION_LOG',
        data: logEntry
      });
    }

    console.log('Contextual action executed:', logEntry);
  }

  /**
   * Add styles to action menu
   * @param {HTMLElement} menu - Menu element
   */
  addMenuStyles(menu) {
    const style = document.createElement('style');
    style.textContent = `
      .contextual-actions-menu {
        position: fixed;
        background: #1a1a1a;
        border: 1px solid #333;
        border-radius: 8px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        z-index: 999998;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        min-width: 300px;
        max-width: 400px;
        opacity: 0;
        transform: translateY(-10px);
        transition: all 0.2s ease;
      }

      .contextual-actions-visible {
        opacity: 1;
        transform: translateY(0);
      }

      .contextual-actions-header {
        background: #2d3748;
        color: white;
        padding: 12px 16px;
        border-bottom: 1px solid #444;
        border-radius: 8px 8px 0 0;
      }

      .contextual-actions-title {
        font-weight: 600;
        font-size: 16px;
        margin-bottom: 4px;
      }

      .contextual-actions-subtitle {
        font-size: 12px;
        color: #9ca3af;
        margin-bottom: 8px;
        font-style: italic;
      }

      .contextual-actions-content {
        padding: 8px 16px;
        max-height: 300px;
        overflow-y: auto;
      }

      .contextual-action-item {
        display: flex;
        align-items: center;
        padding: 12px 16px;
        border-bottom: 1px solid #333;
        cursor: pointer;
        transition: background-color 0.2s ease;
      }

      .contextual-action-item:hover {
        background: #374151;
      }

      .contextual-action-item:last-child {
        border-bottom: none;
      }

      .action-icon {
        font-size: 20px;
        margin-right: 12px;
        width: 24px;
        text-align: center;
      }

      .action-content {
        flex: 1;
      }

      .action-title {
        font-weight: 600;
        color: white;
        margin-bottom: 4px;
      }

      .action-description {
        font-size: 12px;
        color: #9ca3af;
        margin-bottom: 4px;
      }

      .action-shortcut {
        font-size: 10px;
        color: #6b7280;
        background: #374151;
        padding: 2px 6px;
        border-radius: 4px;
        font-family: monospace;
      }

      .contextual-actions-footer {
        background: #2d3748;
        padding: 8px 16px;
        border-radius: 0 0 8px 8px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .contextual-actions-shortcuts {
        font-size: 11px;
        color: #9ca3af;
      }

      .contextual-actions-close {
        background: none;
        border: none;
        color: #9ca3af;
        font-size: 18px;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: background-color 0.2s ease;
      }

      .contextual-actions-close:hover {
        background: #374151;
        color: white;
      }

      .contextual-action-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #1a1a1a;
        border: 1px solid #333;
        border-radius: 8px;
        padding: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        max-width: 400px;
        min-width: 300px;
      }

      .contextual-action-notification.error {
        border-left: 4px solid #ef4444;
      }

      .notification-content {
        display: flex;
        align-items: flex-start;
      }

      .notification-icon {
        font-size: 20px;
        margin-right: 12px;
        margin-top: 2px;
      }

      .notification-message {
        flex: 1;
      }

      .notification-title {
        font-weight: 600;
        color: white;
        margin-bottom: 4px;
      }

      .notification-description {
        font-size: 14px;
        color: #9ca3af;
        line-height: 1.4;
      }

      .notification-close {
        background: none;
        border: none;
        color: #9ca3af;
        font-size: 18px;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        margin-left: 12px;
      }

      .notification-close:hover {
        background: #374151;
        color: white;
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Truncate text to specified length
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length
   * @returns {string} Truncated text
   */
  truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  /**
   * Simple hash function
   * @param {string} str - String to hash
   * @returns {string} Hash
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  /**
   * Get action statistics
   * @returns {Object} Action statistics
   */
  getStats() {
    return {
      config: this.config,
      shortcuts: Array.from(this.shortcuts.entries()).map(([key, config]) => ({
        shortcut: key,
        description: config.description,
        keys: config.keys
      })),
      actionHistory: Array.from(this.actionHistory.entries()),
      cacheSize: this.actionCache.size,
      capabilities: [
        'text selection detection',
        'contextual action menu',
        'keyboard shortcuts',
        'cross-page research comparison',
        'related topic discovery',
        'research continuation',
        'cross-source summarization',
        'combined note generation',
        'viewpoint comparison',
        'revision sheet creation'
      ]
    };
  }

  /**
   * Update configuration
   * @param {Object} newConfig - New configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Clear action cache
   */
  clearCache() {
    this.actionCache.clear();
  }

  /**
   * Reset contextual actions
   */
  reset() {
    this.actionHistory.clear();
    this.actionCache.clear();
    this.hideContextualActions();
  }
}

// Export singleton instance
export const contextualActions = new ContextualActions();

// Export utilities
export const executeAction = contextualActions.executeAction.bind(contextualActions);
export const getStats = contextualActions.getStats.bind(contextualActions);
export const updateConfig = contextualActions.updateConfig.bind(contextualActions);
export const clearCache = contextualActions.clearCache.bind(contextualActions);
export const reset = contextualActions.reset.bind(contextualActions);

export default contextualActions;

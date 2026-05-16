export class SidebarManager {
  constructor(options = {}) {
    this.host = null;
    this.iframe = null;
    this.toggleButton = null;
    this.isInjected = false;
    this.isVisible = false;
    this.isCollapsed = false;
    this.sidebarMode = 'closed';
    this.savedPos = {
      x: null,
      y: 0
    };
    this.savedSize = {
      w: 420,
      h: window.innerHeight
    };
    this.minW = 320;
    this.minH = window.innerHeight;
    this.headerH = 52;
    this._drag = null;
    this._resize = null;
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);
  }
  async injectSidebar() {
    if (this.isInjected) return true;
    await this._waitForDOMReady();
    this._buildPanel();
    this._buildFAB();
    this._loadSavedState();
    document.addEventListener('mousemove', this._onMouseMove);
    document.addEventListener('mouseup', this._onMouseUp);
    this.isInjected = true;
    return true;
  }
  async forceOpen() {
    if (!this.isInjected) await this.injectSidebar();
    await this.openSidebar();
  }
  async forceClose() {
    this._persistSidebarPreference('closed');
    await this.cleanup();
  }
  async openSidebar() {
    if (!this.isInjected) await this.injectSidebar();
    this._show();
    this._persistSidebarPreference('full');
  }
  async minimizeSidebar() {
    if (!this.isInjected) await this.injectSidebar();
    if (!this.host) return;
    this.host.style.display = 'none';
    if (this.toggleButton) this.toggleButton.style.display = 'flex';
    this.isVisible = false;
    this.sidebarMode = 'minimized';
    this._persistSidebarPreference('minimized');
  }
  async toggleSidebar() {
    if (this.isVisible) await this.minimizeSidebar();else await this.openSidebar();
  }
  async cleanup() {
    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('mouseup', this._onMouseUp);
    if (this.host) {
      this.host.remove();
      this.host = null;
    }
    if (this.toggleButton) {
      this.toggleButton.remove();
      this.toggleButton = null;
    }
    this.iframe = null;
    this.isInjected = false;
    this.isVisible = false;
  this.sidebarMode = 'closed';
  }
  _buildPanel() {
    const {
      x,
      y
    } = this._defaultPos();
    const {
      w,
      h
    } = this.savedSize;
    const host = document.createElement('div');
    host.id = 'focusflow-panel-host';
    host.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: ${x}px !important;
      width: ${w}px !important;
      height: 100vh !important;
      z-index: 2147483647 !important;
      display: flex !important;
      flex-direction: column !important;
      border-radius: 0 !important;
      overflow: hidden !important;
      box-shadow: -10px 0 50px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05) !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
      background: #03040b !important;
      transition: width 0.2s ease, transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      min-width: ${this.minW}px !important;
      user-select: none !important;
    `;
    this.host = host;
    const header = document.createElement('div');
    header.id = 'focusflow-panel-header';
    header.style.cssText = `
      height: 48px !important;
      min-height: 48px !important;
      background: rgba(5,8,22,0.95) !important;
      display: flex !important;
      align-items: center !important;
      padding: 0 16px !important;
      gap: 10px !important;
      cursor: grab !important;
      flex-shrink: 0 !important;
      user-select: none !important;
      border-bottom: 1px solid rgba(255,255,255,0.06) !important;
      z-index: 20 !important;
      position: relative !important;
    `;
    header.addEventListener('mousedown', e => {
      if (e.target.tagName === 'BUTTON') return;
      e.preventDefault();
      const rect = this.host.getBoundingClientRect();
      this._drag = { startX: e.clientX, startY: e.clientY, origLeft: rect.left, origTop: rect.top };
      this.host.style.transition = 'none';
      this.host.style.cursor = 'grabbing';
    });
    const brand = document.createElement('div');
    brand.style.cssText = 'flex:1;display:flex;align-items:center;gap:8px;min-width:0';
    const logo = document.createElement('div');
    logo.style.cssText = 'width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,#6366f1,#818cf8);display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0';
    logo.textContent = '⚡';
    const brandText = document.createElement('div');
    brandText.style.cssText = 'min-width:0';
    const brandTitle = document.createElement('span');
    brandTitle.style.cssText = 'font-size:13px;font-weight:900;color:rgba(255,255,255,0.9);letter-spacing:-0.3px;display:block';
    brandTitle.textContent = 'FocusFlow AI';
    const brandSub = document.createElement('span');
    brandSub.style.cssText = 'font-size:9px;font-weight:800;color:#6366f1;text-transform:uppercase;letter-spacing:1.5px;display:block;margin-top:1px';
    brandSub.textContent = 'AIDE';
    brandText.appendChild(brandTitle);
    brandText.appendChild(brandSub);
    brand.appendChild(logo);
    brand.appendChild(brandText);
    const controls = document.createElement('div');
    controls.style.cssText = 'display:flex;align-items:center;gap:4px;flex-shrink:0';
    const minBtn = document.createElement('button');
    minBtn.title = 'Minimize to floating widget';
    minBtn.style.cssText = this._iconBtnStyle();
    minBtn.textContent = '−';
    minBtn.addEventListener('mouseenter', () => { minBtn.style.background = 'rgba(255,255,255,0.12)'; });
    minBtn.addEventListener('mouseleave', () => { minBtn.style.background = 'rgba(255,255,255,0.06)'; });
    minBtn.addEventListener('click', e => { e.stopPropagation(); this.minimizeSidebar(); });
    const closeBtn = document.createElement('button');
    closeBtn.title = 'Close sidebar';
    closeBtn.style.cssText = this._iconBtnStyle();
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('mouseenter', () => { closeBtn.style.background = 'rgba(220,38,38,0.2)'; closeBtn.style.color = '#fff'; });
    closeBtn.addEventListener('mouseleave', () => { closeBtn.style.background = 'rgba(255,255,255,0.06)'; closeBtn.style.color = 'rgba(255,255,255,0.6)'; });
    closeBtn.addEventListener('click', e => { e.stopPropagation(); this.forceClose(); });
    controls.appendChild(minBtn);
    controls.appendChild(closeBtn);
    header.appendChild(brand);
    header.appendChild(controls);
    const iframe = document.createElement('iframe');
    iframe.src = chrome.runtime.getURL('index.html?mode=sidebar');
    iframe.style.cssText = `
      flex: 1 !important;
      width: 100% !important;
      height: 100% !important;
      border: none !important;
      background: #050816 !important;
      display: block !important;
    `;
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups');
    this.iframe = iframe;
    const directions = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];
    directions.forEach(dir => {
      const handle = document.createElement('div');
      handle.dataset.resize = dir;
      handle.style.cssText = this._resizeHandleStyle(dir);
      handle.addEventListener('mousedown', e => {
        e.preventDefault();
        e.stopPropagation();
        const rect = this.host.getBoundingClientRect();
        this._resize = {
          dir,
          startX: e.clientX,
          startY: e.clientY,
          origLeft: rect.left,
          origTop: rect.top,
          origW: rect.width,
          origH: rect.height
        };
      });
      host.appendChild(handle);
    });
    host.appendChild(header);
    host.appendChild(iframe);
    document.body.appendChild(host);
  }
  _buildFAB() {
    const fab = document.createElement('button');
    fab.id = 'focusflow-fab';
    fab.title = 'Open FocusFlow AI';
    fab.style.cssText = `
      position: fixed !important;
      bottom: 24px !important;
      right: 24px !important;
      width: 52px !important;
      height: 52px !important;
      border-radius: 50% !important;
      background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%) !important;
      color: #fff !important;
      font-size: 22px !important;
      border: none !important;
      cursor: pointer !important;
      z-index: 2147483646 !important;
      box-shadow: 0 4px 20px rgba(99,102,241,0.5) !important;
      display: none !important;
      align-items: center !important;
      justify-content: center !important;
      transition: transform 0.2s ease, box-shadow 0.2s ease !important;
    `;
    fab.textContent = '⚡';
    fab.addEventListener('click', () => this.openSidebar());
    fab.addEventListener('mouseenter', () => {
      fab.style.transform = 'scale(1.1) !important';
      fab.style.boxShadow = '0 6px 28px rgba(99,102,241,0.7) !important';
    });
    fab.addEventListener('mouseleave', () => {
      fab.style.transform = 'scale(1) !important';
      fab.style.boxShadow = '0 4px 20px rgba(99,102,241,0.5) !important';
    });
    this.toggleButton = fab;
    document.body.appendChild(fab);
  }
  _onMouseMove(e) {
    if (this._drag) {
      const dx = e.clientX - this._drag.startX;
      const dy = e.clientY - this._drag.startY;
      let newLeft = this._drag.origLeft + dx;
      let newTop = this._drag.origTop + dy;
      const panelW = this.host.offsetWidth;
      const panelH = this.host.offsetHeight;
      newLeft = Math.max(0, Math.min(window.innerWidth - panelW, newLeft));
      newTop = 0;
      this.host.style.left = newLeft + 'px';
      this.host.style.top = newTop + 'px';
      return;
    }
    if (this._resize) {
      const {
        dir,
        startX,
        startY,
        origLeft,
        origTop,
        origW,
        origH
      } = this._resize;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      let newLeft = origLeft,
        newTop = origTop,
        newW = origW,
        newH = origH;
      if (dir.includes('e')) newW = Math.max(this.minW, origW + dx);
      if (dir.includes('w')) {
        newW = Math.max(this.minW, origW - dx);
        newLeft = origLeft + (origW - newW);
      }
      if (dir.includes('s')) newH = Math.max(this.minH, origH + dy);
      if (dir.includes('n')) {
        newH = Math.max(this.minH, origH - dy);
        newTop = origTop + (origH - newH);
      }
      this.host.style.left = newLeft + 'px';
      this.host.style.top = newTop + 'px';
      this.host.style.width = newW + 'px';
      this.host.style.height = newH + 'px';
    }
  }
  _onMouseUp() {
    if (this._drag || this._resize) {
      this._saveState();
      this.host.style.transition = '';
      this.host.style.cursor = '';
    }
    this._drag = null;
    this._resize = null;
  }
  _show() {
    if (!this.host) return;
    this.host.style.display = 'flex';
    if (this.toggleButton) this.toggleButton.style.display = 'none';
    this.isVisible = true;
  this.sidebarMode = 'full';
  }
  _hide() {
    if (!this.host) return;
    this.host.style.display = 'none';
    if (this.toggleButton) this.toggleButton.style.display = 'none';
    this.isVisible = false;
  this.sidebarMode = 'closed';
  }
  _toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
    const arrow = document.getElementById('focusflow-collapse-arrow');
    if (this.isCollapsed) {
      this.savedSize.h = this.host.offsetHeight;
      this.host.style.height = this.headerH + 28 + 'px';
      if (this.iframe) this.iframe.style.display = 'none';
      if (arrow) arrow.style.transform = 'rotate(180deg)';
    } else {
      this.host.style.height = this.savedSize.h + 'px';
      if (this.iframe) this.iframe.style.display = 'block';
      if (arrow) arrow.style.transform = 'rotate(0deg)';
    }
    this._saveState();
  }
  _loadSavedState() {
    try {
      chrome.storage.local.get(['ff_panel_pos', 'ff_panel_size', 'sidebarPreference'], data => {
        if (data.ff_panel_pos && this.host) {
          this.host.style.left = data.ff_panel_pos.x + 'px';
          this.host.style.top = data.ff_panel_pos.y + 'px';
        }
        if (data.ff_panel_size && this.host) {
          this.host.style.width = data.ff_panel_size.w + 'px';
          this.host.style.height = data.ff_panel_size.h + 'px';
          this.savedSize = data.ff_panel_size;
        }
        if (this.host) {
          const pref = data.sidebarPreference || {};
          if (pref.sidebarMode === 'full') {
            this.host.style.display = 'flex';
            if (this.toggleButton) this.toggleButton.style.display = 'none';
            this.isVisible = true;
          this.sidebarMode = 'full';
          } else if (pref.sidebarMode === 'minimized') {
            this.host.style.display = 'none';
            if (this.toggleButton) this.toggleButton.style.display = 'flex';
            this.isVisible = false;
          this.sidebarMode = 'minimized';
          } else {
            this.host.style.display = 'none';
            if (this.toggleButton) this.toggleButton.style.display = 'none';
            this.isVisible = false;
          this.sidebarMode = 'closed';
          }
        }
      });
    } catch (e) {}
  }
  _persistSidebarPreference(sidebarMode) {
    try {
      const sidebarPreference = {
        hasUserOpenedSidebar: sidebarMode !== 'closed',
        isSidebarEnabled: sidebarMode !== 'closed',
        sidebarMode,
        isMinimized: sidebarMode === 'minimized'
      };
      chrome.storage.local.set({
        sidebarPreference,
        activeSidebarState: this.getState()
      });
      chrome.runtime?.sendMessage?.({
        type: 'SIDEBAR_STATE_CHANGED',
        isOpen: sidebarMode === 'full',
        sidebarMode,
        sidebarPreference,
        state: this.getState()
      });
    } catch (e) {}
  }
  _saveState() {
    try {
      const rect = this.host.getBoundingClientRect();
      chrome.storage.local.set({
        ff_panel_pos: {
          x: rect.left,
          y: rect.top
        },
        ff_panel_size: {
          w: rect.width,
          h: rect.height
        }
      });
    } catch (e) {}
  }
  _defaultPos() {
    const w = this.savedSize.w;
    const x = this.savedPos.x ?? Math.max(0, window.innerWidth - w - 20);
    return {
      x,
      y: this.savedPos.y
    };
  }
  async _waitForDOMReady() {
    return new Promise(resolve => {
      if (document.readyState === 'complete' && document.body) return resolve();
      const check = () => {
        if (document.readyState === 'complete' && document.body) resolve();else setTimeout(check, 100);
      };
      check();
    });
  }
  _iconBtnStyle() {
    return `
      background: rgba(255,255,255,0.06) !important;
      border: 1px solid rgba(255,255,255,0.1) !important;
      color: rgba(255,255,255,0.6) !important;
      border-radius: 6px !important;
      width: 26px !important;
      height: 26px !important;
      font-size: 11px !important;
      cursor: pointer !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      padding: 0 !important;
      line-height: 1 !important;
      transition: background 0.15s ease !important;
      flex-shrink: 0 !important;
    `;
  }
  _resizeHandleStyle(dir) {
    const t = '8px',
      r = t,
      b = t,
      l = t,
      c = '8px';
    const map = {
      n: `top:0;left:${c};right:${c};height:${t};cursor:n-resize`,
      s: `bottom:0;left:${c};right:${c};height:${b};cursor:s-resize`,
      e: `right:0;top:${c};bottom:${c};width:${r};cursor:e-resize`,
      w: `left:0;top:${c};bottom:${c};width:${l};cursor:w-resize`,
      ne: `top:0;right:0;width:${c};height:${c};cursor:ne-resize`,
      nw: `top:0;left:0;width:${c};height:${c};cursor:nw-resize`,
      se: `bottom:0;right:0;width:${c};height:${c};cursor:se-resize`,
      sw: `bottom:0;left:0;width:${c};height:${c};cursor:sw-resize`
    };
    return `position:absolute !important;${map[dir]};z-index:10 !important;`;
  }
  getState() {
    return {
      isInjected: this.isInjected,
      isVisible: this.isVisible,
      isCollapsed: this.isCollapsed,
      sidebarMode: this.sidebarMode,
      isMinimized: this.sidebarMode === 'minimized'
    };
  }
  isSidebarInjected() {
    return this.isInjected;
  }
  applyDockedStyles() {}
  restoreOriginalStyles() {}
}
export const sidebarManager = new SidebarManager();
if (typeof window !== 'undefined') {
  window.sidebarManager = sidebarManager;
}
export default SidebarManager;



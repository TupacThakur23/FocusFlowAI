

export class SidebarManager {
  constructor(options = {}) {
    this.host = null;
    this.iframe = null;
    this.toggleButton = null; // the floating FAB to reopen if closed
    this.isInjected = false;
    this.isVisible = false;
    this.isCollapsed = false;

    this.savedPos = { x: null, y: 0 };
    this.savedSize = { w: 420, h: window.innerHeight };
    this.minW = 320;
    this.minH = window.innerHeight;
    this.headerH = 52; // px — refined height for elite feel

    this._drag = null;

    this._resize = null;

    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);
  }

  

  async injectSidebar() {
    if (this.isInjected) return true;
    await this._waitForDOMReady();
    this._loadSavedState();
    this._buildPanel();
    this._buildFAB();
    document.addEventListener('mousemove', this._onMouseMove);
    document.addEventListener('mouseup', this._onMouseUp);
    this.isInjected = true;
    console.log('✅ FocusFlow: Floating panel injected');
    return true;
  }

  async forceOpen() {
    if (!this.isInjected) await this.injectSidebar();
    this._show();
  }

  async forceClose() {
    this._hide();
  }

  async toggleSidebar() {
    if (this.isVisible) this._hide(); else this._show();
  }

  async cleanup() {
    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('mouseup', this._onMouseUp);
    if (this.host) { this.host.remove(); this.host = null; }
    if (this.toggleButton) { this.toggleButton.remove(); this.toggleButton = null; }
    this.iframe = null;
    this.isInjected = false;
    this.isVisible = false;
  }

  

  _buildPanel() {
    const { x, y } = this._defaultPos();
    const { w, h } = this.savedSize;

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
      height: ${this.headerH}px !important;
      min-height: ${this.headerH}px !important;
      background: rgba(99,102,241,0.12) !important;
      border-bottom: 1px solid rgba(255,255,255,0.08) !important;
      display: flex !important;
      align-items: center !important;
      padding: 0 12px !important;
      cursor: grab !important;
      flex-shrink: 0 !important;
      gap: 8px !important;
    `;

    const grip = document.createElement('span');
    grip.style.cssText = 'font-size:13px; color:rgba(255,255,255,0.3); letter-spacing:1px; pointer-events:none !important;';
    grip.textContent = '⠿';

    const title = document.createElement('span');
    title.style.cssText = 'flex:1; font-size:13px; font-weight:600; color:#fff; pointer-events:none !important; letter-spacing:0.3px;';
    title.textContent = '⚡ FocusFlow AI';

    const closeBtn = document.createElement('button');
    closeBtn.style.cssText = this._iconBtnStyle();
    closeBtn.title = 'Close panel';
    closeBtn.innerHTML = '✕';
    closeBtn.addEventListener('click', () => this._hide());

    header.appendChild(grip);
    header.appendChild(title);
    header.appendChild(closeBtn);

    header.addEventListener('mousedown', (e) => {
      if (e.target === closeBtn) return;
      e.preventDefault();
      const rect = this.host.getBoundingClientRect();
      this._drag = { startX: e.clientX, startY: e.clientY, origLeft: rect.left, origTop: rect.top };
      this.host.style.transition = 'none !important';
      this.host.style.cursor = 'grabbing !important';
    });

    const iframe = document.createElement('iframe');
    iframe.src = chrome.runtime.getURL('index.html?mode=sidebar');
    iframe.style.cssText = `
      flex: 1 !important;
      width: 100% !important;
      border: none !important;
      background: #050816 !important;
      display: block !important;
    `;
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups');
    this.iframe = iframe;

    const directions = ['n','s','e','w','ne','nw','se','sw'];
    directions.forEach(dir => {
      const handle = document.createElement('div');
      handle.dataset.resize = dir;
      handle.style.cssText = this._resizeHandleStyle(dir);
      handle.addEventListener('mousedown', (e) => {
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
    fab.addEventListener('click', () => this._show());
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
      let newTop  = this._drag.origTop  + dy;

      const panelW = this.host.offsetWidth;
      const panelH = this.host.offsetHeight;
      newLeft = Math.max(0, Math.min(window.innerWidth  - panelW, newLeft));

      newTop = 0;

      this.host.style.left = newLeft + 'px';
      this.host.style.top  = newTop  + 'px';
      return;
    }

    if (this._resize) {
      const { dir, startX, startY, origLeft, origTop, origW, origH } = this._resize;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      let newLeft = origLeft, newTop = origTop, newW = origW, newH = origH;

      if (dir.includes('e')) newW = Math.max(this.minW, origW + dx);
      if (dir.includes('w')) { newW = Math.max(this.minW, origW - dx); newLeft = origLeft + (origW - newW); }
      if (dir.includes('s')) newH = Math.max(this.minH, origH + dy);
      if (dir.includes('n')) { newH = Math.max(this.minH, origH - dy); newTop  = origTop  + (origH - newH); }

      this.host.style.left   = newLeft + 'px';
      this.host.style.top    = newTop  + 'px';
      this.host.style.width  = newW + 'px';
      this.host.style.height = newH + 'px';
    }
  }

  _onMouseUp() {
    if (this._drag || this._resize) {
      this._saveState();
      this.host.style.transition = '';
      this.host.style.cursor = '';
    }
    this._drag   = null;
    this._resize = null;
  }

  

  _show() {
    if (!this.host) return;
    this.host.style.display = 'flex';
    if (this.toggleButton) this.toggleButton.style.display = 'none';
    this.isVisible = true;
  }

  _hide() {
    if (!this.host) return;
    this.host.style.display = 'none';
    if (this.toggleButton) this.toggleButton.style.display = 'flex';
    this.isVisible = false;
  }

  _toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
    const arrow = document.getElementById('focusflow-collapse-arrow');

    if (this.isCollapsed) {

      this.savedSize.h = this.host.offsetHeight;
      this.host.style.height = (this.headerH + 28) + 'px'; // header + collapseBar
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
      chrome.storage.local.get(['ff_panel_pos', 'ff_panel_size'], (data) => {
        if (data.ff_panel_pos && this.host) {
          this.host.style.left = data.ff_panel_pos.x + 'px';
          this.host.style.top  = data.ff_panel_pos.y + 'px';
        }
        if (data.ff_panel_size && this.host) {
          this.host.style.width  = data.ff_panel_size.w + 'px';
          this.host.style.height = data.ff_panel_size.h + 'px';
          this.savedSize = data.ff_panel_size;
        }
      });
    } catch (e) {  }
  }

  _saveState() {
    try {
      const rect = this.host.getBoundingClientRect();
      chrome.storage.local.set({
        ff_panel_pos:  { x: rect.left, y: rect.top },
        ff_panel_size: { w: rect.width, h: rect.height }
      });
    } catch (e) {  }
  }

  

  _defaultPos() {
    const w = this.savedSize.w;
    const x = this.savedPos.x ?? Math.max(0, window.innerWidth - w - 20);
    return { x, y: this.savedPos.y };
  }

  async _waitForDOMReady() {
    return new Promise(resolve => {
      if (document.readyState === 'complete' && document.body) return resolve();
      const check = () => {
        if (document.readyState === 'complete' && document.body) resolve();
        else setTimeout(check, 100);
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
    const t = '8px', r = t, b = t, l = t, c = '8px';
    const map = {
      n:  `top:0;left:${c};right:${c};height:${t};cursor:n-resize`,
      s:  `bottom:0;left:${c};right:${c};height:${b};cursor:s-resize`,
      e:  `right:0;top:${c};bottom:${c};width:${r};cursor:e-resize`,
      w:  `left:0;top:${c};bottom:${c};width:${l};cursor:w-resize`,
      ne: `top:0;right:0;width:${c};height:${c};cursor:ne-resize`,
      nw: `top:0;left:0;width:${c};height:${c};cursor:nw-resize`,
      se: `bottom:0;right:0;width:${c};height:${c};cursor:se-resize`,
      sw: `bottom:0;left:0;width:${c};height:${c};cursor:sw-resize`,
    };
    return `position:absolute !important;${map[dir]};z-index:10 !important;`;
  }

  getState() {
    return { isInjected: this.isInjected, isVisible: this.isVisible, isCollapsed: this.isCollapsed };
  }

  
  isSidebarInjected() { return this.isInjected; }
  applyDockedStyles()  {  }
  restoreOriginalStyles() {  }
}

export const sidebarManager = new SidebarManager();

if (typeof window !== 'undefined') {
  window.sidebarManager = sidebarManager;
}

export default SidebarManager;

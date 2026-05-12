import { BrainCircuit, BookOpen, ChevronRight, CheckCircle2, Sparkles, Layout, ArrowRight, ShieldCheck } from "lucide-react";

export default function Launcher({ onNavigate }) {
  console.log('🚀 ADAPTIVE WORKSPACE ACTIVE (v2.0.1)');

  const handleOpenAide = () => {
    console.log('🚀 CLICK: Aide button clicked');

    if (typeof chrome !== 'undefined' && chrome.scripting && chrome.tabs) {
      const panelUrl = chrome.runtime.getURL('index.html?mode=sidebar');

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs || !tabs[0]) return;
        const tabId = tabs[0].id;

        // Directly inject the panel into the active tab
        chrome.scripting.executeScript({
          target: { tabId },
          func: (iframeUrl) => {
            const PANEL_ID = 'ff-floating-panel';
            const FAB_ID   = 'ff-floating-fab';

            // Clean up ANY existing instance to ensure fresh load
            const existing = document.getElementById(PANEL_ID);
            if (existing) existing.remove();
            const existingFab = document.getElementById(FAB_ID);
            if (existingFab) existingFab.remove();

            // --- Build the Adaptive Floating Panel ---
            const PANEL_W = 480;
            const PANEL_H = '100vh';
            
            const panel = document.createElement('div');
            panel.id = PANEL_ID;
            panel.style.cssText = [
              'position:fixed',
              'top:0',
              'right:0',
              `width:${PANEL_W}px`,
              `height:${PANEL_H}`,
              'z-index:2147483647',
              'display:flex',
              'flex-direction:column',
              'border-radius:0',
              'border-left:1px solid rgba(255,255,255,0.08)',
              'box-shadow:0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)',
              'background:rgba(5, 8, 22, 0.85)',
              'backdrop-filter:blur(30px) saturate(150%)',
              'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
              'transition:transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease',
              'overflow:hidden',
            ].join(';');

            // --- Premium Header (Drag Region) ---
            const header = document.createElement('div');
            header.style.cssText = [
              'height:56px',
              'min-height:56px',
              'background:transparent',
              'display:flex',
              'align-items:center',
              'padding:0 20px',
              'gap:12px',
              'cursor:grab',
              'flex-shrink:0',
              'user-select:none',
            ].join(';');

            const logoContainer = document.createElement('div');
            logoContainer.style.cssText = 'display:flex;flex-direction:column;flex:1';

            const brandRow = document.createElement('div');
            brandRow.style.cssText = 'display:flex;align-items:center;gap:8px';

            const zapIcon = document.createElement('img');
            zapIcon.src = chrome.runtime.getURL('icon.png');
            zapIcon.style.cssText = 'width:32px;height:32px;object-fit:contain;display:block;border-radius:8px;';
            zapIcon.alt = 'FocusFlow';

            const title = document.createElement('span');
            title.style.cssText = 'font-size:14px;font-weight:900;color:rgba(255,255,255,0.9);letter-spacing:-0.2px';
            title.innerHTML = 'FocusFlow <span style="color:#4F8CFF">AI</span>';

            const statusRow = document.createElement('div');
            statusRow.style.cssText = 'display:flex;align-items:center;gap:6px;margin-top:2px';
            
            const dot = document.createElement('div');
            dot.style.cssText = 'width:6px;height:6px;border-radius:50%;background:#10b981;box-shadow:0 0 8px #10b981';
            
            const statusText = document.createElement('span');
            statusText.style.cssText = 'font-size:10px;font-weight:800;color:#6b7280;text-transform:uppercase;letter-spacing:1px';
            statusText.textContent = 'Ready';

            brandRow.append(zapIcon, title);
            statusRow.append(dot, statusText);
            logoContainer.append(brandRow, statusRow);

            const controls = document.createElement('div');
            controls.style.cssText = 'display:flex;align-items:center;gap:4px';

            const minBtn = document.createElement('button');
            minBtn.style.cssText = 'background:rgba(255,255,255,0.05);border:none;color:rgba(255,255,255,0.4);border-radius:8px;width:28px;height:28px;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s';
            minBtn.textContent = '−';
            minBtn.onmouseenter = () => minBtn.style.background = 'rgba(255,255,255,0.1)';
            minBtn.onmouseleave = () => minBtn.style.background = 'rgba(255,255,255,0.05)';
            minBtn.onclick = () => {
              panel.style.transform = 'translate(100%, 0) scale(0.9)';
              panel.style.opacity = '0';
              setTimeout(() => {
                panel.style.display = 'none';
                const fab = document.getElementById(FAB_ID);
                if (fab) fab.style.display = 'flex';
              }, 400);
            };

            const closeBtn = document.createElement('button');
            closeBtn.style.cssText = 'background:rgba(255,255,255,0.05);border:none;color:rgba(255,255,255,0.4);border-radius:8px;width:28px;height:28px;font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s';
            closeBtn.textContent = '✕';
            closeBtn.onmouseenter = () => { closeBtn.style.background = 'rgba(220,38,38,0.2)'; closeBtn.style.color = '#fff'; };
            closeBtn.onmouseleave = () => { closeBtn.style.background = 'rgba(255,255,255,0.05)'; closeBtn.style.color = 'rgba(255,255,255,0.4)'; };
            closeBtn.onclick = () => {
              panel.style.transform = 'translateY(20px) scale(0.95)';
              panel.style.opacity = '0';
              setTimeout(() => panel.remove(), 300);
            };

            controls.append(minBtn, closeBtn);
            header.append(logoContainer, controls);

            // --- Drag Logic ---
            let isDragging = false;
            let currentX, currentY, initialX, initialY, xOffset = 0, yOffset = 0;

            header.addEventListener('mousedown', (e) => {
              if (e.target.tagName === 'BUTTON') return;
              initialX = e.clientX - xOffset;
              initialY = e.clientY - yOffset;
              isDragging = true;
              header.style.cursor = 'grabbing';
            });

            window.addEventListener('mousemove', (e) => {
              if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                xOffset = currentX;
                yOffset = currentY;
                panel.style.transform = `translate(${currentX}px, ${currentY}px)`;
              }
            });

            window.addEventListener('mouseup', () => {
              isDragging = false;
              header.style.cursor = 'grab';
            });

            // --- iframe Area ---
            const iframe = document.createElement('iframe');
            iframe.src = iframeUrl;
            iframe.style.cssText = 'flex:1;width:100%;border:none;background:transparent;display:block';
            iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups');

            // --- Resize Edge (Left side) ---
            const resizeHandle = document.createElement('div');
            resizeHandle.style.cssText = 'position:absolute;left:0;top:0;width:6px;height:100%;cursor:ew-resize;z-index:2147483648';
            let isResizing = false;

            resizeHandle.addEventListener('mousedown', (e) => {
              isResizing = true;
              document.body.style.cursor = 'ew-resize';
            });

            window.addEventListener('mousemove', (e) => {
              if (isResizing) {
                const newWidth = window.innerWidth - e.clientX;
                if (newWidth >= 420 && newWidth <= 850) {
                  panel.style.width = `${newWidth}px`;
                }
              }
            });

            window.addEventListener('mouseup', () => {
              isResizing = false;
              document.body.style.cursor = 'default';
            });

            panel.append(header, iframe, resizeHandle);
            document.body.appendChild(panel);

            // --- THE ORB (Minimized State) ---
            const fab = document.createElement('button');
            fab.id = FAB_ID;
            fab.style.cssText = [
              'position:fixed',
              'bottom:40px',
              'right:40px',
              'width:64px',
              'height:64px',
              'border-radius:18px',
              'background:#0d1117',
              'border:1.5px solid rgba(100,80,255,0.3)',
              'cursor:pointer',
              'z-index:2147483646',
              'box-shadow:0 12px 40px rgba(0,0,0,0.6), 0 0 30px rgba(99,66,255,0.25)',
              'display:none',
              'align-items:center',
              'justify-content:center',
              'transition:transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            ].join(';');
            
            fab.innerHTML = `<img src="${chrome.runtime.getURL('icon.png')}" style="width:56px;height:56px;object-fit:contain;display:block;border-radius:14px;" alt="FocusFlow" />`;

            // Pulse Animation
            const styleSheet = document.createElement("style");
            styleSheet.textContent = `
              @keyframes orbPulse {
                0% { box-shadow: 0 0 0 0 rgba(79, 140, 255, 0.4); }
                70% { box-shadow: 0 0 0 15px rgba(79, 140, 255, 0); }
                100% { box-shadow: 0 0 0 0 rgba(79, 140, 255, 0); }
              }
              #ff-floating-fab:hover { animation: orbPulse 1.5s infinite; }
            `;
            document.head.appendChild(styleSheet);

            fab.onmouseenter = () => fab.style.transform = 'scale(1.1) rotate(5deg)';
            fab.onmouseleave = () => fab.style.transform = 'scale(1) rotate(0deg)';
            
            fab.onclick = () => { 
              panel.style.display = 'flex'; 
              setTimeout(() => {
                panel.style.transform = 'translate(0, 0) scale(1)';
                panel.style.opacity = '1';
              }, 10);
              fab.style.display = 'none'; 
            };
            document.body.appendChild(fab);
          },
          args: [panelUrl],
        }).catch(err => console.error('FocusFlow: executeScript failed', err));

        // Close popup
        setTimeout(() => window.close(), 100);
      });
    } else if (onNavigate) {
      onNavigate("aide");
    }
  };

  const handleOpenResearchHub = () => {
    console.log('🚀 CLICK: Research Hub button clicked');
    if (chrome && chrome.tabs) {
      chrome.tabs.create({ url: chrome.runtime.getURL('index.html#research') });
      window.close();
    } else if (onNavigate) {
      onNavigate("research");
    }
  };

  return (
    <div className="w-[320px] h-[440px] flex flex-col bg-[#03040b] text-white font-sans overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/15 blur-[60px] -z-10" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-violet-600/10 blur-[60px] -z-10" />

      {/* Header Section */}
      <div className="pt-10 pb-6 px-7">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3.5">
            <img
              src="icon.png"
              alt="FocusFlow"
              className="w-12 h-12 object-contain rounded-2xl"
            />
            <div>
              <h1 className="text-xl font-black text-white tracking-tighter leading-none uppercase">FocusFlow</h1>
              <div className="flex items-center gap-1.5 mt-1.5">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em]">Enterprise AI</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex-1 px-6 py-2 space-y-5">
        <button
          onClick={handleOpenAide}
          className="group relative w-full p-5 bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-blue-500/30 rounded-[2rem] flex items-center gap-5 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10"
        >
          <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-500">
            <Sparkles className="w-6 h-6 text-blue-400" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="text-[14px] font-black text-white uppercase tracking-tight group-hover:text-blue-400 transition-colors">Aide Extension</h3>
            <p className="text-[11px] text-gray-500 font-medium mt-0.5">Real-time web synthesis</p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-700 group-hover:text-blue-400 group-hover:translate-x-1.5 transition-all duration-500" />
        </button>

        <button
          onClick={handleOpenResearchHub}
          className="group relative w-full p-5 bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-violet-500/30 rounded-[2rem] flex items-center gap-5 transition-all duration-500 hover:shadow-2xl hover:shadow-violet-500/10"
        >
          <div className="w-12 h-12 bg-violet-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-violet-500/20 transition-all duration-500">
            <Layout className="w-6 h-6 text-violet-400" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="text-[14px] font-black text-white uppercase tracking-tight group-hover:text-violet-400 transition-colors">Research Studio</h3>
            <p className="text-[11px] text-gray-500 font-medium mt-0.5">Knowledge Operating System</p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-700 group-hover:text-violet-400 group-hover:translate-x-1.5 transition-all duration-500" />
        </button>
      </div>

      {/* Footer Branding */}
      <div className="py-8 flex flex-col items-center">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.02] border border-white/[0.04]">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em]">Engine Running</span>
        </div>
      </div>
    </div>
  );
}

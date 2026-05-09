import {
  BrainCircuit,
  BookOpen,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { VIEWS } from "../constants/views";

const AideLogo = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 21L14 4H18L11 21H7Z" fill="#3b82f6"/>
    <path d="M4 21L9 9H13L8 21H4Z" fill="#1e3a8a"/>
  </svg>
);

export default function Launcher({ onNavigate }) {

  const handleOpenSidebar = () => {
    console.log('🚀 CLICK FLOW: Aide button clicked');
    console.log('🚀 CLICK FLOW: Attempting navigation to:', VIEWS.AIDE);
    
    // Direct navigation call
    if (onNavigate) {
      console.log('🚀 CLICK FLOW: Calling onNavigate(VIEWS.AIDE)');
      onNavigate(VIEWS.AIDE);
    }
  };

  const handleOpenResearchHub = () => {
    console.log('🚀 CLICK FLOW: Research Hub button clicked');
    console.log('🚀 CLICK FLOW: Attempting navigation to:', VIEWS.RESEARCH_HUB);
    
    // Direct navigation call
    if (onNavigate) {
      console.log('🚀 CLICK FLOW: Calling onNavigate(VIEWS.RESEARCH_HUB)');
      onNavigate(VIEWS.RESEARCH_HUB);
    }
  };

  return (
    <div className="w-[320px] bg-[#0a0a0b] text-[#f3f4f6] font-sans flex flex-col overflow-hidden border border-[#26272b] rounded-xl shadow-2xl">
      
      {/* Header */}
      <header className="flex flex-col items-center pt-8 pb-5 px-6">
        <AideLogo />
        <h1 className="text-lg font-semibold tracking-wide text-white mt-3">FocusFlow AI</h1>
        <p className="text-xs text-[#9ca3af] mt-1 text-center">Your AI research workspace</p>
      </header>

      {/* Navigation Cards */}
      <div className="px-5 pb-4 flex flex-col gap-3">
        
        {/* Aide Card */}
        <button
          onClick={handleOpenSidebar}
          // disabled={!isReady} // TEMPORARILY DISABLED FOR TESTING
          style={{
            background: '#111214',
            border: '1px solid #26272b',
            borderRadius: '12px',
            padding: '16px',
            color: 'white',
            width: '100%',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            position: 'relative',
            zIndex: 9999,
            pointerEvents: 'auto'
          }}
        >
          <div className="bg-[#3b82f6]/10 border border-[#3b82f6]/20 p-2.5 rounded-lg shrink-0 group-hover:bg-[#3b82f6]/20 transition-colors">
            <Sparkles className="w-5 h-5 text-[#3b82f6]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-white">Aide</h3>
            <p className="text-[11px] text-[#9ca3af] mt-0.5 leading-snug">Extract, summarize, ask & study any page</p>
          </div>
          <ChevronRight className="w-4 h-4 text-[#9ca3af] group-hover:text-[#3b82f6] transition-colors shrink-0" />
        </button>

        {/* Research Hub Card */}
        <button
          onClick={handleOpenResearchHub}
          // disabled={!isReady} // TEMPORARILY DISABLED FOR TESTING
          style={{
            background: '#111214',
            border: '1px solid #26272b',
            borderRadius: '12px',
            padding: '16px',
            color: 'white',
            width: '100%',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            position: 'relative',
            zIndex: 9999,
            pointerEvents: 'auto'
          }}
        >
          <div className="bg-[#10b981]/10 border border-[#10b981]/20 p-2.5 rounded-lg shrink-0 group-hover:bg-[#10b981]/20 transition-colors">
            <BookOpen className="w-5 h-5 text-[#10b981]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-white">Research Hub</h3>
            <p className="text-[11px] text-[#9ca3af] mt-0.5 leading-snug">Browse saved workbooks & research notes</p>
          </div>
          <ChevronRight className="w-4 h-4 text-[#9ca3af] group-hover:text-[#10b981] transition-colors shrink-0" />
        </button>

      </div>

      {/* Footer */}
      <footer className="flex items-center justify-center gap-1.5 text-[#9ca3af] py-4 border-t border-[#26272b]">
        <ShieldCheck className="w-3 h-3" />
        <span className="text-[10px]">Your data stays private and secure</span>
      </footer>
    </div>
  );
}

import { useState, useEffect } from "react";
import {
  BrainCircuit, FileText, Send, Sparkles,
  MessageSquare, List, Lightbulb, GraduationCap, Settings,
  ChevronDown, Search, Zap, Clock, ShieldCheck, X,
  Maximize2, Minus, Plus, Mic, Activity, Info, BarChart3, Database,
  CheckCircle2, Bookmark, Star
} from "lucide-react";
import { useExtension } from "../lib/extension/ExtensionProvider";
import ExtractionProgress from "./ExtractionProgress";

const tools = [
  { id: "SUMMARY",  icon: FileText,       label: "Summary" },
  { id: "EXPLAIN",  icon: Lightbulb,      label: "Explain" },
  { id: "ASK",      icon: MessageSquare,  label: "Ask" },
  { id: "POINTS",   icon: List,           label: "Key Points" },
  { id: "CARDS",    icon: GraduationCap,  label: "Flashcards" },
  { id: "VIVA",     icon: Sparkles,       label: "Viva" },
];

export default function Dashboard() {
  const { actions, extractedContent } = useExtension();
  const [activeTool, setActiveTool] = useState("SUMMARY");
  const [query, setQuery] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [hasExtracted, setHasExtracted] = useState(false);
  const [showSaveSheet, setShowSaveSheet] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowSaveSheet(false);
    };
    if (showSaveSheet) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSaveSheet]);

  useEffect(() => {
    if (extractedContent && !isExtracting) {
      setHasExtracted(true);
    }
  }, [extractedContent, isExtracting]);

  const handleStartExtraction = () => {
    setIsExtracting(true);
    setHasExtracted(false);

    actions.extractContent();
  };

  const handleExtractionComplete = () => {
    setIsExtracting(false);
    setHasExtracted(true);
  };

  return (
    <div 
      className="w-full h-full flex flex-col font-sans select-none overflow-hidden"
      style={{ backgroundColor: '#050816', color: 'white' }}
    >
      
      
      <main className="flex-1 overflow-y-auto no-scrollbar pb-24">
        
        
        <div className="px-5 pt-6 pb-2">
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-[20px] p-5">
            <div className="flex items-start gap-4">
               <div className="w-10 h-10 bg-white/[0.03] border border-white/[0.08] rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-xl font-serif text-white/40">W</span>
               </div>
               <div className="flex-1 min-w-0">
                  <h3 className="text-[14px] font-bold text-white leading-tight truncate">Artificial Intelligence – Wikipedia</h3>
                  <a href="#" className="text-[11px] text-blue-400 hover:underline mt-1 block">en.wikipedia.org ↗</a>
                  <div className="flex items-center gap-4 mt-3 text-[11px] text-gray-500 font-medium">
                    <span className="flex items-center gap-1.5"><Clock size={12} /> 12 min read</span>
                    <span className="flex items-center gap-1.5"><Activity size={12} /> 3,240 words</span>
                  </div>
               </div>
               <div className="flex flex-col items-end gap-3">
                  <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full border ${hasExtracted ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/[0.03] border-white/[0.05]'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${hasExtracted ? 'bg-emerald-500' : 'bg-gray-600'}`} />
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${hasExtracted ? 'text-emerald-500' : 'text-gray-500'}`}>
                      {hasExtracted ? 'Extracted' : 'Not extracted'}
                    </span>
                  </div>
                  {!hasExtracted && !isExtracting && (
                    <button 
                      onClick={handleStartExtraction}
                      className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-black uppercase tracking-wider shadow-lg shadow-blue-600/20 active:scale-95 transition-all animate-in fade-in zoom-in-95"
                    >
                      <Zap size={14} fill="white" /> Extract
                    </button>
                  )}
               </div>
            </div>
          </div>
        </div>

        
        <div className="px-5 py-6">
          <div className="grid grid-cols-3 gap-3">
            {tools.map(t => {
               const Icon = t.icon;
               const isActive = activeTool === t.id;
               

               const colors = {
                 SUMMARY: { bg: 'bg-blue-500/5', border: 'border-blue-500/20', text: 'text-blue-400', glow: 'shadow-blue-500/10' },
                 EXPLAIN: { bg: 'bg-amber-500/5', border: 'border-amber-500/20', text: 'text-amber-400', glow: 'shadow-amber-500/10' },
                 ASK:     { bg: 'bg-emerald-500/5', border: 'border-emerald-500/20', text: 'text-emerald-400', glow: 'shadow-emerald-500/10' },
                 POINTS:  { bg: 'bg-violet-500/5', border: 'border-violet-500/20', text: 'text-violet-400', glow: 'shadow-violet-500/10' },
                 CARDS:   { bg: 'bg-rose-500/5', border: 'border-rose-500/20', text: 'text-rose-400', glow: 'shadow-rose-500/10' },
                 VIVA:    { bg: 'bg-pink-500/5', border: 'border-pink-500/20', text: 'text-pink-400', glow: 'shadow-pink-500/10' },
               };
               
               const theme = colors[t.id] || colors.SUMMARY;

               return (
                 <button 
                   key={t.id}
                   onClick={() => setActiveTool(t.id)}
                   className={`group flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border transition-all duration-300 ${
                     isActive 
                       ? `${theme.bg} ${theme.border} ${theme.text} ${theme.glow} ring-1 ring-white/10` 
                       : 'bg-white/[0.02] border-white/[0.05] text-gray-500 hover:bg-white/[0.04] hover:border-white/[0.1] hover:text-white/80'
                   } active:scale-95`}
                 >
                   <div className={`p-2.5 rounded-xl transition-transform duration-300 group-hover:scale-110 ${isActive ? 'bg-white/10' : 'bg-white/[0.03]'}`}>
                     <Icon size={18} strokeWidth={2.5} />
                   </div>
                   <span className="text-[11px] font-black uppercase tracking-wider">{t.label}</span>
                 </button>
               );
            })}
          </div>
        </div>

        
        <div className="px-5">
           {isExtracting ? (
             
             <div className="bg-white/[0.01] border border-white/[0.05] rounded-[24px]">
               <ExtractionProgress onComplete={handleExtractionComplete} />
             </div>
           ) : !hasExtracted ? (
             
             <div className="flex flex-col items-center justify-center py-12 bg-white/[0.01] border border-dashed border-white/[0.05] rounded-[24px] text-center gap-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="w-16 h-16 bg-blue-500/10 rounded-[20px] flex items-center justify-center relative">
                   <FileText size={32} className="text-blue-500/40" />
                   <div className="absolute inset-0 bg-blue-500/5 blur-xl rounded-full" />
                </div>
                <div>
                  <h2 className="text-[16px] font-black text-white/90">Ready to analyze this page</h2>
                  <p className="text-[12px] text-gray-500 mt-2 max-w-[240px] leading-relaxed font-medium">
                    Extract the content to generate summaries, key points, explanations, and more.
                  </p>
                </div>
                <button 
                  onClick={handleStartExtraction}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[12px] font-black uppercase tracking-wider shadow-xl shadow-blue-600/25 active:scale-95 transition-all"
                >
                  <Zap size={16} fill="white" /> Extract Content
                </button>
             </div>
           ) : (
             
             <div className="flex flex-col gap-6 animate-in fade-in duration-500">
                {hasExtracted ? (
                  
                  <div className="relative group animate-in slide-in-from-bottom-4 duration-1000">
                    
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-violet-600/20 rounded-[32px] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
                    
                    <div className="relative bg-[#0a0c1a]/80 backdrop-blur-3xl border border-white/[0.08] rounded-[28px] p-8 shadow-2xl overflow-hidden">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                              <Sparkles size={16} className="text-blue-400" />
                           </div>
                           <div>
                              <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Deep Analysis</span>
                              <h4 className="text-[14px] font-black text-white/90 uppercase tracking-tight">{activeTool} Mode</h4>
                           </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                           <CheckCircle2 size={10} /> Verified Insight
                        </div>
                      </div>

                      <div className="text-[15px] leading-[1.8] text-white/80 font-medium space-y-4">
                        <p>
                          Artificial Intelligence (AI) refers to the simulation of human intelligence in machines that are programmed to think like humans and mimic their actions. The term may also be applied to any machine that exhibits traits associated with a human mind such as learning and problem-solving.
                        </p>
                        <p>
                          This specific analysis has identified key structural patterns in the source document, emphasizing the convergence of neural network scalability and real-time processing efficiency.
                        </p>
                      </div>

                      
                      <div className="mt-8 pt-6 border-t border-white/[0.04] flex items-center justify-between text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                         <span>Processed in 1.2s</span>
                         <div className="flex gap-4">
                            <button className="hover:text-blue-400 transition-colors">Copy Report</button>
                            <button className="hover:text-blue-400 transition-colors">Save to Studio</button>
                         </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-600 italic text-[11px] font-bold uppercase tracking-widest">
                     Analyzing research context...
                  </div>
                )}
                <div className="h-32" />
             </div>
           )}
        </div>
      </main>

      
      {showSaveSheet && (
        <>
          <div 
            className="absolute inset-0 bg-[#050816]/60 backdrop-blur-sm z-40 animate-in fade-in duration-300"
            onClick={() => setShowSaveSheet(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 z-50 bg-[#0a0c1a]/95 backdrop-blur-2xl border-t border-white/[0.08] rounded-t-[32px] p-6 shadow-[0_-20px_40px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-full duration-300 max-h-[85vh] overflow-y-auto no-scrollbar">
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                      <Bookmark size={20} className="text-blue-500 fill-blue-500/20" />
                   </div>
                   <div>
                      <h3 className="text-[16px] font-bold text-white">Save to Research Hub</h3>
                      <p className="text-[12px] text-gray-500 font-medium">Organize and revisit your knowledge</p>
                   </div>
                </div>
                <button 
                  onClick={() => setShowSaveSheet(false)}
                  className="p-2 text-gray-500 hover:text-white transition-colors bg-white/[0.05] rounded-xl"
                >
                  <X size={16} />
                </button>
             </div>

             <div className="flex gap-6">
                
                <div className="flex-1 space-y-3">
                   <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Select Workbook</h4>
                   
                   <div className="p-3 bg-white/[0.03] hover:bg-white/[0.06] border border-blue-500/30 rounded-2xl flex items-center justify-between cursor-pointer transition-colors">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30" />
                         <div>
                            <h5 className="text-[13px] font-bold text-white">AI Research</h5>
                            <p className="text-[11px] text-gray-500">24 notes • Updated 2h ago</p>
                         </div>
                      </div>
                      <Star size={16} className="text-gray-600" />
                   </div>

                   <div className="p-3 bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] rounded-2xl flex items-center justify-between cursor-pointer transition-colors">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30" />
                         <div>
                            <h5 className="text-[13px] font-bold text-white">Machine Learning Notes</h5>
                            <p className="text-[11px] text-gray-500">18 notes • Updated yesterday</p>
                         </div>
                      </div>
                      <Star size={16} className="text-gray-600" />
                   </div>

                   <div className="p-3 bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] rounded-2xl flex items-center justify-between cursor-pointer transition-colors">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30" />
                         <div>
                            <h5 className="text-[13px] font-bold text-white">DSA Preparation</h5>
                            <p className="text-[11px] text-gray-500">31 notes • Updated 3d ago</p>
                         </div>
                      </div>
                      <Star size={16} className="text-gray-600" />
                   </div>
                   
                   <div className="p-3 border border-dashed border-white/[0.1] hover:border-blue-500/50 rounded-2xl flex items-center justify-center cursor-pointer transition-colors text-blue-400 gap-2 h-14">
                      <Plus size={16} />
                      <span className="text-[12px] font-bold">Create New Workbook</span>
                   </div>
                </div>

                
                <div className="flex-1 flex flex-col justify-between">
                   <div>
                     <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">What to Save</h4>
                     <div className="grid grid-cols-2 gap-2">
                        <button className="px-4 py-2.5 bg-blue-500/10 border border-blue-500/30 rounded-xl text-[12px] font-bold text-blue-400 flex items-center gap-2">
                          <FileText size={14} /> Summary
                        </button>
                        <button className="px-4 py-2.5 bg-white/[0.03] border border-white/[0.05] rounded-xl text-[12px] font-bold text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                          <List size={14} /> Key Points
                        </button>
                        <button className="px-4 py-2.5 bg-white/[0.03] border border-white/[0.05] rounded-xl text-[12px] font-bold text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                          <Database size={14} /> Full Content
                        </button>
                        <button className="px-4 py-2.5 bg-white/[0.03] border border-white/[0.05] rounded-xl text-[12px] font-bold text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                          <GraduationCap size={14} /> Flashcards
                        </button>
                        <button className="px-4 py-2.5 bg-white/[0.03] border border-white/[0.05] rounded-xl text-[12px] font-bold text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                          <Sparkles size={14} /> Viva Notes
                        </button>
                     </div>
                   </div>

                   <div className="mt-6">
                     <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Add Tags (Optional)</h4>
                     <div className="flex flex-wrap gap-2 mb-6">
                        <span className="px-3 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[11px] text-gray-400 font-bold hover:bg-white/[0.08] cursor-pointer">AI</span>
                        <span className="px-3 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[11px] text-gray-400 font-bold hover:bg-white/[0.08] cursor-pointer">Research</span>
                        <span className="px-3 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[11px] text-gray-400 font-bold hover:bg-white/[0.08] cursor-pointer">ML</span>
                        <span className="px-3 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[11px] text-gray-400 font-bold hover:bg-white/[0.08] cursor-pointer">Study</span>
                        <button className="px-3 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[11px] text-gray-400 font-bold hover:text-white cursor-pointer"><Plus size={14} /></button>
                     </div>

                     <button 
                       onClick={() => setShowSaveSheet(false)}
                       className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white font-black text-[13px] uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 active:scale-95 transition-all"
                     >
                        <Bookmark size={16} fill="white" /> Save to Workbook
                     </button>
                   </div>
                </div>
             </div>
             
             <div className="mt-4 pt-4 border-t border-white/[0.04] flex items-center justify-center gap-2 text-[10px] font-medium text-gray-600">
               <ShieldCheck size={12} /> Your data is private and secure
             </div>
          </div>
        </>
      )}

      
      <footer className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#050816] via-[#050816] to-transparent">
        <div className="bg-white/[0.02] border border-white/[0.08] rounded-[24px] p-2 flex items-center gap-2 shadow-2xl shadow-black/50">
           <button 
             onClick={() => setShowSaveSheet(true)}
             className="flex flex-col items-center justify-center w-12 h-11 text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-xl"
           >
              <Bookmark size={16} />
              <span className="text-[8px] font-black uppercase mt-0.5 tracking-widest">Save</span>
           </button>
           <div className="flex-1 flex items-center gap-3 px-2">
              <button className="flex items-center gap-2 text-[12px] font-bold text-gray-400 hover:text-white transition-colors">
                <Zap size={14} className="text-blue-400" /> Quick Prompts <ChevronDown size={14} />
              </button>
              <div className="w-[1px] h-4 bg-white/[0.08]" />
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask FocusFlow anything..."
                className="bg-transparent border-none focus:outline-none flex-1 text-[13px] text-white placeholder-gray-600"
              />
           </div>
           <button className="p-2.5 text-gray-500 hover:text-white transition-colors">
              <Mic size={18} />
           </button>
           <button className={`p-2.5 rounded-xl transition-all ${query.trim() ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-white/[0.03] text-gray-600'}`}>
              <Send size={18} fill={query.trim() ? "white" : "none"} />
           </button>
        </div>
        
        <div className="flex items-center justify-center gap-6 mt-4 pb-1">
           <div className="flex items-center gap-2 text-[9px] font-bold text-gray-600 uppercase tracking-widest">
              <ShieldCheck size={12} /> End-to-end encrypted
           </div>
           <div className="flex items-center gap-2 text-[9px] font-bold text-gray-600 uppercase tracking-widest">
              <div className="w-1 h-1 rounded-full bg-emerald-500" /> Real-time context
           </div>
        </div>
      </footer>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import {
  ChevronsLeft, ChevronsRight, Home, Library, Clock, Bookmark,
  Folder, LayoutGrid, Users, Sparkles, BrainCircuit, Zap,
  MoreHorizontal, Search, UserPlus, Star, Plus, FileText, Send,
  Paperclip, FileJson, GraduationCap, ThumbsUp, ThumbsDown, Copy,
  ExternalLink, ChevronDown, Activity, CheckCircle2, ChevronRight, BookOpen
} from "lucide-react";

export default function Workbook({ title = "AI Research", onBack }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [insights, setInsights] = useState({ keyInsights: [], topEntities: [] });
  const [isInsightsLoading, setIsInsightsLoading] = useState(true);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isChatLoading]);

  useEffect(() => {
    const fetchInsights = async () => {
      setIsInsightsLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/ai/workbook-insights?workbook=${encodeURIComponent(title)}`);
        const data = await res.json();
        setInsights(data);
      } catch (err) {
        console.error("Failed to fetch insights", err);
      } finally {
        setIsInsightsLoading(false);
      }
    };
    fetchInsights();
  }, [title]);

  const handleSendMessage = async () => {
    if (!query.trim() || isChatLoading) return;
    
    const userMsg = { role: "user", text: query, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
    setMessages(prev => [...prev, userMsg]);
    setQuery("");
    setIsChatLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/ai/workbook-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workbook: title, query: userMsg.text })
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, { role: "assistant", data }]);
    } catch (err) {
      console.error("Chat failed", err);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex bg-[#0a0c14] text-white font-sans overflow-hidden">
      
      
      <div 
        className={`${isCollapsed ? 'w-[72px]' : 'w-[260px]'} bg-[#05060b] border-r border-white/[0.05] flex flex-col shrink-0 z-20 transition-all duration-300 ease-in-out`}
      >
        <div className={`h-16 flex items-center ${isCollapsed ? 'justify-center' : 'px-6 justify-between'} mb-2 border-b border-white/[0.02]`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-900/20 shrink-0">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            {!isCollapsed && (
              <div className="animate-in fade-in duration-300">
                <h1 className="text-sm font-black tracking-tighter text-white leading-none">FocusFlow</h1>
                <span className="text-[9px] font-bold text-blue-500 tracking-widest uppercase">Studio</span>
              </div>
            )}
          </div>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-1.5 text-gray-500 hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors ${isCollapsed ? 'hidden' : 'block'}`}
          >
            <ChevronsLeft size={16} />
          </button>
        </div>

        {isCollapsed && (
          <div className="flex justify-center mb-6">
             <button 
                onClick={() => setIsCollapsed(false)}
                className="p-1.5 text-gray-500 hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors mt-2"
              >
                <ChevronsRight size={16} />
              </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-3 space-y-6 custom-scrollbar pb-6">
          <NavSection title="Discovery" isCollapsed={isCollapsed}>
            <NavItem icon={Home} label="Home" isCollapsed={isCollapsed} onClick={onBack} />
            <NavItem icon={Library} label="Knowledge Base" isCollapsed={isCollapsed} />
            <NavItem icon={Clock} label="Recent Sessions" isCollapsed={isCollapsed} />
            <NavItem icon={Bookmark} label="Pinned Insights" count={3} isCollapsed={isCollapsed} />
          </NavSection>

          <NavSection title="Workspaces" isCollapsed={isCollapsed}>
            <NavItem icon={Folder} label="All Workbooks" isCollapsed={isCollapsed} active />
            <NavItem icon={LayoutGrid} label="Collections" isCollapsed={isCollapsed} />
            <NavItem icon={Users} label="Shared with Me" isCollapsed={isCollapsed} />
          </NavSection>

          <NavSection title="Tools" isCollapsed={isCollapsed}>
            <NavItem icon={LayoutGrid} label="Flashcards" isCollapsed={isCollapsed} />
            <NavItem icon={Sparkles} label="Viva Practice" isCollapsed={isCollapsed} />
            <NavItem icon={BrainCircuit} label="AI Assistant" isCollapsed={isCollapsed} />
          </NavSection>

          {!isCollapsed && (
            <div className="mt-4 p-4 bg-gradient-to-b from-white/[0.04] to-transparent border border-white/[0.05] rounded-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-3 opacity-20"><Zap size={40} /></div>
               <h4 className="text-[12px] font-bold text-orange-400 flex items-center gap-1.5 mb-1.5">👑 Pro Plan</h4>
               <p className="text-[10px] text-gray-400 leading-relaxed mb-3">Unlock unlimited access to all features and AI tools.</p>
               <button className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold rounded-lg transition-colors">Upgrade Plan</button>
            </div>
          )}
        </div>

        <div className={`p-4 border-t border-white/[0.05] flex ${isCollapsed ? 'justify-center' : 'items-center gap-3'} transition-all`}>
           <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0 cursor-pointer hover:bg-white/20 transition-colors">
              LA
           </div>
           {!isCollapsed && (
             <>
               <div className="flex-1 min-w-0">
                  <h5 className="text-[12px] font-bold text-white truncate">Lakshya</h5>
                  <p className="text-[10px] text-gray-500 truncate">lakshya@example.com</p>
               </div>
               <MoreHorizontal className="w-4 h-4 text-gray-500 cursor-pointer hover:text-white transition-colors" />
             </>
           )}
        </div>
      </div>

      
      <div className="w-[280px] bg-[#080911] border-r border-white/[0.05] flex flex-col shrink-0 z-10 hidden md:flex">
         <div className="h-16 flex items-center px-5 border-b border-white/[0.02] shrink-0">
            <h2 className="text-[11px] font-black text-gray-500 uppercase tracking-widest flex items-center justify-between w-full">
               Workbook Contents
               <button className="text-gray-500 hover:text-white transition-colors"><Plus size={14} /></button>
            </h2>
         </div>

         <div className="flex-1 overflow-y-auto px-3 py-5 custom-scrollbar space-y-6">
            
            <div className="space-y-1">
               <WorkbookNavItem icon={Home} label="Overview" active />
            </div>

            <div className="space-y-1">
               <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-2 mb-2">Saved Pages</h3>
               <WorkbookDocItem label="What is Artificial Intelligence?" />
               <WorkbookDocItem label="History of AI" activeIndicator />
               <WorkbookDocItem label="Machine Learning Basics" />
               <WorkbookDocItem label="Deep Learning Explained" />
               <WorkbookDocItem label="Large Language Models (LLMs)" />
               <button className="text-[11px] font-bold text-gray-500 hover:text-white transition-colors px-2 mt-2">Show 6 more</button>
            </div>

            <div className="space-y-1">
               <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-2 mb-2">Notes</h3>
               <WorkbookDocItem icon={FileJson} label="Key Concepts" />
               <WorkbookDocItem icon={FileJson} label="Research Notes" activeIndicator />
               <WorkbookDocItem icon={FileJson} label="Interesting Findings" />
               <button className="text-[11px] font-bold text-gray-500 hover:text-white transition-colors px-2 mt-2">Show 3 more</button>
            </div>

            <div className="space-y-1">
               <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-2 mb-2">Flashcards</h3>
               <WorkbookDocItem icon={Activity} label="AI Fundamentals" />
               <WorkbookDocItem icon={Activity} label="Model Architectures" />
               <button className="text-[11px] font-bold text-gray-500 hover:text-white transition-colors px-2 mt-2">Show 2 more</button>
            </div>

            <div className="space-y-1">
               <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-2 mb-2">Viva Sessions</h3>
               <WorkbookDocItem icon={GraduationCap} label="AI Basics Viva" />
               <WorkbookDocItem icon={GraduationCap} label="Deep Learning Viva" />
            </div>

            <div className="space-y-1">
               <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-2 mb-2">AI Syntheses</h3>
               <WorkbookDocItem icon={Sparkles} label="AI Research Summary" />
               <WorkbookDocItem icon={FileText} label="Trends & Insights" />
            </div>

         </div>
      </div>

      
      <div className="flex-1 flex flex-col min-w-0 bg-[#0a0c14] relative">
         
         <div className="h-auto py-3 min-h-[64px] flex items-center justify-between px-8 border-b border-white/[0.02] shrink-0 bg-[#05060b]/50 backdrop-blur-xl absolute top-0 left-0 right-0 z-20">
            <div className="flex items-center gap-4">
               <div className="w-9 h-9 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center shrink-0">
                  <Folder className="w-4 h-4 text-emerald-500" />
               </div>
               <div className="flex flex-col justify-center">
                  <h2 className="text-[14px] font-bold text-white flex items-center gap-2">
                     {title} <ChevronDown size={14} className="text-gray-500" />
                  </h2>
                  <div className="flex items-center gap-2 text-[11px] text-gray-500 font-medium mt-0.5">
                     <span>Active Workspace</span> • <span>You</span> 
                     <span className="px-1.5 py-[1px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded font-bold uppercase tracking-widest text-[8px]">Active</span>
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-4">
               <div className="relative group w-[240px]">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="Search in this workbook..."
                    className="w-full bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] focus:border-blue-500/50 rounded-xl pl-9 pr-9 py-1.5 text-[12px] text-white placeholder-gray-500 focus:outline-none transition-all"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-50">
                     <span className="text-[9px] font-bold border border-white/20 rounded px-1 py-0.5">⌘</span>
                     <span className="text-[9px] font-bold border border-white/20 rounded px-1 py-0.5">K</span>
                  </div>
               </div>

               <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] rounded-lg text-[12px] font-bold text-white flex items-center gap-2 transition-colors">
                     <UserPlus size={14} /> Share
                  </button>
                  <button className="p-1.5 text-gray-400 hover:text-white hover:bg-white/[0.05] border border-white/[0.05] rounded-lg transition-colors">
                     <Star size={14} />
                  </button>
                  <button className="p-1.5 text-gray-400 hover:text-white hover:bg-white/[0.05] border border-white/[0.05] rounded-lg transition-colors">
                     <MoreHorizontal size={14} />
                  </button>
               </div>
            </div>
         </div>

         
         <div className="flex-1 overflow-y-auto px-8 pt-24 pb-32 custom-scrollbar flex flex-col">
            <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col justify-end space-y-8">
               
               {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center text-center py-10 opacity-60">
                     <BrainCircuit className="w-10 h-10 text-blue-500 mb-4" />
                     <h3 className="text-xl font-bold text-white mb-2">AI Research Copilot</h3>
                     <p className="text-sm text-gray-400">Your AI research partner. Ask anything about your workspace.</p>
                  </div>
               )}

               {messages.map((msg, idx) => (
                  msg.role === "user" ? (
                     <div key={idx} className="flex justify-end animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex items-end gap-3 max-w-[80%]">
                           <div className="bg-[#1e1e2d] text-white px-5 py-3.5 rounded-2xl rounded-tr-sm text-[14px] leading-relaxed shadow-lg">
                              {msg.text}
                              <div className="text-right text-[10px] text-gray-500 mt-2">{msg.time}</div>
                           </div>
                           <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold shrink-0 shadow-lg">
                              LA
                           </div>
                        </div>
                     </div>
                  ) : (
                     <div key={idx} className="flex items-start gap-4 animate-in fade-in slide-in-from-bottom-6 duration-500">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                           <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 bg-white/[0.02] border border-white/[0.05] rounded-[24px] rounded-tl-sm p-6 shadow-xl">
                           <p className="text-[14px] text-gray-300 mb-6 font-medium">{msg.data?.introText || "Here are some insights:"}</p>
                           
                           {msg.data?.insights && msg.data.insights.length > 0 && (
                              <div className="space-y-4 mb-6">
                                 {msg.data.insights.map((insight, i) => (
                                    <StructuredInsight 
                                      key={i} 
                                      number={i + 1} 
                                      color={insight.color || "bg-blue-500/20 text-blue-400"} 
                                      title={insight.title} 
                                      desc={insight.desc} 
                                      sources={insight.sources} 
                                    />
                                 ))}
                              </div>
                           )}

                           <div className="flex items-center justify-between pt-4 border-t border-white/[0.04]">
                              <div className="flex items-center gap-4">
                                 <button className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 hover:text-white transition-colors">
                                    <Copy size={12} /> Copy
                                 </button>
                                 <button className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 hover:text-white transition-colors">
                                    <ExternalLink size={12} /> Save as note
                                 </button>
                              </div>
                              <div className="flex items-center gap-2">
                                 <button className="p-1.5 text-gray-500 hover:text-green-400 transition-colors rounded-lg hover:bg-green-400/10"><ThumbsUp size={14}/></button>
                                 <button className="p-1.5 text-gray-500 hover:text-red-400 transition-colors rounded-lg hover:bg-red-400/10"><ThumbsDown size={14}/></button>
                              </div>
                           </div>
                        </div>
                     </div>
                  )
               ))}

               {isChatLoading && (
                  <div className="flex items-start gap-4 animate-in fade-in">
                     <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20 animate-pulse">
                        <BrainCircuit className="w-4 h-4 text-white" />
                     </div>
                     <div className="flex-1 bg-white/[0.02] border border-white/[0.05] rounded-[24px] rounded-tl-sm p-6 shadow-xl">
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
                           <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{animationDelay: '0.2s'}} />
                           <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{animationDelay: '0.4s'}} />
                        </div>
                     </div>
                  </div>
               )}
               <div ref={chatEndRef} />

            </div>
         </div>

         
         <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#0a0c14] via-[#0a0c14] to-transparent pointer-events-none z-20">
            <div className="max-w-3xl mx-auto pointer-events-auto">
               
               <div className="bg-[#05060b] border border-white/[0.08] rounded-2xl p-2 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                  <div className="relative flex items-center">
                     <button className="p-2.5 text-gray-500 hover:text-white transition-colors rounded-xl hover:bg-white/[0.05]">
                        <Paperclip size={18} />
                     </button>
                     <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => { if(e.key === 'Enter') handleSendMessage(); }}
                        placeholder="Ask anything about your research..."
                        className="flex-1 bg-transparent border-none px-3 py-3 text-[14px] text-white placeholder-gray-500 focus:outline-none"
                     />
                     <button onClick={handleSendMessage} className={`p-2.5 rounded-xl transition-all ${query.trim() ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-white/[0.03] text-gray-600'}`}>
                        <Send size={18} fill={query.trim() ? "white" : "none"} />
                     </button>
                  </div>
               </div>

               <div className="flex items-center gap-2 mt-4 overflow-x-auto no-scrollbar pb-2">
                  <QuickPill icon={FileText} text="Summarize this workbook" />
                  <QuickPill icon={BrainCircuit} text="Find connections" />
                  <QuickPill icon={BookOpen} text="Generate study guide" />
                  <QuickPill icon={LayoutGrid} text="Create flashcards" />
               </div>

            </div>
         </div>
      </div>

      
      <div className="w-[320px] bg-[#05060b] border-l border-white/[0.05] flex flex-col shrink-0 z-10 hidden lg:flex">
         
         <div className="p-6 border-b border-white/[0.02]">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Context</h3>
            <div className="flex items-center gap-6 border-b border-white/[0.05]">
               <button className="text-[13px] font-bold text-blue-500 pb-2 border-b-2 border-blue-500">Insights</button>
               <button className="text-[13px] font-bold text-gray-500 pb-2 border-b-2 border-transparent hover:text-white transition-colors">Connections</button>
               <button className="text-[13px] font-bold text-gray-500 pb-2 border-b-2 border-transparent hover:text-white transition-colors">Sources</button>
            </div>
         </div>

         <div className="flex-1 overflow-y-auto px-6 py-2 custom-scrollbar space-y-8">
            
            {isInsightsLoading ? (
               <div className="py-10 flex justify-center"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>
            ) : (
               <>
                  
                  <div>
                     <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3">Key Insights</h3>
                     <div className="space-y-3">
                        {insights.keyInsights?.length > 0 ? insights.keyInsights.map((item, idx) => (
                           <InsightCard 
                             key={idx}
                             title={item.title} color={item.color || "text-emerald-400"} 
                             desc={item.desc} 
                             chartColor={item.chartColor || "border-emerald-500"} 
                           />
                        )) : <p className="text-xs text-gray-500">Not enough data to generate insights.</p>}
                     </div>
                  </div>

                  
                  <div className="mt-8">
                     <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3">Top Entities</h3>
                     <div className="space-y-1">
                        {insights.topEntities?.length > 0 ? insights.topEntities.map((item, idx) => (
                           <EntityRow 
                             key={idx}
                             label={item.label} count={item.count} icon={BrainCircuit} color={item.color || "text-blue-500"} 
                           />
                        )) : <p className="text-xs text-gray-500">No entities found.</p>}
                     </div>
                  </div>
               </>
            )}

            
            <div>
               <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3">Suggested Actions</h3>
               <div className="space-y-2">
                  <SuggestedAction icon={FileText} label="Review notes on AI Ethics" />
                  <SuggestedAction icon={LayoutGrid} label="Create flashcards from LLMs notes" />
                  <SuggestedAction icon={CheckCircle2} label="Generate summary of all saved pages" />
               </div>
            </div>

         </div>

      </div>

    </div>
  );
}

function NavSection({ title, children, isCollapsed }) {
  if (isCollapsed) return <div className="space-y-2 mb-4">{children}</div>;
  return (
    <div className="space-y-1 mb-2">
      <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-3 mb-2">{title}</h3>
      {children}
    </div>
  );
}

function NavItem({ icon: Icon, label, active, count, isCollapsed, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center ${isCollapsed ? 'justify-center w-10 h-10 mx-auto' : 'justify-between w-full px-3 py-2'} rounded-xl transition-all duration-300 group
        ${active ? "bg-blue-600/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/[0.03]"}
      `}
      title={isCollapsed ? label : undefined}
    >
      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
        <Icon className={`w-4 h-4 transition-colors duration-300 ${active ? "text-blue-500" : "text-gray-500 group-hover:text-gray-300"}`} />
        {!isCollapsed && (
          <span className={`text-[13px] font-bold ${active ? "text-white" : "text-gray-400 group-hover:text-white"}`}>{label}</span>
        )}
      </div>
      {!isCollapsed && count && (
        <span className="text-[10px] font-black bg-white/[0.05] border border-white/[0.05] px-2 py-0.5 rounded-full text-white">
          {count}
        </span>
      )}
    </button>
  );
}

function WorkbookNavItem({ icon: Icon, label, active }) {
  return (
    <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[12px] font-bold transition-all ${active ? 'bg-blue-600/10 text-white' : 'text-gray-400 hover:bg-white/[0.03] hover:text-white'}`}>
      <Icon size={16} className={active ? 'text-blue-500' : 'text-gray-500'} /> {label}
    </button>
  );
}

function WorkbookDocItem({ icon: Icon = FileText, label, activeIndicator }) {
  return (
    <button className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[12px] font-medium text-gray-400 hover:text-white hover:bg-white/[0.02] transition-colors group">
      <div className="flex items-center gap-3 min-w-0">
         <Icon size={14} className="text-gray-600 group-hover:text-gray-400 shrink-0" />
         <span className="truncate">{label}</span>
      </div>
      {activeIndicator && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />}
    </button>
  );
}

function StructuredInsight({ number, color, title, desc, sources }) {
  return (
    <div className="flex gap-4 p-4 rounded-xl border border-white/[0.03] bg-white/[0.01] hover:bg-white/[0.03] transition-colors cursor-pointer group">
       <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 ${color}`}>
          {number}
       </div>
       <div>
          <h4 className="text-[13px] font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{title}</h4>
          <p className="text-[12px] text-gray-400 mb-2 leading-relaxed">{desc}</p>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{sources}</span>
       </div>
    </div>
  );
}

function QuickPill({ icon: Icon, text }) {
  return (
    <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] text-[11px] font-bold text-gray-400 hover:text-white transition-colors whitespace-nowrap">
      <Icon size={12} className="text-gray-500" /> {text}
    </button>
  );
}

function InsightCard({ title, desc, color, chartColor }) {
  return (
    <div className="p-4 rounded-xl border border-white/[0.03] bg-white/[0.01] hover:bg-white/[0.03] transition-colors group cursor-pointer">
       <h4 className={`text-[12px] font-bold mb-1 ${color}`}>{title}</h4>
       <p className="text-[11px] text-gray-400 leading-relaxed mb-3">{desc}</p>
       
       <div className="h-4 flex items-end gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
          <div className={`w-full border-t border-dashed ${chartColor} transform -skew-y-12`} />
       </div>
    </div>
  );
}

function EntityRow({ label, count, icon: Icon, color }) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.03] transition-colors cursor-pointer group">
       <div className="flex items-center gap-3">
          <Icon size={14} className={`${color} opacity-80 group-hover:opacity-100`} />
          <span className="text-[12px] font-bold text-gray-300 group-hover:text-white">{label}</span>
       </div>
       <span className="text-[11px] font-black text-gray-600 bg-white/[0.03] px-2 py-0.5 rounded-md">{count}</span>
    </div>
  );
}

function SuggestedAction({ icon: Icon, label }) {
  return (
    <button className="w-full flex items-center gap-3 p-3 rounded-xl border border-white/[0.03] bg-white/[0.01] hover:bg-white/[0.05] transition-colors text-left group">
       <Icon size={14} className="text-gray-500 group-hover:text-blue-400 transition-colors shrink-0" />
       <span className="text-[11px] font-bold text-gray-400 group-hover:text-white transition-colors leading-snug">{label}</span>
    </button>
  );
}

import { useState, useEffect, useRef } from "react";
import { ChevronsLeft, ChevronsRight, Home, Library, Clock, Bookmark, Folder, LayoutGrid, Users, Sparkles, BrainCircuit, Zap, MoreHorizontal, Search, UserPlus, Star, Plus, FileText, Send, Paperclip, FileJson, GraduationCap, ThumbsUp, ThumbsDown, Copy, ExternalLink, ChevronDown, Activity, CheckCircle2, ChevronRight, BookOpen } from "lucide-react";
import api from "../services/api";
const insightBadgeColors = ["bg-emerald-500/20 text-emerald-400", "bg-blue-500/20 text-blue-400", "bg-violet-500/20 text-violet-400", "bg-orange-500/20 text-orange-400"];
const insightTextColors = ["text-emerald-400", "text-blue-400", "text-violet-400", "text-orange-400"];
const normalizeBadgeColor = (color, index = 0) => String(color || "").startsWith("bg-") ? color : insightBadgeColors[index % insightBadgeColors.length];
const normalizeTextColor = (color, index = 0) => String(color || "").startsWith("text-") ? color : insightTextColors[index % insightTextColors.length];
export default function Workbook({
  title = "AI Research",
  initialPrompt = "",
  onBack
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [insights, setInsights] = useState({
    keyInsights: [],
    topEntities: []
  });
  const [isInsightsLoading, setIsInsightsLoading] = useState(true);
  const [researchItems, setResearchItems] = useState([]);
  const [activeContent, setActiveContent] = useState("overview");
  const [selectedItem, setSelectedItem] = useState(null);
  const [workbookSearch, setWorkbookSearch] = useState("");
  const [contextTab, setContextTab] = useState("insights");
  const [statusMessage, setStatusMessage] = useState("");
  const [isStarred, setIsStarred] = useState(false);
  const chatEndRef = useRef(null);
  const initialPromptSent = useRef(false);
  const refreshWorkbookData = async () => {
    try {
      const res = await api.get(`/api/research?workbook=${encodeURIComponent(title)}`);
      const data = Array.isArray(res.data) ? res.data : [];
      setResearchItems(data);
      setSelectedItem(current => current && data.some(item => item._id === current._id) ? current : data[0] || null);
    } catch (err) {
      console.error("Failed to fetch workbook items", err);
      setResearchItems([]);
      setSelectedItem(null);
    }
  };
  const refreshInsights = async () => {
    setIsInsightsLoading(true);
    try {
      const res = await api.get(`/api/ai/workbook-insights?workbook=${encodeURIComponent(title)}`);
      setInsights(res.data || {
        keyInsights: [],
        topEntities: []
      });
    } catch (err) {
      console.error("Failed to fetch insights", err);
    } finally {
      setIsInsightsLoading(false);
    }
  };
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages, isChatLoading]);
  useEffect(() => {
    refreshWorkbookData();
  }, [title]);
  useEffect(() => {
    refreshInsights();
  }, [title]);
  const filteredResearchItems = researchItems.filter(item => {
    const text = [item.topic, item.summary, item.notes, item.link, ...(item.tags || [])].filter(Boolean).join(" ").toLowerCase();
    return text.includes(workbookSearch.toLowerCase());
  });
  const allFlashcards = filteredResearchItems.flatMap(item => item.outputs?.flashcards || []);
  const allViva = filteredResearchItems.flatMap(item => item.outputs?.viva || []);
  const allSources = filteredResearchItems.flatMap(item => {
    const related = item.outputs?.relatedSources || [];
    return [...(item.link ? [{
      title: item.topic,
      url: item.link,
      text: item.summary || "Saved source"
    }] : []), ...related];
  });
  const connections = insights.topEntities?.length ? insights.topEntities : filteredResearchItems.flatMap(item => item.tags || []).slice(0, 5).map((label, index) => ({
    label,
    count: index + 1,
    color: "text-blue-500"
  }));
  useEffect(() => {
    setSelectedItem(filteredResearchItems[0] || null);
  }, [title, researchItems.length]);
  useEffect(() => {
    if (!initialPrompt || initialPromptSent.current) return;
    initialPromptSent.current = true;
    handleSendMessage(initialPrompt);
  }, [initialPrompt]);
  const showStatus = message => {
    setStatusMessage(message);
    setTimeout(() => setStatusMessage(""), 1800);
  };
  const handleSendMessage = async (overrideQuery = "") => {
    const outgoingQuery = (overrideQuery || query).trim();
    if (!outgoingQuery || isChatLoading) return;
    const userMsg = {
      role: "user",
      text: outgoingQuery,
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
    setMessages(prev => [...prev, userMsg]);
    setQuery("");
    setIsChatLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/ai/workbook-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          workbook: title,
          query: userMsg.text
        })
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        role: "assistant",
        data
      }]);
    } catch (err) {
      console.error("Chat failed", err);
      setMessages(prev => [...prev, {
        role: "assistant",
        data: {
          introText: "I could not reach the workbook AI route. Your saved pages are still available here.",
          insights: []
        }
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };
  const handleCopy = async text => {
    try {
      await navigator.clipboard.writeText(text);
      showStatus("Copied");
    } catch {
      showStatus("Copy unavailable");
    }
  };
  const handleSaveAssistantNote = async data => {
    try {
      await api.post("/api/research", {
        topic: `Copilot note - ${title}`,
        workbook: title,
        summary: data?.introText || "Saved workbook copilot note.",
        notes: (data?.insights || []).map(item => `${item.title}: ${item.desc}`).join("\n"),
        outputs: {
          answer: data?.introText || "",
          saveType: "copilot-note",
          tags: ["Copilot", "Synthesis"]
        }
      });
      showStatus("Saved as note");
    } catch (err) {
      console.error("Save assistant note failed", err);
      showStatus("Save failed");
    }
  };
  const openItem = (item, contentType = "page") => {
    setSelectedItem(item);
    setActiveContent(contentType);
  };
  const quickAsk = text => handleSendMessage(text);
  return <div className="w-full h-screen flex bg-[#0a0c14] text-white font-sans overflow-hidden">

      <div className={`${isCollapsed ? 'w-[72px]' : 'w-[260px]'} bg-[#05060b] border-r border-white/[0.05] flex flex-col shrink-0 z-20 transition-all duration-300 ease-in-out`}>
        <div className={`h-16 flex items-center ${isCollapsed ? 'justify-center' : 'px-6 justify-between'} mb-2 border-b border-white/[0.02]`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-900/20 shrink-0">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            {!isCollapsed && <div className="animate-in fade-in duration-300">
                <h1 className="text-sm font-black tracking-tighter text-white leading-none">FocusFlow</h1>
                <span className="text-[9px] font-bold text-blue-500 tracking-widest uppercase">Studio</span>
              </div>}
          </div>
          <button onClick={() => setIsCollapsed(!isCollapsed)} className={`p-1.5 text-gray-500 hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors ${isCollapsed ? 'hidden' : 'block'}`}>
            <ChevronsLeft size={16} />
          </button>
        </div>

        {isCollapsed && <div className="flex justify-center mb-6">
             <button onClick={() => setIsCollapsed(false)} className="p-1.5 text-gray-500 hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors mt-2">
                <ChevronsRight size={16} />
              </button>
          </div>}

        <div className="flex-1 overflow-y-auto px-3 space-y-6 custom-scrollbar pb-6">
          <NavSection title="Discovery" isCollapsed={isCollapsed}>
            <NavItem icon={Home} label="Home" isCollapsed={isCollapsed} onClick={onBack} />
            <NavItem icon={Library} label="Knowledge Base" isCollapsed={isCollapsed} onClick={() => setActiveContent("page")} />
            <NavItem icon={Clock} label="Recent Sessions" isCollapsed={isCollapsed} onClick={() => setActiveContent("overview")} />
            <NavItem icon={Bookmark} label="Pinned Insights" count={3} isCollapsed={isCollapsed} />
          </NavSection>

          <NavSection title="Workspaces" isCollapsed={isCollapsed}>
            <NavItem icon={Folder} label="All Workbooks" isCollapsed={isCollapsed} active />
            <NavItem icon={LayoutGrid} label="Collections" isCollapsed={isCollapsed} />
            <NavItem icon={Users} label="Shared with Me" isCollapsed={isCollapsed} />
          </NavSection>

          <NavSection title="Tools" isCollapsed={isCollapsed}>
            <NavItem icon={LayoutGrid} label="Flashcards" isCollapsed={isCollapsed} onClick={() => setActiveContent("flashcards")} />
            <NavItem icon={Sparkles} label="Viva Practice" isCollapsed={isCollapsed} onClick={() => setActiveContent("viva")} />
            <NavItem icon={BrainCircuit} label="AI Assistant" isCollapsed={isCollapsed} onClick={() => setActiveContent("chat")} />
          </NavSection>

          {!isCollapsed && <div className="mt-4 p-4 bg-gradient-to-b from-white/[0.04] to-transparent border border-white/[0.05] rounded-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-3 opacity-20"><Zap size={40} /></div>
               <h4 className="text-[12px] font-bold text-orange-400 flex items-center gap-1.5 mb-1.5">👑 Pro Plan</h4>
               <p className="text-[10px] text-gray-400 leading-relaxed mb-3">Unlock unlimited access to all features and AI tools.</p>
               <button className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold rounded-lg transition-colors">Upgrade Plan</button>
            </div>}
        </div>

        <div className={`p-4 border-t border-white/[0.05] flex ${isCollapsed ? 'justify-center' : 'items-center gap-3'} transition-all`}>
           <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0 cursor-pointer hover:bg-white/20 transition-colors">
              LA
           </div>
           {!isCollapsed && <>
               <div className="flex-1 min-w-0">
                  <h5 className="text-[12px] font-bold text-white truncate">Lakshya</h5>
                  <p className="text-[10px] text-gray-500 truncate">lakshya@example.com</p>
               </div>
               <MoreHorizontal className="w-4 h-4 text-gray-500 cursor-pointer hover:text-white transition-colors" />
             </>}
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
               <WorkbookNavItem icon={Home} label="Overview" active={activeContent === "overview"} onClick={() => setActiveContent("overview")} />
            </div>

            <div className="space-y-1">
               <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-2 mb-2">Saved Pages</h3>
               {filteredResearchItems.length > 0 ? filteredResearchItems.slice(0, 5).map((item, idx) => <WorkbookDocItem key={item._id || idx} label={item.topic || "Untitled Research"} activeIndicator={selectedItem?._id === item._id} onClick={() => openItem(item, "page")} />) : <WorkbookDocItem label="No saved pages yet" />}
               {filteredResearchItems.length > 5 && <button onClick={() => setActiveContent("page")} className="text-[11px] font-bold text-gray-500 hover:text-white transition-colors px-2 mt-2">Show {filteredResearchItems.length - 5} more</button>}
            </div>

            <div className="space-y-1">
               <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-2 mb-2">Notes</h3>
               {filteredResearchItems.slice(0, 3).map((item, idx) => <WorkbookDocItem key={item._id || idx} icon={FileJson} label={item.summary ? item.summary.slice(0, 36) : "Research Note"} activeIndicator={selectedItem?._id === item._id && activeContent === "notes"} onClick={() => openItem(item, "notes")} />)}
               {filteredResearchItems.length === 0 && <WorkbookDocItem icon={FileJson} label="Key Concepts" />}
            </div>

            <div className="space-y-1">
               <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-2 mb-2">Flashcards</h3>
               {allFlashcards.slice(0, 2).map((card, idx) => <WorkbookDocItem key={idx} icon={Activity} label={card.q || "Flashcard"} activeIndicator={activeContent === "flashcards" && idx === 0} onClick={() => setActiveContent("flashcards")} />)}
               {allFlashcards.length === 0 && <WorkbookDocItem icon={Activity} label="No flashcards saved yet" />}
            </div>

            <div className="space-y-1">
               <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-2 mb-2">Viva Sessions</h3>
               {allViva.slice(0, 2).map((item, idx) => <WorkbookDocItem key={idx} icon={GraduationCap} label={item.q || "Viva Question"} activeIndicator={activeContent === "viva" && idx === 0} onClick={() => setActiveContent("viva")} />)}
               {allViva.length === 0 && <WorkbookDocItem icon={GraduationCap} label="No viva notes saved yet" />}
            </div>

            <div className="space-y-1">
               <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-2 mb-2">AI Syntheses</h3>
               <WorkbookDocItem icon={Sparkles} label="AI Research Summary" activeIndicator={activeContent === "synthesis"} onClick={() => {
            setActiveContent("synthesis");
            quickAsk("Summarize this workbook");
          }} />
               <WorkbookDocItem icon={FileText} label="Trends & Insights" activeIndicator={contextTab === "connections"} onClick={() => setContextTab("connections")} />
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
                     <span>{researchItems.length} items</span> <span>-</span> <span>You</span>
                     <span className="px-1.5 py-[1px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded font-bold uppercase tracking-widest text-[8px]">Active</span>
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-4">
               <div className="relative group w-[240px]">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                  <input type="text" value={workbookSearch} onChange={event => setWorkbookSearch(event.target.value)} onKeyDown={event => {
              if (event.key === "Enter" && workbookSearch.trim()) quickAsk(`Search this workbook for ${workbookSearch.trim()}`);
            }} placeholder="Search in this workbook..." className="w-full bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] focus:border-blue-500/50 rounded-xl pl-9 pr-9 py-1.5 text-[12px] text-white placeholder-gray-500 focus:outline-none transition-all" />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-50">
                     <span className="text-[9px] font-bold border border-white/20 rounded px-1 py-0.5">⌘</span>
                     <span className="text-[9px] font-bold border border-white/20 rounded px-1 py-0.5">K</span>
                  </div>
               </div>

               <div className="flex items-center gap-2">
                  <button onClick={() => {
              handleCopy(`${title}: ${researchItems.length} saved items`);
            }} className="px-3 py-1.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] rounded-lg text-[12px] font-bold text-white flex items-center gap-2 transition-colors">
                     <UserPlus size={14} /> Share
                  </button>
                  <button onClick={() => {
              setIsStarred(value => !value);
              showStatus(isStarred ? "Unpinned" : "Pinned");
            }} className={`p-1.5 hover:bg-white/[0.05] border border-white/[0.05] rounded-lg transition-colors ${isStarred ? "text-orange-400" : "text-gray-400 hover:text-white"}`}>
                     <Star size={14} fill={isStarred ? "currentColor" : "none"} />
                  </button>
                  <button onClick={refreshWorkbookData} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/[0.05] border border-white/[0.05] rounded-lg transition-colors">
                     <MoreHorizontal size={14} />
                  </button>
               </div>
            </div>
         </div>

         <div className="flex-1 overflow-y-auto px-8 pt-24 pb-32 custom-scrollbar flex flex-col">
            <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col justify-end space-y-8">

               {activeContent !== "chat" && <WorkbookContentPanel activeContent={activeContent} title={title} selectedItem={selectedItem} researchItems={filteredResearchItems} flashcards={allFlashcards} viva={allViva} sources={allSources} insights={insights} onAsk={quickAsk} onOpenItem={item => openItem(item, "page")} onCopy={handleCopy} />}

               {activeContent === "chat" && messages.length === 0 && <div className="flex flex-col items-center justify-center text-center py-10 opacity-60">
                     <BrainCircuit className="w-10 h-10 text-blue-500 mb-4" />
                     <h3 className="text-xl font-bold text-white mb-2">AI Research Copilot</h3>
                     <p className="text-sm text-gray-400">Your AI research partner. Ask anything about your workspace.</p>
                  </div>}

               {messages.map((msg, idx) => msg.role === "user" ? <div key={idx} className="flex justify-end animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex items-end gap-3 max-w-[80%]">
                           <div className="bg-[#1e1e2d] text-white px-5 py-3.5 rounded-2xl rounded-tr-sm text-[14px] leading-relaxed shadow-lg">
                              {msg.text}
                              <div className="text-right text-[10px] text-gray-500 mt-2">{msg.time}</div>
                           </div>
                           <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold shrink-0 shadow-lg">
                              LA
                           </div>
                        </div>
                     </div> : <div key={idx} className="flex items-start gap-4 animate-in fade-in slide-in-from-bottom-6 duration-500">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                           <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 bg-white/[0.02] border border-white/[0.05] rounded-[24px] rounded-tl-sm p-6 shadow-xl">
                           <p className="text-[14px] text-gray-300 mb-6 font-medium">{msg.data?.introText || "Here are some insights:"}</p>

                           {msg.data?.insights && msg.data.insights.length > 0 && <div className="space-y-4 mb-6">
                                 {msg.data.insights.map((insight, i) => <StructuredInsight key={i} number={i + 1} color={normalizeBadgeColor(insight.color, i)} title={insight.title} desc={insight.desc} sources={insight.sources} />)}
                              </div>}

                           <div className="flex items-center justify-between pt-4 border-t border-white/[0.04]">
                              <div className="flex items-center gap-4">
                                 <button onClick={() => handleCopy(`${msg.data?.introText || ""}\n${(msg.data?.insights || []).map(item => `${item.title}: ${item.desc}`).join("\n")}`)} className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 hover:text-white transition-colors">
                                    <Copy size={12} /> Copy
                                 </button>
                                 <button onClick={() => handleSaveAssistantNote(msg.data)} className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 hover:text-white transition-colors">
                                    <ExternalLink size={12} /> Save as note
                                 </button>
                              </div>
                              <div className="flex items-center gap-2">
                                 <button className="p-1.5 text-gray-500 hover:text-green-400 transition-colors rounded-lg hover:bg-green-400/10"><ThumbsUp size={14} /></button>
                                 <button className="p-1.5 text-gray-500 hover:text-red-400 transition-colors rounded-lg hover:bg-red-400/10"><ThumbsDown size={14} /></button>
                              </div>
                           </div>
                        </div>
                     </div>)}

               {isChatLoading && <div className="flex items-start gap-4 animate-in fade-in">
                     <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20 animate-pulse">
                        <BrainCircuit className="w-4 h-4 text-white" />
                     </div>
                     <div className="flex-1 bg-white/[0.02] border border-white/[0.05] rounded-[24px] rounded-tl-sm p-6 shadow-xl">
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
                           <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{
                  animationDelay: '0.2s'
                }} />
                           <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{
                  animationDelay: '0.4s'
                }} />
                        </div>
                     </div>
                  </div>}
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
                     <input type="text" value={query} onChange={e => setQuery(e.target.value)} onFocus={() => setActiveContent("chat")} onKeyDown={e => {
                if (e.key === 'Enter') handleSendMessage();
              }} placeholder="Ask anything about your research..." className="flex-1 bg-transparent border-none px-3 py-3 text-[14px] text-white placeholder-gray-500 focus:outline-none" />
                     <button onClick={handleSendMessage} className={`p-2.5 rounded-xl transition-all ${query.trim() ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-white/[0.03] text-gray-600'}`}>
                        <Send size={18} fill={query.trim() ? "white" : "none"} />
                     </button>
                  </div>
               </div>

               <div className="flex items-center gap-2 mt-4 overflow-x-auto no-scrollbar pb-2">
                  <QuickPill icon={FileText} text="Summarize this workbook" onClick={() => quickAsk("Summarize this workbook")} />
                  <QuickPill icon={BrainCircuit} text="Find connections" onClick={() => quickAsk("Find connections across this workbook")} />
                  <QuickPill icon={BookOpen} text="Generate study guide" onClick={() => quickAsk("Generate a study guide from this workbook")} />
                  <QuickPill icon={LayoutGrid} text="Create flashcards" onClick={() => {
              setActiveContent("flashcards");
              quickAsk("Create flashcards from this workbook");
            }} />
                  {statusMessage && <span className="ml-auto rounded-lg bg-emerald-500/10 px-3 py-1.5 text-[11px] font-bold text-emerald-300">{statusMessage}</span>}
               </div>

            </div>
         </div>
      </div>

      <div className="w-[320px] bg-[#05060b] border-l border-white/[0.05] flex flex-col shrink-0 z-10 hidden lg:flex">

         <div className="p-6 border-b border-white/[0.02]">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Context</h3>
            <div className="flex items-center gap-6 border-b border-white/[0.05]">
               <ContextTabButton label="Insights" active={contextTab === "insights"} onClick={() => setContextTab("insights")} />
               <ContextTabButton label="Connections" active={contextTab === "connections"} onClick={() => setContextTab("connections")} />
               <ContextTabButton label="Sources" active={contextTab === "sources"} onClick={() => setContextTab("sources")} />
            </div>
         </div>

         <div className="flex-1 overflow-y-auto px-6 py-2 custom-scrollbar space-y-8">

            {isInsightsLoading ? <div className="py-10 flex justify-center"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div> : contextTab === "connections" ? <div>
                  <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3">Connections</h3>
                  <div className="space-y-1">
                     {connections.length > 0 ? connections.map((item, idx) => <EntityRow key={`${item.label}-${idx}`} label={item.label} count={item.count} icon={BrainCircuit} color={item.color || "text-blue-500"} />) : <p className="text-xs text-gray-500">No connections found yet.</p>}
                  </div>
               </div> : contextTab === "sources" ? <div>
                  <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3">Sources</h3>
                  <div className="space-y-2">
                     {allSources.length > 0 ? allSources.slice(0, 8).map((source, idx) => <a key={`${source.url || source.title}-${idx}`} href={source.url} target="_blank" rel="noreferrer" className="block rounded-xl border border-white/[0.04] bg-white/[0.02] p-3 hover:bg-white/[0.05]">
                         <p className="truncate text-[12px] font-bold text-white">{source.title || source.text || "Source"}</p>
                         <p className="mt-1 truncate text-[10px] text-blue-400">{source.url || "Saved source"}</p>
                       </a>) : <p className="text-xs text-gray-500">No sources saved yet.</p>}
                  </div>
               </div> : <>

                  <div>
                     <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3">Key Insights</h3>
                     <div className="space-y-3">
                        {insights.keyInsights?.length > 0 ? insights.keyInsights.map((item, idx) => <InsightCard key={idx} title={item.title} color={normalizeTextColor(item.color, idx)} desc={item.desc} chartColor={item.chartColor || "border-emerald-500"} />) : <p className="text-xs text-gray-500">Not enough data to generate insights.</p>}
                     </div>
                  </div>

                  <div className="mt-8">
                     <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3">Top Entities</h3>
                     <div className="space-y-1">
                        {insights.topEntities?.length > 0 ? insights.topEntities.map((item, idx) => <EntityRow key={idx} label={item.label} count={item.count} icon={BrainCircuit} color={item.color || "text-blue-500"} />) : <p className="text-xs text-gray-500">No entities found.</p>}
                     </div>
                  </div>
               </>}

            <div>
               <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3">Suggested Actions</h3>
               <div className="space-y-2">
                  <SuggestedAction icon={FileText} label="Review saved notes" onClick={() => {
              setActiveContent("notes");
            }} />
                  <SuggestedAction icon={LayoutGrid} label="Create flashcards from saved pages" onClick={() => {
              setActiveContent("flashcards");
              quickAsk("Create flashcards from saved pages");
            }} />
                  <SuggestedAction icon={CheckCircle2} label="Generate summary of all saved pages" onClick={() => quickAsk("Generate summary of all saved pages")} />
               </div>
            </div>

         </div>

      </div>

    </div>;
}
function NavSection({
  title,
  children,
  isCollapsed
}) {
  if (isCollapsed) return <div className="space-y-2 mb-4">{children}</div>;
  return <div className="space-y-1 mb-2">
      <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-3 mb-2">{title}</h3>
      {children}
    </div>;
}
function NavItem({
  icon: Icon,
  label,
  active,
  count,
  isCollapsed,
  onClick
}) {
  return <button onClick={onClick} className={`
        flex items-center ${isCollapsed ? 'justify-center w-10 h-10 mx-auto' : 'justify-between w-full px-3 py-2'} rounded-xl transition-all duration-300 group
        ${active ? "bg-blue-600/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/[0.03]"}
      `} title={isCollapsed ? label : undefined}>
      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
        <Icon className={`w-4 h-4 transition-colors duration-300 ${active ? "text-blue-500" : "text-gray-500 group-hover:text-gray-300"}`} />
        {!isCollapsed && <span className={`text-[13px] font-bold ${active ? "text-white" : "text-gray-400 group-hover:text-white"}`}>{label}</span>}
      </div>
      {!isCollapsed && count && <span className="text-[10px] font-black bg-white/[0.05] border border-white/[0.05] px-2 py-0.5 rounded-full text-white">
          {count}
        </span>}
    </button>;
}
function WorkbookNavItem({
  icon: Icon,
  label,
  active,
  onClick
}) {
  return <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[12px] font-bold transition-all ${active ? 'bg-blue-600/10 text-white' : 'text-gray-400 hover:bg-white/[0.03] hover:text-white'}`}>
      <Icon size={16} className={active ? 'text-blue-500' : 'text-gray-500'} /> {label}
    </button>;
}
function WorkbookDocItem({
  icon: Icon = FileText,
  label,
  activeIndicator,
  onClick
}) {
  return <button onClick={onClick} className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[12px] font-medium text-gray-400 hover:text-white hover:bg-white/[0.02] transition-colors group">
      <div className="flex items-center gap-3 min-w-0">
         <Icon size={14} className="text-gray-600 group-hover:text-gray-400 shrink-0" />
         <span className="truncate">{label}</span>
      </div>
      {activeIndicator && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />}
    </button>;
}
function StructuredInsight({
  number,
  color,
  title,
  desc,
  sources
}) {
  return <div className="flex gap-4 p-4 rounded-xl border border-white/[0.03] bg-white/[0.01] hover:bg-white/[0.03] transition-colors cursor-pointer group">
       <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 ${color}`}>
          {number}
       </div>
       <div>
          <h4 className="text-[13px] font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{title}</h4>
          <p className="text-[12px] text-gray-400 mb-2 leading-relaxed">{desc}</p>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{sources}</span>
       </div>
    </div>;
}
function WorkbookContentPanel({
  activeContent,
  title,
  selectedItem,
  researchItems,
  flashcards,
  viva,
  sources,
  insights,
  onAsk,
  onOpenItem,
  onCopy
}) {
  if (activeContent === "flashcards") {
    return <ContentShell icon={LayoutGrid} title="Flashcards" subtitle={`${flashcards.length} cards generated from saved pages`}>
        <div className="grid grid-cols-2 gap-3">
          {flashcards.length ? flashcards.slice(0, 8).map((card, idx) => <div key={`${card.q}-${idx}`} className="rounded-xl border border-pink-400/20 bg-pink-500/[0.04] p-4">
              <p className="text-[12px] font-black text-white">{card.q || card.topic || "Study Card"}</p>
              <p className="mt-2 text-[11px] leading-relaxed text-gray-400">{card.a || card.explanation || "Review the saved page context."}</p>
            </div>) : <EmptyState text="No flashcards saved yet." />}
        </div>
      </ContentShell>;
  }
  if (activeContent === "viva") {
    return <ContentShell icon={GraduationCap} title="Viva Practice" subtitle={`${viva.length} questions available`}>
        <div className="space-y-3">
          {viva.length ? viva.slice(0, 10).map((item, idx) => <div key={`${item.q}-${idx}`} className="rounded-xl border border-violet-400/20 bg-violet-500/[0.04] p-4 text-[12px]">
              <p className="font-black text-white">Q{idx + 1}. {item.q || "Question"}</p>
              <p className="mt-2 leading-relaxed text-gray-400">{item.a || "Use your saved notes to answer this."}</p>
            </div>) : <EmptyState text="No viva notes saved yet." />}
        </div>
      </ContentShell>;
  }
  if (activeContent === "synthesis") {
    return <ContentShell icon={Sparkles} title="AI Synthesis" subtitle="Connected workbook intelligence">
        <p className="text-[13px] leading-relaxed text-gray-300">{insights.keyInsights?.[0]?.desc || `Ask FocusFlow to synthesize the ${researchItems.length} saved item${researchItems.length === 1 ? "" : "s"} in ${title}.`}</p>
        <button onClick={() => onAsk("Synthesize the strongest ideas across this workbook")} className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-white">Generate synthesis</button>
      </ContentShell>;
  }
  if (activeContent === "notes" && selectedItem) {
    return <ContentShell icon={FileJson} title="Saved Note" subtitle={selectedItem.topic || "Saved research"}>
        <p className="text-[13px] leading-relaxed text-gray-300">{selectedItem.notes || selectedItem.summary || "No notes saved for this item yet."}</p>
      </ContentShell>;
  }
  if (activeContent === "page" && selectedItem) {
    return <ContentShell icon={FileText} title={selectedItem.topic || "Saved Page"} subtitle={selectedItem.link || "Saved research item"}>
        <p className="text-[13px] leading-relaxed text-gray-300">{selectedItem.summary || selectedItem.notes || "No summary saved yet."}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {(selectedItem.tags || []).map(tag => <span key={tag} className="rounded-full bg-blue-500/10 px-3 py-1 text-[10px] font-bold text-blue-200">{tag}</span>)}
        </div>
        <div className="mt-5 flex gap-2">
          {selectedItem.link && <a href={selectedItem.link} target="_blank" rel="noreferrer" className="rounded-xl border border-white/[0.08] px-3 py-2 text-[11px] font-bold text-gray-300 hover:text-white">Open source</a>}
          <button onClick={() => onAsk(`Explain ${selectedItem.topic}`)} className="rounded-xl bg-blue-600 px-3 py-2 text-[11px] font-bold text-white">Ask about this</button>
          <button onClick={() => onCopy(`${selectedItem.topic}\n\n${selectedItem.summary || selectedItem.notes || ""}`)} className="rounded-xl border border-white/[0.08] px-3 py-2 text-[11px] font-bold text-gray-300 hover:text-white">Copy</button>
        </div>
      </ContentShell>;
  }
  return <ContentShell icon={BrainCircuit} title={`${title} Overview`} subtitle={`${researchItems.length} saved item${researchItems.length === 1 ? "" : "s"}`}>
      <div className="space-y-2">
        {researchItems.length ? researchItems.slice(0, 6).map(item => <button key={item._id} onClick={() => onOpenItem(item)} className="w-full rounded-xl border border-white/[0.05] bg-white/[0.02] p-4 text-left hover:bg-white/[0.05]">
            <p className="truncate text-[13px] font-black text-white">{item.topic || "Untitled Research"}</p>
            <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-gray-400">{item.summary || item.notes || "Saved from Aide."}</p>
          </button>) : <EmptyState text="This workbook is ready. Save a page from the Aide sidebar to start building it." />}
      </div>
    </ContentShell>;
}
function ContentShell({
  icon: Icon,
  title,
  subtitle,
  children
}) {
  return <section className="rounded-[24px] border border-white/[0.06] bg-white/[0.02] p-6 shadow-xl">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
          <Icon size={18} />
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-[16px] font-black text-white">{title}</h3>
          <p className="mt-1 truncate text-[12px] text-gray-500">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>;
}
function EmptyState({
  text
}) {
  return <div className="rounded-xl border border-dashed border-white/[0.08] p-6 text-center text-[12px] font-bold text-gray-500">{text}</div>;
}
function ContextTabButton({
  label,
  active,
  onClick
}) {
  return <button onClick={onClick} className={`text-[13px] font-bold pb-2 border-b-2 transition-colors ${active ? "text-blue-500 border-blue-500" : "text-gray-500 border-transparent hover:text-white"}`}>
      {label}
    </button>;
}
function QuickPill({
  icon: Icon,
  text,
  onClick
}) {
  return <button onClick={onClick} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] text-[11px] font-bold text-gray-400 hover:text-white transition-colors whitespace-nowrap">
      <Icon size={12} className="text-gray-500" /> {text}
    </button>;
}
function InsightCard({
  title,
  desc,
  color,
  chartColor
}) {
  return <div className="p-4 rounded-xl border border-white/[0.03] bg-white/[0.01] hover:bg-white/[0.03] transition-colors group cursor-pointer">
       <h4 className={`text-[12px] font-bold mb-1 ${color}`}>{title}</h4>
       <p className="text-[11px] text-gray-400 leading-relaxed mb-3">{desc}</p>

       <div className="h-4 flex items-end gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
          <div className={`w-full border-t border-dashed ${chartColor} transform -skew-y-12`} />
       </div>
    </div>;
}
function EntityRow({
  label,
  count,
  icon: Icon,
  color
}) {
  return <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.03] transition-colors cursor-pointer group">
       <div className="flex items-center gap-3">
          <Icon size={14} className={`${color} opacity-80 group-hover:opacity-100`} />
          <span className="text-[12px] font-bold text-gray-300 group-hover:text-white">{label}</span>
       </div>
       <span className="text-[11px] font-black text-gray-600 bg-white/[0.03] px-2 py-0.5 rounded-md">{count}</span>
    </div>;
}
function SuggestedAction({
  icon: Icon,
  label,
  onClick
}) {
  return <button onClick={onClick} className="w-full flex items-center gap-3 p-3 rounded-xl border border-white/[0.03] bg-white/[0.01] hover:bg-white/[0.05] transition-colors text-left group">
       <Icon size={14} className="text-gray-500 group-hover:text-blue-400 transition-colors shrink-0" />
       <span className="text-[11px] font-bold text-gray-400 group-hover:text-white transition-colors leading-snug">{label}</span>
    </button>;
}

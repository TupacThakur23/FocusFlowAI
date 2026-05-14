import { useState, useEffect, useMemo } from "react";
import { BookOpen, Search, Plus, Folder, Tag, Clock, ChevronRight, FileText, ExternalLink, Trash2, RefreshCw, LayoutGrid, Library, Bookmark, Sparkles, Filter, MoreHorizontal, ChevronDown, ArrowUpRight, Zap, Settings, HelpCircle, Bell, Home, Users, CheckCircle2, FileJson, ArrowRight, Star, BrainCircuit } from "lucide-react";
import Workbook from "./Workbook";
import api from "../services/api";
export default function ResearchHub() {
  const [researchData, setResearchData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [activeWorkbook, setActiveWorkbook] = useState(null);
  const [savedWorkbooks, setSavedWorkbooks] = useState(["Research Workbook"]);
  const [isCreatingWorkbook, setIsCreatingWorkbook] = useState(false);
  const [newWorkbookName, setNewWorkbookName] = useState("");
  const [initialWorkbookPrompt, setInitialWorkbookPrompt] = useState("");
  const refreshResearch = async () => {
    setIsLoading(true);
    try {
      const [researchRes, workbookRes] = await Promise.all([api.get("/api/research"), api.get("/api/research/workbooks")]);
      const research = Array.isArray(researchRes.data) ? researchRes.data : [];
      const workbooks = Array.isArray(workbookRes.data) && workbookRes.data.length ? workbookRes.data : ["Research Workbook"];
      setResearchData(research);
      setFilteredData(research);
      setSavedWorkbooks(workbooks);
    } catch (error) {
      console.error("Failed to fetch research:", error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    refreshResearch();
  }, []);
  const workbookSummaries = useMemo(() => {
    return savedWorkbooks.map(name => {
      const items = researchData.filter(item => (item.workbook || "Research Workbook") === name);
      const lastDate = items[0]?.date ? new Date(items[0].date) : null;
      return {
        name,
        count: items.length,
        desc: items[0]?.summary || "Research workspace.",
        time: lastDate ? `Updated ${lastDate.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric"
        })}` : "Ready for pages"
      };
    });
  }, [researchData, savedWorkbooks]);
  const activeFilteredData = useMemo(() => {
    if (activeTab === "recent") return filteredData.slice(0, 6);
    if (activeTab === "pinned") return filteredData.filter(item => item.tags?.includes("Pinned") || item.saveOptions?.includes("Pinned"));
    if (activeTab === "flashcards") return filteredData.filter(item => item.outputs?.flashcards?.length);
    if (activeTab === "viva") return filteredData.filter(item => item.outputs?.viva?.length);
    return filteredData;
  }, [activeTab, filteredData]);
  const openWorkbook = (name, prompt = "") => {
    setInitialWorkbookPrompt(prompt);
    setActiveWorkbook(name);
  };
  const handleCreateWorkbook = async () => {
    const name = newWorkbookName.trim();
    if (!name) return;
    try {
      await api.post("/api/research/workbooks", {
        name
      });
      setSavedWorkbooks(items => [name, ...items.filter(item => item !== name)]);
      setNewWorkbookName("");
      setIsCreatingWorkbook(false);
      openWorkbook(name);
    } catch (error) {
      console.error("Failed to create workbook:", error);
    }
  };
  const openCopilot = (prompt = "What are the key themes in my research?") => {
    const target = workbookSummaries.find(workbook => workbook.count > 0)?.name || workbookSummaries[0]?.name || "Research Workbook";
    openWorkbook(target, prompt);
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.post("/api/research/semantic-search", {
          query: searchQuery
        });
        const data = res.data;
        const localResults = researchData.filter(item => (item?.topic || "").toLowerCase().includes(searchQuery.toLowerCase()) || item?.summary && item.summary.toLowerCase().includes(searchQuery.toLowerCase()) || item?.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()) || item?.workbook && item.workbook.toLowerCase().includes(searchQuery.toLowerCase()));
        setFilteredData(Array.isArray(data) && data.length > 0 ? data : localResults);
      } catch (error) {
        console.error("Semantic search failed", error);
      } finally {
        setIsSearching(false);
      }
    };
    if (!searchQuery.trim()) {
      setFilteredData(researchData);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const debounceTimer = setTimeout(fetchData, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, researchData]);
  const handleDelete = async id => {
    try {
      await api.delete(`/api/research/${id}`);
      setResearchData(prev => prev.filter(item => item._id !== id));
      setFilteredData(prev => prev.filter(item => item._id !== id));
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };
  const totalWorkbooks = workbookSummaries.length;
  const totalItems = researchData.length;
  if (activeWorkbook) {
    return <Workbook title={activeWorkbook} initialPrompt={initialWorkbookPrompt} onBack={() => {
      setActiveWorkbook(null);
      refreshResearch();
    }} />;
  }
  return <div className="w-full h-screen flex bg-[#0a0c14] text-white font-sans overflow-hidden">

      <div className="w-[260px] bg-[#05060b] border-r border-white/[0.05] flex flex-col shrink-0 z-10">
        <div className="h-16 flex items-center px-6 gap-3 mb-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-900/20">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tighter text-white leading-none">FocusFlow</h1>
            <span className="text-[9px] font-bold text-blue-500 tracking-widest uppercase">Studio</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-8 custom-scrollbar pb-6">

          <div className="space-y-1">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-3 mb-3">Discovery</h3>
            <NavItem icon={Home} label="Home" active={activeTab === "all"} onClick={() => setActiveTab("all")} />
            <NavItem icon={Library} label="Knowledge Base" active={activeTab === "knowledge"} onClick={() => setActiveTab("knowledge")} />
            <NavItem icon={Clock} label="Recent Sessions" active={activeTab === "recent"} onClick={() => setActiveTab("recent")} />
            <NavItem icon={Bookmark} label="Pinned Insights" active={activeTab === "pinned"} count={researchData.filter(item => item.tags?.includes("Pinned") || item.saveOptions?.includes("Pinned")).length} onClick={() => setActiveTab("pinned")} />
          </div>

          <div className="space-y-1">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-3 mb-3">Workspaces</h3>
            <NavItem icon={Folder} label="All Workbooks" active={activeTab === "workbooks"} count={totalWorkbooks} onClick={() => setActiveTab("workbooks")} />
            <NavItem icon={LayoutGrid} label="Collections" active={activeTab === "collections"} onClick={() => setActiveTab("collections")} />
            <NavItem icon={Users} label="Shared with Me" active={activeTab === "shared"} onClick={() => setActiveTab("shared")} />
          </div>

          <div className="space-y-1">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-3 mb-3">Tools</h3>
            <NavItem icon={LayoutGrid} label="Flashcards" active={activeTab === "flashcards"} onClick={() => setActiveTab("flashcards")} />
            <NavItem icon={Sparkles} label="Viva Practice" active={activeTab === "viva"} onClick={() => setActiveTab("viva")} />
            <NavItem icon={BrainCircuit} label="AI Assistant" onClick={() => openCopilot()} />
          </div>

          <div className="mt-4 p-4 bg-gradient-to-b from-white/[0.04] to-transparent border border-white/[0.05] rounded-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-3 opacity-20"><Zap size={40} /></div>
             <h4 className="text-[12px] font-bold text-orange-400 flex items-center gap-1.5 mb-1.5">👑 Pro Plan</h4>
             <p className="text-[10px] text-gray-400 leading-relaxed mb-3">Unlock unlimited access to all features and AI tools.</p>
             <button className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold rounded-lg transition-colors">Upgrade Plan</button>
          </div>
        </div>

        <div className="p-4 border-t border-white/[0.05]">
          <div className="flex items-center gap-3 px-2 cursor-pointer hover:bg-white/[0.03] p-2 rounded-xl transition-colors">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white">
              PH
            </div>
            <div className="flex-1 min-w-0">
               <h5 className="text-[12px] font-bold text-white truncate">Phillip</h5>
               <p className="text-[10px] text-gray-500 truncate">phillip@example.com</p>
            </div>
            <MoreHorizontal className="w-4 h-4 text-gray-500" />
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 z-10 relative bg-[#0a0c14]">

        <div className="h-16 flex items-center justify-between px-10 border-b border-white/[0.02] shrink-0">
          <div className="relative group w-[500px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search your research, notes, and insights..." className="w-full bg-[#05060b] border border-white/[0.05] focus:border-blue-500/50 rounded-xl pl-10 pr-10 py-2 text-sm text-white placeholder-gray-500 focus:outline-none transition-all shadow-inner" />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-50">
               {isSearching ? <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div> : <>
                   <span className="text-[10px] font-bold border border-white/20 rounded px-1.5 py-0.5">⌘</span>
                   <span className="text-[10px] font-bold border border-white/20 rounded px-1.5 py-0.5">K</span>
                 </>}
            </div>
          </div>

          <div className="flex items-center gap-5">
            <button className="text-gray-400 hover:text-white transition-colors"><Bell className="w-5 h-5" /></button>
            {isCreatingWorkbook ? <div className="flex items-center gap-2 rounded-xl border border-blue-500/30 bg-[#05060b] p-1.5">
                <input value={newWorkbookName} onChange={event => setNewWorkbookName(event.target.value)} onKeyDown={event => event.key === "Enter" && handleCreateWorkbook()} autoFocus placeholder="Workbook name" className="w-44 bg-transparent px-2 text-[12px] font-bold text-white outline-none placeholder:text-gray-600" />
                <button onClick={handleCreateWorkbook} className="rounded-lg bg-blue-600 px-3 py-1.5 text-[11px] font-black text-white">Create</button>
                <button onClick={() => {
              setIsCreatingWorkbook(false);
              setNewWorkbookName("");
            }} className="rounded-lg px-2 py-1.5 text-[11px] font-bold text-gray-400 hover:text-white">Cancel</button>
              </div> : <button onClick={() => setIsCreatingWorkbook(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-[12px] font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Workbook <ChevronDown className="w-3 h-3 ml-1" />
              </button>}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar">
          <div className="max-w-[1200px] mx-auto space-y-10">

            <header className="animate-in fade-in slide-in-from-left-4 duration-700">
              <h2 className="text-3xl font-black text-white tracking-tight mb-2 flex items-center gap-3">
                Welcome back, Researcher <span className="text-2xl animate-waving-hand origin-bottom-right inline-block">👋</span>
              </h2>
              <p className="text-gray-400 text-sm font-medium">
                Your research hub. All your knowledge. One place to explore and create.
              </p>
            </header>

            <div className="grid grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
               <StatCard icon={Folder} color="text-blue-500" bg="bg-blue-500/10" value={totalWorkbooks} label="Workbooks" sub="Active spaces" />
               <StatCard icon={FileText} color="text-emerald-500" bg="bg-emerald-500/10" value={totalItems} label="Saved Items" sub="Across all workbooks" />
               <StatCard icon={Clock} color="text-violet-500" bg="bg-violet-500/10" value="0h" label="Research Time" sub="This week" />
               <StatCard icon={Star} color="text-orange-500" bg="bg-orange-500/10" value="0" label="Pinned Insights" sub="Quick access" />
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              <div className="flex items-center justify-between mb-4">
                 <h3 className="text-lg font-bold text-white tracking-tight">My Workbooks</h3>
                 <button className="text-[12px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">View all <ChevronRight size={14} /></button>
              </div>
              <div className="grid grid-cols-4 gap-4">
                 {(() => {
                const themes = ["from-indigo-900/40 to-blue-900/20 border-indigo-500/20", "from-emerald-900/40 to-teal-900/20 border-emerald-500/20", "from-orange-900/40 to-red-900/20 border-orange-500/20", "from-blue-900/40 to-cyan-900/20 border-blue-500/20"];
                const accents = ["bg-indigo-500", "bg-emerald-500", "bg-orange-500", "bg-blue-500"];
                if (workbookSummaries.length === 0) {
                  return <div className="col-span-4 border border-dashed border-white/[0.1] rounded-2xl p-10 flex flex-col items-center justify-center text-center bg-white/[0.01]">
                             <Folder className="w-10 h-10 text-gray-600 mb-4" />
                             <h4 className="text-white font-bold mb-1">No Workbooks Yet</h4>
                             <p className="text-sm text-gray-500 max-w-sm">Use the Aide sidebar to extract information and build your first workbook.</p>
                          </div>;
                }
                return workbookSummaries.map((wb, idx) => {
                  return <WorkbookCard key={idx} title={wb.name} desc={wb.desc} items={`${wb.count} items`} time={wb.time} theme={themes[idx % themes.length]} accent={accents[idx % accents.length]} progress={`w-[${Math.min(Math.max(wb.count, 1) * 8, 100)}%]`} onClick={() => openWorkbook(wb.name)} />;
                });
              })()}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">

               <div className="bg-[#05060b] border border-white/[0.05] rounded-[24px] p-6 flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                     <h3 className="text-[15px] font-bold text-white tracking-tight">Recent Activity</h3>
                     <button className="text-[12px] font-bold text-blue-400 hover:text-blue-300 transition-colors">View all</button>
                  </div>

                  <div className="space-y-1 flex-1">

                     {isLoading ? <div className="text-center py-10 text-gray-500 text-xs font-bold uppercase tracking-widest animate-pulse">Loading Activity...</div> : activeFilteredData.length > 0 ? activeFilteredData.slice(0, 5).map((item, idx) => <TimelineItem key={item._id || idx} icon={FileText} color="text-blue-400" bg="bg-blue-500/10" action="Saved insight from" target={item?.topic ? item.topic.length > 30 ? item.topic.substring(0, 30) + '...' : item.topic : 'Untitled'} context={item?.workbook || "Research"} time={item?.date ? new Date(item.date).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric'
                }) : 'Unknown'} onOpen={() => openWorkbook(item?.workbook || "Research Workbook", `Summarize "${item?.topic || "this saved page"}"`)} onDelete={() => handleDelete(item._id)} />) : <div className="flex flex-col items-center justify-center py-8 text-center bg-white/[0.01] border border-dashed border-white/[0.05] rounded-xl">
                           <Clock className="w-6 h-6 text-gray-600 mb-2" />
                           <p className="text-xs text-gray-500 font-medium">No recent activity found.</p>
                        </div>}
                  </div>
               </div>

               <div className="bg-[#05060b] border border-white/[0.05] rounded-[24px] p-6 flex flex-col relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-violet-600/5 pointer-events-none" />

                  <div className="flex items-center gap-3 mb-2 relative z-10">
                     <h3 className="text-[16px] font-bold text-white tracking-tight">AI Research Copilot</h3>
                     <span className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/10 text-[9px] font-black uppercase tracking-widest text-gray-400">BETA</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-6 relative z-10">Ask questions across your entire knowledge base.</p>

                  <div className="space-y-2.5 mb-6 relative z-10 flex-1">
                     {totalItems > 0 ? <>
                           <CopilotQuery text="What are the key themes in my research?" onClick={openCopilot} />
                           <CopilotQuery text="Find connections across my workbooks" onClick={openCopilot} />
                           <CopilotQuery text="Summarize my saved insights" onClick={openCopilot} />
                           <CopilotQuery text="How can I optimize my research flow?" onClick={openCopilot} />
                        </> : <>
                           <CopilotQuery text="How do I get started with FocusFlow?" onClick={openCopilot} />
                           <CopilotQuery text="How do I extract notes using the Aide?" onClick={openCopilot} />
                           <CopilotQuery text="What can the AI Copilot do for me?" onClick={openCopilot} />
                           <CopilotQuery text="Show me a quick start guide" onClick={openCopilot} />
                        </>}
                  </div>

                  <button onClick={() => openCopilot()} className="w-full relative z-10 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white font-black text-[13px] transition-all shadow-[0_8px_20px_rgba(37,99,235,0.2)] hover:shadow-[0_12px_25px_rgba(37,99,235,0.3)] active:scale-95 flex items-center justify-between px-6">
                     Ask Copilot <ArrowUpRight size={16} />
                  </button>
               </div>

            </div>

          </div>
        </div>
      </div>
    </div>;
}
function NavItem({
  icon: Icon,
  label,
  active,
  count,
  onClick
}) {
  return <button onClick={onClick} className={`
        w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-300 group
        ${active ? "bg-blue-600/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/[0.03]"}
      `}>
      <div className="flex items-center gap-3">
        <Icon className={`w-4 h-4 transition-colors duration-300 ${active ? "text-blue-500" : "text-gray-500 group-hover:text-gray-300"}`} />
        <span className={`text-[13px] font-bold ${active ? "text-white" : "text-gray-400 group-hover:text-white"}`}>{label}</span>
      </div>
      {count && <span className="text-[10px] font-black bg-white/[0.05] border border-white/[0.05] px-2 py-0.5 rounded-full text-white">
          {count}
        </span>}
    </button>;
}
function StatCard({
  icon: Icon,
  color,
  bg,
  value,
  label,
  sub
}) {
  return <div className="p-5 bg-white/[0.02] border border-white/[0.04] rounded-2xl flex items-center gap-4 hover:bg-white/[0.04] transition-colors">
       <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
          <Icon className={`w-5 h-5 ${color}`} />
       </div>
       <div>
          <div className="flex items-baseline gap-2 mb-0.5">
             <span className="text-2xl font-black text-white leading-none">{value}</span>
          </div>
          <p className="text-[13px] font-bold text-gray-300">{label}</p>
          <p className="text-[11px] text-gray-500 font-medium">{sub}</p>
       </div>
    </div>;
}
function WorkbookCard({
  title,
  desc,
  items,
  time,
  theme,
  accent,
  progress,
  onClick
}) {
  return <div onClick={onClick} className={`group p-5 bg-gradient-to-br ${theme} border rounded-2xl relative overflow-hidden hover:-translate-y-1 hover:shadow-2xl transition-all duration-500 cursor-pointer`}>
       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
       <div className="relative z-10 flex flex-col h-full">
          <div className={`w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md mb-4 border border-white/10`}>
             <Folder className="w-4 h-4 text-white" />
          </div>
          <h4 className="text-[15px] font-bold text-white mb-2 leading-tight">{title}</h4>
          <p className="text-[12px] text-gray-400 mb-6 flex-1 line-clamp-2 leading-relaxed">{desc}</p>

          <div className="flex items-center gap-2 text-[11px] text-gray-400 font-medium mb-3">
             <span className="text-white">{items}</span> • <span>{time}</span>
          </div>
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
             <div className={`h-full ${accent} ${progress} rounded-full`} />
          </div>
       </div>
    </div>;
}
function TimelineItem({
  icon: Icon,
  color,
  bg,
  action,
  target,
  context,
  time,
  onOpen,
  onDelete
}) {
  return <div className="flex items-center gap-4 p-2.5 hover:bg-white/[0.02] rounded-xl transition-colors cursor-pointer group">
       <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${bg}`}>
          <Icon className={`w-3.5 h-3.5 ${color}`} />
       </div>
       <button onClick={onOpen} className="flex-1 min-w-0 text-left">
          <p className="text-[13px] text-gray-400 truncate">
            {action} <span className="text-blue-400 group-hover:underline">{target}</span> • <span className="text-gray-500">{context}</span>
          </p>
       </button>
       <span className="text-[11px] text-gray-500 shrink-0">{time}</span>
       {onDelete && <button onClick={event => {
      event.stopPropagation();
      onDelete();
    }} className="rounded-lg p-1 text-gray-600 opacity-0 transition hover:bg-red-500/10 hover:text-red-300 group-hover:opacity-100" title="Delete saved item">
           <Trash2 size={13} />
         </button>}
    </div>;
}
function CopilotQuery({
  text,
  onClick
}) {
  return <button onClick={() => onClick?.(text)} className="w-full flex items-center gap-3 p-3 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] rounded-xl transition-colors group text-left">
       <div className="w-5 h-5 rounded-md bg-white/[0.05] flex items-center justify-center shrink-0 border border-white/[0.05]">
          <Search className="w-3 h-3 text-gray-400 group-hover:text-blue-400 transition-colors" />
       </div>
       <span className="text-[12px] text-gray-300 group-hover:text-white transition-colors truncate">{text}</span>
    </button>;
}

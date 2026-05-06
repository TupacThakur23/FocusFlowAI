import { useEffect, useMemo, useState } from "react";
import api, { API_URL } from "../services/api";
import {
  Search, Settings, Bell, Home, FolderOpen, FileText, StickyNote,
  HelpCircle, Bookmark, Sparkles, AlignLeft, Lightbulb, MessageSquare,
  BookOpen, ExternalLink, Plus, Trash2, Loader2, ChevronRight, Clock,
  BrainCircuit, ArrowLeft
} from "lucide-react";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: Home },
];
const RESEARCH_NAV = [
  { id: "workspaces", label: "Workspaces", icon: FolderOpen },
  { id: "sources", label: "Sources", icon: FileText },
  { id: "notes", label: "Notes", icon: StickyNote },
  { id: "questions", label: "Questions", icon: HelpCircle },
  { id: "saved", label: "Saved Research", icon: Bookmark },
];

export default function ResearchHub({ onBack }) {
  const [researchList, setResearchList] = useState([]);
  const [workbooks, setWorkbooks] = useState(["Research Workbook"]);
  const [selectedWorkbook, setSelectedWorkbook] = useState("Research Workbook");
  const [activeNav, setActiveNav] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [showNewWorkbook, setShowNewWorkbook] = useState(false);
  const [newWorkbookName, setNewWorkbookName] = useState("");
  const [showAddSource, setShowAddSource] = useState(false);
  const [newSourceUrl, setNewSourceUrl] = useState("");
  const [showNewNote, setShowNewNote] = useState(false);
  const [newNoteText, setNewNoteText] = useState("");
  const [showAskInput, setShowAskInput] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [activePill, setActivePill] = useState("Summarize");
  const [viewAll, setViewAll] = useState({ sources: false, notes: false, questions: false });
  const [pillLoading, setPillLoading] = useState(false);
  const [pillOutput, setPillOutput] = useState("");

  useEffect(() => { loadResearch(); }, []);

  const loadResearch = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`${API_URL}/api/research`);
      const items = res.data || [];
      setResearchList(items);
      const names = [...new Set(items.map(i => i.workbook || "Research Workbook"))];
      setWorkbooks(names.length ? names : ["Research Workbook"]);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`${API_URL}/api/research/${id}`);
      setResearchList(prev => prev.filter(i => (i._id || i.id) !== id));
    } catch (e) { console.error(e); }
  };

  const handleCreateWorkbook = () => {
    const name = newWorkbookName.trim();
    if (!name || workbooks.includes(name)) return;
    setWorkbooks(prev => [...prev, name]);
    setSelectedWorkbook(name);
    setNewWorkbookName("");
    setShowNewWorkbook(false);
  };

  const handleAddSource = async () => {
    if (!newSourceUrl.trim()) return;
    try {
      const res = await api.post(`${API_URL}/api/research`, {
        topic: newSourceUrl, link: newSourceUrl, notes: "", workbook: selectedWorkbook,
      });
      setSearchQuery("");
      setResearchList(prev => [res.data, ...prev]);
      setNewSourceUrl(""); setShowAddSource(false);
    } catch (e) { console.error(e); }
  };

  const handleAddNote = async () => {
    if (!newNoteText.trim()) return;
    try {
      const res = await api.post(`${API_URL}/api/research`, {
        topic: newNoteText.substring(0, 60), notes: newNoteText, workbook: selectedWorkbook,
      });
      setSearchQuery("");
      setResearchList(prev => [res.data, ...prev]);
      setNewNoteText(""); setShowNewNote(false);
    } catch (e) { console.error(e); }
  };

  const handleAskQuestion = async () => {
    if (!newQuestion.trim()) return;
    try {
      const res = await api.post(`${API_URL}/api/research`, {
        topic: newQuestion, notes: `Q&A:\nQ: ${newQuestion}`, workbook: selectedWorkbook,
      });
      setSearchQuery("");
      setResearchList(prev => [res.data, ...prev]);
      setNewQuestion(""); setShowAskInput(false);
    } catch (e) { console.error(e); }
  };

  const handlePillAction = async (label) => {
    setActivePill(label);
    const allNotes = filtered.map(i => i.notes).filter(Boolean).join("\n");
    if (!allNotes && label !== "Ask") {
      setPillOutput("No content in this workspace yet. Add sources or notes first.");
      return;
    }
    setPillLoading(true);
    setPillOutput("");
    try {
      const prompts = {
        "Summarize": `Summarize these research notes concisely:\n\n${allNotes.slice(0, 4000)}`,
        "Explain": `Explain the key concepts from these notes in simple terms:\n\n${allNotes.slice(0, 4000)}`,
        "Ask": null,
        "Generate Notes": `Create structured study notes from this content:\n\n${allNotes.slice(0, 4000)}`,
        "Find Sources": `Suggest 5 related topics or sources to explore based on:\n\n${allNotes.slice(0, 4000)}`,
      };
      if (label === "Ask") {
        setPillOutput("Use the question input below to ask about your research.");
        setPillLoading(false);
        return;
      }
      const res = await api.post(`${API_URL}/api/ai/summarize`, { text: prompts[label] });
      setPillOutput(res.data.summary || "No output generated.");
    } catch (e) {
      console.error(e);
      setPillOutput("AI request failed. Check server connection.");
    } finally {
      setPillLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return researchList
      .filter(i => (i.workbook || "Research Workbook") === selectedWorkbook)
      .filter(i => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (i.topic || "").toLowerCase().includes(q) || (i.notes || "").toLowerCase().includes(q);
      });
  }, [researchList, selectedWorkbook, searchQuery]);

  const sources = filtered.filter(i => i.link);
  const notes = filtered.filter(i => i.notes);
  const questions = filtered.filter(i => i.notes?.includes("Q&A"));
  const latestSummary = filtered.find(i => i.notes?.includes("Summary:"));
  const summaryText = latestSummary?.notes?.split("Summary:\n")[1]?.split("\n\n")[0] || "";

  // Sidebar nav filtering
  const getNavContent = () => {
    switch (activeNav) {
      case "sources": return sources;
      case "notes": return notes.filter(i => !i.notes?.includes("Q&A"));
      case "questions": return questions;
      case "saved": return filtered;
      default: return null; // show dashboard
    }
  };
  const navFiltered = getNavContent();

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#f3f4f6] font-sans flex">
      {/* Left Sidebar */}
      <aside className="w-[220px] bg-[#0a0a0b] border-r border-[#1a1b1e] flex flex-col shrink-0 sticky top-0 h-screen">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <BrainCircuit className="w-6 h-6 text-[#3b82f6]" />
          <span className="text-base font-semibold text-white">Research Hub</span>
        </div>

        <nav className="flex-1 px-3 mt-1">
          {NAV_ITEMS.map(n => (
            <button key={n.id} onClick={() => setActiveNav(n.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm mb-0.5 transition-colors ${activeNav === n.id ? "bg-[#111214] text-white" : "text-[#9ca3af] hover:text-white hover:bg-[#111214]/60"}`}>
              <n.icon className="w-4 h-4" />{n.label}
            </button>
          ))}
          <p className="text-[10px] font-semibold text-[#6b7280] uppercase tracking-wider mt-5 mb-2 px-3">Research</p>
          {RESEARCH_NAV.map(n => (
            <button key={n.id} onClick={() => setActiveNav(n.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm mb-0.5 transition-colors ${activeNav === n.id ? "bg-[#111214] text-white" : "text-[#9ca3af] hover:text-white hover:bg-[#111214]/60"}`}>
              <n.icon className="w-4 h-4" />{n.label}
            </button>
          ))}
        </nav>

        <div className="mx-3 mb-3 bg-[#111214] border border-[#26272b] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-[#3b82f6]" />
            <span className="text-xs font-medium text-white">AI Assistant</span>
          </div>
          <p className="text-[10px] text-[#9ca3af] leading-relaxed mb-3">Powered by advanced research AI.</p>
          <button className="w-full bg-[#3b82f6]/10 border border-[#3b82f6]/20 text-[#3b82f6] text-xs font-medium py-1.5 rounded-lg hover:bg-[#3b82f6]/20 transition-colors">Learn more</button>
        </div>

        <div className="flex items-center gap-3 px-5 py-4 border-t border-[#1a1b1e]">
          <div className="w-8 h-8 rounded-full bg-[#10b981] flex items-center justify-center text-xs font-bold text-white">U</div>
          <div><p className="text-xs font-medium text-white">User</p><p className="text-[10px] text-[#6b7280]">Free Plan</p></div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="flex items-center gap-4 px-6 py-3 border-b border-[#1a1b1e] shrink-0 sticky top-0 bg-[#0a0a0b] z-10">
          <div className="flex-1 max-w-md">
            <div className="flex items-center gap-2 bg-[#111214] border border-[#26272b] rounded-lg px-3 py-2">
              <Search className="w-4 h-4 text-[#6b7280]" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search your research..."
                className="flex-1 bg-transparent border-none outline-none text-sm text-[#f3f4f6] placeholder:text-[#6b7280]" />
              <kbd className="text-[10px] text-[#6b7280] border border-[#26272b] px-1.5 py-0.5 rounded">⌘K</kbd>
            </div>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <Bell className="w-4.5 h-4.5 text-[#9ca3af] hover:text-white cursor-pointer transition-colors" />
            <Settings className="w-4.5 h-4.5 text-[#9ca3af] hover:text-white cursor-pointer transition-colors" />
            <div className="w-8 h-8 rounded-full bg-[#3b82f6] flex items-center justify-center text-xs font-bold text-white">U</div>
          </div>
        </header>

        {/* Content + Right Sidebar */}
        <div className="flex flex-1 overflow-hidden">
          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-6 min-w-0">
            {/* Breadcrumb */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2 text-sm">
                <FolderOpen className="w-4 h-4 text-[#9ca3af]" />
                <span className="text-[#9ca3af]">Workspaces</span>
                <ChevronRight className="w-3 h-3 text-[#6b7280]" />
                <span className="text-white font-medium">{selectedWorkbook}</span>
              </div>
              <button className="flex items-center gap-1.5 text-xs text-[#9ca3af] hover:text-white transition-colors">
                <Settings className="w-3.5 h-3.5" /> Workspace settings
              </button>
            </div>

            {/* Workspace Header */}
            <div className="bg-[#111214] border border-[#26272b] rounded-2xl p-6 mb-6">
              <div className="bg-[#17181c] w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <BrainCircuit className="w-6 h-6 text-[#3b82f6]" />
              </div>
              <h1 className="text-2xl font-semibold text-white mb-2">{selectedWorkbook}</h1>
              <p className="text-sm text-[#9ca3af] mb-4 max-w-2xl">Research workspace with {filtered.length} saved items, {sources.length} sources, and AI-powered analysis tools.</p>
              <div className="flex items-center gap-2 flex-wrap">
                {workbooks.map(w => (
                  <button key={w} onClick={() => setSelectedWorkbook(w)}
                    className={`px-3 py-1 rounded-full text-xs border transition-colors ${selectedWorkbook === w ? "border-[#3b82f6] text-[#3b82f6] bg-[#3b82f6]/5" : "border-[#26272b] text-[#9ca3af] hover:text-white"}`}>
                    {w}
                  </button>
                ))}
                <button onClick={() => setShowNewWorkbook(!showNewWorkbook)} className="px-2 py-1 rounded-full text-xs border border-dashed border-[#26272b] text-[#6b7280] hover:text-white transition-colors">
                  <Plus className="w-3 h-3" />
                </button>
                {showNewWorkbook && (
                  <div className="flex items-center gap-2 w-full mt-2">
                    <input value={newWorkbookName} onChange={e => setNewWorkbookName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreateWorkbook()} placeholder="Workbook name..." autoFocus className="flex-1 bg-[#17181c] border border-[#26272b] rounded-lg px-3 py-1.5 text-xs outline-none text-[#f3f4f6] focus:border-[#3b82f6]" />
                    <button onClick={handleCreateWorkbook} className="bg-[#3b82f6] text-white text-xs px-3 py-1.5 rounded-lg">Create</button>
                  </div>
                )}
              </div>
            </div>

            {/* Action Pills */}
            <div className="flex items-center gap-2 mb-6 flex-wrap">
              {[
                { icon: AlignLeft, label: "Summarize" },
                { icon: Lightbulb, label: "Explain" },
                { icon: MessageSquare, label: "Ask" },
                { icon: StickyNote, label: "Generate Notes" },
                { icon: Search, label: "Find Sources" },
              ].map(a => (
                <button key={a.label} onClick={() => handlePillAction(a.label)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${activePill === a.label ? "bg-[#3b82f6] border-[#3b82f6] text-white" : "bg-transparent border-[#26272b] text-[#9ca3af] hover:text-white hover:border-[#374151]"}`}>
                  <a.icon className="w-4 h-4" />{a.label}
                </button>
              ))}
            </div>

            {/* AI Pill Output */}
            {(pillLoading || pillOutput) && (
              <div className="bg-[#111214] border border-[#26272b] rounded-2xl p-5 mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-[#3b82f6]" />
                  <h2 className="text-base font-semibold text-white">AI {activePill}</h2>
                </div>
                {pillLoading ? (
                  <div className="flex items-center gap-2 py-4"><Loader2 className="w-5 h-5 animate-spin text-[#3b82f6]" /><span className="text-sm text-[#9ca3af]">Generating...</span></div>
                ) : (
                  <p className="text-sm text-[#d1d5db] leading-relaxed whitespace-pre-wrap">{pillOutput}</p>
                )}
              </div>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-[#3b82f6]" /></div>
            ) : (
              <>
                {/* Sources + AI Summary Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                  {/* Current Sources */}
                  <div className="bg-[#111214] border border-[#26272b] rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-base font-semibold text-white">Current Sources</h2>
                      <button onClick={() => setViewAll(p => ({...p, sources: !p.sources}))} className="text-xs text-[#3b82f6] cursor-pointer hover:underline">View all ({sources.length})</button>
                    </div>
                    <div className="space-y-3">
                      {(viewAll.sources ? sources : sources.slice(0, 3)).map(s => (
                        <div key={s._id || s.id} className="flex items-center gap-3 p-3 bg-[#17181c] rounded-xl hover:bg-[#1d1e22] transition-colors group">
                          <div className="w-10 h-10 rounded-lg bg-[#26272b] flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4 text-[#3b82f6]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white line-clamp-1">{s.topic}</p>
                            <p className="text-[11px] text-[#6b7280] mt-0.5">{new Date(s.date).toLocaleDateString()}</p>
                          </div>
                          {s.link && <a href={s.link} target="_blank" rel="noopener noreferrer" className="opacity-0 group-hover:opacity-100 transition-opacity"><ExternalLink className="w-4 h-4 text-[#9ca3af]" /></a>}
                        </div>
                      ))}
                      {sources.length === 0 && <p className="text-xs text-[#6b7280] italic py-4 text-center">No sources saved yet</p>}
                    </div>
                    {!showAddSource ? (
                      <button onClick={() => setShowAddSource(true)} className="flex items-center gap-1.5 text-xs text-[#9ca3af] hover:text-white mt-4 transition-colors"><Plus className="w-3 h-3" /> Add source</button>
                    ) : (
                      <div className="flex items-center gap-2 mt-4">
                        <input value={newSourceUrl} onChange={e => setNewSourceUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddSource()} placeholder="Paste URL..." autoFocus className="flex-1 bg-[#0a0a0b] border border-[#26272b] rounded-lg px-3 py-1.5 text-xs outline-none text-[#f3f4f6] focus:border-[#3b82f6]" />
                        <button onClick={handleAddSource} className="bg-[#3b82f6] text-white text-xs px-3 py-1.5 rounded-lg">Add</button>
                        <button onClick={() => setShowAddSource(false)} className="text-xs text-[#6b7280]">×</button>
                      </div>
                    )}
                  </div>

                  {/* AI Summary */}
                  <div className="bg-[#111214] border border-[#26272b] rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-4 h-4 text-[#3b82f6]" />
                      <h2 className="text-base font-semibold text-white">AI Summary</h2>
                    </div>
                    <p className="text-sm text-[#d1d5db] leading-relaxed">
                      {summaryText || "No AI summary available yet. Use Aide to extract and summarize content, then save it to this workspace."}
                    </p>
                    {summaryText && (
                      <button className="flex items-center gap-1.5 text-xs text-[#3b82f6] hover:underline mt-4">
                        <FileText className="w-3 h-3" /> View full summary <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Notes + Questions Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* Notes */}
                  <div className="bg-[#111214] border border-[#26272b] rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-base font-semibold text-white">Notes</h2>
                      <button onClick={() => setViewAll(p => ({...p, notes: !p.notes}))} className="text-xs text-[#3b82f6] cursor-pointer hover:underline">{viewAll.notes ? 'Collapse' : 'View all'}</button>
                    </div>
                    <div className="space-y-3">
                      {(viewAll.notes ? notes : notes.slice(0, 3)).map(n => (
                        <button key={n._id || n.id} onClick={() => setExpandedId(expandedId === (n._id || n.id) ? null : (n._id || n.id))}
                          className="w-full flex items-start gap-3 p-3 bg-[#17181c] rounded-xl hover:bg-[#1d1e22] transition-colors text-left">
                          <StickyNote className="w-4 h-4 text-[#9ca3af] mt-0.5 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-white line-clamp-1">{n.topic}</p>
                            <p className="text-[11px] text-[#6b7280] mt-0.5 flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(n.date).toLocaleDateString()}</p>
                            {expandedId === (n._id || n.id) && (
                              <div className="mt-2 pt-2 border-t border-[#26272b]">
                                <p className="text-xs text-[#d1d5db] whitespace-pre-wrap line-clamp-6">{n.notes}</p>
                                <div className="flex gap-3 mt-2">
                                  {n.link && <a href={n.link} target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#3b82f6] hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3" />Source</a>}
                                  <button onClick={(e) => { e.stopPropagation(); handleDelete(n._id || n.id); }} className="text-[10px] text-[#ef4444] hover:underline flex items-center gap-1"><Trash2 className="w-3 h-3" />Delete</button>
                                </div>
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                      {notes.length === 0 && <p className="text-xs text-[#6b7280] italic py-4 text-center">No notes saved yet</p>}
                    </div>
                    {!showNewNote ? (
                      <button onClick={() => setShowNewNote(true)} className="flex items-center gap-1.5 text-xs text-[#9ca3af] hover:text-white mt-4 transition-colors"><Plus className="w-3 h-3" /> New note</button>
                    ) : (
                      <div className="mt-4 flex flex-col gap-2">
                        <textarea value={newNoteText} onChange={e => setNewNoteText(e.target.value)} placeholder="Write a note..." autoFocus rows={3} className="w-full bg-[#0a0a0b] border border-[#26272b] rounded-lg px-3 py-2 text-xs outline-none text-[#f3f4f6] resize-none focus:border-[#3b82f6]" />
                        <div className="flex gap-2"><button onClick={handleAddNote} className="bg-[#3b82f6] text-white text-xs px-3 py-1.5 rounded-lg">Save</button><button onClick={() => setShowNewNote(false)} className="text-xs text-[#6b7280]">Cancel</button></div>
                      </div>
                    )}
                  </div>

                  {/* Related Questions */}
                  <div className="bg-[#111214] border border-[#26272b] rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-base font-semibold text-white">Related Questions</h2>
                      <button onClick={() => setViewAll(p => ({...p, questions: !p.questions}))} className="text-xs text-[#3b82f6] cursor-pointer hover:underline">{viewAll.questions ? 'Collapse' : 'View all'}</button>
                    </div>
                    <div className="space-y-3">
                      {(viewAll.questions ? questions : questions.slice(0, 3)).map(q => (
                        <div key={q._id || q.id} className="flex items-start gap-3 p-3 bg-[#17181c] rounded-xl">
                          <HelpCircle className="w-4 h-4 text-[#9ca3af] mt-0.5 shrink-0" />
                          <p className="text-sm text-[#d1d5db] line-clamp-2">{q.notes?.split("Q: ")[1]?.split("\n")[0] || q.topic}</p>
                        </div>
                      ))}
                      {questions.length === 0 && <p className="text-xs text-[#6b7280] italic py-4 text-center">No questions yet</p>}
                    </div>
                    {!showAskInput ? (
                      <button onClick={() => setShowAskInput(true)} className="flex items-center gap-1.5 text-xs text-[#9ca3af] hover:text-white mt-4 transition-colors"><Plus className="w-3 h-3" /> Ask a new question</button>
                    ) : (
                      <div className="flex items-center gap-2 mt-4">
                        <input value={newQuestion} onChange={e => setNewQuestion(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAskQuestion()} placeholder="Type a question..." autoFocus className="flex-1 bg-[#0a0a0b] border border-[#26272b] rounded-lg px-3 py-1.5 text-xs outline-none text-[#f3f4f6] focus:border-[#3b82f6]" />
                        <button onClick={handleAskQuestion} className="bg-[#3b82f6] text-white text-xs px-3 py-1.5 rounded-lg">Ask</button>
                        <button onClick={() => setShowAskInput(false)} className="text-xs text-[#6b7280]">×</button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </main>

          {/* Right Sidebar */}
          <aside className="w-[280px] border-l border-[#1a1b1e] p-5 overflow-y-auto shrink-0 hidden xl:block sticky top-[53px] h-[calc(100vh-53px)]">
            {/* Insights */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-[#3b82f6]" />
                <h3 className="text-sm font-semibold text-white">Insights</h3>
              </div>
              <div className="mb-4">
                <p className="text-[10px] font-semibold text-[#3b82f6] uppercase tracking-wider mb-2">Smart Suggestion</p>
                <div className="bg-[#111214] border border-[#26272b] rounded-xl p-4">
                  <p className="text-xs text-[#d1d5db] leading-relaxed mb-3">Consider exploring related topics to deepen your understanding of this research area.</p>
                  <button className="text-xs text-[#3b82f6] border border-[#3b82f6]/30 px-3 py-1.5 rounded-lg hover:bg-[#3b82f6]/10 transition-colors">Explore topic</button>
                </div>
              </div>

              <p className="text-[10px] font-semibold text-[#3b82f6] uppercase tracking-wider mb-2">Related Sources</p>
              <div className="space-y-2 mb-4">
                {sources.slice(0, 3).map(s => (
                  <a key={s._id || s.id} href={s.link} target="_blank" rel="noopener noreferrer"
                    className="flex items-start gap-3 p-3 bg-[#111214] border border-[#26272b] rounded-xl hover:bg-[#17181c] transition-colors group">
                    <div className="w-8 h-5 rounded bg-[#3b82f6]/20 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[8px] font-bold text-[#3b82f6]">SRC</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-white line-clamp-2">{s.topic}</p>
                      <p className="text-[10px] text-[#6b7280] mt-0.5">{new Date(s.date).toLocaleDateString()}</p>
                    </div>
                    <ExternalLink className="w-3 h-3 text-[#6b7280] opacity-0 group-hover:opacity-100 shrink-0 mt-1 transition-opacity" />
                  </a>
                ))}
              </div>
              {sources.length > 3 && (
                <button className="flex items-center justify-between w-full text-xs text-[#9ca3af] hover:text-white transition-colors">
                  View more sources <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Activity */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Workspace Activity</h3>
              <div className="space-y-3">
                {filtered.slice(0, 3).map(item => (
                  <div key={item._id || item.id} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#17181c] flex items-center justify-center shrink-0 mt-0.5">
                      <FileText className="w-3 h-3 text-[#9ca3af]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-[#9ca3af]">Source added</p>
                      <p className="text-xs text-white line-clamp-1">{item.topic}</p>
                      <p className="text-[10px] text-[#6b7280] mt-0.5">{new Date(item.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
              {filtered.length > 3 && (
                <button className="flex items-center justify-between w-full text-xs text-[#9ca3af] hover:text-white mt-4 transition-colors">
                  View all activity <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

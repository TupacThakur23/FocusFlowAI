import { useEffect, useMemo, useRef, useState } from "react";
import api, { API_URL } from "../services/api";
import {
  Settings,
  FileText,
  Sparkles,
  AlignLeft,
  Lightbulb,
  MessageSquare,
  Layers,
  BookOpen,
  Copy,
  Send,
  Book,
  FolderDown,
  ShieldCheck,
  ExternalLink,
  Loader2,
  LayoutTemplate,
  ArrowLeft
} from "lucide-react";

// Minimal Logo Component
const AideLogo = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 21L14 4H18L11 21H7Z" fill="#3b82f6"/>
    <path d="M4 21L9 9H13L8 21H4Z" fill="#1e3a8a"/>
  </svg>
);

export default function Dashboard({ onBack }) {
  const [researchList, setResearchList] = useState([]);
  const [workbooks, setWorkbooks] = useState(["Research Workbook"]);
  const [selectedWorkbook, setSelectedWorkbook] = useState("Research Workbook");
  const [ingestUrl, setIngestUrl] = useState("");
  
  // Data States
  const [documentText, setDocumentText] = useState("");
  const [summary, setSummary] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [relatedSources, setRelatedSources] = useState([]);
  const [selectedText, setSelectedText] = useState("");
  const [studyNotes, setStudyNotes] = useState("");
  
  // UI States
  const [activeView, setActiveView] = useState("summary"); // summary, explain, ask, sources, study
  const [isLoading, setIsLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [copyStatus, setCopyStatus] = useState("Copy");

  // Chrome Extension States
  const [currentTab, setCurrentTab] = useState(null);
  const [autoIngestedUrl, setAutoIngestedUrl] = useState("");
  const syncRef = useRef(null);

  useEffect(() => {
    loadResearch();

    if (!window.chrome?.storage?.session) return;

    const syncFromExtension = async () => {
      try {
        const data = await window.chrome.storage.session.get([
          "aideCurrentSelection",
          "aideCurrentTab",
        ]);

        if (data.aideCurrentSelection) setSelectedText(data.aideCurrentSelection);

        if (data.aideCurrentTab) {
          setCurrentTab(data.aideCurrentTab);
          if (!ingestUrl) setIngestUrl(data.aideCurrentTab.url || "");
        }
      } catch (error) {
        console.error(error);
      }
    };

    const requestActiveTab = () => {
      if (!window.chrome?.runtime?.sendMessage) return;
      window.chrome.runtime.sendMessage({ type: "AIDE_GET_ACTIVE_TAB" }, (response) => {
        if (window.chrome.runtime.lastError) return;
        if (response?.tab?.url) {
          setCurrentTab({ title: response.tab.title, url: response.tab.url });
          if (!ingestUrl) setIngestUrl(response.tab.url);
        }
      });
    };

    requestActiveTab();
    syncFromExtension();
    syncRef.current = window.setInterval(syncFromExtension, 1200);

    return () => {
      if (syncRef.current) window.clearInterval(syncRef.current);
    };
  }, [ingestUrl]);

  // Auto-ingest: when running as extension and a new tab URL is detected, extract automatically
  useEffect(() => {
    if (!window.chrome?.storage?.session) return;
    if (!currentTab?.url || currentTab.url === autoIngestedUrl || isExtracting || isLoading) return;
    
    const autoIngest = async () => {
      setIsExtracting(true);
      setIngestUrl(currentTab.url);
      try {
        const res = await api.post(`${API_URL}/api/focus/ingest`, { url: currentTab.url });
        setDocumentText(res.data.text || "");
        setAutoIngestedUrl(currentTab.url);
        setSummary("");
        setAnswer("");
        // Auto-summarize after extraction
        if (res.data.text) {
          handleSummarize(res.data.text);
        }
      } catch (error) {
        console.error("Auto-ingest failed:", error);
        setIsExtracting(false);
      }
    };

    autoIngest();
  }, [currentTab?.url, autoIngestedUrl, isExtracting, isLoading]);

  const loadResearch = async () => {
    try {
      const res = await api.get(`${API_URL}/api/research`);
      const items = res.data || [];
      setResearchList(items);
      const workbookNames = [...new Set(items.map((item) => item.workbook || "Research Workbook"))];
      setWorkbooks(workbookNames.length ? workbookNames : ["Research Workbook"]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUseCurrentTab = () => {
    if (currentTab?.url) {
      setIngestUrl(currentTab.url);
    }
  };

  const handleExtract = async () => {
    if (!ingestUrl) return;
    setIsExtracting(true);
    setSaveMessage("");

    try {
      const res = await api.post(`${API_URL}/api/focus/ingest`, { url: ingestUrl });
      setDocumentText(res.data.text || "No content extracted.");
      setSummary("");
      setAnswer("");
      handleSummarize(res.data.text);
    } catch (error) {
      console.error(error);
      setDocumentText("Error loading content.");
      setIsExtracting(false);
    }
  };

  const handleSummarize = async (textToUse = documentText) => {
    if (!textToUse) return;
    setIsLoading(true);
    setActiveView("summary");

    try {
      const res = await api.post(`${API_URL}/api/ai/summarize`, {
        text: `Summarize this page in a concise, professional paragraph:\n\n${textToUse}`,
      });
      setSummary(res.data.summary || "");
    } catch (error) {
      console.error(error);
      setSummary("Error generating summary.");
    } finally {
      setIsLoading(false);
      setIsExtracting(false);
    }
  };

  const handleAsk = async () => {
    if (!question) return;
    setIsLoading(true);
    setActiveView("ask");

    try {
      const res = await api.post(`${API_URL}/api/focus/query`, { question });
      setAnswer(res.data.answer || "No answer returned.");
      setQuestion("");
    } catch (error) {
      console.error(error);
      setAnswer("Error querying Aide.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExplainSelection = async () => {
    if (!selectedText && !documentText) return;
    setIsLoading(true);
    setActiveView("explain");
    
    const context = selectedText || documentText.substring(0, 1000);

    try {
      const res = await api.post(`${API_URL}/api/ai/summarize`, {
        text: `Explain this section simply:\n\n${context}`,
      });
      setAnswer(res.data.summary || "");
    } catch (error) {
      console.error(error);
      setAnswer("Error explaining.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRelatedSources = async () => {
    const baseText = summary || documentText;
    if (!baseText) return;
    setIsLoading(true);
    setActiveView("sources");

    try {
      const res = await api.post(`${API_URL}/api/ai/summarize`, {
        text: `Based on this text, list 3 related sources/topics to explore:\n\n${baseText.slice(0, 4000)}`,
      });
      
      const parsed = (res.data.summary || "")
        .split("\n")
        .filter(line => line.trim().length > 5)
        .slice(0, 3)
        .map((line, index) => ({ id: index + 1, text: line }));

      setRelatedSources(parsed);
    } catch (error) {
      console.error(error);
      setRelatedSources([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudy = async () => {
    const baseText = documentText;
    if (!baseText) return;
    setIsLoading(true);
    setActiveView("study");

    try {
      const res = await api.post(`${API_URL}/api/ai/summarize`, {
        text: `Create 3 flashcards or study questions based on this text:\n\n${baseText.slice(0, 4000)}`,
      });
      setStudyNotes(res.data.summary || "");
    } catch (error) {
      console.error(error);
      setStudyNotes("Error generating study notes.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    let content = "";
    if (activeView === "summary") content = summary;
    if (activeView === "explain" || activeView === "ask") content = answer;
    if (activeView === "sources") content = relatedSources.map(s => s.text).join('\n');
    if (activeView === "study") content = studyNotes;

    if (content) {
      navigator.clipboard.writeText(content);
      setCopyStatus("Copied!");
      setTimeout(() => setCopyStatus("Copy"), 2000);
    }
  };

  const handleSaveToWorkspace = async () => {
    const compiledNotes = [
      summary ? `Summary:\n${summary}` : "",
      answer ? `Q&A / Explanation:\n${answer}` : "",
      studyNotes ? `Study Notes:\n${studyNotes}` : "",
      relatedSources.length ? `Sources:\n${relatedSources.map((s) => s.text).join("\n")}` : "",
    ].filter(Boolean).join("\n\n");

    try {
      const res = await api.post(`${API_URL}/api/research`, {
        topic: currentTab?.title || "Untitled Source",
        notes: compiledNotes || documentText,
        link: ingestUrl,
        workbook: selectedWorkbook,
      });

      setSaveMessage("Saved!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      console.error(error);
      setSaveMessage("Error");
    }
  };

  const getActiveContent = () => {
    if (isLoading) return <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-[#3b82f6]" /></div>;
    
    switch (activeView) {
      case "summary":
        return summary ? <p className="leading-relaxed">{summary}</p> : <p className="italic text-[#9ca3af]">No summary available. Extract content first.</p>;
      case "explain":
        return answer ? <p className="leading-relaxed">{answer}</p> : <p className="italic text-[#9ca3af]">No explanation available.</p>;
      case "ask":
        return answer ? <p className="leading-relaxed">{answer}</p> : <p className="italic text-[#9ca3af]">Ask a question below.</p>;
      case "sources":
        return relatedSources.length > 0 ? (
          <ul className="space-y-3">
            {relatedSources.map(s => <li key={s.id} className="leading-relaxed">{s.text}</li>)}
          </ul>
        ) : <p className="italic text-[#9ca3af]">No sources found.</p>;
      case "study":
        return studyNotes ? <p className="leading-relaxed whitespace-pre-wrap">{studyNotes}</p> : <p className="italic text-[#9ca3af]">No study notes available.</p>;
      default:
        return null;
    }
  };

  const getWordCount = () => {
    let content = "";
    if (activeView === "summary") content = summary;
    if (activeView === "explain" || activeView === "ask") content = answer;
    if (activeView === "study") content = studyNotes;
    
    if (!content) return 0;
    return content.trim().split(/\s+/).length;
  };

  return (
    <div className="w-[400px] h-[600px] bg-[#0a0a0b] text-[#f3f4f6] font-sans flex flex-col relative overflow-hidden mx-auto border border-[#26272b] rounded-xl shadow-2xl">
      
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-[#26272b] shrink-0">
        <div className="flex items-center gap-2">
          {onBack && (
            <button onClick={onBack} className="p-1 rounded-md hover:bg-[#17181c] transition-colors">
              <ArrowLeft className="w-4 h-4 text-[#9ca3af]" />
            </button>
          )}
          <AideLogo />
          <h1 className="text-sm font-semibold tracking-wide text-white">Aide</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span className="text-xs font-medium text-[#9ca3af]">Ready</span>
          </div>
          <div className="h-4 w-px bg-[#26272b]"></div>
          <Settings className="w-4 h-4 text-[#9ca3af] hover:text-white cursor-pointer transition-colors" />
        </div>
      </header>

      {/* Main Scrollable Content */}
      <main className="flex-1 overflow-y-auto p-5 flex flex-col gap-5 custom-scrollbar">
        
        {/* Source Section */}
        <section className="flex flex-col gap-2 shrink-0">
          <label className="text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wider">Source</label>
          <div className="bg-[#111214] border border-[#26272b] rounded-xl p-3 flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="bg-[#17181c] p-2.5 rounded-lg flex shrink-0">
                <FileText className="w-5 h-5 text-[#3b82f6]" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <h3 className="text-sm font-medium text-white line-clamp-1">
                  {currentTab?.title || "No page selected"}
                </h3>
                <p className="text-xs text-[#9ca3af] line-clamp-1 mt-0.5">
                  {ingestUrl || currentTab?.url || "Navigate to an article to extract"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-1">
              <button 
                onClick={handleUseCurrentTab}
                className="flex-1 bg-[#17181c] border border-[#26272b] hover:bg-[#26272b] text-[#f3f4f6] text-xs font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <LayoutTemplate className="w-3.5 h-3.5" /> Use Current Tab
              </button>
              <button 
                onClick={handleExtract}
                disabled={isExtracting || !ingestUrl}
                className="flex-1 bg-[#3b82f6] hover:bg-blue-600 text-white text-xs font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {isExtracting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />} 
                Extract
              </button>
            </div>
          </div>
        </section>

        {/* Action Pills */}
        <section className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 shrink-0">
          <Pill 
            active={activeView === "summary"} 
            onClick={() => setActiveView("summary")}
            icon={<AlignLeft className="w-3.5 h-3.5" />} 
            label="Summarize" 
          />
          <Pill 
            active={activeView === "explain"} 
            onClick={handleExplainSelection}
            icon={<Lightbulb className="w-3.5 h-3.5" />} 
            label="Explain" 
          />
          <Pill 
            active={activeView === "ask"} 
            onClick={() => setActiveView("ask")}
            icon={<MessageSquare className="w-3.5 h-3.5" />} 
            label="Ask" 
          />
          <Pill 
            active={activeView === "sources"} 
            onClick={handleRelatedSources}
            icon={<Layers className="w-3.5 h-3.5" />} 
            label="Sources" 
          />
          <Pill 
            active={activeView === "study"} 
            onClick={handleStudy}
            icon={<BookOpen className="w-3.5 h-3.5" />} 
            label="Study" 
          />
        </section>

        {/* AI Output Section */}
        <section className="bg-[#111214] border border-[#26272b] rounded-xl p-4 flex flex-col gap-3 min-h-[140px] shrink-0">
          <label className="text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wider">
            AI {activeView.toUpperCase()}
          </label>
          <div className="text-[13px] text-[#d1d5db] flex-1">
            {getActiveContent()}
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-[#9ca3af]">
            <button 
              onClick={handleCopy}
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Copy className="w-3.5 h-3.5" /> {copyStatus}
            </button>
            <span>~ {getWordCount()} words</span>
          </div>
        </section>

        {/* Ask Input */}
        <section className="bg-[#111214] border border-[#26272b] rounded-xl p-1.5 flex items-center gap-2 shrink-0">
          <MessageSquare className="w-4 h-4 text-[#9ca3af] ml-2 shrink-0" />
          <input 
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAsk();
              }
            }}
            placeholder="Ask a question about this content..."
            className="flex-1 bg-transparent border-none outline-none text-[13px] text-[#f3f4f6] placeholder:text-[#6b7280]"
          />
          <button 
            onClick={handleAsk}
            disabled={!question || isLoading}
            className="bg-[#3b82f6] hover:bg-blue-600 text-white text-[13px] font-medium px-4 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" /> Ask
          </button>
        </section>

        {/* Save to Workspace */}
        <section className="bg-[#111214] border border-[#26272b] rounded-xl p-4 flex flex-col gap-3 shrink-0">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wider">Save to Workspace</label>
            {saveMessage && <span className="text-[10px] text-green-400 font-medium">{saveMessage}</span>}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Book className="w-4 h-4 text-[#9ca3af]" />
              </div>
              <select 
                value={selectedWorkbook}
                onChange={(e) => setSelectedWorkbook(e.target.value)}
                className="w-full bg-[#17181c] border border-[#26272b] text-[#f3f4f6] text-[13px] rounded-lg py-2 pl-9 pr-3 appearance-none outline-none focus:border-[#3b82f6]"
              >
                {workbooks.map(book => <option key={book} value={book}>{book}</option>)}
              </select>
            </div>
            <button 
              onClick={handleSaveToWorkspace}
              className="flex-1 bg-[#3b82f6] hover:bg-blue-600 text-white text-[13px] font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <FolderDown className="w-4 h-4" /> Save to Workspace
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="flex items-center justify-between mt-auto pt-1 pb-2">
          <div className="flex items-center gap-1.5 text-[#9ca3af]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="text-[11px]">Your data stays private and secure.</span>
          </div>
          <a href="#" className="flex items-center gap-1 text-[11px] text-[#9ca3af] hover:text-white transition-colors">
            Learn more <ExternalLink className="w-3 h-3" />
          </a>
        </footer>

      </main>
    </div>
  );
}

const Pill = ({ active, onClick, icon, label }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium border transition-colors whitespace-nowrap shrink-0 ${
        active 
          ? "bg-transparent border-[#3b82f6] text-[#3b82f6]" 
          : "bg-transparent border-[#26272b] text-[#9ca3af] hover:text-[#f3f4f6] hover:border-[#374151]"
      }`}
    >
      {icon} {label}
    </button>
  );
};
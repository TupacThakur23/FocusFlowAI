import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, BookmarkPlus, BookOpen, BrainCircuit, CheckCircle2, ChevronDown,
  Clock, Copy, ExternalLink, FileText, GraduationCap, Lightbulb, Link2, List,
  Loader2, Mic, Minus, Plus, RefreshCw, Save, Search, Send, Sparkles, Star, X, Zap
} from "lucide-react";
import { useExtension } from "../lib/extension/ExtensionProvider";
import api from "../services/api";

const tools = [
  { id: "SUMMARY", icon: FileText, label: "Summary", desc: "Get concise summaries", color: "#b45cff", glow: "shadow-purple-500/20", border: "border-purple-500/40", bg: "bg-purple-500/[0.05]" },
  { id: "EXPLAIN", icon: Lightbulb, label: "Explain", desc: "Understand complex topics", color: "#22d3ee", glow: "shadow-cyan-500/20", border: "border-cyan-500/40", bg: "bg-cyan-500/[0.05]" },
  { id: "SOURCES", icon: Link2, label: "Sources", desc: "Discover related sources", color: "#00f58a", glow: "shadow-emerald-500/20", border: "border-emerald-500/40", bg: "bg-emerald-500/[0.05]" },
  { id: "POINTS", icon: List, label: "Key Points", desc: "Extract key takeaways", color: "#ffd21f", glow: "shadow-yellow-500/20", border: "border-yellow-500/40", bg: "bg-yellow-500/[0.05]" },
  { id: "CARDS", icon: GraduationCap, label: "Flashcards", desc: "Generate smart flashcards", color: "#ff5cdf", glow: "shadow-pink-500/20", border: "border-pink-500/40", bg: "bg-pink-500/[0.05]" },
  { id: "VIVA", icon: Sparkles, label: "Viva Mode", desc: "Test your understanding", color: "#a855ff", glow: "shadow-violet-500/20", border: "border-violet-500/40", bg: "bg-violet-500/[0.05]" },
];

const fallbackPage = {
  title: "Current webpage",
  hostname: "ready for context",
  url: "manual-context",
  favicon: "icon.png",
  text: "FocusFlow AI helps convert browsing into research by extracting page context, summarizing ideas, explaining concepts, generating flashcards, preparing viva questions, and saving knowledge into workbooks.",
};

const defaultWorkbookOptions = [
  { name: "Research Workbook", meta: "Default research space", color: "from-blue-500 to-violet-600" },
];

const cleanWords = (text = "") => text.replace(/\s+/g, " ").trim();
const sentenceSplit = (text = "") => cleanWords(text).split(/(?<=[.!?])\s+/).filter(Boolean);
const readingTime = (text = "") => Math.max(1, Math.ceil(cleanWords(text).split(/\s+/).filter(Boolean).length / 220));

function hostnameFrom(url, fallback = "current page") {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return fallback; }
}

function inferTopics(text = "", title = "") {
  const source = `${title} ${text}`.toLowerCase();
  const choices = [
    ["AI", ["ai", "artificial intelligence", "model", "machine learning", "neural"]],
    ["Architecture", ["architecture", "system", "framework", "structure"]],
    ["Research", ["research", "study", "paper", "analysis", "survey"]],
    ["Learning", ["learn", "student", "education", "revision", "concept"]],
    ["Ethics", ["ethic", "alignment", "safety", "responsible", "risk"]],
    ["Technology", ["software", "browser", "extension", "web", "engineering"]],
  ];
  const found = choices.filter(([, keys]) => keys.some((key) => source.includes(key))).map(([label]) => label);
  return [...new Set(found), "Context", "Knowledge"].slice(0, 4);
}

function makeFlashcards(analysis) {
  return analysis.topics.slice(0, 6).map((topic, index) => ({
    q: index % 2 === 0 ? `What is ${topic}?` : `Why is ${topic} important?`,
    a: analysis.keyPoints[index] || `${topic} is one of the main ideas detected in this page context.`,
  }));
}

function makeVivaQuestions(analysis) {
  return [
    { q: `What is the main idea of ${analysis.title}?`, a: analysis.summary },
    { q: `Which topic is most important here?`, a: analysis.topics[0] || "The extracted page context." },
    { q: "What practical insight can you take from this page?", a: analysis.insight },
    { q: "What would you research next?", a: `Follow the connected ideas around ${analysis.topics.slice(0, 2).join(" and ")}.` },
  ];
}

function buildLocalAnalysis(page, ai = null) {
  const text = cleanWords(page?.text || page?.content || page?.summary || fallbackPage.text);
  const title = page?.title || fallbackPage.title;
  const url = page?.url || fallbackPage.url;
  const sentences = sentenceSplit(text);
  const topics = (ai?.topics?.length ? ai.topics : inferTopics(text, title)).slice(0, 5);
  const keyPoints = (ai?.keyPoints?.length ? ai.keyPoints : sentences.slice(0, 5)).map((point) => String(point).replace(/^[-*]\s*/, "").slice(0, 180));
  const summary = ai?.summary || sentences.slice(0, 2).join(" ") || "This page is ready for focused AI research.";

  return {
    title,
    url,
    hostname: page?.hostname || hostnameFrom(url, fallbackPage.hostname),
    favicon: page?.favicon || page?.favIconUrl || "icon.png",
    text,
    topics,
    keyPoints: keyPoints.length ? keyPoints : [summary],
    summary,
    insight: keyPoints[0] || `${title} connects ${topics.slice(0, 2).join(" and ").toLowerCase()} into a research thread.`,
    readingTime: page?.readingTime || readingTime(text),
    contentType: ai?.contentType || "webpage",
    complexity: ai?.complexity || "intermediate",
  };
}

function sourceCards(analysis) {
  return analysis.topics.slice(0, 4).map((topic) => ({
    title: `${topic} research path`,
    desc: `Explore supporting references connected to ${topic.toLowerCase()} and this page.`,
    url: `https://www.google.com/search?q=${encodeURIComponent(`${topic} ${analysis.title}`)}`,
  }));
}

export default function Dashboard() {
  const { actions, researchSession, currentTab, selectedText } = useExtension();
  const [viewMode, setViewMode] = useState("HOME");
  const [extractionState, setExtractionState] = useState("IDLE");
  const [pageAnalysis, setPageAnalysis] = useState(null);
  const [showSaveDrawer, setShowSaveDrawer] = useState(false);
  const [query, setQuery] = useState("");
  const [chatLines, setChatLines] = useState([]);
  const [workbook, setWorkbook] = useState(defaultWorkbookOptions[0].name);
  const [workbookOptions, setWorkbookOptions] = useState(defaultWorkbookOptions);
  const [selectedSaveTypes, setSelectedSaveTypes] = useState(["Summary"]);
  const [selectedTags, setSelectedTags] = useState(["AI", "Research"]);
  const [isSaving, setIsSaving] = useState(false);
  const [isAsking, setIsAsking] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const activePage = useMemo(() => {
    const pages = researchSession?.pages || researchSession?.extractedPages || [];
    return pageAnalysis || pages[pages.length - 1] || currentTab || fallbackPage;
  }, [researchSession, currentTab, pageAnalysis]);

  const analysis = pageAnalysis || buildLocalAnalysis(activePage);
  const activeTool = tools.find((tool) => tool.id === viewMode);
  const hasExtracted = extractionState === "COMPLETED" || Boolean(pageAnalysis);

  useEffect(() => {
    let cancelled = false;
    const fetchWorkbooks = async () => {
      try {
        const res = await api.get("/api/research/workbooks");
        const names = Array.isArray(res.data) && res.data.length ? res.data : defaultWorkbookOptions.map((item) => item.name);
        if (cancelled) return;
        const options = names.map((name, index) => ({
          name,
          meta: index === 0 ? "Primary research space" : "Saved workbook",
          color: ["from-blue-500 to-violet-600", "from-emerald-400 to-teal-600", "from-orange-400 to-amber-600", "from-cyan-400 to-blue-700"][index % 4],
        }));
        setWorkbookOptions(options);
        setWorkbook((current) => options.some((option) => option.name === current) ? current : options[0].name);
      } catch (err) {
        console.warn("Workbook list unavailable, using local defaults", err?.message);
      }
    };
    fetchWorkbooks();
    return () => { cancelled = true; };
  }, []);

  const runDeepAnalysis = async (page) => {
    try {
      const res = await api.post("/api/ai/deep-analysis", {
        text: page.text || page.content || "",
        title: page.title,
        url: page.url,
        wordCount: cleanWords(page.text || page.content || "").split(/\s+/).length,
      });
      return res.data;
    } catch (err) {
      console.warn("Deep analysis unavailable, using local analysis", err?.message);
      return null;
    }
  };

  const handleStartExtraction = async () => {
    setExtractionState("EXTRACTING");
    setSaveMessage("");
    try {
      let content = null;
      const response = await (actions.extractContent?.() || actions.sendMessage?.({ type: "EXTRACT_CONTENT_REQUEST" }));
      if (response?.success && response.content) {
        content = response.content;
        await actions.sendMessage?.({ type: "SAVE_TO_SESSION", content });
      }

      const page = content || activePage || fallbackPage;
      const ai = page.text || page.content ? await runDeepAnalysis(page) : null;
      setPageAnalysis(buildLocalAnalysis(page, ai));
      setExtractionState("COMPLETED");
    } catch (err) {
      console.error("Extraction failed:", err);
      setPageAnalysis(buildLocalAnalysis(activePage || fallbackPage));
      setExtractionState("COMPLETED");
    }
  };

  const savePayload = (type = "page") => ({
    topic: analysis.title,
    link: analysis.url,
    workbook,
    summary: analysis.summary,
    notes: `${analysis.insight}\n\nTopics: ${analysis.topics.join(", ")}`,
    outputs: {
      summary: analysis.summary,
      answer: chatLines[chatLines.length - 1]?.a || "",
      question: chatLines[chatLines.length - 1]?.q || "",
      selectedText: analysis.text.slice(0, 4000),
      studyNotes: analysis.keyPoints.join("\n"),
      relatedSources: sourceCards(analysis).map((source, index) => ({
        id: index + 1,
        text: source.desc,
        title: source.title,
        url: source.url,
      })),
      flashcards: makeFlashcards(analysis),
      viva: makeVivaQuestions(analysis),
      saveType: type,
      saveOptions: selectedSaveTypes,
      tags: selectedTags,
    },
  });

  const handleSave = async (type = "page") => {
    setIsSaving(true);
    setSaveMessage("");
    try {
      await api.post("/api/research", savePayload(type));
      setWorkbookOptions((options) => (
        options.some((option) => option.name === workbook)
          ? options
          : [{ name: workbook, meta: "Saved workbook", color: "from-blue-500 to-violet-600" }, ...options]
      ));
      setSaveMessage(type === "session" ? "Session saved to Research Hub" : "Page saved to Research Hub");
    } catch (err) {
      console.error("Save failed:", err);
      setSaveMessage("Start the backend server, then save again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSend = async () => {
    const question = query.trim();
    if (!question || isAsking) return;
    setQuery("");
    setIsAsking(true);
    setChatLines((lines) => [...lines.slice(-3), { q: question, a: "Thinking..." }]);
    try {
      const res = await api.post("/api/ai/ask", { context: analysis.text, question });
      const answer = res.data?.answer || analysis.insight;
      setChatLines((lines) => [...lines.slice(0, -1), { q: question, a: answer }]);
    } catch (err) {
      setChatLines((lines) => [...lines.slice(0, -1), { q: question, a: hasExtracted ? analysis.insight : "Extract the page first and I can answer with full context." }]);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#020614] text-white font-sans selection:bg-blue-500/30">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(70,91,255,0.20),transparent_35%),radial-gradient(circle_at_90%_35%,rgba(143,68,255,0.10),transparent_34%)]" />

      <header className="relative z-20 flex h-[76px] shrink-0 items-center justify-between border-b border-white/[0.08] px-5">
        {viewMode === "HOME" ? (
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <img src="icon.png" alt="" className="h-9 w-9 rounded-xl object-contain" />
              <h1 className="text-[15px] font-black tracking-tight">FocusFlow <span className="text-blue-400">AI</span></h1>
            </div>
            <div className="mt-1 flex items-center gap-2 pl-0.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399]" />
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-400">Ready</span>
            </div>
          </div>
        ) : (
          <button onClick={() => setViewMode("HOME")} className="group flex items-center gap-3 text-left">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-gray-300 transition group-hover:border-white/20 group-hover:text-white">
              <ArrowLeft size={18} />
            </span>
            <span className="text-[13px] font-black" style={{ color: activeTool?.color }}>{activeTool?.label}</span>
          </button>
        )}
        <div className="flex items-center gap-2 text-gray-400">
          <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] hover:text-white"><Minus size={15} /></button>
          <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] hover:text-white"><X size={16} /></button>
        </div>
      </header>

      <main className="relative z-10 flex-1 overflow-y-auto px-5 pb-32 pt-4 no-scrollbar">
        {viewMode === "HOME" ? (
          <div className="space-y-4">
            <PageContextCard analysis={analysis} onRefresh={handleStartExtraction} />
            <ExtractionCard state={extractionState} analysis={analysis} onExtract={handleStartExtraction} />
            <div className="grid grid-cols-2 gap-3">
              {tools.map((tool) => <ToolCard key={tool.id} tool={tool} onClick={() => setViewMode(tool.id)} />)}
            </div>
            {chatLines.map((line, index) => <ChatPreview key={index} line={line} />)}
          </div>
        ) : (
          <FeatureView mode={viewMode} analysis={analysis} selectedText={selectedText} />
        )}
      </main>

      <footer className="absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-[#020614] via-[#020614]/95 to-transparent px-4 pb-4 pt-12">
        {showSaveDrawer && (
          <SaveDrawer
            workbook={workbook}
            setWorkbook={setWorkbook}
            workbookOptions={workbookOptions}
            selectedSaveTypes={selectedSaveTypes}
            setSelectedSaveTypes={setSelectedSaveTypes}
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
            isSaving={isSaving}
            saveMessage={saveMessage}
            onClose={() => setShowSaveDrawer(false)}
            onSave={() => handleSave("workbook")}
          />
        )}

        <div className="flex h-[68px] items-center gap-2 rounded-2xl border border-white/10 bg-[#080d1d]/90 p-2 shadow-2xl backdrop-blur-2xl">
          <button onClick={() => setShowSaveDrawer((v) => !v)} className={`flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl border text-[8px] font-black uppercase transition ${showSaveDrawer ? "border-blue-400 bg-blue-600 text-white" : "border-blue-500/20 bg-blue-500/[0.08] text-blue-300 hover:text-white"}`}><BookmarkPlus size={15} />Save</button>
          <button className="flex h-12 shrink-0 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 text-[10px] font-black uppercase tracking-[0.12em] text-gray-300"><Zap size={15} />Prompts <ChevronDown size={13} /></button>
          <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} placeholder="Ask anything..." className="min-w-0 flex-1 bg-transparent px-2 text-[13px] font-medium text-white outline-none placeholder:text-gray-600" />
          <button className="p-2 text-gray-500 hover:text-blue-300"><Mic size={18} /></button>
          <button onClick={handleSend} disabled={isAsking} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/30 disabled:opacity-60">{isAsking ? <Loader2 size={18} className="animate-spin" /> : <Send size={19} />}</button>
        </div>
        <div className="mt-3 flex items-center justify-center gap-6 text-[8px] font-black uppercase tracking-[0.18em] text-gray-600">
          <span>End-to-end encrypted</span>
          <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />Real-time context</span>
        </div>
      </footer>
    </div>
  );
}

function PageContextCard({ analysis, onRefresh }) {
  return (
    <section className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.035] p-3.5 backdrop-blur-xl">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.05]">
        <img src={analysis.favicon || "icon.png"} alt="" className="h-5 w-5 object-contain" />
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-[13px] font-black text-white">{analysis.title}</h2>
        <p className="mt-0.5 truncate text-[11px] font-medium text-gray-500">{analysis.hostname}</p>
      </div>
      <button onClick={onRefresh} className="rounded-lg p-2 text-gray-500 transition hover:bg-white/[0.05] hover:text-white" title="Refresh context"><ExternalLink size={17} /></button>
    </section>
  );
}

function ExtractionCard({ state, analysis, onExtract }) {
  const completed = state === "COMPLETED";
  const extracting = state === "EXTRACTING";
  return (
    <section className="relative overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#050a1a]/80 p-6 text-center shadow-2xl backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/70 to-transparent" />
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 shadow-[0_0_45px_rgba(68,100,255,0.35)]">
        {extracting ? <Loader2 className="h-8 w-8 animate-spin" /> : completed ? <CheckCircle2 className="h-8 w-8 text-emerald-300" /> : <BrainCircuit className="h-8 w-8" />}
      </div>
      {completed ? (
        <div>
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">Extraction Complete</p>
          <h2 className="mx-auto mb-3 max-w-[360px] text-[14px] font-black leading-snug text-white">{analysis.insight}</h2>
          <div className="mb-4 flex flex-wrap justify-center gap-2">
            {analysis.topics.map((topic) => <span key={topic} className="rounded-full border border-blue-400/15 bg-blue-500/[0.06] px-3 py-1 text-[10px] font-bold text-gray-300">{topic}</span>)}
          </div>
          <p className="mx-auto mb-4 line-clamp-2 max-w-[370px] text-[12px] leading-relaxed text-gray-400">{analysis.summary}</p>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.04] px-3 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-gray-500"><Clock size={12} /> {analysis.readingTime} min read</div>
        </div>
      ) : (
        <div>
          <h2 className="mb-2 text-[17px] font-black text-white">Ready to analyze this page</h2>
          <p className="mx-auto mb-5 max-w-[300px] text-[12px] leading-relaxed text-gray-400">Extract key insights, summarize content, and uncover what matters.</p>
          <button onClick={onExtract} disabled={extracting} className="inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 px-7 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-white shadow-lg shadow-blue-600/30 transition active:scale-95 disabled:opacity-70">{extracting ? "Extracting" : "Extract Content"}<Zap size={14} /></button>
        </div>
      )}
    </section>
  );
}

function ToolCard({ tool, onClick }) {
  return (
    <button onClick={onClick} className={`group relative min-h-[118px] overflow-hidden rounded-2xl border ${tool.border} ${tool.bg} p-4 text-left shadow-xl ${tool.glow} transition duration-300 hover:-translate-y-0.5 hover:bg-white/[0.055]`}>
      <div className="flex h-full items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-black/20" style={{ color: tool.color }}><tool.icon size={28} /></div>
        <div className="min-w-0">
          <p className="text-[13px] font-black uppercase tracking-[0.09em] text-white">{tool.label}</p>
          <p className="mt-2 text-[12px] leading-snug text-gray-400">{tool.desc}</p>
          <div className="mt-3 h-0.5 w-9 rounded-full" style={{ background: tool.color }} />
        </div>
      </div>
    </button>
  );
}

function FeatureView({ mode, analysis, selectedText }) {
  if (mode === "SUMMARY") return <FeaturePanel title="AI Summary" color="#b45cff"><p>{analysis.summary}</p><ul className="space-y-2">{analysis.keyPoints.slice(0, 3).map((p) => <FeatureBullet key={p} color="#b45cff">{p}</FeatureBullet>)}</ul></FeaturePanel>;
  if (mode === "EXPLAIN") return <FeaturePanel title="Explanation" color="#22d3ee"><p>{selectedText ? `Selected text: ${selectedText}` : "Highlight text on the webpage, then return here for a contextual explanation."}</p><p>{selectedText ? `In simple terms, this connects to ${analysis.topics.slice(0, 2).join(" and ").toLowerCase()}. ${analysis.insight}` : analysis.insight}</p></FeaturePanel>;
  if (mode === "SOURCES") return <FeaturePanel title="Related Sources" color="#00f58a">{sourceCards(analysis).map((source) => <SourceRow key={source.url} source={source} />)}</FeaturePanel>;
  if (mode === "POINTS") return <FeaturePanel title="Key Points" color="#ffd21f"><ul className="space-y-3">{analysis.keyPoints.map((point) => <FeatureBullet key={point} color="#ffd21f">{point}</FeatureBullet>)}</ul></FeaturePanel>;
  if (mode === "CARDS") return <FeaturePanel title="Flashcards" color="#ff5cdf"><div className="grid grid-cols-2 gap-3">{makeFlashcards(analysis).slice(0, 4).map((card) => <Flashcard key={card.q} card={card} />)}</div><div className="mt-3 flex justify-center gap-1.5"><span className="h-1.5 w-5 rounded-full bg-violet-400" /><span className="h-1.5 w-1.5 rounded-full bg-white/20" /><span className="h-1.5 w-1.5 rounded-full bg-white/20" /></div></FeaturePanel>;
  return <FeaturePanel title="Viva Questions" color="#a855ff"><div className="space-y-3">{makeVivaQuestions(analysis).map((item, index) => <div key={item.q} className="text-[12px] leading-relaxed"><p className="font-bold text-white">Q{index + 1}. {item.q}</p><p className="mt-1 text-gray-400">A. {item.a}</p></div>)}</div></FeaturePanel>;
}

function FeaturePanel({ title, color, children }) {
  return (
    <section className="rounded-2xl border border-white/[0.10] bg-[#060b19]/85 text-[13px] leading-relaxed text-gray-300 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
        <h2 className="text-[11px] font-black uppercase tracking-[0.16em]" style={{ color }}>{title}</h2>
        <Copy size={16} className="text-gray-500" />
      </div>
      <div className="space-y-4 p-4">{children}</div>
    </section>
  );
}

function FeatureBullet({ color, children }) {
  return <li className="flex gap-3 text-[12px] leading-relaxed text-gray-300"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: color }} />{children}</li>;
}

function SourceRow({ source }) {
  return <a href={source.url} target="_blank" rel="noreferrer" className="flex gap-3 rounded-xl border border-white/[0.05] bg-white/[0.03] p-3 transition hover:bg-white/[0.06]"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300" /><span className="min-w-0 flex-1"><span className="block text-[12px] font-bold text-white">{source.title}</span><span className="mt-1 block truncate text-[11px] text-blue-400">{source.url}</span></span><ExternalLink size={14} className="text-gray-500" /></a>;
}

function Flashcard({ card }) {
  return <div className="min-h-[118px] rounded-xl border border-pink-400/25 bg-pink-500/[0.04] p-3"><h3 className="mb-2 text-[11px] font-black text-white">{card.q}</h3><p className="line-clamp-4 text-[10px] leading-relaxed text-gray-400">{card.a}</p></div>;
}

function ChatPreview({ line }) {
  return <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 text-[12px] leading-relaxed text-gray-300"><p className="mb-2 font-bold text-white">{line.q}</p><p>{line.a}</p></div>;
}

const saveTypeOptions = [
  { id: "Summary", icon: FileText },
  { id: "Key Points", icon: List },
  { id: "Full Content", icon: FileText },
  { id: "Flashcards", icon: GraduationCap },
  { id: "Viva Notes", icon: Sparkles },
];

const tagOptions = ["AI", "Research", "ML", "Study"];

function SaveDrawer({ workbook, setWorkbook, workbookOptions, selectedSaveTypes, setSelectedSaveTypes, selectedTags, setSelectedTags, isSaving, saveMessage, onClose, onSave }) {
  const [isCreatingWorkbook, setIsCreatingWorkbook] = useState(false);
  const [draftWorkbook, setDraftWorkbook] = useState("");
  const visibleWorkbookOptions = workbookOptions.some((option) => option.name === workbook)
    ? workbookOptions
    : [{ name: workbook, meta: "New workbook", color: "from-blue-500 to-violet-600" }, ...workbookOptions];

  const toggleSaveType = (id) => {
    setSelectedSaveTypes((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  };

  const toggleTag = (tag) => {
    setSelectedTags((items) => items.includes(tag) ? items.filter((item) => item !== tag) : [...items, tag]);
  };

  const createWorkbook = () => {
    const name = draftWorkbook.trim();
    if (!name) return;
    setWorkbook(name);
    setDraftWorkbook("");
    setIsCreatingWorkbook(false);
  };

  return (
    <div className="mb-3 rounded-2xl border border-white/10 bg-[#080d1d]/95 p-4 shadow-2xl backdrop-blur-2xl">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-400/30 bg-violet-500/[0.12] text-violet-300">
            <BookmarkPlus size={18} />
          </div>
          <div>
            <h3 className="text-[13px] font-black text-white">Save to Research Hub</h3>
            <p className="mt-0.5 text-[11px] text-gray-500">Organize and revisit your knowledge</p>
          </div>
        </div>
        <button onClick={onClose} className="rounded-lg p-1 text-gray-500 transition hover:bg-white/[0.05] hover:text-white"><X size={16} /></button>
      </div>

      <div className="grid grid-cols-[1fr_0.95fr] gap-5">
        <div>
          <p className="mb-2 text-[9px] font-black uppercase tracking-[0.16em] text-gray-500">Select Workbook</p>
          <div className="space-y-2">
            {visibleWorkbookOptions.map((option) => {
              const active = workbook === option.name;
              return (
                <button key={option.name} onClick={() => setWorkbook(option.name)} className={`flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition ${active ? "border-blue-500 bg-blue-500/[0.10]" : "border-white/[0.07] bg-white/[0.035] hover:border-white/[0.14]"}`}>
                  <span className={`h-8 w-8 shrink-0 rounded-lg bg-gradient-to-br ${option.color} shadow-lg`} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12px] font-black text-white">{option.name}</span>
                    <span className="mt-0.5 block truncate text-[10px] font-medium text-gray-500">{option.meta}</span>
                  </span>
                  <Star size={15} className={active ? "text-blue-300" : "text-gray-500"} />
                </button>
              );
            })}
            {isCreatingWorkbook ? (
              <div className="rounded-xl border border-dashed border-violet-500/70 bg-violet-500/[0.04] p-2">
                <input
                  value={draftWorkbook}
                  onChange={(event) => setDraftWorkbook(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && createWorkbook()}
                  autoFocus
                  placeholder="Workbook name"
                  className="mb-2 w-full rounded-lg border border-white/[0.08] bg-black/20 px-3 py-2 text-[11px] font-bold text-white outline-none placeholder:text-gray-600 focus:border-violet-400/50"
                />
                <div className="flex gap-2">
                  <button onClick={createWorkbook} className="flex-1 rounded-lg bg-violet-500 px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-white">Use</button>
                  <button onClick={() => { setDraftWorkbook(""); setIsCreatingWorkbook(false); }} className="rounded-lg border border-white/[0.08] px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-gray-400">Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setIsCreatingWorkbook(true)} className="flex w-full items-center justify-center gap-3 rounded-xl border border-dashed border-violet-500/70 bg-violet-500/[0.04] px-3 py-3 text-[11px] font-black text-violet-300 transition hover:bg-violet-500/[0.10]">
                <Plus size={16} /> Create New Workbook
              </button>
            )}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[9px] font-black uppercase tracking-[0.16em] text-gray-500">What to Save</p>
          <div className="grid grid-cols-2 gap-2">
            {saveTypeOptions.map(({ id, icon: Icon }) => {
              const active = selectedSaveTypes.includes(id);
              return (
                <button key={id} onClick={() => toggleSaveType(id)} className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-[11px] font-bold transition ${active ? "border-blue-500 bg-blue-500/[0.10] text-white" : "border-white/[0.07] bg-white/[0.04] text-gray-300 hover:border-white/[0.14]"}`}>
                  <Icon size={15} className={active ? "text-blue-300" : "text-gray-500"} /> {id}
                </button>
              );
            })}
          </div>

          <p className="mb-2 mt-6 text-[9px] font-black uppercase tracking-[0.16em] text-gray-500">Add Tags (Optional)</p>
          <div className="mb-6 flex flex-wrap gap-2">
            {tagOptions.map((tag) => {
              const active = selectedTags.includes(tag);
              return <button key={tag} onClick={() => toggleTag(tag)} className={`rounded-full px-3 py-1.5 text-[10px] font-bold transition ${active ? "bg-blue-500/20 text-blue-200" : "bg-white/[0.06] text-gray-400 hover:text-white"}`}>{tag}</button>;
            })}
            <button className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.06] text-gray-400 hover:text-white"><Plus size={13} /></button>
          </div>

          <button onClick={onSave} disabled={isSaving || selectedSaveTypes.length === 0} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 px-4 py-3.5 text-[11px] font-black uppercase tracking-[0.14em] text-white shadow-lg shadow-blue-600/25 transition active:scale-[0.99] disabled:opacity-60">
            {isSaving ? <Loader2 size={15} className="animate-spin" /> : <BookmarkPlus size={15} />} Save to Workbook
          </button>
        </div>
      </div>

      <div className="mt-4 border-t border-white/[0.06] pt-4 text-center text-[11px] font-medium text-gray-500">
        Your data is private and secure
      </div>
      {saveMessage && <p className="mt-2 text-center text-[10px] font-bold text-emerald-300">{saveMessage}</p>}
    </div>
  );
}

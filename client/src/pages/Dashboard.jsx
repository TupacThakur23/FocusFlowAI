import { useEffect, useState } from "react";
import axios from "axios";
import {
  FolderPlus,
  Upload,
  FileText,
  Sparkles,
  BookOpen,
  Layers,
  Download,
  Brain,
  Send, 
  Link,
  Type,
  UploadCloud,
  History,
  Trash2,
  ClipboardList,
  Lightbulb
} from "lucide-react";


export default function Dashboard() {
  const getInitialView = () => {
  const hash = window.location.hash;

  if (hash === "#/rag") return "focus";
  if (hash === "#/research") return "research";

  return "menu";
};

const [activeView, setActiveView] = useState(getInitialView());

  const [researchList, setResearchList] = useState([]);

  // --- RESEARCH HUB STATES ---
  const [selectedFile, setSelectedFile] = useState(null);
  const [newTopic, setNewTopic] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [newLink, setNewLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [question, setQuestion] = useState("");
  const [assistantResponse, setAssistantResponse] = useState("");

  // --- FOCUS RAG STATES ---
  const [ingestRaw, setIngestRaw] = useState("");
  const [ingestUrl, setIngestUrl] = useState("");
  const [documentText, setDocumentText] = useState("");
  const [ragLoading, setRagLoading] = useState(false);
  const [ragQuestion, setRagQuestion] = useState("");
  const [ragAnswer, setRagAnswer] = useState("");
  const [ragChunks, setRagChunks] = useState([]);

  useEffect(() => {
    const fetchResearch = async () => {
      try {
        const rRes = await axios.get("http://localhost:5000/api/research");
        setResearchList(rRes.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchResearch();
  }, []);

  const handleAddFile = async () => {
    if(!newTopic) return;
    try {
      const res = await axios.post("http://localhost:5000/api/research", { topic: newTopic, notes: newNotes, link: newLink });
      setResearchList([...researchList, res.data]);
      setNewTopic(""); setNewNotes(""); setNewLink("");
    } catch(e) { console.error(e) }
  };

  const askAI = async (promptType, customQuestion = "") => {
    if (!selectedFile && activeView === "research") {
      setAssistantResponse("Please select a file first.");
      return;
    }
    setLoading(true);
    if(promptType === "question") setAssistantResponse("Thinking...");
    else setAiResponse("Processing...");

    const fc = selectedFile ? `Topic: ${selectedFile.topic}\nNotes: ${selectedFile.notes}` : "";
    let p = "";
    if (promptType === "summarize") p = `Summarize:\n${fc}`;
    else if (promptType === "keypoints") p = `Key points:\n${fc}`;
    else if (promptType === "question") p = `Based on:\n${fc}\n\nAnswer: ${customQuestion}`;

    try {
      const res = await axios.post("http://localhost:5000/api/ai/summarize", { text: p });
      if (promptType === "question") {
        setAssistantResponse(res.data.summary);
        setQuestion("");
      } else setAiResponse(res.data.summary);
    } catch(e) {
      if (promptType === "question") setAssistantResponse("Error!");
      else setAiResponse("Error!");
    } finally { setLoading(false); }
  };

  const handleIngest = async () => {
    if(!ingestRaw && !ingestUrl) return;
    setRagLoading(true);
    setDocumentText("Ingesting and generating vector embeddings...");
    try {
      const payload = ingestUrl ? { url: ingestUrl } : { rawText: ingestRaw };
      const res = await axios.post("http://localhost:5000/api/focus/ingest", payload);
      setDocumentText(res.data.text);
      setIngestRaw("");
      setIngestUrl("");
    } catch(e) {
      console.error(e);
      setDocumentText("Error loading content.");
    } finally {
      setRagLoading(false);
    }
  };

  const handleRagQuery = async () => {
    if(!ragQuestion) return;
    setRagLoading(true);
    setRagAnswer("Searching vector store...");
    setRagChunks([]);
    try {
       const res = await axios.post("http://localhost:5000/api/focus/query", { question: ragQuestion });
       setRagAnswer(res.data.answer);
       setRagChunks(res.data.topRelevantChunks || []);
       setRagQuestion("");
    } catch(e) {
       console.error(e);
       setRagAnswer("Error querying vector store.");
    } finally {
       setRagLoading(false);
    }
  };

  // --- STYLING MACROS ---
  const styles = {
    app: { display: "flex", flexDirection: "column", width: "100%", height: "100vh", minWidth: "800px", minHeight: "600px", backgroundColor: "#0f0f0f", color: "white", fontFamily: "sans-serif", overflow: "hidden" },
    btn: { padding: "10px", backgroundColor: "#222", border: "1px solid #444", color: "white", borderRadius: "5px", cursor: "pointer" },
    btnAction: { backgroundColor: "#00ff88", color: "black", fontWeight: "bold", border: "none" },
    input: { padding: "8px", backgroundColor: "#222", border: "1px solid #444", color: "white", borderRadius: "4px", width: "100%", boxSizing: "border-box" },
    topNav: { padding: "10px 20px", display: "flex", alignItems: "center", borderBottom: "1px solid #333", backgroundColor: "#111", gap: "20px" },
    card: { backgroundColor: "#1a1a1a", padding: "15px", borderRadius: "8px", border: "1px solid #333", marginBottom: "10px" }
  };

  if (activeView === "menu") {
    return (
      <div style={{...styles.app, justifyContent: "center", alignItems: "center"}}>
        <h1 style={{ fontSize: "3rem", margin: "0 0 10px 0", color: "#00ff88" }}>FocusFlow AI</h1>
        <p style={{ color: "#aaa", marginBottom: "40px", fontSize: "1.2rem" }}>Choose your workspace to begin</p>
        <div style={{ display: "flex", gap: "20px" }}>
          <button style={{ ...styles.btn, padding: "20px 40px", fontSize: "1.2rem" }}
              onClick={() => {
              chrome.tabs.create({
              url: chrome.runtime.getURL("index.html#/rag")
                    } );
                window.close();
              }}>🧠 Focus RAG Mode</button>
          <button style={{ ...styles.btn, padding: "20px 40px", fontSize: "1.2rem" }}
  onClick={() => {
    chrome.tabs.create({
      url: chrome.runtime.getURL("index.html#/research")
    });
    window.close();
  }}>📁 Research Hub</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.app}>
      <div style={styles.topNav}>
        <button style={styles.btn} onClick={() => setActiveView("menu")}>← Back to Menu</button>
        <h2 style={{ margin: 0 }}>{activeView === "focus" ? "Focus RAG Workspace" : "Research Hub"}</h2>
      </div>

     
       {activeView === "focus" && (
  <div className="flex flex-1 overflow-hidden bg-[#050816] text-white">

    {/* Left Panel */}
    <div className="w-[26%] border-r border-white/10 p-4 bg-white/5 flex flex-col gap-4">

      <div className="rounded-2xl bg-white/5 p-4 border border-white/10">
        <h3 className="text-lg font-semibold text-emerald-300 mb-3">Source</h3>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <button className="flex items-center justify-center gap-2 py-2 rounded-xl bg-white/10">
  <div className="p-1 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 shadow-md">
    <Link size={14} />
  </div>
  URL
</button>
          <button className="flex items-center justify-center gap-2 py-2 rounded-xl bg-white/5">
  <div className="p-1 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 shadow-md">
    <Type size={14} />
  </div>
  Text
</button>
        </div>

        <input
          className="w-full p-3 rounded-xl bg-black/30 border border-white/10 mb-3"
          placeholder="Paste URL..."
          value={ingestUrl}
          onChange={(e) => setIngestUrl(e.target.value)}
        />

        <textarea
          className="w-full p-3 rounded-xl bg-black/30 border border-white/10 mb-3 h-28 resize-none"
          placeholder="Paste raw text..."
          value={ingestRaw}
          onChange={(e) => setIngestRaw(e.target.value)}
        />

       <button
  onClick={handleIngest}
  className="w-full py-3 rounded-xl bg-emerald-400 text-black font-semibold flex items-center justify-center gap-2"
>
  <UploadCloud size={16} />
  {ragLoading ? "Loading..." : "Load Context"}
</button>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-sm">
        <div className="rounded-xl bg-white/5 p-3">
          {ragChunks.length}
          <div className="text-white/50 text-xs">Chunks</div>
        </div>
        <div className="rounded-xl bg-white/5 p-3">
          12.4k
          <div className="text-white/50 text-xs">Tokens</div>
        </div>
        <div className="rounded-xl bg-white/5 p-3">
          2.8s
          <div className="text-white/50 text-xs">Speed</div>
        </div>
      </div>

      <div className="rounded-2xl bg-white/5 p-4 border border-white/10 flex-1 overflow-auto">
        <h4 className="font-semibold mb-2 text-white/80">Document Preview</h4>
        <p className="text-sm text-white/60 whitespace-pre-wrap">
          {documentText || "Load content to preview extracted text here."}
        </p>
      </div>
    </div>

    {/* Center Panel */}
    <div className="flex-1 flex flex-col p-4 gap-4">

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Chat with your context</h2>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5">
  <div className="p-1 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 shadow-md">
    <History size={14} />
  </div>
  History
</button>
         <button
  onClick={() => {
    setRagAnswer("");
    setRagChunks([]);
  }}
  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 text-red-300"
>
  <div className="p-1 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 shadow-md">
    <Trash2 size={14} />
  </div>
  Clear
</button>
        </div>
      </div>

      <div className="flex-1 rounded-2xl bg-white/5 border border-white/10 p-4 overflow-auto space-y-4">

        {ragQuestion && (
          <div className="flex justify-end">
            <div className="max-w-[70%] bg-violet-500/20 px-4 py-3 rounded-2xl">
              {ragQuestion}
            </div>
          </div>
        )}

        <div className="flex justify-start">
          <div className="max-w-[75%] bg-white/5 px-4 py-3 rounded-2xl border border-white/10 whitespace-pre-wrap">
            {ragAnswer || "Ask a question about the loaded content."}
          </div>
        </div>

        {ragChunks.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm text-white/50">Relevant Sources</div>
            {ragChunks.map((chunk, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-black/30 border-l-4 border-emerald-400 text-sm text-white/70"
              >
                {chunk}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <input
          className="flex-1 p-4 rounded-2xl bg-white/5 border border-white/10"
          placeholder="Ask anything about this content..."
          value={ragQuestion}
          onChange={(e) => setRagQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleRagQuery()}
        />

        <button className="flex items-center gap-2 px-5 rounded-xl bg-emerald-400 text-black font-semibold">
  <Send size={16} />
  Ask
</button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <button className="flex items-center gap-2 p-3 rounded-xl bg-white/5">
  <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-green-400 shadow-md">
    <FileText size={16} />
  </div>
  Summarize
</button>
        <button className="flex items-center gap-2 p-3 rounded-xl bg-white/5">
  <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-400 shadow-md">
    <Sparkles size={16} />
  </div>
  Key Points
</button>
      <button className="flex items-center gap-2 p-3 rounded-xl bg-white/5">
  <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 shadow-md">
    <ClipboardList size={16} />
  </div>
  Quiz
</button>
        <button className="flex items-center gap-2 p-3 rounded-xl bg-white/5">
  <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 shadow-md">
    <Lightbulb size={16} />
  </div>
  Explain
</button>
      </div>
    </div>
  </div>
)}

      {activeView === "research" && (
  <div className="flex flex-1 overflow-hidden bg-[#050816] text-white">

    {/* Left Sidebar */}
    <div className="w-[22%] border-r border-white/10 bg-white/5 p-4 flex flex-col gap-4">

      <div>
        <h3 className="text-lg font-semibold text-violet-300 mb-3">My Topics</h3>

        <input
          placeholder="Search topics..."
          className="w-full p-3 rounded-xl bg-black/30 border border-white/10 mb-3"
        />

        <div className="space-y-2 max-h-[70vh] overflow-auto">
          {researchList.slice().reverse().map((f) => (
            <div
              key={f.id}
              onClick={() => setSelectedFile(f)}
              className={`p-3 rounded-xl cursor-pointer border transition ${
                selectedFile?.id === f.id
                  ? "bg-violet-500/20 border-violet-400"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
            >
              <div className="font-medium">{f.topic}</div>
              <div className="text-xs text-white/50 mt-1">
                {f.notes?.length || 0} notes
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto grid grid-cols-2 gap-2">
        <button className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 shadow-lg hover:bg-white/10">
  <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 shadow-md">
    <FolderPlus size={16} />
  </div>
  New Topic
</button>
        <button className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 shadow-lg hover:bg-white/10">
  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 shadow-md">
    <Upload size={16} />
  </div>
  Upload File
</button>
      </div>
    </div>

    {/* Center Content */}
    <div className="flex-1 flex flex-col p-4 gap-4">

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {selectedFile ? selectedFile.topic : "Research Workspace"}
        </h2>

        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10">
  <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-green-400 shadow-md">
    <FileText size={16} />
  </div>
  Summarize
</button>

          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10">
  <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-400 shadow-md">
    <Sparkles size={16} />
  </div>
  Key Points
</button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 flex-1 overflow-auto p-5 whitespace-pre-wrap text-white/80">
        {selectedFile
          ? selectedFile.notes || "No notes available."
          : "Select a topic to view notes or files."}
      </div>

      <div className="grid grid-cols-4 gap-3">
        <button className="flex items-center gap-2 p-3 rounded-xl bg-white/5">
  <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 shadow-md">
    <BookOpen size={16} />
  </div>
  Notes
</button>
        <button className="flex items-center gap-2 p-3 rounded-xl bg-white/5">
  <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 shadow-md">
    <Layers size={16} />
  </div>
  Flashcards
</button>
        <button className="flex items-center gap-2 p-3 rounded-xl bg-white/5">
  <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 shadow-md">
    <Download size={16} />
  </div>
  Export
</button>
        <button className="flex items-center gap-2 p-3 rounded-xl bg-white/5">
  <div className="p-2 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 shadow-md">
    <Brain size={16} />
  </div>
  Organize
</button>
      </div>
    </div>

    {/* Right AI Panel */}
    <div className="w-[30%] border-l border-white/10 bg-white/5 p-4 flex flex-col gap-4">

      <h3 className="text-lg font-semibold text-emerald-300">
        AI Assistant
      </h3>

      <div className="flex-1 rounded-2xl bg-black/20 border border-white/10 p-4 overflow-auto whitespace-pre-wrap text-white/80">
        {assistantResponse || "Ask AI about your selected topic, notes or files."}
      </div>

      <div className="flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && askAI("question", question)}
          placeholder="Ask AI..."
          className="flex-1 p-3 rounded-xl bg-black/30 border border-white/10"
        />

        <button
          onClick={() => askAI("question", question)}
          className="px-5 rounded-xl bg-emerald-400 text-black font-semibold"
        >
          Ask
        </button>
      </div>
    </div>
  </div>
  
)}

    </div>
  );
}





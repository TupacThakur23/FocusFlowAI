import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [activeView, setActiveView] = useState("menu");

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
          <button style={{...styles.btn, padding: "20px 40px", fontSize: "1.2rem"}} onClick={() => setActiveView("focus")}>🧠 Focus RAG Mode</button>
          <button style={{...styles.btn, padding: "20px 40px", fontSize: "1.2rem"}} onClick={() => setActiveView("research")}>📁 Research Hub</button>
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
        <div style={{ display: "flex", flex: 1, flexDirection: "column", overflow: "hidden" }}>
          {/* Top Ingest Area */}
          <div style={{ padding: "15px", backgroundColor: "#1a1a1a", borderBottom: "1px solid #333", display: "flex", gap: "10px", alignItems: "center" }}>
            <strong style={{color: "#4ade80", whiteSpace: "nowrap"}}>Inject Context:</strong>
            <input style={styles.input} placeholder="Paste http:// URL..." value={ingestUrl} onChange={e=>setIngestUrl(e.target.value)} />
            <span style={{color: "#aaa"}}>OR</span>
            <input style={styles.input} placeholder="Paste raw text block..." value={ingestRaw} onChange={e=>setIngestRaw(e.target.value)} />
            <button style={{...styles.btn, ...styles.btnAction, width: "150px"}} onClick={handleIngest} disabled={ragLoading}>Load Context</button>
          </div>

          {/* Split Content View */}
          <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
            {/* Left: Main Content */}
            <div style={{ width: "60%", padding: "20px", borderRight: "1px solid #333", overflowY: "auto", fontSize: "16px", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
              {documentText || <span style={{color:"#555"}}>Load a URL or Text above to extract and embed document chunks for analysis.</span>}
            </div>
            
            {/* Right: AI Output & Chunks */}
            <div style={{ width: "40%", padding: "20px", overflowY: "auto", backgroundColor: "#111", display: "flex", flexDirection: "column" }}>
              <h3 style={{margin: "0 0 10px 0"}}>AI Assistant Response</h3>
              <div style={{ padding: "15px", backgroundColor: "#222", border: "1px solid #4ade80", borderRadius: "5px", whiteSpace: "pre-wrap", lineHeight: "1.5", marginBottom: "20px" }}>
                {ragAnswer || "Ask a question below to trigger Semantic Search."}
              </div>

              {ragChunks.length > 0 && (
                <>
                  <h4 style={{margin: "0 0 10px 0", color: "#aaa"}}>Relevant Context Sources Identified</h4>
                  {ragChunks.map((chunk, i) => (
                    <div key={i} style={{ padding: "10px", backgroundColor: "#1a1a1a", borderLeft: "3px solid #3b82f6", marginBottom: "10px", fontSize: "14px" }}>
                       {chunk}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Bottom Bar */}
          <div style={{ padding: "15px", borderTop: "1px solid #333", backgroundColor: "#1a1a1a", display: "flex", gap: "10px" }}>
            <input 
              style={{...styles.input, padding: "12px", border: "1px solid #555", fontSize: "16px"}}
              placeholder="Ask anything about the document..." 
              value={ragQuestion}
              onChange={e=>setRagQuestion(e.target.value)}
              onKeyDown={e=>e.key === 'Enter' && handleRagQuery()}
            />
            <button style={{...styles.btn, ...styles.btnAction, width: "120px"}} disabled={ragLoading} onClick={handleRagQuery}>
              {ragLoading ? "..." : "Ask"}
            </button>
          </div>
        </div>
      )}

      {activeView === "research" && (
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Sidebar */}
          <div style={{ width: "25%", backgroundColor: "#1a1a1a", borderRight: "1px solid #333", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "10px", borderBottom: "1px solid #333" }}>
              <input style={{...styles.input, marginBottom: "5px"}} placeholder="Topic..." value={newTopic} onChange={e=>setNewTopic(e.target.value)} />
              <input style={{...styles.input, marginBottom: "5px"}} placeholder="Notes..." value={newNotes} onChange={e=>setNewNotes(e.target.value)} />
              <button style={{...styles.btn, ...styles.btnAction, width: "100%"}} onClick={handleAddFile}>+ Add</button>
            </div>
            <div style={{ flex: 1, overflowY: "auto" }}>
              {researchList.slice().reverse().map(f => (
                <div key={f._id} style={{ padding: "15px", cursor: "pointer", borderBottom: "1px solid #333", backgroundColor: selectedFile?._id === f._id ? "#333" : "transparent" }} onClick={() => setSelectedFile(f)}>
                  📄 {f.topic}
                </div>
              ))}
            </div>
          </div>

          {/* Center */}
          <div style={{ width: "50%", padding: "20px", borderRight: "1px solid #333", overflowY: "auto", display: "flex", flexDirection: "column" }}>
            {selectedFile ? (
              <div style={{ flex: 1 }}>
                <h1 style={{color: "#00ff88", margin: "0 0 10px 0"}}>{selectedFile.topic}</h1>
                <p style={{whiteSpace: "pre-wrap", lineHeight: 1.5}}>{selectedFile.notes || "No notes..."}</p>
              </div>
            ) : <div style={{flex: 1, display: "flex", alignItems: "center", justifyContent: "center"}}><p style={{color: "#555"}}>Select a file to view.</p></div>}
            
            <div style={{ borderTop: "1px solid #333", paddingTop: "10px", marginTop: "auto" }}>
              <p style={{color: "#4ade80", fontSize: "14px", marginBottom: "10px", minHeight: "20px"}}>{assistantResponse || "Ask AI about this file"}</p>
              <div style={{ display: "flex", gap: "10px" }}>
                <input style={{...styles.input, marginBottom: 0}} placeholder="Ask..." value={question} onChange={e=>setQuestion(e.target.value)} onKeyDown={e=>e.key==='Enter' && askAI("question", question)}/>
                <button style={{...styles.btn, ...styles.btnAction, margin: 0, width: "100px"}} onClick={()=>askAI("question", question)}>{loading ? "..." : "Ask"}</button>
              </div>
            </div>
          </div>

          {/* Right */}
          <div style={{ width: "25%", padding: "15px", display: "flex", flexDirection: "column", backgroundColor: "#111" }}>
            <button style={{...styles.btn, marginBottom: "5px"}} onClick={()=>askAI("summarize")}>Summarize</button>
            <button style={{...styles.btn, marginBottom: "15px"}} onClick={()=>askAI("keypoints")}>Key Points</button>
            <h4 style={{ margin: "0 0 10px 0" }}>AI Result</h4>
            <div style={{ flex: 1, padding: "10px", backgroundColor: "#222", borderRadius: "5px", overflowY: "auto", whiteSpace: "pre-wrap" }}>
              {aiResponse || "Results here..."}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
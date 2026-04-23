import { useEffect, useState } from "react";
import axios from "axios";
import {
  Settings,
  FolderOpen,
  Search,
  Plus,
  Trash2,
  Paperclip,
  Download,
  MoreVertical,
  Send,
  FileText,
  List,
  Scale,
  MessageSquare,
  Network,
  Save,
  CheckCircle,
  Calendar,
  Activity,
  TrendingUp,
  Link
} from "lucide-react";

export default function Dashboard() {
  const [activeView, setActiveView] = useState("focus");

  useEffect(() => {
    if (window.chrome?.tabs && window.innerWidth <= 850) {
      chrome.tabs.create({ url: chrome.runtime.getURL("index.html") });
      window.close();
    }
  }, []);

  // --- RESEARCH HUB STATES ---
  const [researchList, setResearchList] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [newTopic, setNewTopic] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [assistantResponse, setAssistantResponse] = useState("");
  const [isCreatingTopic, setIsCreatingTopic] = useState(false);

  // --- FOCUS RAG STATES ---
  const [ingestUrl, setIngestUrl] = useState("");
  const [documentText, setDocumentText] = useState("");
  const [ragLoading, setRagLoading] = useState(false);
  const [ragQuestion, setRagQuestion] = useState("");
  const [ragAnswer, setRagAnswer] = useState("");
  const [ragChunks, setRagChunks] = useState([]);
  const [extractSuccess, setExtractSuccess] = useState(false);

  useEffect(() => {
    const fetchResearch = async () => {
      try {
        const rRes = await axios.get("http://localhost:5000/api/research");
        setResearchList(rRes.data);
        if (rRes.data.length > 0) setSelectedFile(rRes.data[rRes.data.length - 1]);
      } catch (e) {
        console.error(e);
      }
    };
    fetchResearch();
  }, []);

  const handleAddFile = async () => {
    if(!newTopic) return;
    try {
      const res = await axios.post("http://localhost:5000/api/research", { topic: newTopic, notes: newNotes, link: "" });
      setResearchList([...researchList, res.data]);
      setSelectedFile(res.data);
      setNewTopic(""); setNewNotes("");
      setIsCreatingTopic(false);
    } catch(e) { console.error(e) }
  };

  const saveToHub = async () => {
     if(!documentText) return;
     try {
       const res = await axios.post("http://localhost:5000/api/research", { 
           topic: ingestUrl || "Saved RAG Document", 
           notes: documentText
       });
       setResearchList([...researchList, res.data]);
       alert("Saved to Research Hub!");
     } catch(e) { console.error(e) }
  };

  const deleteFile = async (id) => {
     try {
       await axios.delete(`http://localhost:5000/api/research/${id}`);
       const updatedList = researchList.filter(f => f.id !== id);
       setResearchList(updatedList);
       if (selectedFile?.id === id) {
           setSelectedFile(updatedList.length > 0 ? updatedList[0] : null);
       }
     } catch(e) { console.error(e) }
  };

  const askAI = async (promptType, customQuestion = "") => {
    if (!selectedFile && activeView === "research") {
      setAssistantResponse("Please select a file first.");
      return;
    }
    setLoading(true);
    setAssistantResponse("Thinking...");

    const fc = selectedFile ? `Topic: ${selectedFile.topic}\nNotes: ${selectedFile.notes}` : "";
    let p = "";
    if (promptType === "summarize") p = `Summarize the following content briefly:\n${fc}`;
    else if (promptType === "keypoints") p = `Extract all key points and core essential data from:\n${fc}`;
    else if (promptType === "workplan") p = `Generate a detailed structured Work Plan based on:\n${fc}`;
    else if (promptType === "status") p = `Draft a synthetic Status Report for:\n${fc}`;
    else if (promptType === "progress") p = `Design a Progress Tracking matrix based on:\n${fc}`;
    else if (promptType === "resources") p = `Compile a list of necessary potential Resources related to:\n${fc}`;
    else if (promptType === "flowchart") p = `Generate a structural Mermaid.js code Flowchart mapping out:\n${fc}`;
    else if (promptType === "question") p = `Based on:\n${fc}\n\nAnswer: ${customQuestion}`;

    try {
      const res = await axios.post("http://localhost:5000/api/ai/summarize", { text: p });
      setAssistantResponse(res.data.summary);
      if (promptType === "question") setQuestion("");
    } catch(e) {
      setAssistantResponse("Error reaching Gemini AI.");
    } finally { setLoading(false); }
  };

  const askRagAction = async (action) => {
    if(!documentText) return;
    setRagLoading(true);
    
    // Optimistic UI Append
    setRagQuestion(action);
    setRagAnswer(`Running logic task: ${action}...`);
    
    let targetQ = action;
    if (action === "Summarize") targetQ = "Provide a concise summary of this content.";
    if (action === "Key Points") targetQ = "Extract key ideas and essential points.";
    if (action === "Compare") targetQ = "Compare and contrast the main arguments inside this context.";
    
    if (action === "Mind Map") targetQ = "Generate a textual mind map layout of all components mapped in this document.";

    try {
       const res = await axios.post("http://localhost:5000/api/focus/query", { question: targetQ });
       setRagAnswer(res.data.answer);
       setRagChunks(res.data.topRelevantChunks || []);
    } catch(e) {
       console.error(e);
       setRagAnswer("Error querying vector store.");
    } finally {
       setRagLoading(false);
    }
  };

  const handleIngest = async () => {
    if(!ingestUrl) return;
    setRagLoading(true);
    setExtractSuccess(false);
    setDocumentText("Extracting and generating Gemini vector embeddings...");
    
    // We can simulate the "instruction" parser by treating the query string magically if the user separates by pipe
    const splitInput = ingestUrl.split("|");
    const rawUrl = splitInput[0].trim();
    const instruction = splitInput[1] ? splitInput[1].trim() : "";
    
    try {
      const payload = { url: rawUrl, instruction };
      const res = await axios.post("http://localhost:5000/api/focus/ingest", payload);
      setDocumentText(res.data.text);
      setExtractSuccess(true);
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
    setRagAnswer("Searching vector matrices...");
    setRagChunks([]);
    try {
       const res = await axios.post("http://localhost:5000/api/focus/query", { question: ragQuestion });
       setRagAnswer(res.data.answer);
       setRagChunks(res.data.topRelevantChunks || []);
       // setRagQuestion(""); keep it for visual flow
    } catch(e) {
       console.error(e);
       setRagAnswer("Error querying vector store.");
    } finally {
       setRagLoading(false);
    }
  };


  return (
    <div className="flex w-full h-screen min-w-[1100px] min-h-[700px] bg-[#0a0a0a] text-gray-300 font-sans overflow-hidden">
      
      {/* GLOBAL LEFT SIDEBAR */}
      <div className="w-[260px] bg-[#0f0f0f] border-r border-[#1f1f1f] flex flex-col justify-between py-6 z-10 shrink-0">
        <div>
           <div className="px-6 mb-8 mt-2">
              <h1 className="text-xl font-bold tracking-[0.2em] text-gray-200">AI <span className="text-gray-500">FOCUS</span></h1>
           </div>
           
           <div className="flex flex-col gap-2">
              <button 
                 onClick={()=>setActiveView("focus")}
                 className={`flex items-center gap-3 px-6 py-3 border-l-2 transition-all ${
                    activeView === "focus" 
                    ? "border-red-500 bg-[#1c1212] text-red-500 font-medium" 
                    : "border-transparent text-gray-400 hover:text-gray-200 hover:bg-[#151515]"
                 }`}
              >
                 <FolderOpen size={18} />
                 Focus Mode
              </button>
              
              <button 
                 onClick={()=>setActiveView("research")}
                 className={`flex items-center gap-3 px-6 py-3 border-l-2 transition-all ${
                    activeView === "research" 
                    ? "border-white bg-[#1c1c1c] text-white font-medium" 
                    : "border-transparent text-gray-400 hover:text-gray-200 hover:bg-[#151515]"
                 }`}
              >
                 <FolderOpen size={18} />
                 Research Hub
              </button>
           </div>
        </div>
        
        <div className="px-6 mt-auto">
           <button className="flex items-center gap-3 text-gray-500 hover:text-gray-300 transition-colors w-full py-2">
             <Settings size={18} />
             Settings
           </button>
        </div>
      </div>

      {/* MAIN DYNAMIC CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* ======================================= */}
        {/* ============ FOCUS MODE ================= */}
        {/* ======================================= */}
        {activeView === "focus" && (
           <div className="absolute inset-0 flex flex-col p-6 animate-fade-in bg-[#0c0c0c]">
               <h2 className="text-xl font-bold text-white mb-4 tracking-wider">FOCUS MODE</h2>

               <div className="flex gap-6 h-full flex-1 overflow-hidden min-h-0">
                   
                   {/* Left Deep Focus Column */}
                   <div className="flex-[2.5] flex flex-col h-full gap-4 overflow-hidden min-w-0">
                      
                      {/* URL Extraction Bar */}
                      <div className="flex items-center gap-4 bg-[#111] p-3 rounded-xl border border-[#222]">
                         <input 
                            placeholder="https://example.com/ai-transformers | optional: filtering rules" 
                            className="bg-[#0c0c0c] border border-[#222] rounded flex-1 px-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-red-500/50"
                            value={ingestUrl}
                            onChange={(e) => setIngestUrl(e.target.value)}
                         />
                         <button 
                            onClick={handleIngest}
                            className="px-6 py-2 border border-green-500/50 text-green-500 text-sm font-medium rounded hover:bg-green-500/10 transition-colors disabled:opacity-50"
                            disabled={ragLoading}
                         >
                            Extract
                         </button>
                         {extractSuccess && <div className="text-xs text-green-500 flex items-center gap-1 shrink-0 px-2"><CheckCircle size={14}/> Content extracted successfully</div>}
                      </div>

                      {/* Main Document Reading Frame */}
                      <div className="flex-1 border border-[#222] bg-[#111] rounded-xl p-8 overflow-auto">
                         {documentText ? (
                            <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300 font-serif max-w-3xl mx-auto">
                                <h2 className="text-2xl font-bold text-gray-100 mb-6 font-sans">Primary Scraped Content</h2>
                                {documentText}
                            </div>
                         ) : (
                            <div className="h-full flex items-center justify-center text-gray-600 italic">
                               Paste a URL above to natively trigger Gemini AI pre-extraction filter.
                            </div>
                         )}
                      </div>

                      {/* Interactive Bottom Prompt Bar */}
                      <div className="bg-[#111] border-l-2 border-red-500 border-t border-r border-b border-[#222]/0 rounded-lg p-3 flex gap-3 shadow-lg shrink-0">
                         <input 
                            placeholder="Ask anything about this content..." 
                            className="flex-1 px-3 py-2 bg-transparent text-sm focus:outline-none text-gray-200"
                            value={ragQuestion}
                            onChange={(e) => setRagQuestion(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleRagQuery()}
                         />
                         <div className="flex items-center gap-3 shrink-0 px-4">
                           <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Smart (RAG)</span>
                           <button onClick={handleRagQuery} className="bg-green-500/10 hover:bg-green-500/20 text-green-500 p-2 rounded-lg transition-colors">
                              <Send size={18} className="ml-1" />
                           </button>
                         </div>
                      </div>
                      
                      {/* Live Response Panel (Renders instantly upon querying) */}
                      {ragAnswer && (
                         <div className="bg-[#1a1313] border border-red-900/30 p-4 rounded-xl text-sm leading-relaxed text-gray-300 overflow-auto max-h-[150px] shrink-0 border-l-2 border-l-red-500 shadow-xl">
                            {ragAnswer}
                         </div>
                      )}

                   </div>

                   {/* Right Features Column */}
                   <div className="flex-1 border border-[#222] bg-[#0c0c0c] rounded-xl p-6 min-w-[280px]">
                      <h3 className="text-red-500 text-[10px] font-black tracking-[0.2em] uppercase mb-6">Features</h3>
                      
                      <div className="flex flex-col gap-1">
                          <button onClick={() => askRagAction("Summarize")} className="flex items-start gap-4 hover:bg-[#151515] p-3 rounded-lg text-left transition-colors group">
                             <FileText size={18} className="text-green-500 mt-0.5 group-hover:scale-110 transition-transform" />
                             <div>
                                <div className="text-sm font-semibold text-gray-200">Summarize</div>
                                <div className="text-xs text-gray-500 mt-1">Get a concise summary of this content</div>
                             </div>
                          </button>
                          
                          <button onClick={() => askRagAction("Key Points")} className="flex items-start gap-4 hover:bg-[#151515] p-3 rounded-lg text-left transition-colors group">
                             <List size={18} className="text-green-500 mt-0.5 group-hover:scale-110 transition-transform" />
                             <div>
                                <div className="text-sm font-semibold text-gray-200">Key Points</div>
                                <div className="text-xs text-gray-500 mt-1">Extract key ideas and essential points</div>
                             </div>
                          </button>
                          
                          <button onClick={() => askRagAction("Compare")} className="flex items-start gap-4 hover:bg-[#151515] p-3 rounded-lg text-left transition-colors group">
                             <Scale size={18} className="text-green-500 mt-0.5 group-hover:scale-110 transition-transform" />
                             <div>
                                <div className="text-sm font-semibold text-gray-200">Compare</div>
                                <div className="text-xs text-gray-500 mt-1">Compare with other documents</div>
                             </div>
                          </button>
                          
                         
                          
                          <button onClick={() => askRagAction("Mind Map")} className="flex items-start gap-4 hover:bg-[#151515] p-3 rounded-lg text-left transition-colors group">
                             <Network size={18} className="text-green-500 mt-0.5 group-hover:scale-110 transition-transform" />
                             <div>
                                <div className="text-sm font-semibold text-gray-200">Mind Map</div>
                                <div className="text-xs text-gray-500 mt-1">Generate a text-based mind map representation</div>
                             </div>
                          </button>
                          
                          <button onClick={saveToHub} className="flex items-start gap-4 hover:bg-[#151515] p-3 rounded-lg text-left transition-colors group mt-4 pt-4 border-t border-[#222]">
                             <Save size={18} className="text-green-500 mt-0.5 group-hover:scale-110 transition-transform" />
                             <div>
                                <div className="text-sm font-semibold text-gray-200">Save to Hub</div>
                                <div className="text-xs text-gray-500 mt-1">Export this content matrix permanently</div>
                             </div>
                          </button>
                      </div>
                   </div>
               </div>
           </div>
        )}



        {/* ======================================= */}
        {/* ============ RESEARCH HUB ============= */}
        {/* ======================================= */}
        {activeView === "research" && (
           <div className="absolute inset-0 flex flex-col p-4 animate-fade-in bg-[#0c0c0c]">
               <h2 className="text-xl font-bold text-white mb-4 tracking-wider px-2">RESEARCH HUB</h2>

               <div className="flex gap-4 h-full flex-1 overflow-hidden">
                   
                   {/* Left Internal Sidebar: MY FILES */}
                   <div className="w-[300px] border border-[#222] bg-[#111] rounded-xl flex flex-col shrink-0 overflow-hidden relative">
                       <div className="p-4 border-b border-[#222] flex justify-between items-center">
                          <h3 className="text-red-500 text-[10px] font-black tracking-[0.2em] uppercase">My Files</h3>
                          <button onClick={()=>setIsCreatingTopic(!isCreatingTopic)} className="text-green-500 border border-green-500/30 px-3 py-1 rounded text-xs hover:bg-green-500/10 transition-colors flex items-center gap-1">
                             <Plus size={12}/> New File
                          </button>
                       </div>
                       
                       {isCreatingTopic && (
                          <div className="p-4 bg-[#151515] border-b border-[#222]">
                             <input className="w-full bg-[#0a0a0a] border border-[#333] px-3 py-2 text-sm rounded mb-2 text-white" placeholder="Document Title..." value={newTopic} onChange={e=>setNewTopic(e.target.value)} />
                             <button onClick={handleAddFile} className="w-full bg-red-600 hover:bg-red-500 text-white text-xs py-2 rounded font-bold transition-colors">Confirm File Creation</button>
                          </div>
                       )}

                       <div className="p-4">
                          <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-gray-500" size={14} />
                            <input className="bg-[#0a0a0a] border border-[#222] w-full rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-red-500/50" placeholder="Search files..." />
                          </div>
                       </div>
                       
                       <div className="flex-1 overflow-y-auto px-2 space-y-1">
                           {researchList.slice().reverse().map(file => (
                              <button 
                                 key={file._id} 
                                 onClick={()=>setSelectedFile(file)}
                                 className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${selectedFile?._id === file._id || selectedFile?.id === file.id ? 'border border-red-500 bg-[#1a1313]' : 'border border-transparent hover:bg-[#151515]'}`}
                              >
                                 <div className="flex items-center gap-3 overflow-hidden">
                                    <FileText size={16} className="text-gray-400 shrink-0" />
                                    <div className="truncate min-w-0">
                                       <div className="text-sm font-medium text-gray-200 truncate">{file.topic}</div>
                                       <div className="text-[10px] text-gray-600 mt-1">May 24, 2024</div>
                                    </div>
                                 </div>
                                 <MoreVertical size={14} className="text-gray-600 opacity-0 group-hover:opacity-100" />
                              </button>
                           ))}
                       </div>
                       
                       <div className="p-4 border-t border-[#222] mt-auto">
                           <button className="flex items-center gap-3 text-gray-500 hover:text-gray-300 text-sm">
                             <Trash2 size={16} /> Trash
                           </button>
                       </div>
                   </div>


                   {/* Center Main Document Viewing Column */}
                   <div className="flex-[2] flex flex-col gap-4 overflow-hidden min-w-0">
                      
                      {/* Document Viewer Frame */}
                      <div className="flex-1 border border-[#222] bg-[#111] rounded-xl flex flex-col overflow-hidden">
                         <div className="p-4 border-b border-[#222] flex justify-between items-center bg-[#151515]">
                            <h2 className="text-lg font-bold text-gray-200 flex items-center gap-2">
                               {selectedFile ? selectedFile.topic : "No File Selected"}
                            </h2>
                            <div className="flex gap-4 text-gray-400">
                               <Link size={16} className="hover:text-white cursor-pointer" />
                               <Download size={16} className="hover:text-white cursor-pointer" />
                               <MoreVertical size={16} className="hover:text-white cursor-pointer" />
                            </div>
                         </div>
                         
                         <div className="p-6 flex-1 overflow-auto text-sm text-gray-300 leading-relaxed font-serif whitespace-pre-wrap">
                            {selectedFile ? (selectedFile.notes || "This file is completely blank.") : "Please create or select a file to preview its contents here."}
                         </div>
                      </div>

                      {/* AI Assistant Chat Integration */}
                      <div className="border border-[#222] bg-[#0c0c0c] rounded-xl flex flex-col shrink-0">
                         <div className="p-4">
                            <h3 className="text-red-500 text-[10px] font-black tracking-[0.2em] uppercase mb-4">AI Assistant</h3>
                            
                            {/* Live Response Panel placed ABOVE the input */}
                            {assistantResponse && (
                               <div className="mb-4 bg-[#1a1313] border-l-2 border-red-500 text-gray-300 text-sm px-4 py-3 rounded-r overflow-auto max-h-[120px] whitespace-pre-wrap">
                                  {assistantResponse}
                               </div>
                            )}

                            <div className="bg-[#111] border border-[#222] rounded-lg p-2 flex gap-3 shadow-lg">
                               <input 
                                  placeholder="Ask me anything about this document..." 
                                  className="flex-1 px-3 py-2 bg-transparent text-sm focus:outline-none text-gray-200"
                                  value={question}
                                  onChange={(e) => setQuestion(e.target.value)}
                                  onKeyDown={e => e.key === "Enter" && askAI("question", question)}
                               />
                               <div className="flex items-center gap-3 shrink-0 px-4 border-l border-[#222]">
                                 <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Smart (RAG)</span>
                                 <button onClick={()=>askAI("question", question)} className="bg-green-500/10 hover:bg-green-500/20 text-green-500 p-2 rounded-lg transition-colors">
                                    <Send size={18} className="ml-1" />
                                 </button>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>


                   {/* Right Side TOOLS & FEATURES Panel */}
                   <div className="flex-1 min-w-[280px] flex flex-col gap-4 overflow-hidden">
                      <div className="flex-1 border border-[#222] bg-[#111] rounded-xl flex flex-col">
                         <div className="p-4 border-b border-[#222]">
                            <h3 className="text-red-500 text-[10px] font-black tracking-[0.2em] uppercase">Tools & Features</h3>
                         </div>
                         
                         <div className="p-4 grid grid-cols-2 gap-3">
                            <button onClick={()=>askAI("summarize")} className="flex flex-col items-center justify-center gap-3 p-6 bg-[#1a1a1a] hover:bg-[#222] rounded-xl border border-[#333] transition-colors group">
                               <FileText size={24} className="text-green-500 group-hover:scale-110 transition-transform" />
                               <span className="text-xs font-semibold">Summarize</span>
                            </button>
                            <button onClick={()=>askAI("keypoints")} className="flex flex-col items-center justify-center gap-3 p-6 bg-[#1a1a1a] hover:bg-[#222] rounded-xl border border-[#333] transition-colors group">
                               <List size={24} className="text-green-500 group-hover:scale-110 transition-transform" />
                               <span className="text-xs font-semibold">Key Points</span>
                            </button>
                            <button onClick={()=>askAI("workplan")} className="flex flex-col items-center justify-center gap-3 p-6 bg-[#1a1a1a] hover:bg-[#222] rounded-xl border border-[#333] transition-colors group">
                               <Calendar size={24} className="text-green-500 group-hover:scale-110 transition-transform" />
                               <span className="text-xs font-semibold">Work Plan</span>
                            </button>
                            <button onClick={()=>askAI("status")} className="flex flex-col items-center justify-center gap-3 p-6 bg-[#1a1a1a] hover:bg-[#222] rounded-xl border border-[#333] transition-colors group">
                               <Activity size={24} className="text-green-500 group-hover:scale-110 transition-transform" />
                               <span className="text-xs font-semibold">Status</span>
                            </button>
                            <button onClick={()=>askAI("progress")} className="flex flex-col items-center justify-center gap-3 p-6 bg-[#1a1a1a] hover:bg-[#222] rounded-xl border border-[#333] transition-colors group">
                               <TrendingUp size={24} className="text-green-500 group-hover:scale-110 transition-transform" />
                               <span className="text-xs font-semibold">Progress Tracker</span>
                            </button>
                            <button onClick={()=>askAI("resources")} className="flex flex-col items-center justify-center gap-3 p-6 bg-[#1a1a1a] hover:bg-[#222] rounded-xl border border-[#333] transition-colors group">
                               <Paperclip size={24} className="text-green-500 group-hover:scale-110 transition-transform" />
                               <span className="text-xs font-semibold">Resources</span>
                            </button>
                         </div>
                         
                         <div className="p-4 mt-auto">
                            <button onClick={()=>askAI("flowchart")} className="w-full flex items-center justify-center gap-3 py-4 bg-[#1a1313] hover:bg-[#2a1313] border border-red-900/50 rounded-xl text-red-500 font-bold transition-colors">
                               <Network size={18} /> Generate Flowchart
                            </button>
                            <div className="mt-4 text-center text-[10px] text-gray-600 uppercase tracking-widest">More tools coming soon...</div>
                         </div>
                      </div>
                   </div>
               </div>
           </div>
        )}

      </div>
    </div>
  );
}

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

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

export default function Dashboard() {
  const [activeView, setActiveView] = useState("focus");

  // --- RESEARCH HUB STATES ---
  const [researchList, setResearchList] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [newTopic, setNewTopic] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [assistantResponse, setAssistantResponse] = useState("");
  const [isCreatingTopic, setIsCreatingTopic] = useState(false);

  // --- FOCUS STATES ---
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
        const rRes = await axios.get(`${API_URL}/api/research`);
        setResearchList(rRes.data);
        if (rRes.data.length > 0) setSelectedFile(rRes.data[rRes.data.length - 1]);
      } catch (e) {
        console.error(e);
      }
    };
    fetchResearch();
  }, []);

  const handleAddFile = async () => {
    if (!newTopic) return;
    try {
      const res = await axios.post(`${API_URL}/api/research`, {
        topic: newTopic,
        notes: newNotes,
        link: ""
      });
      setResearchList([...researchList, res.data]);
      setSelectedFile(res.data);
      setNewTopic("");
      setNewNotes("");
      setIsCreatingTopic(false);
    } catch (e) {
      console.error(e);
    }
  };

  const saveToHub = async () => {
    if (!documentText) return;
    try {
      const res = await axios.post(`${API_URL}/api/research`, {
        topic: ingestUrl || "Saved RAG Document",
        notes: documentText
      });
      setResearchList([...researchList, res.data]);
      alert("Saved to Research Hub!");
    } catch (e) {
      console.error(e);
    }
  };

  const deleteFile = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/research/${id}`);
      const updatedList = researchList.filter(f => f._id !== id);
      setResearchList(updatedList);
    } catch (e) {
      console.error(e);
    }
  };

  const askAI = async (promptType, customQuestion = "") => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/ai/summarize`, {
        text: customQuestion || promptType
      });
      setAssistantResponse(res.data.summary);
    } catch (e) {
      setAssistantResponse("Error reaching AI.");
    } finally {
      setLoading(false);
    }
  };

  const handleIngest = async () => {
    if (!ingestUrl) return;

    setRagLoading(true);
    setExtractSuccess(false);
    setDocumentText("Extracting...");

    try {
      const res = await axios.post(`${API_URL}/api/focus/ingest`, {
        url: ingestUrl
      });

      setDocumentText(res.data.text || "No content extracted.");
      setExtractSuccess(true);
    } catch (e) {
      console.error(e);
      setDocumentText("Error loading content.");
    } finally {
      setRagLoading(false);
    }
  };

  const handleRagQuery = async () => {
    if (!ragQuestion) return;

    setRagLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/focus/query`, {
        question: ragQuestion
      });
      setRagAnswer(res.data.answer || "No answer returned.");
      setRagChunks(res.data.topRelevantChunks || []);
    } catch (e) {
      setRagAnswer("Error querying focus assistant.");
      setRagChunks([]);
    } finally {
      setRagLoading(false);
    }
  };

  return (
    <div className="flex w-full h-screen bg-black text-white">
      <div className="w-64 p-4 bg-[#111]">
        <button onClick={() => setActiveView("focus")}>Focus Mode</button>
        <button onClick={() => setActiveView("research")}>Research Hub</button>
      </div>

      <div className="flex-1 p-6">
        {activeView === "focus" && (
          <>
            <input
              value={ingestUrl}
              onChange={(e) => setIngestUrl(e.target.value)}
              placeholder="Enter URL"
            />
            <button onClick={handleIngest}>Extract</button>

            <div>{documentText}</div>

            <input
              value={ragQuestion}
              onChange={(e) => setRagQuestion(e.target.value)}
            />
            <button onClick={handleRagQuery}>Ask</button>

            <div>{ragAnswer}</div>
          </>
        )}
      </div>
    </div>
  );
}
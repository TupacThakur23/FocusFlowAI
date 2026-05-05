import { useEffect, useMemo, useRef, useState } from "react";
import api, { API_URL } from "../services/api";

const quickActions = ["Summarize", "Explain", "Notes", "Questions", "Sources"];

export default function Dashboard() {
  const [mode, setMode] = useState("launcher");
  const [researchList, setResearchList] = useState([]);
  const [workbooks, setWorkbooks] = useState([]);
  const [selectedWorkbook, setSelectedWorkbook] = useState("General");
  const [newWorkbook, setNewWorkbook] = useState("");
  const [ingestUrl, setIngestUrl] = useState("");
  const [documentText, setDocumentText] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [summary, setSummary] = useState("");
  const [saveInstruction, setSaveInstruction] = useState("");
  const [includeSummary, setIncludeSummary] = useState(true);
  const [includeQuestions, setIncludeQuestions] = useState(true);
  const [includeNotes, setIncludeNotes] = useState(false);
  const [includeSources, setIncludeSources] = useState(false);
  const [relatedSources, setRelatedSources] = useState([]);
  const [selectedText, setSelectedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [studyOutput, setStudyOutput] = useState({ notes: "", questions: [], flashcards: [] });
  const [workbookContext, setWorkbookContext] = useState("");
  const [sessionPages, setSessionPages] = useState([]);
  const [saveMode, setSaveMode] = useState("page");
  const [currentTab, setCurrentTab] = useState(null);
  const [autoIngestedUrl, setAutoIngestedUrl] = useState("");
  const [currentSource, setCurrentSource] = useState(null);
  const syncRef = useRef(null);

  useEffect(() => {
    loadResearch();

    if (!window.chrome?.storage?.session) return;

    const syncFromExtension = async () => {
      try {
        const data = await window.chrome.storage.session.get([
          "aideCurrentSelection",
          "aideLastSource",
          "aideSessionPages",
          "aideCurrentTab"
        ]);
        if (data.aideCurrentSelection) setSelectedText(data.aideCurrentSelection);
        if (data.aideCurrentTab) {
          setCurrentTab(data.aideCurrentTab);
          setIngestUrl((current) => current || data.aideCurrentTab.url || "");
        } else if (data.aideLastSource?.url) {
          setIngestUrl((current) => current || data.aideLastSource.url);
        }
        setSessionPages(data.aideSessionPages || []);
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
          setIngestUrl((current) => current || response.tab.url);
        }
      });
    };

    requestActiveTab();
    syncFromExtension();
    syncRef.current = window.setInterval(syncFromExtension, 1200);

    return () => {
      if (syncRef.current) window.clearInterval(syncRef.current);
    };
  }, []);

  useEffect(() => {
    if (mode !== "aide" || !currentTab?.url || currentTab.url === autoIngestedUrl || isLoading) return;

    const runAutoIngest = async () => {
      setIsLoading(true);
      setSaveMessage("");
      try {
        setIngestUrl(currentTab.url);
        const res = await api.post(`${API_URL}/api/focus/ingest`, { url: currentTab.url });
        setDocumentText(res.data.text || "No content extracted.");
        setCurrentSource(res.data.source || null);
        setSummary("");
        setAnswer("");
        setAutoIngestedUrl(currentTab.url);
      } catch (error) {
        console.error(error);
        setDocumentText("Error loading content.");
      } finally {
        setIsLoading(false);
      }
    };

    runAutoIngest();
  }, [mode, currentTab, autoIngestedUrl]);

  const loadResearch = async () => {
    try {
      const res = await api.get(`${API_URL}/api/research`);
      const items = res.data || [];
      setResearchList(items);
      const workbookNames = [...new Set(items.map((item) => item.workbook || "General"))];
      setWorkbooks(workbookNames.length ? workbookNames : ["General"]);
    } catch (error) {
      console.error(error);
    }
  };

  const groupedResearch = useMemo(() => {
    return researchList.reduce((acc, item) => {
      const key = item.workbook || "General";
      acc[key] = acc[key] || [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [researchList]);

  const isYoutubeUrl = (value = "") => /(?:youtube\.com|youtu\.be)/i.test(value);

  const handleExtract = async () => {
    if (!ingestUrl) return;
    setIsLoading(true);
    setSaveMessage("");
    try {
      const res = await api.post(`${API_URL}/api/focus/ingest`, { url: ingestUrl });
      setDocumentText(res.data.text || "No content extracted.");
      setSummary("");
      setAnswer("");
    } catch (error) {
      console.error(error);
      setDocumentText("Error loading content.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseCurrentTab = async () => {
    if (!currentTab?.url) return;
    setIngestUrl(currentTab.url);
    setTimeout(handleExtract, 0);
  };

  const handleSummarize = async (customText) => {
    const text = customText || documentText;
    if (!text) return;
    setIsLoading(true);
    try {
      const res = await api.post(`${API_URL}/api/ai/summarize`, {
        text: `Summarize this page in concise study notes:\n\n${text}`
      });
      setSummary(res.data.summary || "");
    } catch (error) {
      console.error(error);
      setSummary("Error generating summary.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAsk = async () => {
    if (!question) return;
    setIsLoading(true);
    try {
      const res = await api.post(`${API_URL}/api/focus/query`, { question });
      setAnswer(res.data.answer || "No answer returned.");
    } catch (error) {
      console.error(error);
      setAnswer("Error querying Aide.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExplainSelection = async () => {
    if (!selectedText) return;
    setIsLoading(true);
    try {
      const res = await api.post(`${API_URL}/api/ai/summarize`, {
        text: `Explain this selected section in simple terms:\n\n${selectedText}`
      });
      setAnswer(res.data.summary || "");
    } catch (error) {
      console.error(error);
      setAnswer("Error explaining selection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRelatedSources = async () => {
    const baseText = summary || documentText;
    if (!baseText) return;
    setIsLoading(true);
    try {
      const res = await api.post(`${API_URL}/api/ai/summarize`, {
        text: `Based on this page, suggest 5 related sources with title and url only in plain text list format:\n\n${baseText.slice(0, 4000)}`
      });
      const parsed = (res.data.summary || "")
        .split("\n")
        .filter(Boolean)
        .slice(0, 5)
        .map((line, index) => ({ id: index + 1, text: line }));
      setRelatedSources(parsed);
    } catch (error) {
      console.error(error);
      setRelatedSources([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateWorkbook = () => {
    if (!newWorkbook.trim()) return;
    if (!workbooks.includes(newWorkbook.trim())) {
      setWorkbooks((prev) => [...prev, newWorkbook.trim()]);
    }
    setSelectedWorkbook(newWorkbook.trim());
    setNewWorkbook("");
  };

  const handleSaveToWorkspace = async () => {
    const workbook = selectedWorkbook || "General";
    const sourceList = saveMode === "session" ? sessionPages : [];
    const compiledNotes = [
      saveInstruction ? `Save instruction: ${saveInstruction}` : "",
      includeSummary && summary ? `Summary:\n${summary}` : "",
      includeQuestions && answer ? `Q&A:\nQ: ${question}\nA: ${answer}` : "",
      includeNotes && documentText ? `Extracted content:\n${documentText}` : "",
      includeSources && relatedSources.length ? `Related sources:\n${relatedSources.map((s) => s.text).join("\n")}` : ""
    ].filter(Boolean).join("\n\n");

    try {
      const res = await api.post(`${API_URL}/api/research`, {
        topic: saveMode === "session" ? `Session capture (${sourceList.length} pages)` : ingestUrl || currentTab?.title || "Untitled page",
        notes: compiledNotes || documentText,
        link: saveMode === "session" ? (sourceList[0]?.url || ingestUrl) : ingestUrl,
        workbook,
        outputs: {
          summary,
          answer,
          question,
          selectedText,
          relatedSources,
          sessionPages: sourceList
        }
      });
      setSaveMessage(`Saved to ${workbook}`);
      setResearchList((prev) => [res.data, ...prev]);
      if (!workbooks.includes(workbook)) {
        setWorkbooks((prev) => [...prev, workbook]);
      }
    } catch (error) {
      console.error(error);
      setSaveMessage("Failed to save.");
    }
  };
  
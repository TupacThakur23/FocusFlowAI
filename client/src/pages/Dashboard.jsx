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
  const [studyOutput, setStudyOutput] = useState({
    notes: "",
    questions: [],
    flashcards: [],
  });
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
          "aideCurrentTab",
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
    if (mode !== "aide" || !currentTab?.url || currentTab.url === autoIngestedUrl || isLoading) {
      return;
    }

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
  }, [mode, currentTab, autoIngestedUrl, isLoading]);

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
      setCurrentSource(res.data.source || null);
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
        text: `Summarize this page in concise study notes:\n\n${text}`,
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
        text: `Explain this selected section in simple terms:\n\n${selectedText}`,
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
        text: `Based on this page, suggest 5 related sources with title and url only in plain text list format:\n\n${baseText.slice(0, 4000)}`,
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
    const trimmed = newWorkbook.trim();
    if (!trimmed) return;

    if (!workbooks.includes(trimmed)) {
      setWorkbooks((prev) => [...prev, trimmed]);
    }

    setSelectedWorkbook(trimmed);
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
      includeSources && relatedSources.length
        ? `Related sources:\n${relatedSources.map((s) => s.text).join("\n")}`
        : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    try {
      const res = await api.post(`${API_URL}/api/research`, {
        topic:
          saveMode === "session"
            ? `Session capture (${sourceList.length} pages)`
            : ingestUrl || currentTab?.title || "Untitled page",
        notes: compiledNotes || documentText,
        link: saveMode === "session" ? sourceList[0]?.url || ingestUrl : ingestUrl,
        workbook,
        outputs: {
          summary,
          answer,
          question,
          selectedText,
          relatedSources,
          sessionPages: sourceList,
          studyOutput,
          workbookContext,
          currentSource,
        },
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

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-6">
      <div className="mx-auto max-w-7xl grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <h2 className="text-lg font-semibold mb-4">FocusFlow AI</h2>

          <div className="space-y-2 mb-4">
            <button
              onClick={() => setMode("launcher")}
              className={`w-full rounded-lg px-3 py-2 text-left ${
                mode === "launcher" ? "bg-indigo-600" : "bg-zinc-800"
              }`}
            >
              Launcher
            </button>
            <button
              onClick={() => setMode("aide")}
              className={`w-full rounded-lg px-3 py-2 text-left ${
                mode === "aide" ? "bg-indigo-600" : "bg-zinc-800"
              }`}
            >
              Aide
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-sm mb-2">Select workbook</label>
            <select
              value={selectedWorkbook}
              onChange={(e) => setSelectedWorkbook(e.target.value)}
              className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2"
            >
              {workbooks.map((book) => (
                <option key={book} value={book}>
                  {book}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm mb-2">Create workbook</label>
            <div className="flex gap-2">
              <input
                value={newWorkbook}
                onChange={(e) => setNewWorkbook(e.target.value)}
                placeholder="New workbook"
                className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2"
              />
              <button
                onClick={handleCreateWorkbook}
                className="rounded-lg bg-indigo-600 px-3 py-2"
              >
                Add
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Saved research</h3>
            <div className="space-y-2 max-h-[320px] overflow-auto">
              {(groupedResearch[selectedWorkbook] || []).map((item) => (
                <div key={item._id || item.id} className="rounded-lg bg-zinc-800 p-3 text-sm">
                  <p className="font-medium">{item.topic}</p>
                  <p className="text-zinc-400 line-clamp-3">{item.notes}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <main className="space-y-6">
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
            <div className="flex flex-wrap gap-2 mb-4">
              {quickActions.map((action) => (
                <button
                  key={action}
                  onClick={() => {
                    if (action === "Summarize") handleSummarize();
                    if (action === "Explain") handleExplainSelection();
                    if (action === "Sources") handleRelatedSources();
                  }}
                  className="rounded-full bg-zinc-800 px-4 py-2 text-sm hover:bg-zinc-700"
                >
                  {action}
                </button>
              ))}
            </div>

            <label className="block text-sm mb-2">Page URL</label>
            <div className="flex flex-col md:flex-row gap-2">
              <input
                value={ingestUrl}
                onChange={(e) => setIngestUrl(e.target.value)}
                placeholder="Paste article or video URL"
                className="flex-1 rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2"
              />
              <button
                onClick={handleExtract}
                disabled={isLoading}
                className="rounded-lg bg-indigo-600 px-4 py-2 disabled:opacity-50"
              >
                {isLoading ? "Loading..." : "Extract"}
              </button>
              <button
                onClick={handleUseCurrentTab}
                className="rounded-lg bg-zinc-800 px-4 py-2"
              >
                Use Current Tab
              </button>
            </div>

            {currentTab?.url && (
              <p className="mt-3 text-sm text-zinc-400">
                Current tab: {currentTab.title || currentTab.url}
              </p>
            )}

            {isYoutubeUrl(ingestUrl) && (
              <p className="mt-2 text-xs text-amber-400">
                YouTube URL detected. Make sure your backend supports transcript extraction.
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
            <h3 className="text-lg font-semibold mb-3">Extracted Content</h3>
            <textarea
              value={documentText}
              onChange={(e) => setDocumentText(e.target.value)}
              rows={10}
              className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2"
              placeholder="Extracted content will appear here..."
            />
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Summary</h3>
                <button
                  onClick={() => handleSummarize()}
                  className="rounded-lg bg-indigo-600 px-3 py-2 text-sm"
                >
                  Generate
                </button>
              </div>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={10}
                className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2"
                placeholder="Summary will appear here..."
              />
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
              <h3 className="text-lg font-semibold mb-3">Ask Aide</h3>
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask a question about the content"
                className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 mb-3"
              />
              <button
                onClick={handleAsk}
                className="rounded-lg bg-indigo-600 px-4 py-2 mb-3"
              >
                Ask
              </button>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={8}
                className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2"
                placeholder="Answer will appear here..."
              />
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
            <h3 className="text-lg font-semibold mb-3">Related Sources</h3>
            <div className="space-y-2 mb-4">
              {relatedSources.map((source) => (
                <div key={source.id} className="rounded-lg bg-zinc-800 p-3 text-sm">
                  {source.text}
                </div>
              ))}
            </div>

            <h4 className="font-medium mb-2">Save to workspace</h4>
            <input
              value={saveInstruction}
              onChange={(e) => setSaveInstruction(e.target.value)}
              placeholder="Optional save instruction"
              className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 mb-3"
            />

            <div className="grid gap-2 md:grid-cols-2 mb-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={includeSummary}
                  onChange={(e) => setIncludeSummary(e.target.checked)}
                />
                Include summary
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={includeQuestions}
                  onChange={(e) => setIncludeQuestions(e.target.checked)}
                />
                Include Q&A
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={includeNotes}
                  onChange={(e) => setIncludeNotes(e.target.checked)}
                />
                Include notes
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={includeSources}
                  onChange={(e) => setIncludeSources(e.target.checked)}
                />
                Include sources
              </label>
            </div>

            <div className="flex flex-wrap gap-3 mb-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="saveMode"
                  value="page"
                  checked={saveMode === "page"}
                  onChange={(e) => setSaveMode(e.target.value)}
                />
                Save page
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="saveMode"
                  value="session"
                  checked={saveMode === "session"}
                  onChange={(e) => setSaveMode(e.target.value)}
                />
                Save session
              </label>
            </div>

            <button
              onClick={handleSaveToWorkspace}
              className="rounded-lg bg-emerald-600 px-4 py-2"
            >
              Save
            </button>

            {saveMessage && <p className="mt-3 text-sm text-emerald-400">{saveMessage}</p>}
          </section>
        </main>
      </div>
    </div>
  );
}
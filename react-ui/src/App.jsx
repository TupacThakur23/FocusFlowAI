import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";

export default function App() {
  const [pageData, setPageData] = useState(null);

  useEffect(() => {
    chrome.storage.local.get("pageData", (result) => {
      setPageData(result.pageData);
    });
  }, []);

  return (
    <div className="flex h-screen bg-[#0b1220] text-white">

      {/* Sidebar */}
      <Sidebar pageData={pageData} />

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto space-y-6">

        {/* ✅ INTRO / LANDING SECTION */}
        <div className="bg-[#0f172a] border border-gray-800 rounded-xl p-6">
          <h2 className="text-2xl font-semibold mb-2">
            Welcome to FocusFlow AI 🚀
          </h2>

          <p className="text-gray-400 text-sm leading-relaxed">
            This workspace helps you extract, organize, and analyze information from any webpage using AI.
            <br /><br />
            • Capture page data (headings, links, content) <br />
            • Save and manage research sessions <br />
            • Ask AI questions about your data <br />
            • Combine local files + web content for deeper insights
          </p>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-semibold">
          {pageData?.title || "Loading..."}
        </h1>

        {/* Content + Image */}
        <div className="flex gap-6">

          <div className="flex-1 bg-[#111827] p-4 rounded-lg border border-gray-800">
            <div className="text-gray-300 text-sm leading-relaxed space-y-2">

  <p>
    You are currently analyzing:
  </p>

  <p className="text-white font-medium">
    {pageData?.title || "Loading page..."}
  </p>

  <p className="text-blue-400 break-all">
    {pageData?.url}
  </p>

  <p className="text-gray-400 mt-2">
    This page has been processed by FocusFlow AI. 
    Key elements such as links and content have been extracted and are ready for analysis.
  </p>

</div>
          </div>

          <img
            src="https://images.unsplash.com/photo-1677442136019-21780ecad995"
            className="w-80 rounded-lg object-cover"
          />
        </div>

        {/* ✅ ONLY ONE LINKS CARD */}
        <div className="bg-[#0f172a] border border-gray-800 rounded-xl p-4">
          <h3 className="text-purple-400 font-semibold mb-2">
            Extracted Links
          </h3>

          <ul className="text-sm text-gray-300 space-y-1 max-h-40 overflow-auto">
            {pageData?.links?.slice(0, 10).map((link, i) => (
              <li key={i}>
                <a
                  href={link}
                  target="_blank"
                  className="text-blue-400 hover:underline"
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* AI Summary */}
        <div className="bg-[#111827] p-4 rounded-lg">
          <p className="text-green-400 text-sm mb-2">AI Summary</p>

          <div className="bg-[#020617] p-3 rounded text-sm text-gray-300">
            {pageData
              ? "This page discusses key ideas, extracted links, and important content. AI summary coming next..."
              : "Waiting for data..."}
          </div>
        </div>

        {/* Input Bar */}
        <div className="flex gap-2">
          <input
            className="flex-1 bg-[#020617] border border-gray-700 px-4 py-2 rounded-lg text-white outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ask your assistant..."
          />
          <button className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700">
            Ask
          </button>
        </div>

      </div>
    </div>
  );
}
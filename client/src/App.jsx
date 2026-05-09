import { useState, useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import ResearchHub from "./pages/ResearchHub";

console.log('🎯 APP: Loading with mode detection');

function App() {
  const [view, setView] = useState("launcher");
  const [mode, setMode] = useState("sidebar");

  // Detect mode from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hash = window.location.hash.slice(1);
    
    if (urlParams.get('mode') === 'sidebar') {
      setMode("sidebar");
      setView("aide");
    } else if (hash === 'research') {
      setMode("workspace");
      setView("research");
    }
  }, []);

  // Sidebar mode - only Aide
  if (mode === "sidebar") {
    return <Dashboard />;
  }

  // Workspace mode - Research Hub
  if (mode === "workspace") {
    return <ResearchHub />;
  }

  return <div className="w-full h-full bg-[#050816] text-white flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-2xl font-bold mb-2">FocusFlow AI</h1>
      <p className="text-gray-400">Loading...</p>
    </div>
  </div>;
}

export default App;

import { useState, useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import ResearchHub from "./pages/ResearchHub";
import Launcher from "./pages/Launcher";
import { ExtensionProvider } from "./lib/extension/ExtensionProvider";
console.log('🎯 APP: Loading with mode detection');
function AppContent() {
  const [view, setView] = useState("launcher");
  const [mode, setMode] = useState("popup");
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hash = window.location.hash.slice(1);
    if (urlParams.get('mode') === 'sidebar') {
      setMode("sidebar");
      setView("aide");
      document.body.className = "sidebar-mode";
    } else if (hash === 'research') {
      setMode("workspace");
      setView("research");
      document.body.className = "workspace-mode";
    } else {
      setMode("popup");
      setView("launcher");
      document.body.className = "popup-mode";
    }
  }, []);
  if (mode === "sidebar") {
    return <Dashboard />;
  }
  if (mode === "workspace") {
    return <ResearchHub />;
  }
  if (mode === "popup") {
    return <Launcher />;
  }
  return <div className="w-full h-full bg-[#050816] text-white flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-2xl font-bold mb-2">FocusFlow AI</h1>
      <p className="text-gray-400">Loading...</p>
    </div>
  </div>;
}
export default function App() {
  return <ExtensionProvider>
      <AppContent />
    </ExtensionProvider>;
}

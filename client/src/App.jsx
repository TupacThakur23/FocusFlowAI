import { useState, useEffect } from "react";
import Launcher from "./pages/Launcher";
import Dashboard from "./pages/Dashboard";
import ResearchHub from "./pages/ResearchHub";

function App() {
  // Check if we should render Research Hub full-page (opened via #research hash)
  const [view, setView] = useState(() => {
    if (window.location.hash === "#research") return "research";
    return "launcher";
  });

  // Listen for hash changes
  useEffect(() => {
    const onHash = () => {
      if (window.location.hash === "#research") setView("research");
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  if (view === "research") {
    return <ResearchHub onBack={() => {
      window.location.hash = "";
      setView("launcher");
    }} />;
  }

  if (view === "aide") {
    return <Dashboard onBack={() => setView("launcher")} />;
  }

  return <Launcher onNavigate={setView} />;
}

export default App;
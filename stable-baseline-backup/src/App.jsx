import { useState } from "react";
import Launcher from "./pages/Launcher";
import Dashboard from "./pages/Dashboard";
import ResearchHub from "./pages/ResearchHub";
import { VIEWS } from "./constants/views";

console.log('🎯 APP: App component loading (minimal version)');

function App() {
  // Simple view state
  const [view, setView] = useState(() => {
    const initialView = window.location.hash === "#research" ? VIEWS.RESEARCH_HUB : VIEWS.LAUNCHER;
    console.log('📍 APP: Initial view set to', initialView);
    return initialView;
  });

  // Simple render function
  const renderContent = () => {
    console.log('🎯 RENDER: Rendering view:', view);
    
    switch(view) {
      case VIEWS.RESEARCH_HUB:
        console.log('🎯 RENDER: Rendering ResearchHub');
        return <ResearchHub />;
        
      case VIEWS.AIDE:
        console.log('🎯 RENDER: Rendering Dashboard');
        return <Dashboard />;
        
      case VIEWS.LAUNCHER:
        console.log('🎯 RENDER: Rendering Launcher');
        return <Launcher onNavigate={setView} />;
        
      default:
        console.error('🚨 RENDER: Invalid view:', view);
        return (
          <div style={{color: "white", padding: "20px", textAlign: "center"}}>
            <h2>🚨 Invalid View: {view}</h2>
            <button onClick={() => setView(VIEWS.LAUNCHER)} style={{padding: "10px", marginTop: "10px"}}>
              Return to Launcher
            </button>
          </div>
        );
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#050816]">
      {renderContent()}
    </div>
  );
}

export default App;

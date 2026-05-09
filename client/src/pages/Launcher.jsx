import { BrainCircuit, BookOpen, ChevronRight } from "lucide-react";

export default function Launcher({ onNavigate }) {
  console.log('🎯 LAUNCHER: Pure component mounting');

  const handleOpenAide = () => {
    console.log('🚀 CLICK: Aide button clicked');
    if (onNavigate) {
      onNavigate("aide");
    }
  };

  const handleOpenResearchHub = () => {
    console.log('🚀 CLICK: Research Hub button clicked');
    if (onNavigate) {
      onNavigate("research");
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#050816] text-white">
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-[#26272b]">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <BrainCircuit className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">FocusFlow AI</h1>
            <p className="text-xs text-gray-400">Intelligent Assistant</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-start py-6 px-6 space-y-4">
        {/* Aide Button */}
        <button
          onClick={handleOpenAide}
          className="w-full p-4 bg-[#111214] border border-[#26272b] rounded-xl hover:bg-[#17181c] transition-colors flex items-center justify-between group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <BrainCircuit className="w-6 h-6 text-blue-500" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold text-white">Aide</h3>
              <p className="text-sm text-gray-400">Summarize & analyze current page</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
        </button>

        {/* Research Hub Button */}
        <button
          onClick={handleOpenResearchHub}
          className="w-full p-4 bg-[#111214] border border-[#26272b] rounded-xl hover:bg-[#17181c] transition-colors flex items-center justify-between group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-green-500" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold text-white">Research Hub</h3>
              <p className="text-sm text-gray-400">Manage research & notes</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
        </button>
      </div>

      {/* Footer */}
      <div className="h-16 flex items-center justify-center px-6 border-t border-[#26272b]">
        <p className="text-xs text-gray-500">FocusFlow AI v1.0</p>
      </div>
    </div>
  );
}

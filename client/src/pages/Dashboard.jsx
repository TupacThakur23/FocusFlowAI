import { BrainCircuit, ArrowLeft } from "lucide-react";

export default function Dashboard({ onBack }) {
  console.log('🎯 DASHBOARD: Static Aide component mounting');

  const handleBack = () => {
    console.log('🚀 CLICK: Back button clicked');
    if (onBack) {
      onBack("launcher");
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#050816] text-white">
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-[#26272b]">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <BrainCircuit className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Aide</h1>
            <p className="text-xs text-gray-400">Page Analysis</p>
          </div>
        </div>
        <button
          onClick={handleBack}
          className="p-2 text-gray-400 hover:text-white hover:bg-[#111214] rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto py-6 px-6">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-6">
            <BrainCircuit className="w-8 h-8 text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Aide Working</h2>
          <p className="text-gray-400 mb-8">Static sidebar component for testing</p>
          
          <div className="w-full max-w-sm bg-[#111214] border border-[#26272b] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Status: Active</h3>
            <p className="text-sm text-gray-400 mb-4">Aide sidebar is rendering correctly</p>
            <div className="w-full h-2 bg-[#26272b] rounded-full overflow-hidden">
              <div className="w-full h-2 bg-blue-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { BookOpen, Search, Plus, Folder, Tag, Clock } from "lucide-react";

export default function ResearchHub() {
  console.log('🎯 RESEARCHHUB: Full-page workspace mounting');

  return (
    <div className="w-full h-full bg-[#050816] text-white">
      {/* Header */}
      <div className="h-16 bg-[#111214] border-b border-[#26272b] flex items-center justify-between px-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-green-500" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Research Hub</h1>
            <p className="text-xs text-gray-400">Full-page workspace</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-white hover:bg-[#26272b] rounded-lg transition-colors">
            <Search className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-white hover:bg-[#26272b] rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <div className="w-64 bg-[#111214] border-r border-[#26272b] p-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-2">Workspaces</h3>
              <div className="space-y-1">
                <button className="w-full text-left p-2 hover:bg-[#26272b] rounded-lg transition-colors text-sm text-gray-300 hover:text-white">
                  <div className="flex items-center space-x-2">
                    <Folder className="w-4 h-4" />
                    <span>Recent Research</span>
                  </div>
                </button>
                <button className="w-full text-left p-2 hover:bg-[#26272b] rounded-lg transition-colors text-sm text-gray-300 hover:text-white">
                  <div className="flex items-center space-x-2">
                    <Tag className="w-4 h-4" />
                    <span>By Topic</span>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-2">Quick Actions</h3>
              <div className="space-y-1">
                <button className="w-full text-left p-2 hover:bg-[#26272b] rounded-lg transition-colors text-sm text-gray-300 hover:text-white">
                  <div className="flex items-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>New Notebook</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Area */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Research Hub Workspace</h2>
              <p className="text-gray-400 mb-8">Full-page research management workspace</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-[#111214] border border-[#26272b] rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <h3 className="text-lg font-semibold text-white">Recent</h3>
                  </div>
                  <p className="text-sm text-gray-400 mb-4">View your recent research sessions and findings</p>
                  <div className="text-xs text-gray-500">12 items</div>
                </div>

                <div className="bg-[#111214] border border-[#26272b] rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Folder className="w-5 h-5 text-green-500" />
                    <h3 className="text-lg font-semibold text-white">Notebooks</h3>
                  </div>
                  <p className="text-sm text-gray-400 mb-4">Organized research collections and topics</p>
                  <div className="text-xs text-gray-500">8 notebooks</div>
                </div>

                <div className="bg-[#111214] border border-[#26272b] rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Search className="w-5 h-5 text-purple-500" />
                    <h3 className="text-lg font-semibold text-white">Search</h3>
                  </div>
                  <p className="text-sm text-gray-400 mb-4">Search across all your research and findings</p>
                  <div className="text-xs text-gray-500">Full-text search</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

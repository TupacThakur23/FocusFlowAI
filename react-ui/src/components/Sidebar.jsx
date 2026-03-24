export default function Sidebar({ pageData }) {
  return (
    <div className="w-64 bg-[#0f172a] text-white h-screen flex flex-col justify-between">

      {/* Top */}
      <div>
        {/* Logo */}
        <div className="p-4 text-lg font-semibold border-b border-gray-700">
          ⚡ FocusFlow
        </div>

        {/* Menu */}
        <div className="p-4 space-y-3 text-sm">

          <div className="text-gray-400 uppercase text-xs">Workspace</div>

          <div className="hover:bg-gray-800 p-2 rounded cursor-pointer">
            Dashboard
          </div>

          <div className="hover:bg-gray-800 p-2 rounded cursor-pointer">
            Saved
          </div>

          <div className="hover:bg-gray-800 p-2 rounded cursor-pointer">
            Notes
          </div>

          {/* Current Page */}
          {pageData && (
            <div className="mt-4 bg-gray-800 p-2 rounded text-blue-400 text-xs">
              🌐 {pageData.title.slice(0, 40)}...
            </div>
          )}

        </div>
      </div>

      {/* Bottom */}
      <div className="p-4 border-t border-gray-700 text-xs text-gray-400">
        AI Research Workspace
      </div>


      <div className="mt-6">
  <p className="text-xs text-gray-400 mb-2">Upload Files</p>

  <input
    type="file"
    multiple
    className="hidden"
    id="fileUpload"
    onChange={(e) => {
      const files = Array.from(e.target.files);
      console.log("Uploaded files:", files);
    }}
  />

  <label
    htmlFor="fileUpload"
    className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded-lg cursor-pointer"
  >
    + Add Files
  </label>
</div>






    </div>
    




  );
}
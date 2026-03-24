export default function App() {
  return (
    <div className="flex h-screen bg-gray-100">

      
      <div className="w-64 bg-white border-r p-4">
        <h2 className="text-xl font-semibold mb-4">Research Hub</h2>

        <div className="space-y-2 text-sm">
          <p className="font-medium">My Files</p>
          <p className="text-gray-500">Project Notes.pdf</p>
          <p className="text-gray-500">Data Analysis.pptx</p>

          <p className="font-medium mt-4">Saved Pages</p>
          <p className="text-gray-500">ML Techniques Guide</p>
          <p className="text-gray-500">Productivity Tips Blog</p>
        </div>
      </div>

      
      <div className="flex-1 p-6 overflow-auto">

        
        <h1 className="text-3xl font-bold mb-4">
          The Future of AI in Workplaces
        </h1>

        
        <div className="flex gap-6">
          <div className="flex-1">
            <p className="text-gray-700">
              Artificial intelligence is transforming the workplace in unprecedented ways...
            </p>
          </div>

          <img
            src="https://images.unsplash.com/photo-1677442136019-21780ecad995"
            className="w-80 rounded-lg"
          />
        </div>

      
        <div className="mt-6 p-4 bg-white rounded-lg shadow">
          <h3 className="font-semibold mb-2">Summary</h3>
          <ul className="list-disc ml-5">
            <li>Automation of repetitive tasks</li>
            <li>AI-driven decision making</li>
            <li>Personalized learning</li>
          </ul>
        </div>

        
        <div className="mt-6 flex gap-2">
          <input
            className="flex-1 border p-2 rounded"
            placeholder="Ask your assistant..."
          />
          <button className="bg-blue-500 text-white px-4 rounded">
            Ask
          </button>
        </div>

      </div>
    </div>
  );
}
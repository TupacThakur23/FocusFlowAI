import { useEffect, useState } from "react";

export default function App() {
  const [data, setData] = useState(null);
  const [search, setSearch] = useState("");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState([]);

  useEffect(() => {
    chrome.storage.local.get("pageData", (result) => {
      setData(result.pageData);
    });

    chrome.storage.local.get("savedItems", (res) => {
      setSaved(res.savedItems || []);
    });
  }, []);

  const saveItem = (item) => {
    const updated = [...saved, item];
    setSaved(updated);
    chrome.storage.local.set({ savedItems: updated });
  };

  if (!data) {
    return (
      <div className="h-screen flex items-center justify-center text-white bg-black">
        Loading...
      </div>
    );
  }

  const filteredHeadings = data.headings?.filter((h) =>
    h.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white flex">

      {/* 🔥 SIDEBAR */}
      <div className="w-64 bg-white/5 border-r border-white/10 p-5 backdrop-blur-xl">
        <h1 className="text-xl font-bold mb-6 text-blue-400">
          ⚡ FocusFlow
        </h1>

        <div className="space-y-3 text-sm">
          <p className="opacity-70">Dashboard</p>
          <p className="opacity-70">Saved</p>
          <p className="opacity-70">Notes</p>
        </div>
      </div>

      {/* 🔥 MAIN */}
      <div className="flex-1 p-6">

        {/* HEADER */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">{data.title}</h2>
          <p className="text-gray-400 text-sm">{data.url}</p>
        </div>

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Search..."
          className="w-full mb-6 p-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* GRID */}
        <div className="grid grid-cols-2 gap-6">

          {/* HEADINGS */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 shadow-lg hover:shadow-blue-500/10 transition">
            <h3 className="text-lg mb-3 text-blue-400">Headings</h3>

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {filteredHeadings?.map((h, i) => (
                <div
                  key={i}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer flex justify-between"
                >
                  <span>{h}</span>
                  <button
                    onClick={() => saveItem(h)}
                    className="text-xs text-blue-400"
                  >
                    Save
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* LINKS */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 shadow-lg hover:shadow-purple-500/10 transition">
            <h3 className="text-lg mb-3 text-purple-400">Links</h3>

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {data.links?.slice(0, 15).map((l, i) => (
                <a
                  key={i}
                  href={l}
                  target="_blank"
                  className="block p-2 rounded-lg bg-white/5 hover:bg-white/10 text-blue-300 truncate"
                >
                  {l}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* 🧠 NOTES SECTION */}
        <div className="mt-6 p-5 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-lg mb-3 text-green-400">Notes</h3>

          <textarea
            placeholder="Write notes..."
            className="w-full p-3 rounded-xl bg-black/40 border border-white/10 focus:outline-none"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <button
            className="mt-3 px-4 py-2 bg-green-500 rounded-lg hover:bg-green-600"
            onClick={() =>
              chrome.storage.local.set({ notes: notes })
            }
          >
            Save Notes
          </button>
        </div>

        {/* ⭐ SAVED */}
        <div className="mt-6 p-5 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-lg mb-3 text-yellow-400">Saved Items</h3>

          {saved.map((item, i) => (
            <div key={i} className="text-sm opacity-80 mb-1">
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
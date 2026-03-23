import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import MainContent from "./components/MainContent";

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    chrome.storage.local.get("pageData", (res) => {
      console.log("FROM STORAGE:", res);
      setData(res.pageData);
    });
  }, []);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar />
      <MainContent data={data} />
    </div>
  );
}

export default App;
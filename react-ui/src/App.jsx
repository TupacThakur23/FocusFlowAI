import { useEffect, useState } from "react";

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    chrome.storage.local.get("pageData", (result) => {
      setData(result?.pageData || null);
    });
  }, []);

  if (!data) {
    return <div style={styles.center}>No data found...</div>;
  }

  return (
    <div style={styles.app}>
      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <h2 style={styles.logo}>FocusFlow</h2>

        <div style={styles.navItem}>Overview</div>
        <div style={styles.navItem}>Headings</div>
        <div style={styles.navItem}>Links</div>

        <div style={styles.footer}>
          <p>AI Research Tool</p>
        </div>
      </div>

      {/* MAIN */}
      <div style={styles.main}>
        {/* HEADER */}
        <div style={styles.header}>
          <h1>{data.title || "Untitled Page"}</h1>
          <p style={styles.url}>{data.url}</p>
        </div>

        {/* INSIGHTS */}
        <div style={styles.grid}>
          <div style={styles.card}>
            <h3>Total Headings</h3>
            <p style={styles.metric}>{data.headings?.length || 0}</p>
          </div>

          <div style={styles.card}>
            <h3>Total Links</h3>
            <p style={styles.metric}>{data.links?.length || 0}</p>
          </div>

          <div style={styles.card}>
            <h3>Page Type</h3>
            <p style={styles.metric}>
              {data.links?.length > 50 ? "Content Heavy" : "Simple Page"}
            </p>
          </div>
        </div>

        {/* HEADINGS */}
        <div style={styles.section}>
          <h2>Headings</h2>
          <div style={styles.list}>
            {data.headings?.map((h, i) => (
              <div key={i} style={styles.item}>
                {h}
              </div>
            ))}
          </div>
        </div>

        {/* LINKS */}
        <div style={styles.section}>
          <h2>Top Links</h2>
          <div style={styles.list}>
            {data.links?.slice(0, 10).map((l, i) => (
              <a key={i} href={l} target="_blank" style={styles.link}>
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

<div className="bg-red-500 text-white p-5">
  Tailwind is working
</div>




}

/* 🎨 PREMIUM STYLES */
const styles = {
  app: {
    display: "flex",
    height: "100vh",
    fontFamily: "Inter, sans-serif",
    backgroundColor: "#0f172a",
    color: "white",
  },

  sidebar: {
    width: "220px",
    backgroundColor: "#020617",
    padding: "20px",
    borderRight: "1px solid #1e293b",
  },

  logo: {
    marginBottom: "30px",
  },

  navItem: {
    marginBottom: "15px",
    cursor: "pointer",
    color: "#94a3b8",
  },

  footer: {
    position: "absolute",
    bottom: "20px",
    fontSize: "12px",
    color: "#64748b",
  },

  main: {
    flex: 1,
    padding: "25px",
    overflowY: "auto",
  },

  header: {
    marginBottom: "25px",
  },

  url: {
    color: "#38bdf8",
    fontSize: "14px",
    wordBreak: "break-all",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "15px",
    marginBottom: "25px",
  },

  card: {
    backgroundColor: "#1e293b",
    padding: "15px",
    borderRadius: "10px",
  },

  metric: {
    fontSize: "22px",
    fontWeight: "bold",
  },

  section: {
    marginBottom: "25px",
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  item: {
    padding: "10px",
    backgroundColor: "#334155",
    borderRadius: "6px",
  },

  link: {
    color: "#60a5fa",
    textDecoration: "none",
    wordBreak: "break-all",
  },

  center: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
  },
};

export default App;
const API_URL = import.meta.env.VITE_API_URL;

export const fetchResearch = async (url) => {
  try {
    const res = await fetch(`${API_URL}/api/research`, {
      method: "POST", // 
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url })
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    return data;

  } catch (err) {
    console.error("API ERROR:", err);
    throw err;
  }
};
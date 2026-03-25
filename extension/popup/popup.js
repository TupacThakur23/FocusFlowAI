import { saveDocument } from "../db.js";

document.getElementById("getData").addEventListener("click", async () => {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (
      tab.url.startsWith("chrome://") ||
      tab.url.startsWith("chrome-extension://") ||
      tab.url.startsWith("edge://")
    ) {
      alert("Open a normal website first.");
      return;
    }

    const response = await chrome.tabs.sendMessage(tab.id, {
      type: "GET_DATA",
    }).catch(() => null);

    if (!response) {
      alert("Please refresh the page and try again.");
      return;
    }

    console.log("DATA RECEIVED:", response);

    // Open result page immediately so it feels fast
    chrome.storage.local.set({ pageData: response }, () => {
      chrome.tabs.create({
        url: chrome.runtime.getURL("popup/result.html"),
      });
    });

    try {
      const embedRes = await fetch("http://localhost:5000/api/ai/embed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: response.content }),
      });

      const embedData = await embedRes.json();
      await saveDocument(response.content, embedData.embedding);
      console.log("Saved to IndexedDB + VectorDB ✅");
    } catch (fetchErr) {
      console.warn("Backend unavailable or failed to save embedding:", fetchErr);
    }

  } catch (error) {
    console.error("ERROR:", error);
    alert("Error: " + error.message);
  }
});
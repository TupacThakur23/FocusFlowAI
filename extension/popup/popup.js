import { saveDocument } from "../db.js";

document.getElementById("getData").addEventListener("click", async () => {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (
      tab.url.startsWith("chrome://") ||
      tab.url.startsWith("chrome-extension://")
    ) {
      alert("Open a normal website first.");
      return;
    }

    const response = await chrome.tabs.sendMessage(tab.id, {
      type: "GET_DATA",
    });

    console.log("DATA RECEIVED:", response);

    const embedRes = await fetch("http://localhost:5000/api/ai/embed", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: response.content }),
    });

    const embedData = await embedRes.json();

    await saveDocument({
      ...response,
      embedding: embedData.embedding,
    });

    console.log("Saved to IndexedDB + VectorDB ✅");

    chrome.storage.local.set({ pageData: response }, () => {
      chrome.tabs.create({
        url: chrome.runtime.getURL("popup/result.html"),
      });
    });

  } catch (error) {
    console.error("ERROR:", error);
  }
});
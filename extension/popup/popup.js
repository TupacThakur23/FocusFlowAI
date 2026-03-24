document.getElementById("getData").addEventListener("click", async () => {

    const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });

    if (tab.url.startsWith("chrome://") || tab.url.startsWith("chrome-extension://")) {
        alert("Open a normal website first.");
        return;
    }

    try {
        const response = await chrome.tabs.sendMessage(tab.id, { type: "GET_DATA" });

        console.log("DATA RECEIVED:", response);

        chrome.storage.local.set({ pageData: response }, () => {
            chrome.tabs.create({
                url: chrome.runtime.getURL("popup/result.html")
            });
        });

    } catch (error) {
        console.error("ERROR:", error);
    }
});
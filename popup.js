document.getElementById("getData").addEventListener("click", async () => {

    const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });

    
    if (tab.url.startsWith("chrome://") || tab.url.startsWith("chrome-extension://")) {
        alert("Open a normal website first.");
        return;
    }

    chrome.tabs.sendMessage(tab.id, { type: "GET_DATA" }, (response) => {

        if (chrome.runtime.lastError) {
            console.error("ERROR:", chrome.runtime.lastError.message);
            return;
        }

        console.log("DATA RECEIVED:", response);

        // saveToIndexedDB(response)

        
        chrome.storage.local.set({ pageData: response }, () => { // LOCAL STORAGE (DELETE WHEN IndexedDB done)

            chrome.tabs.create({
                url: chrome.runtime.getURL("result.html")
            });

        });
    });
});
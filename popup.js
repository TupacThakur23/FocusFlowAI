document.getElementById("getData").addEventListener("click", async () => {
    console.log("BUTTON CLICKED");

    const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });

    const tab = tabs[0];
    if (tab.url.startsWith("chrome://") || tab.url.startsWith("chrome-extension://")) {
    alert("Cannot run on this page. Open a normal website.");
    return;
}

    chrome.tabs.sendMessage(tab.id, { type: "GET_DATA" }, (response) => {
        if (chrome.runtime.lastError) {
            console.error("ERROR:", chrome.runtime.lastError.message);
        } else {
            console.log("RESPONSE:", response);

            
            chrome.storage.local.set({ pageData: response }, () => {
                
                
                chrome.tabs.create({
                    url: chrome.runtime.getURL("result.html")
                });

            });
        }
    });
});
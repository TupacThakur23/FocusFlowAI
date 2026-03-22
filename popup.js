document.getElementById("getData").addEventListener("click", async () => {
  console.log("BUTTON CLICKED");

  
  const tabs = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  const tab = tabs[0]; 

 
  chrome.tabs.sendMessage(tab.id, { type: "GET_DATA" }, (response) => {
    if (chrome.runtime.lastError) {
      console.error("ERROR:", chrome.runtime.lastError.message);
    } else {
      console.log("RESPONSE:", response);
    }
  });
});
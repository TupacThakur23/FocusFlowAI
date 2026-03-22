console.log("Content script running");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "GET_DATA") {

        
        const elements = Array.from(document.querySelectorAll("h1, h2, h3"));
        const data = elements.map(el => el.innerText);

        sendResponse(data);
    }
});

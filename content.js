console.log("Content script running");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "GET_DATA") {

        const data = {
            title: document.title,
            url: window.location.href,

            headings: Array.from(document.querySelectorAll("h1,h2,h3")).map(el => el.innerText),

            links: Array.from(document.querySelectorAll("a")).map(a => a.href)
        }
    }
    
    sendResponse(data);
});

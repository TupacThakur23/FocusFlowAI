console.log("Content script running");

const pageData = {
    title: document.title,
    url: window.location.href,
    content: document.body.innerText.slice(0,200)
}


chrome.runtime.sendMessage({
    type: "PAGE_DATA",
    data: pageData
})



chrome.runtime.onMessage.addListener((request,sender,sendResponse) => {
    if (request.type === "GET_DATA"){
        sendResponse({
            title: document.title,
            url: window.location.href,
            content: document.body.innerText.slice(0,2000)
        })
    }
})

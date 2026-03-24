console.log("CONTENT SCRIPT LOADED")

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

  if (message.type === "GET_DATA") {

    const headings = Array.from(document.querySelectorAll("h1, h2, h3"))
      .map(h => h.innerText);

    const links = Array.from(document.querySelectorAll("a"))
      .map(a => a.href);

    const data = {
      title: document.title,
      url: window.location.href,
      content: document.body.innerText.slice(0, 1000),
      headings,
      links
    };

    sendResponse(data);
  }
});
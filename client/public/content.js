// Content script — captures selected text on web pages and sends it to the extension
(function () {
  document.addEventListener("mouseup", () => {
    const selection = window.getSelection().toString().trim();
    if (selection.length > 0) {
      chrome.storage.session.set({ aideCurrentSelection: selection });
    }
  });
})();

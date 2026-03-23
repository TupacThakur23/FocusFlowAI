console.log("Result page loaded");

chrome.storage.local.get("pageData", (result) => {

    const data = result.pageData;
    const container = document.getElementById("content");

    if (!data) {
        container.innerHTML = "<p>No data found</p>";
        return;
    }

    
    container.innerHTML = `
        <h2>${data.title}</h2>
        <p>${data.url}</p>

        <h3>Headings</h3>
        ${data.headings.map(h => `<div class="card">${h}</div>`).join("")}

        <h3>Links</h3>
        ${data.links.slice(0, 10).map(l => `<div class="card">${l}</div>`).join("")}
    `;
});
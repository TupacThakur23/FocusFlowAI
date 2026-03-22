console.log("Result page loaded");

chrome.storage.local.get("pageData", (result) => {
    console.log("RETRIEVED:", result);


    let data = result.pageData;

    console.log("TYPE:", typeof data, data)

    const container = document.getElementById("content");
    
    if (!Array.isArray(data)) {
        data = Object.values(data);
    }

    if (!data || data.length === 0) {
        container.innerHTML = "<p>No data found</p>";
        return;
    }

    data.forEach(item => {
        const div = document.createElement("div");
        div.className = "card";
        div.innerText = item;
        container.appendChild(div);
    });
});
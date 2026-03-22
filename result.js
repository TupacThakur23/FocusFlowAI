const data = JSON.parse(localStorage.getItem("pageData"));

const container = document.getElementById("content");

if (data) {
  data.forEach(item => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerText = item;
    container.appendChild(div);
  });
}
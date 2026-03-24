# 🚀 FocusFlow AI

### *Context-Aware AI Research Workspace Inside Your Browser*

---

## 📌 Overview

FocusFlow AI is a **Chrome Extension-based AI research workspace** designed to streamline how students and researchers interact with information.

It integrates **content capture, local storage, AI processing, and semantic search** into a unified workflow—reducing context switching and improving productivity.

---

## 🎯 Problem Statement

Modern research workflows suffer from:

- Constant tab switching  
- Fragmented information across multiple sources  
- Lack of intelligent organization and summarization  

This results in **cognitive overload and reduced efficiency**.

---

## 💡 Solution

FocusFlow AI transforms the browser into an **intelligent cowork environment** that:

- Captures and stores web content  
- Uses AI to summarize and refine information  
- Enables semantic search using vector embeddings  
- Organizes research in a structured workspace  

---

## 🧩 Core Features

### 📄 Smart Research Hub
- Save and manage web pages locally  
- Organized sidebar interface  
- Indexed storage for quick retrieval  

---

### 🧠 AI Summarization *(Implemented)*
- Generate concise summaries from long content  
- Extract key insights automatically  

---

### 🔍 Semantic Search *(In Progress)*
- Vector-based similarity search  
- Meaning-based retrieval using embeddings  

---

### ✍️ Writing Assistant *(Planned)*
- Grammar correction and tone adjustment  
- Context-aware writing suggestions  

---

### 📊 Flowchart Generator *(Planned)*
- Convert text into structured diagrams  
- Visualize workflows and concepts  

---

### 🤖 AI Assistant Bar *(In Progress)*
- Ask questions about current content  
- Get real-time explanations and rewrites  

---

## 🛠️ Tech Stack

| Layer            | Technology                          |
|------------------|------------------------------------|
| Frontend         | React + Tailwind CSS               |
| Extension Layer  | Chrome Extension APIs              |
| Backend          | Node.js + Express                  |
| Storage          | IndexedDB (Dexie)                  |
| AI / NLP         | OpenAI API / Transformers.js       |
| Vector Search    | Embeddings + Cosine Similarity     |
| Visualization    | Mermaid.js / D3.js                 |

---

## 🧱 Architecture

Webpage
↓
Content Script (Extract Data)
↓
Extension / Frontend UI
↓
IndexedDB (Local Storage)
↓
Embedding Generation (MiniLM / OpenAI)
↓
Vector Similarity Search
↓
AI Processing (Summarization / Insights)
↓
User Interface

## ⚙️ Installation

### 1. Clone the repository
```bash
git clone https://github.com/TupacThakur23/FocusFlowAI.git
cd FocusFlowAI

⚠️ Challenges
Handling dynamic webpage content extraction
Optimizing performance within browser limits
Implementing efficient vector similarity search
Balancing AI processing with responsiveness
🔐 Privacy & Security
All data stored locally using IndexedDB
No unnecessary permissions required
Designed with a privacy-first approach
Minimal dependency on external servers
👨‍💻 Contributors
Yuvraj V Singh
Lakshya Chauhan

🎓 Academic Context

Developed as part of an OJT (On-the-Job Training) Project focusing on:

AI-powered productivity tools
Browser-based intelligent systems
Human-centered design
🌟 Future Scope
Advanced semantic search with optimized vector DB
Offline AI inference using WebGPU
Cross-device synchronization
Collaborative research workspace
Real-time AI cowork assistant
📌 Conclusion

FocusFlow AI aims to transform the browser into an intelligent research workspace, combining AI, storage, and visualization into a seamless experience.



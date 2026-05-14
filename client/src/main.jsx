import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
window.FOCUSFLOW_RENDER_STATUS = 'loading';
console.log('🚀 FocusFlow AI: Starting React mount', {
  rootElement: document.getElementById("root"),
  timestamp: Date.now(),
  userAgent: navigator.userAgent
});
try {
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(<React.StrictMode>
      <App />
    </React.StrictMode>);
  window.FOCUSFLOW_RENDER_STATUS = 'mounted';
  console.log('✅ FocusFlow AI: React app mounted successfully', {
    status: 'mounted',
    timestamp: Date.now()
  });
} catch (error) {
  window.FOCUSFLOW_RENDER_STATUS = 'failed';
  console.error('❌ FocusFlow AI: React mount failed', {
    error: error.message,
    stack: error.stack,
    timestamp: Date.now()
  });
}

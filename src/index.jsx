// ═══════════════════════════════════════════════════════
//  ARC LABS — main.jsx
//  Entry point — imports global CSS then renders App
//  Supports react-snap prerendering (hydrate if snapshot)
// ═══════════════════════════════════════════════════════

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/global.css";

const rootElement = document.getElementById("root");

if (rootElement.hasChildNodes()) {
  // react-snap has pre-rendered — hydrate instead of full render
  ReactDOM.hydrateRoot(
    rootElement,
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

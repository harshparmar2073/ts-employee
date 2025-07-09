import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./index.css";
import App from "./App.jsx";
import { ToastProvider } from "./context/ToastContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ToastProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ToastProvider>
  </StrictMode>
);

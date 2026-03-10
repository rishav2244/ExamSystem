import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { PopupProvider } from "./components/popupType/usePopup";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <PopupProvider>
      <App />
    </PopupProvider>
  </React.StrictMode>
);
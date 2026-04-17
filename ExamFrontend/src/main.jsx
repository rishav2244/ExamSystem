import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { PopupProvider } from "./components/popupType/usePopup";
import { ConfirmProvider } from "./components/popupType/useConfirm";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <PopupProvider>
      <ConfirmProvider>
        <App />
      </ConfirmProvider>
    </PopupProvider>
  </React.StrictMode>
);
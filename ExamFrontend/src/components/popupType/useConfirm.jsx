import { createContext, useContext, useState } from "react";
import { ConfirmModal } from "./ConfirmModal";

const ConfirmContext = createContext();

export const ConfirmProvider = ({ children }) => {

  const [confirmState, setConfirmState] = useState({
    message: "",
    resolve: null
  });

  const confirmPopup = (message) => {
    return new Promise((resolve) => {
      setConfirmState({
        message,
        resolve
      });
    });
  };

  const handleConfirm = () => {
    confirmState.resolve(true);
    setConfirmState({ message: "", resolve: null });
  };

  const handleCancel = () => {
    confirmState.resolve(false);
    setConfirmState({ message: "", resolve: null });
  };

  return (
    <ConfirmContext.Provider value={{ confirmPopup }}>

      {children}

      {confirmState.message && (
        <ConfirmModal
          message={confirmState.message}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}

    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => useContext(ConfirmContext);
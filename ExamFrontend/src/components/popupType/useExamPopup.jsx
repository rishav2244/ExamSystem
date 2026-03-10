import { createContext, useContext, useState } from "react";
import { ExamPopupModal } from "./ExamPopupModal";

const ExamPopupContext = createContext();

export const ExamPopupProvider = ({ children }) => {

  const [popup, setPopup] = useState({
    message: "",
    type: "",
    visible: false
  });

  const showExamPopup = (message, type = "info") => {
    setPopup({
      message,
      type,
      visible: true
    });
  };

  const closePopup = () => {
    setPopup({
      message: "",
      type: "",
      visible: false
    });
  };

  return (
    <ExamPopupContext.Provider value={{ showExamPopup }}>
      {children}

      {popup.visible && (
        <ExamPopupModal
          message={popup.message}
          type={popup.type}
          onClose={closePopup}
        />
      )}

    </ExamPopupContext.Provider>
  );
};

export const useExamPopup = () => useContext(ExamPopupContext);
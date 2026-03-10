import { createContext, useContext, useState } from "react";

const PopupContext = createContext();

export const PopupProvider = ({ children }) => {

    const [popup, setPopup] = useState({
        message: "",
        type: "",
        visible: false
    });

    const showPopup = (message, type = "info") => {
        setPopup({
            message,
            type,
            visible: true
        });
    };

    const closePopup = () => {
        setPopup(prev => ({ ...prev, visible: false }));
    };

    return (
        <PopupContext.Provider value={{ showPopup }}>
            {children}

            {popup.visible && (
                <div className="popup-overlay">

                    <div className="popup-modal">

                        <h3 className={`popup-title popup-${popup.type}`}>
                            {popup.type === "error" && "Error"}
                            {popup.type === "success" && "Success"}
                            {popup.type === "warning" && "Warning"}
                            {popup.type === "info" && "Notice"}
                        </h3>
                        {/* <h3 className={`popup-title popup-${popup.type}`}>
                            {popup.type === "error" && "❌ Error"}
                            {popup.type === "success" && "✅ Success"}
                            {popup.type === "warning" && "⚠ Warning"}
                            {popup.type === "info" && "ℹ Notice"}
                        </h3> */}

                        <p className="popup-message">
                            {popup.message}
                        </p>

                        <button className="popup-button" onClick={closePopup}>
                            OK
                        </button>

                    </div>

                </div>
            )}

        </PopupContext.Provider>
    );
};

export const usePopup = () => useContext(PopupContext);
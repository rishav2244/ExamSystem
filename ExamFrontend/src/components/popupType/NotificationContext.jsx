import React, { createContext, useContext, useState } from 'react';
import { Outlet } from 'react-router-dom'; // <--- Add this

const NotificationContext = createContext();

export const NotificationProvider = () => { // Removed {children} from props
    const [config, setConfig] = useState({ isOpen: false, message: "" });

    const showNotification = (message) => {
        return new Promise((resolve) => {
            setConfig({ isOpen: true, message, resolve });
        });
    };

    const closeNotification = () => {
        if (config.resolve) config.resolve();
        setConfig({ isOpen: false, message: "" });
    };

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {/* 1. Render child routes here */}
            <Outlet /> 

            {/* 2. Your Popup Overlay */}
            {config.isOpen && (
                <div className="popup-overlay success-overlay">
                    <div className="popup-modal success-modal">
                        <h3>Success!</h3>
                        <p>{config.message}</p>
                        <button className="confirm-ok" onClick={closeNotification}>
                            Dismiss
                        </button>
                    </div>
                </div>
            )}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);
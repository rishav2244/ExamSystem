import React, { createContext, useContext, useState } from 'react';
import { Outlet } from 'react-router-dom';

const NotificationContext = createContext();

export const NotificationProvider = () => { 
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
            <Outlet /> 
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
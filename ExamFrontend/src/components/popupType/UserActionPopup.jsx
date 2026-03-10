// // import { useState } from "react";

// // export const useUserActionPopup = () => {
// //     const [popup, setPopup] = useState({
// //         show: false,
// //         message: "",
// //         type: "info"
// //     });

// //     const showUserPopup = (message, type = "info") => {
// //         setPopup({
// //             show: true,
// //             message,
// //             type
// //         });
// //     };

// //     const closeUserPopup = () => {
// //         setPopup({
// //             show: false,
// //             message: "",
// //             type: "info"
// //         });
// //     };

// //     const UserPopupModal = () => {
// //         if (!popup.show) return null;

// //         return (
// //             <div className="modal-backdrop">
// //                 <div className="modal-window popup-modal">
// //                     <h3>
// //                         {popup.type === "success"
// //                             ? "Success"
// //                             : popup.type === "error"
// //                             ? "Error"
// //                             : "Notification"}
// //                     </h3>

// //                     <p>{popup.message}</p>

// //                     <div className="modal-footer">
// //                         <button className="form-submit" onClick={closeUserPopup}>
// //                             OK
// //                         </button>
// //                     </div>
// //                 </div>
// //             </div>
// //         );
// //     };

// //     return { showUserPopup, UserPopupModal };
// // };

// import { useState } from "react";

// export const useUserActionPopup = () => {
//     const [popup, setPopup] = useState(null);

//     const showUserPopup = (message, type = "info") => {
//         setPopup({ message, type });
//     };

//     const closePopup = () => {
//         setPopup(null);
//     };

//     const UserPopupModal = () => {
//         if (!popup) return null;

//         return (<div className="popup-modal">

//             <h3>Error</h3>

//             <p>Registration Error: Email already exists in database</p>

//             <div className="popup-divider"></div>

//             <div className="popup-footer">
//                 <button className="popup-btn" onClick={closePopup}>
//                     OK
//                 </button>
//             </div>

//         </div>
//             // <div className="modal-backdrop">
//             //     <div className="modal-window popup-modal">
//             //         <h3>
//             //             {popup.type === "success"
//             //                 ? "Success"
//             //                 : popup.type === "error"
//             //                 ? "Error"
//             //                 : "Notification"}
//             //         </h3>

//             //         <p>{popup.message}</p>

//             //         <div className="modal-footer">
//             //             <button className="form-submit" onClick={closePopup}>
//             //                 OK
//             //             </button>
//             //         </div>
//             //     </div>
//             // </div>
//         );
//     };

//     return { showUserPopup, UserPopupModal };
// };

import React from "react";

export const UserActionPopup = ({ show, message, type, onClose }) => {

    if (!show) return null;

    const title =
        type === "error"
            ? "Error"
            : type === "success"
            ? "Success"
            : "Notification";

    return (
        <div className="modal-backdrop">
            <div className="popup-modal">

                <h3 className={`popup-title ${type}`}>
                    {title}
                </h3>

                <p className="popup-message">
                    {message}
                </p>

                <div className="popup-divider"></div>

                <div className="popup-footer">
                    <button
                        className="popup-btn"
                        onClick={onClose}
                    >
                        OK
                    </button>
                </div>

            </div>
        </div>
    );
};
import { useContext, useEffect, useState } from "react";
import { AuthenticationContext } from "../context/AuthenticationContext";
import Papa from "papaparse";

export const ExamDetailsModal = ({ onClose }) => {

    const { email } = useContext(AuthenticationContext);
    const [CSVObj, setCSVObj] = useState(null);

    const handleExamCreation = async (e) => {
        const csvFile = e.target.files[0];
        if (!csvFile) {
            return;
        }
        Papa.parse(csvFile, {
            complete: (resultant) => {
                setCSVObj(resultant);
            },
            error: (err) => {
                console.log(err.message);
            }
        });
    }

    useEffect(() => {
        console.log(CSVObj);
    },[CSVObj]);

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div
                className="modal-window"
                onClick={(e) => e.stopPropagation()}
            >
                <button className="modal-close" onClick={onClose}>
                    ✕
                </button>
                <h2>Exam details</h2>
                <div>
                    <input
                        onChange={handleExamCreation}
                        type="file" />
                </div>
            </div>
        </div>
    );
};
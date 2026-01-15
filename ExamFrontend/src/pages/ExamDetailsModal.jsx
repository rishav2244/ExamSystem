import { useContext, useEffect, useState } from "react";
import { AuthenticationContext } from "../context/AuthenticationContext";
import Papa from "papaparse";
import { ExamQuestion } from "../components/FYIType/ExamQuestion";

export const ExamDetailsModal = ({ onClose }) => {

    const { email } = useContext(AuthenticationContext);
    const [CSVObj, setCSVObj] = useState(null);

    const handleExamCreation = async (e) => {
        const csvFile = e.target.files[0];
        if (!csvFile) {
            return;
        }

        Papa.parse(csvFile, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (header) => header.trim(),
            complete: (resultant) => {
                const transformed = transformCSV(resultant.data);
                setCSVObj(transformed);
            },
            error: (err) => {
                console.log(err.message);
            }
        });
    }

    const transformCSV = (rows) => {
        return rows.map((row) => {//We return result as our "nice" JSON.
            const result = {
                Question: row["Question"],
                Ans: row["Correction Option"],
                Marks: row["Marks"]
            };//We create these three attributes with these values from each row.

            let optionIndex = 1;
            Object.keys(row).forEach((key) => {
                if (key.startsWith("Option")) {
                    result[optionIndex] = row[key];
                    optionIndex++;
                }
            });//Basically generates attributes based on index.

            return result;
        });
    };


    useEffect(() => {
        console.log(CSVObj);
    }, [CSVObj]);

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

                    {CSVObj && CSVObj.length > 0 && (
                        <div className="exam-questions-container">
                            {CSVObj.map((q, index) => (
                                <ExamQuestion
                                    key={index}
                                    question={q}
                                    index={index}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
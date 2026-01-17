import { useContext, useEffect, useState } from "react";
import { AuthenticationContext } from "../context/AuthenticationContext";
import Papa from "papaparse";
import { ExamQuestion } from "../components/FYIType/ExamQuestion";
import { ExamQuestionDraft } from "../components/FYIType/ExamQuestionDraft";
import { getExamQuestions, uploadExamQuestions } from "../api/api";

export const ExamDetailsModal = ({ exam, onClose, onQuestionsUploaded }) => {
    const { email } = useContext(AuthenticationContext);
    const [CSVObj, setCSVObj] = useState(null);
    const [backendQuestions, setBackendQuestions] = useState([]);
    const isPending = exam?.status === "PENDING";

    useEffect(() => {
        if (isPending || !exam?.id) return;

        getExamQuestions(exam.id)
            .then((data) => {
                const transformed = transformBackendQuestions(data || []);
                setBackendQuestions(transformed);
            })
            .catch((err) => {
                console.log("Couldn't load questions", err);
            });
    }, [exam?.id, isPending]);

    const transformCSV = (rows) => {
        return rows.map((row) => {
            const result = {
                Question: row["Question"],
                Ans: row["Correction Option"],
                Marks: row["Marks"],
            };
            let optionIndex = 1;
            Object.keys(row).forEach((key) => {
                if (key.startsWith("Option")) {
                    result[optionIndex] = row[key];
                    optionIndex++;
                }
            });
            return result;
        });
    };

    const validateCSVData = (data) => {
    if (!data || data.length === 0) return "The CSV file is empty.";

    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const questionNum = i + 1;

        // 1. Check Marks
        if (isNaN(row["Marks"]) || row["Marks"].trim() === "") {
            return `Row ${questionNum}: "Marks" must be a number.`;
        }

        // 2. Collect all available options for this row
        const options = Object.keys(row)
            .filter(key => key.startsWith("Option") && row[key]?.trim() !== "")
            .map(key => row[key].trim());

        if (options.length < 2) {
            return `Row ${questionNum}: Must have at least 2 non-empty options.`;
        }

        // 3. THE CRITICAL CHECK: Does the 'Correction Option' match an actual Option?
        const correctAns = row["Correction Option"]?.trim();
        if (!options.includes(correctAns)) {
            return `Row ${questionNum}: The "Correction Option" (${correctAns}) does not exactly match any of the provided options. Check for typos!`;
        }
    }
    return null; 
};

    const handleExamCreation = (e) => {
        const csvFile = e.target.files[0];
        if (!csvFile) return;

        Papa.parse(csvFile, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (header) => header.trim(),
            complete: (resultant) => {
                const validationError = validateCSVData(resultant.data);

                if (validationError) {
                    alert(`Invalid CSV: ${validationError}`);
                    e.target.value = null; // Reset the file input
                    return;
                }

                const transformed = transformCSV(resultant.data);
                setCSVObj(transformed);
            },
            error: (err) => {
                alert("Error parsing CSV: " + err.message);
            },
        });
    };

    const handleQuestionUpdate = (qIndex, fieldKey, newValue) => {
        setCSVObj((prevCSV) => {
            return prevCSV.map((item, index) => {
                if (index === qIndex) {
                    return { ...item, [fieldKey]: newValue };
                }
                return item;
            });
        });
    };

    const transformBackendQuestions = (questions) => {
        return questions.map((q) => {
            const transformed = {
                Question: q.text,
                Marks: String(q.marks || "1"),
                Ans: "",
            };
            q.options.forEach((opt) => {
                const key = String(opt.optionIndex + 1);
                transformed[key] = opt.text;
            });
            const correctOption = q.options.find(
                (opt) => opt.optionIndex === q.correctOptionIndex
            );
            if (correctOption) {
                transformed.Ans = correctOption.text;
            }
            return transformed;
        });
    };

    const handleSave = async () => {
        if (!CSVObj || CSVObj.length === 0) return;

        if (!window.confirm("Do you want to save these questions to the exam?")) {
            return;
        }

        try {
            await uploadExamQuestions(exam.id, CSVObj);
            alert("Questions saved successfully!");
            setCSVObj(null);
            onQuestionsUploaded();
            onClose();
        } catch (err) {
            alert("Failed to save questions. Please check console for details.");
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-window" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>✕</button>

                <h2>Exam details</h2>

                {exam && (
                    <div className="exam-header">
                        <h3>Exam ID: {exam.id}</h3>
                        <h3>{exam.title}</h3>
                        <p>Status: {exam.status}</p>
                    </div>
                )}

                {isPending ? (
                    <div>
                        <h3>Upload Questions (CSV)</h3>
                        <input type="file" accept=".csv" onChange={handleExamCreation} />

                        {CSVObj && CSVObj.length > 0 && (
                            <>
                                <div className="exam-questions-container" style={{ margin: "20px 0" }}>
                                    {CSVObj.map((q, index) => (
                                        <ExamQuestionDraft
                                            key={index}
                                            question={q}
                                            index={index}
                                            onChange={handleQuestionUpdate}
                                        />
                                    ))}
                                </div>

                                <button onClick={handleSave} className="QuestionsSaveButton">
                                    Save Questions to Exam
                                </button>
                            </>
                        )}
                    </div>
                ) : (
                    <div>
                        <h3>Exam Questions</h3>
                        {backendQuestions.length === 0 ? (
                            <p>No questions loaded yet</p>
                        ) : (
                            <div className="exam-questions-container">
                                {backendQuestions.map((q, index) => (
                                    <ExamQuestion key={index} question={q} index={index} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
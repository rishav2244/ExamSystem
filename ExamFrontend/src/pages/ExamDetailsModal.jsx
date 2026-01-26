import { useContext, useEffect, useState } from "react";
import { AuthenticationContext } from "../context/AuthenticationContext";
import Papa from "papaparse";
import { ExamQuestion } from "../components/FYIType/ExamQuestion";
import { ExamQuestionDraft } from "../components/FYIType/ExamQuestionDraft";
import {
    getExamQuestions,
    uploadExamQuestions,
    publishExam,
    getAllUserGroups,
    assignGroupToExam,
    getGroupMembers,
    getExamCandidates
} from "../api/api";

export const ExamDetailsModal = ({ exam, onClose, onQuestionsUploaded }) => {
    const { email } = useContext(AuthenticationContext);

    const [CSVObj, setCSVObj] = useState(null);
    const [backendQuestions, setBackendQuestions] = useState([]);
    const [availableGroups, setAvailableGroups] = useState([]);
    const [selectedGroupId, setSelectedGroupId] = useState("");
    const [candidates, setCandidates] = useState([]);

    const isPending = exam?.status === "PENDING";
    const canPublish = exam?.status === "SAVED" && selectedGroupId !== "";

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

    useEffect(() => {
        if (exam?.status === "SAVED") {
            getAllUserGroups()
                .then(data => setAvailableGroups(data))
                .catch(err => console.error("Failed to load groups", err));
        }
    }, [exam?.status]);

   
    useEffect(() => {
        if (exam?.status === "PUBLISHED") {
           
            getExamCandidates(exam.id)
                .then(data => setCandidates(data || []))
                .catch(err => console.error("Failed to load assigned candidates", err));
        } else if (exam?.status === "SAVED" && selectedGroupId) {
            
            getGroupMembers(selectedGroupId)
                .then(data => setCandidates(data || []))
                .catch(err => console.error("Failed to preview group", err));
        } else {
            setCandidates([]);
        }
    }, [exam?.status, exam?.id, selectedGroupId]);

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

            if (isNaN(row["Marks"]) || row["Marks"].trim() === "") {
                return `Row ${questionNum}: "Marks" must be a number.`;
            }

            const options = Object.keys(row)
                .filter(key => key.startsWith("Option") && row[key]?.trim() !== "")
                .map(key => row[key].trim());

            if (options.length < 2) {
                return `Row ${questionNum}: Must have at least 2 non-empty options.`;
            }

            const correctAns = row["Correction Option"]?.trim();
            if (!options.includes(correctAns)) {
                return `Row ${questionNum}: The "Correction Option" (${correctAns}) does not exactly match any of the provided options. Check for typos!`;
            }
        }
        return null;
    };

    const validateDraftData = (questions) => {
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            const label = `Question ${i + 1}`;

            if (!q.Question || q.Question.trim() === "") {
                return `${label}: Question text cannot be empty.`;
            }

            if (q.Marks === "" || isNaN(q.Marks) || Number(q.Marks) < 0) {
                return `${label}: Marks must be a positive number.`;
            }

            const optionKeys = Object.keys(q).filter(key => !isNaN(key));
            if (optionKeys.length < 2) {
                return `${label}: Must have at least 2 options.`;
            }

            const optionValues = optionKeys.map(k => q[k].trim());
            if (optionValues.some(val => val === "")) {
                return `${label}: One or more options are empty.`;
            }

            if (!optionValues.includes(q.Ans.trim())) {
                return `${label}: The Correct Answer does not match any of the provided options.`;
            }
        }
        return null; 
    };

    const handleConfirmAndPublish = async () => {
        if (!selectedGroupId) {
            alert("Please select a group first.");
            return;
        }

        if (!window.confirm("This will assign the group and publish the exam. Students will see it immediately. Proceed?")) {
            return;
        }

        try {
            console.log("Assigning group...");
            await assignGroupToExam(exam.id, selectedGroupId);

            console.log("Publishing exam...");
            await publishExam(exam.id);

            alert("Group assigned and Exam published successfully!");
            onQuestionsUploaded();
            onClose();
        } catch (err) {
            alert("An error occurred during the publish process. Check console.");
            console.error(err);
        }
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
                    e.target.value = null;
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

    const handleDeleteExam = async () => {
        if (!window.confirm("ARE YOU SURE? This will permanently delete the exam and all its questions. This cannot be undone.")) {
            return;
        }

        console.log("Delete triggered for exam ID:", exam.id);
        
    };

    const handleSave = async () => {
        if (!CSVObj || CSVObj.length === 0) return;

        const error = validateDraftData(CSVObj);
        if (error) {
            alert(`Validation Error:\n${error}`);
            return;
        }

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

                <div className="modal-body">
                    {isPending ? (
                        <div className="upload-section">
                            <h3>Upload Questions (CSV)</h3>
                            <input type="file" accept=".csv" onChange={handleExamCreation} />
                            {CSVObj && CSVObj.length > 0 && (
                                <div className="exam-questions-container">
                                    {CSVObj.map((q, index) => (
                                        <ExamQuestionDraft
                                            key={index}
                                            question={q}
                                            index={index}
                                            onChange={handleQuestionUpdate}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="view-section">
                            <h3>Exam Questions</h3>
                            <div className="exam-questions-container">
                                {backendQuestions.map((q, index) => (
                                    <ExamQuestion key={index} question={q} index={index} />
                                ))}
                            </div>

                            {/* SAVED: Show Dropdown to Assign Group */}
                            {exam?.status === "SAVED" && (
                                <div className="group-assignment-section">
                                    <h4>Select Candidate Group</h4>
                                    <div className="group-input-group">
                                        <select
                                            value={selectedGroupId}
                                            onChange={(e) => setSelectedGroupId(e.target.value)}
                                            className="group-dropdown"
                                        >
                                            <option value="">-- Select Group to Assign --</option>
                                            {availableGroups.map((grp) => (
                                                <option key={grp.id} value={grp.id}>{grp.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* LIST CONTAINER: Show for SAVED (if selected) or PUBLISHED (always) */}
                            {((exam?.status === "SAVED" && selectedGroupId) || exam?.status === "PUBLISHED") && (
                                <div className="candidate-list-container">
                                    <h5>
                                        {exam?.status === "PUBLISHED" ? "Assigned Candidates" : "Draft Candidate List"} ({candidates.length})
                                    </h5>
                                    <div className="candidate-scroll">
                                        {candidates.length > 0 ? (
                                            candidates.map((c, i) => (
                                                <div key={i} className="candidate-item">
                                                    <span className="candidate-name">{c.name}</span>
                                                    <span className="candidate-email">{c.email}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="no-candidates-msg">No candidates found.</p>
                                        )}
                                    </div>
                                    {exam?.status === "SAVED" && (
                                        <p className="draft-notice">Review carefully. This list will be finalized on Publish.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button onClick={handleDeleteExam} className="DeleteExamButton">
                        Delete Exam
                    </button>

                    {/* Save Draft Questions (Pending only) */}
                    {isPending && CSVObj && CSVObj.length > 0 && (
                        <button onClick={handleSave} className="QuestionsSaveButton">
                            Save Questions to Exam
                        </button>
                    )}

                    {/* Assign + Publish (Saved + Group Selected only) */}
                    {exam?.status === "SAVED" && selectedGroupId !== "" && (
                        <button onClick={handleConfirmAndPublish} className="PublishExamButton">
                            Confirm & Publish Exam
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
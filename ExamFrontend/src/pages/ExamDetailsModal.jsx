import { useContext, useEffect, useState } from "react";
import { AuthenticationContext } from "../context/AuthenticationContext";
import { usePopup } from "../components/popupType/usePopup";
import { useConfirm } from "../components/popupType/useConfirm";
import Papa from "papaparse";

import { ExamQuestion } from "../components/FYIType/ExamQuestion";
import { ExamQuestionDraft } from "../components/FYIType/ExamQuestionDraft";
import { CandidateRow } from "../components/FYIType/CandidateRow";

import { MailSendingModal } from "../components/popupType/MailSendingModal";


import {
    getExamQuestions,
    uploadExamQuestions,
    publishExam,
    getAllUserGroups,
    assignGroupToExam,
    getGroupMembers,
    getExamCandidates,
    deleteExam
} from "../api/api";

export const ExamDetailsModal = ({ exam, onClose, onQuestionsUploaded }) => {

    const { email } = useContext(AuthenticationContext);
    const { showPopup } = usePopup();
    const { confirmPopup } = useConfirm();

    const [CSVObj, setCSVObj] = useState(null);
    const [backendQuestions, setBackendQuestions] = useState([]);
    const [availableGroups, setAvailableGroups] = useState([]);
    const [selectedGroupId, setSelectedGroupId] = useState("");
    const [candidates, setCandidates] = useState([]);
    const [cutoff, setCutoff] = useState(40);

    const isPending = exam?.status === "PENDING";
    const [sendingMail, setSendingMail] = useState(false);

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

        }
        else if (exam?.status === "SAVED" && selectedGroupId) {

            getGroupMembers(selectedGroupId)
                .then(data => setCandidates(data || []))
                .catch(err => console.error("Failed to preview group", err));

        }
        else {

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
                return `Row ${questionNum}: The "Correction Option" (${correctAns}) does not match any option.`;
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
                return `${label}: Correct Answer does not match options.`;
            }

        }

        return null;

    };
    const handleConfirmAndPublish = async () => {

        if (!selectedGroupId) {
            showPopup("Please select a group first.", "warning");
            return;
        }

        const confirmed = await confirmPopup(
            "This will assign the group and publish the exam. Students will see it immediately. Proceed?"
        );

        if (!confirmed) return;

        try {

            setSendingMail(true);

            await new Promise(r => setTimeout(r, 50));

            await assignGroupToExam(exam.id, selectedGroupId);

            await publishExam(exam.id);

            setSendingMail(false);

            showPopup("Exam published and invitations sent successfully!", "success");

            onQuestionsUploaded();
            onClose();

        } catch (err) {

            setSendingMail(false);

            showPopup("An error occurred during the publish process.", "error");
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

                    showPopup(`Invalid CSV: ${validationError}`, "error");
                    e.target.value = null;
                    return;

                }

                const transformed = transformCSV(resultant.data);
                setCSVObj(transformed);

            },

            error: (err) => {

                showPopup("Error parsing CSV: " + err.message, "error");

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

        const confirmed = await confirmPopup(
            "ARE YOU SURE? This will permanently delete the exam and all its questions, submissions, and candidate records. This cannot be undone."
        );

        if (!confirmed) return;

        try {

            await deleteExam(exam.id);

            showPopup("Exam deleted successfully.", "success");

            if (onQuestionsUploaded) {

                onQuestionsUploaded();

            }

            onClose();

        } catch (err) {

            const errorMessage =
                err.response?.data?.message ||
                "An error occurred while deleting the exam.";

            showPopup(`Delete Failed: ${errorMessage}`, "error");

            console.error(err);

        }

    };


    const handleSave = async () => {

        if (!CSVObj || CSVObj.length === 0) return;

        const error = validateDraftData(CSVObj);

        if (error) {

            showPopup(`Validation Error: ${error}`, "error");
            return;

        }

        if (cutoff < 0 || cutoff > 100) {

            showPopup("Cutoff percentage must be between 0 and 100.", "warning");
            return;

        }

        const confirmed = await confirmPopup(
            `Save questions with a ${cutoff}% passing cutoff?`
        );

        if (!confirmed) return;

        try {

            await uploadExamQuestions(exam.id, CSVObj, cutoff);

            showPopup("Questions and Cutoff saved successfully!", "success");

            setCSVObj(null);
            onQuestionsUploaded();
            onClose();

        } catch (err) {

            showPopup("Failed to save. Check console.", "error");

        }

    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-window" onClick={(e) => e.stopPropagation()}>

                {sendingMail && <MailSendingModal />}

                <button className="modal-close" onClick={onClose}>✕</button>
                <button className="modal-close" onClick={onClose}>✕</button>

                <h2>Exam details</h2>

                {exam && (
                    <div className="modal-exam-header">
                        <h3>{exam.title}</h3>
                        <p>Status: {exam.status}</p>
                        <p className="exam-meta">Starts: {new Date(exam.startTime).toLocaleString()}</p>
                        <p className="exam-meta">Ends: {new Date(exam.endTime).toLocaleString()}</p>
                        <p className="exam-meta">Total Marks: {exam.totalMarks}</p>
                        <p className="exam-meta">
                            Cutoff Marks: {((exam.totalMarks * exam.cutoff) / 100).toFixed(2)}
                        </p>
                    </div>
                )}

                <div className="modal-body">

                    {isPending ? (
                        <div className="upload-section">

                            <h3>Upload Questions (CSV)</h3>

                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleExamCreation}
                            />

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
                                    <ExamQuestion
                                        key={index}
                                        question={q}
                                        index={index}
                                    />
                                ))}

                            </div>

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
                                                <option key={grp.id} value={grp.id}>
                                                    {grp.name}
                                                </option>
                                            ))}

                                        </select>

                                    </div>

                                </div>
                            )}

                            {((exam?.status === "SAVED" && selectedGroupId) || exam?.status === "PUBLISHED") && (

                                <div className="candidate-list-container">

                                    <h5>
                                        {exam?.status === "PUBLISHED"
                                            ? "Assigned Candidates"
                                            : "Draft Candidate List"} ({candidates.length})
                                    </h5>

                                    <div className="candidate-scroll">

                                        {candidates.length > 0 ? (
                                            candidates.map((c) => (
                                                <CandidateRow
                                                    key={c.id}
                                                    candidate={c}
                                                />
                                            ))
                                        ) : (
                                            <p className="no-candidates-msg">
                                                No candidates found.
                                            </p>
                                        )}

                                    </div>

                                    {exam?.status === "SAVED" && (
                                        <p className="draft-notice">
                                            Review carefully. This list will be finalized on Publish.
                                        </p>
                                    )}

                                </div>

                            )}

                        </div>
                    )}

                </div>

                <div className="modal-footer">

                    <button
                        onClick={handleDeleteExam}
                        className="DeleteExamButton"
                    >
                        Delete Exam
                    </button>

                    {isPending && CSVObj && CSVObj.length > 0 && (
                        <div className="save-actions-container">

                            <div className="cutoff-input-wrapper">

                                <label>Pass Cutoff (%): </label>

                                <input
                                    type="number"
                                    value={cutoff}
                                    onChange={(e) => setCutoff(e.target.value)}
                                    min="0"
                                    max="100"
                                    className="cutoff-input"
                                />

                            </div>

                        </div>
                    )}

                    {isPending && CSVObj && CSVObj.length > 0 && (
                        <button
                            onClick={handleSave}
                            className="QuestionsSaveButton"
                        >
                            Save Questions to Exam
                        </button>
                    )}

                    {exam?.status === "SAVED" && selectedGroupId !== "" && (
                        <button
                            onClick={handleConfirmAndPublish}
                            className="PublishExamButton"
                        >
                            Confirm & Publish Exam
                        </button>
                    )}

                </div>

            </div>
        </div>
    );
}
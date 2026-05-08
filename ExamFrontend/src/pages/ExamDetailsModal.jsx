import { useContext, useEffect, useState } from "react";
import { AuthenticationContext } from "../context/AuthenticationContext";
import { usePopup } from "../components/popupType/usePopup";
import { useConfirm } from "../components/popupType/useConfirm";
import Papa from "papaparse";

// Sub-components
import { ExamOverviewPlate } from "../components/headerType/ExamOverviewPlate";
import { QuestionWorkbench } from "../components/FYIType/QuestionWorkbench";
import { ExamCandidatePanel } from "../components/FYIType/ExamCandidatePanel";
import { ExamActionTray } from "../components/footerType/ExamActionTray";
import { MailSendingModal } from "../components/popupType/MailSendingModal";

// API
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
    const { showPopup } = usePopup();
    const { confirmPopup } = useConfirm();

    const [CSVObj, setCSVObj] = useState(null);
    const [backendQuestions, setBackendQuestions] = useState([]);
    const [availableGroups, setAvailableGroups] = useState([]);
    const [selectedGroupId, setSelectedGroupId] = useState("");
    const [candidates, setCandidates] = useState([]);
    const [cutoff, setCutoff] = useState(40);

    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [sendingMail, setSendingMail] = useState(false);

    const pageSize = 5;
    const isPending = exam?.status === "PENDING";

    // --- Data Fetching Logic ---

    useEffect(() => {
        if (isPending || !exam?.id) return;
        getExamQuestions(exam.id)
            .then((data) => setBackendQuestions(transformBackendQuestions(data || [])))
            .catch((err) => console.log("Couldn't load questions", err));
    }, [exam?.id, isPending]);

    useEffect(() => {
        if (exam?.status === "SAVED") {
            getAllUserGroups(0, 100)
                .then(data => setAvailableGroups(data.content || data))
                .catch(err => console.error("Failed to load groups", err));
        }
    }, [exam?.status]);

    useEffect(() => {
        if (exam?.status === "PUBLISHED") {
            getExamCandidates(exam.id, currentPage, pageSize)
                .then(data => {
                    setCandidates(data.content || []);
                    setTotalPages(data.totalPages || 0);
                })
                .catch(err => console.error("Failed to load assigned candidates", err));
        } else if (exam?.status === "SAVED" && selectedGroupId) {
            getGroupMembers(selectedGroupId, 0, 100)
                .then(data => {
                    const memberList = data.content || data;
                    setCandidates(Array.isArray(memberList) ? memberList : []);
                    setTotalPages(data.totalPages || 0);
                })
                .catch(err => {
                    console.error("Failed to preview group", err);
                    setCandidates([]);
                });
        } else {
            setCandidates([]);
            setTotalPages(0);
        }
    }, [exam?.status, exam?.id, selectedGroupId, currentPage]);

    // --- Handlers & Helpers ---

    const transformCSV = (rows) => rows.map((row) => {
        const result = { Question: row["Question"], Ans: row["Correction Option"], Marks: row["Marks"] };
        let optionIndex = 1;
        Object.keys(row).forEach((key) => {
            if (key.startsWith("Option")) { result[optionIndex] = row[key]; optionIndex++; }
        });
        return result;
    });

    const transformBackendQuestions = (questions) => questions.map((q) => {
        const transformed = { Question: q.text, Marks: String(q.marks || "1"), Ans: "" };
        q.options.forEach((opt) => { transformed[String(opt.optionIndex + 1)] = opt.text; });
        const correctOption = q.options.find((opt) => opt.optionIndex === q.correctOptionIndex);
        if (correctOption) transformed.Ans = correctOption.text;
        return transformed;
    });

    const handleCSVUpload = (e) => {
        const csvFile = e.target.files[0];
        if (!csvFile) return;
        Papa.parse(csvFile, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (h) => h.trim(),
            complete: (res) => {
                const err = validateCSVData(res.data);
                if (err) { showPopup(`Invalid CSV: ${err}`, "error"); e.target.value = null; return; }
                setCSVObj(transformCSV(res.data));
            }
        });
    };

    const validateCSVData = (data) => {
        if (!data || data.length === 0) return "The CSV file is empty.";
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            if (isNaN(row["Marks"]) || row["Marks"].trim() === "") return `Row ${i + 1}: Marks must be a number.`;
            const options = Object.keys(row).filter(k => k.startsWith("Option") && row[k]?.trim() !== "");
            if (options.length < 2) return `Row ${i + 1}: Must have at least 2 options.`;
            if (!options.map(k => row[k].trim()).includes(row["Correction Option"]?.trim())) return `Row ${i + 1}: Answer mismatch.`;
        }
        return null;
    };

    const handleConfirmAndPublish = async () => {
        if (!selectedGroupId) return showPopup("Please select a group.", "warning");
        if (!(await confirmPopup("Assign group and publish exam?"))) return;
        try {
            setSendingMail(true);
            await assignGroupToExam(exam.id, selectedGroupId);
            await publishExam(exam.id);
            setSendingMail(false);
            showPopup("Published!", "success");
            onQuestionsUploaded(); onClose();
        } catch { setSendingMail(false); showPopup("Error publishing.", "error"); }
    };

    const handleDelete = async () => {
        if (!(await confirmPopup("Permanently delete this exam?"))) return;
        try {
            await deleteExam(exam.id);
            showPopup("Deleted.", "success");
            onQuestionsUploaded(); onClose();
        } catch (err) { showPopup("Delete failed.", "error"); }
    };

    const handleSaveQuestions = async () => {
        if (!CSVObj) return;
        if (cutoff < 0 || cutoff > 100) return showPopup("Invalid cutoff.", "warning");
        if (!(await confirmPopup(`Save questions with ${cutoff}% cutoff?`))) return;
        try {
            await uploadExamQuestions(exam.id, CSVObj, cutoff);
            showPopup("Saved!", "success");
            onQuestionsUploaded(); onClose();
        } catch { showPopup("Save failed.", "error"); }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-window wide-modal" onClick={(e) => e.stopPropagation()}>
                {sendingMail && <MailSendingModal />}
                <button className="modal-close" onClick={onClose}>✕</button>

                <h2>Exam details</h2>

                <ExamOverviewPlate exam={exam} />

                <div className="modal-body">
                    <QuestionWorkbench 
                        isPending={isPending}
                        onCSVUpload={handleCSVUpload}
                        csvQuestions={CSVObj}
                        onDraftChange={(idx, key, val) => {
                            const newCSV = [...CSVObj];
                            newCSV[idx][key] = val;
                            setCSVObj(newCSV);
                        }}
                        backendQuestions={backendQuestions}
                    />

                    <ExamCandidatePanel 
                        examStatus={exam?.status}
                        availableGroups={availableGroups}
                        selectedGroupId={selectedGroupId}
                        onGroupChange={setSelectedGroupId}
                        candidates={candidates}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>

                <ExamActionTray 
                    examStatus={exam?.status}
                    isPending={isPending}
                    csvQuestionsExist={!!CSVObj}
                    cutoff={cutoff}
                    setCutoff={setCutoff}
                    selectedGroupId={selectedGroupId}
                    onDelete={handleDelete}
                    onSaveQuestions={handleSaveQuestions}
                    onPublish={handleConfirmAndPublish}
                />
            </div>
        </div>
    );
};
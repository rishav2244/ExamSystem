import { useContext, useEffect, useState } from "react";
import { AuthenticationContext } from "../context/AuthenticationContext";
import { createExam } from "../api/api";
import { usePopup } from "../components/popupType/usePopup";

export const CreateExamModal = ({ onClose, onExamCreated }) => {

    const { email } = useContext(AuthenticationContext);
    const { showPopup } = usePopup();

    const [examData, setExamData] = useState({
        title: "",
        duration: "",
        startTime: "",
        endTime: "",
        status: "",
        createdBy: "",
        allowResume: false
    });

    useEffect(() => {
        setExamData(prev => ({
            ...prev,
            status: "PENDING",
            createdBy: email
        }));
    }, [email]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setExamData(prev => ({
            ...prev,
            // If the input type is checkbox, use 'checked' (boolean), else use 'value'
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleExamCreation = async (e) => {
        e.preventDefault();
        if (!examData.title) {
            showPopup("Title is required", "error");
            return;
        }
        else if (!examData.startTime) {
            showPopup("Start time is required", "error");
            return;
        }
        else if (!examData.endTime) {
            showPopup("End time is required", "error");
            return;
        }
        else if (!examData.duration) {
            showPopup("Duration is required", "error");
            return;
        }
        else if (examData.endTime < examData.startTime) {
            showPopup("Start date cannot be after end date.", "error");
            return;
        }
        else if (isNaN(examData.duration) || Number(examData.duration) <= 0) {
            showPopup("Duration cannot be negative or 0 or non-numeric.", "error");
            return;
        }

        const start = new Date(examData.startTime);
        const end = new Date(examData.endTime);
        const durationMinutes = Number(examData.duration);

        const availableMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
        if (availableMinutes < (durationMinutes + 5)) {
            showPopup(`The time window (${availableMinutes} mins) is too short for a ${durationMinutes} min exam plus the required 5-minute buffer.`, "error");
            return;
        }

        try {

            const examDetailsJSON = {
                title: examData.title,
                duration: Number(examData.duration),
                startTime: new Date(examData.startTime).toISOString(),
                endTime: new Date(examData.endTime).toISOString(),
                status: examData.status,
                createdBy: examData.createdBy,
                allowResume: examData.allowResume,
            };

            console.log("Submitting exam:", examDetailsJSON);

            await createExam(
                examDetailsJSON.title,
                examDetailsJSON.duration,
                examDetailsJSON.startTime,
                examDetailsJSON.endTime,
                examDetailsJSON.status,
                examDetailsJSON.allowResume
            );

            showPopup("Exam created successfully!", "success");
            onExamCreated();
            onClose();
        } catch (err) {
            console.error(err);
            showPopup("Failed to create exam. See console for details.", "error");
        }
    }

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div
                className="modal-window"
                onClick={(e) => e.stopPropagation()}
            >
                <button className="modal-close" onClick={onClose}>
                    ✕
                </button>
                <h2>Create Exam</h2>
                <div
                    className="FormDiv">
                    <form
                        onSubmit={handleExamCreation}
                    >
                        <div
                            className="form-group">
                            <label htmlFor="title">Title</label>
                            <input type="text"
                                name="title"
                                id="title"
                                placeholder="Title"
                                value={examData.title}
                                onChange={handleChange} />
                        </div>

                        <div
                            className="form-group">
                            <label htmlFor="duration">Duration</label>
                            <input type="text"
                                name="duration"
                                id="duration"
                                value={examData.duration}
                                onChange={handleChange}
                                placeholder="Duration (Mins)" />
                        </div>

                        <div
                            className="form-group">
                            <label htmlFor="startTime">Start time</label>
                            <input
                                type="datetime-local"
                                name="startTime"
                                id="startTime"
                                value={examData.startTime}
                                onChange={handleChange} />
                        </div>

                        <div
                            className="form-group">
                            <label htmlFor="endTime">End time</label>
                            <input
                                type="datetime-local"
                                name="endTime"
                                id="endTime"
                                value={examData.endTime}
                                onChange={handleChange} />
                        </div>

                        <div className="form-group checkbox-group">
                            <label htmlFor="allowResume">Allow resume?</label>
                            <input
                                type="checkbox"
                                name="allowResume"
                                id="allowResume"
                                checked={examData.allowResume}
                                onChange={handleChange}
                            />
                        </div>

                        <button
                            type="submit"
                            className="form-submit">Create</button>
                    </form>
                </div>
            </div>
        </div>
    );
};
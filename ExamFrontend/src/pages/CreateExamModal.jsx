import { useContext, useEffect, useState } from "react";
import { AuthenticationContext } from "../context/AuthenticationContext";
import { createExam } from "../api/api";

export const CreateExamModal = ({ onClose, onExamCreated }) => {

    const { email } = useContext(AuthenticationContext);

    const [examData, setExamData] = useState({
        title: "",
        duration: "",
        startTime: "",
        endTime: "",
        status: "",
        createdBy: ""
    });

    useEffect(() => {
        setExamData(prev => ({
            ...prev,
            status: "PENDING",
            createdBy: email
        }));
    }, [email]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setExamData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleExamCreation = async (e) => {
        e.preventDefault();
        if (!examData.title) {
            alert("Title is required");
            return;
        }
        else if (!examData.startTime) {
            alert("Start time is required");
            return;
        }
        else if (!examData.endTime) {
            alert("End time is required");
            return;
        }
        else if (!examData.duration) {
            alert("Duration is required");
            return;
        }
        else if (examData.endTime < examData.startTime){
            alert("Start date cannot be after end date.")
            return;
        }
        else if (Number(examData.duration) <= 0)
        {
            alert("Duration cannot be negative or 0.")
            return;
        }
        // console.log(examData);

        try {

            const examDetailsJSON = {
                title: examData.title,
                duration: Number(examData.duration),
                startTime: new Date(examData.startTime).toISOString(),
                endTime: new Date(examData.endTime).toISOString(),
                status: examData.status,
                createdBy: examData.createdBy,
            };

            console.log("Submitting exam:", examDetailsJSON);

            await createExam(
                examDetailsJSON.title,
                examDetailsJSON.duration,
                examDetailsJSON.startTime,
                examDetailsJSON.endTime,
                examDetailsJSON.status,
                examDetailsJSON.createdBy
            );

            alert("Exam created successfully!");
            onExamCreated();
            onClose();
        } catch (err) {
            console.error(err);
            alert("Failed to create exam. See console for details.");
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

                        <button 
                        type="submit"
                        className="form-submit">Create</button>
                    </form>
                </div>
            </div>
        </div>
    );
};
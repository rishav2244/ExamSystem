import axios from "axios";

const API_URL = "http://localhost:8080/api";

// /api/user for user, goes into /login and /register
// /api/exams for exam, goes into /createExam and /getExams

export const loginAttempt = async (email, password) => {
    const loginReqJSON = {
        email: email,
        password: password,
    }
    try {
        const resp = await axios.post(`${API_URL}/user/login`, loginReqJSON);
        return resp.data;
    } catch (err) {
        throw err;
    }
}

export const registrationAttempt = async (email, name, password, role) => {
    const registerReqJSON = {
        email: email,
        name: name,
        password: password,
        role: role,
    }
    try {
        const resp = await axios.post(`${API_URL}/user/register`, registerReqJSON);
        return resp.data;
    } catch (err) {
        throw err;
    }
}

export const createExam = async (title, duration, startTime, endTime, status, createdBy) => {
    const createExamReqJSON = {
        title: title,
        duration: duration,
        startTime: startTime,
        endTime: endTime,
        status: status,
        createdBy: createdBy
    }
    try {
        const resp = await axios.post(`${API_URL}/exams/createExam`, createExamReqJSON);
        return resp.data;
    } catch (err) {
        throw err;
    }
}

export const getExams = async () => {
    try {
        const resp = await axios.get(`${API_URL}/exams/getExams`);
        return resp.data;
    } catch (err) {
        throw err;
    }
}

export const getExamQuestions = async (examId) => {
    const response = await axios.get(`${API_URL}/exams/${examId}/questions`);
    return response.data;
};

export const uploadExamQuestions = async (examId, questions) => {
    try {
        const payload = questions.map((q) => {
            // Build options array from numeric keys 1,2,3,4
            const options = [];
            for (let i = 1; i <= 4; i++) {
                if (q[i]) {
                    options.push({
                        optionIndex: i - 1,
                        text: q[i],
                    });
                }
            }

            // Find correct option index by matching text
            const correctOptionIndex = options.findIndex(
                (opt) => opt.text.trim() === q.Ans.trim()
            );

            return {
                text: q.Question?.trim() || "",
                marks: Number(q.Marks) || 1,
                correctOptionIndex: correctOptionIndex >= 0 ? correctOptionIndex : 0, // fallback to 0 if not found
                options,
            };
        });

        const response = await axios.post(
            `${API_URL}/exams/${examId}/questions`,
            payload
        );

        return response.data; // usually void, but good to return for future
    } catch (error) {
        console.error("Question upload failed:", error);
        throw error; // let component handle error if needed
    }
};
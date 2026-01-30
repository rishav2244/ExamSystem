import axios from "axios";

const API_URL = "http://localhost:8080/api";

// /api/user for user, goes into /login and /register
// /api/exams for exam, goes into /createExam and /getExams

export const loginAttempt = async (email, password) => {
    const loginReqJSON = { email, password };
    try {
        const resp = await axios.post(`${API_URL}/user/login`, loginReqJSON);
        const token = resp.headers['authorization'];

        return { ...resp.data, token };
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

export const resetPassword = async (email, oldPassword, newPassword) => {
    const payload = { email, oldPassword, newPassword };
    try {
        const resp = await axios.post(`${API_URL}/user/reset-password`, payload);
        return resp.data;
    } catch (err) {
        throw err;
    }
};

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

            const options = [];
            for (let i = 1; i <= 4; i++) {
                if (q[i]) {
                    options.push({
                        optionIndex: i - 1,
                        text: q[i],
                    });
                }
            }

            const correctOptionIndex = options.findIndex(
                (opt) => opt.text.trim() === q.Ans.trim()
            );

            return {
                text: q.Question?.trim() || "",
                marks: Number(q.Marks) || 1,
                correctOptionIndex: correctOptionIndex >= 0 ? correctOptionIndex : 0,
                options,
            };
        });

        const response = await axios.post(
            `${API_URL}/exams/${examId}/questions`,
            payload
        );

        return response.data;
    } catch (error) {
        console.error("Question upload failed:", error);
        throw error;
    }
};

export const publishExam = async (examId) => {
    try {
        const resp = await axios.post(`${API_URL}/exams/publishExam/${examId}`);
        return resp.data;
    } catch (err) {
        console.error("Failed to publish exam:", err);
        throw err;
    }
};

export const getAllUsers = async () => {
    try {
        const resp = await axios.get(`${API_URL}/user/users`);
        return resp.data; // This returns the List<UserHeavyDTO>
    } catch (err) {
        console.error("Error fetching users:", err);
        throw err;
    }
};

export const getAllUserGroups = async () => {
    const resp = await axios.get(`${API_URL}/userGroups`);
    return resp.data;
};

export const createGroup = async (groupData) => {
    const resp = await axios.post(`${API_URL}/userGroups/create`, groupData);
    return resp.data;
};

export const deleteGroup = async (groupId) => {
    await axios.delete(`${API_URL}/userGroups/delete/${groupId}`);
};

export const getGroupMembers = async (groupId) => {
    const resp = await axios.get(`${API_URL}/userGroups/userList/${groupId}`);
    return resp.data;
};

export const getCandidatesOnly = async () => {
    const resp = await axios.get(`${API_URL}/user/candidates`);
    return resp.data;
};

export const assignGroupToExam = async (examId, groupId) => {
    const resp = await axios.post(`${API_URL}/exams/Candidates/${examId}/${groupId}`);
    return resp.data
};

export const getExamCandidates = async (examId) => {
    try {
        const resp = await axios.get(`${API_URL}/candidate/candidates/${examId}`);
        return resp.status === 204 ? [] : resp.data;
    } catch (err) {
        console.error("Error fetching candidates:", err);
        throw err;
    }
};

export const getCandidateDashboard = async (email) => {
    try {
        const resp = await axios.get(
            `${API_URL}/candidateUser/dashboard/${email}`
        );
        return resp.data;
    } catch (err) {
        console.error("Error fetching candidate dashboard:", err);
        throw err;
    }
};

export const checkCandidateEligibility = async (examId, email) => {
    try {
        const resp = await axios.get(
            `${API_URL}/candidateUser/eligibility/${examId}/${email}`
        );
        return resp.data;
    } catch (err) {
        throw err;
    }
};

export const startExam = async (examId, name, email, location) => {
    // These keys must match the Java private field names EXACTLY
    const payload = {
        examId: examId,
        candidateName: name,      // Matches 'private String candidateName'
        candidateEmail: email,    // Matches 'private String candidateEmail'
        location: location        // Matches 'private String location'
    };

    const resp = await axios.post(`${API_URL}/candidateUser/start`, payload);
    return resp.data;
};

export const fetchExamContent = async (examId) => {
    const resp = await axios.get(`${API_URL}/candidateUser/exam/${examId}`);
    return resp.data;
};

export const saveAnswer = async (submissionId, questionId, optionId) => {
    await axios.post(`${API_URL}/candidateUser/answer`, {
        submissionId,
        questionId,
        optionId
    });
};

export const finalizeExam = async (submissionId) => {
    await axios.post(`${API_URL}/candidateUser/submit/${submissionId}`);
};

export const reportViolation = async (submissionId) => {
    await axios.patch(`${API_URL}/candidateUser/violation/${submissionId}`);
};

export const getSubmissionsByExam = async (examId) => {
    try {
        const resp = await axios.get(`${API_URL}/submissions/exam/${examId}`);
        return resp.data;
    } catch (err) {
        console.error("Error fetching submissions:", err);
        throw err;
    }
};

axios.interceptors.request.use(
    (config) => {
        const auth = JSON.parse(sessionStorage.getItem("auth"));
        if (auth && auth.token) {
            config.headers.Authorization = auth.token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
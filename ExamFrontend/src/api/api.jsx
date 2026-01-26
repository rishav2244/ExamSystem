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
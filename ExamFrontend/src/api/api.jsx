import axios from "axios";

const API_URL = "http://localhost:8080/api";
// const API_URL = "http://localhost:8081/api";


export const loginAttempt = async (email, password) => {
    const loginReqJSON = { email, password };
    try {
        const resp = await axios.post(`${API_URL}/user/login`, loginReqJSON);

        const { user, tokens } = resp.data;
        const formattedToken = `${tokens.type} ${tokens.accessToken}`;

        sessionStorage.setItem("auth", JSON.stringify({
            user: user,
            token: formattedToken,
            refreshToken: tokens.refreshToken
        }));

        return resp.data;
    } catch (err) {
        throw err;
    }
}

export const logout = async () => {
    try {
        await axios.post(`${API_URL}/user/logout`);
    } finally {
        sessionStorage.removeItem("auth");
        window.location.href = "/login";
    }
};

export const registerCandidate = async (name, email, password) => {
    const payload = {
        name,
        email,
        password
    };

    try {
        const resp = await axios.post(
            `${API_URL}/user/self-register`,
            payload
        );
        return resp.data;
    } catch (err) {
        throw err;
    }
};

export const verifyOtp = async (email, otp) => {

    const payload = {
        email,
        otp
    };

    try {
        const resp = await axios.post(
            `${API_URL}/user/verify-otp`,
            payload
        );

        return resp.data;

    } catch (err) {
        throw err;
    }
};

export const resendOtp = async (email) => {
    try {
        const resp = await axios.post(`${API_URL}/user/resend-otp`, null, {
            params: { email }
        });
        return resp.data;
    } catch (err) {
        throw err;
    }
};

export const bulkRegistrationAttempt = async (usersList) => {
    const payload = { users: usersList };
    try {
        const resp = await axios.post(`${API_URL}/user/bulk-register`, payload);
        return resp.data;
    } catch (err) {
        throw err;
    }
};

export const resetPassword = async (oldPassword, newPassword) => {
    const payload = { oldPassword, newPassword };
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
    }
    try {
        const resp = await axios.post(`${API_URL}/exams/createExam`, createExamReqJSON);
        return resp.data;
    } catch (err) {
        throw err;
    }
}

export const getExams = async (page = 0, size = 10, status = null) => {
    try {
        // Build params object explicitly
        const queryParams = new URLSearchParams();
        queryParams.append("page", page);
        queryParams.append("size", size);

        if (status && status.trim() !== "") {
            queryParams.append("status", status);
        }

        // Log this to your console to verify the URL
        const fullUrl = `${API_URL}/exams/getExams?${queryParams.toString()}`;
        console.log("Fetching from:", fullUrl);

        const resp = await axios.get(`${API_URL}/exams/getExams`, {
            params: queryParams
        });

        return resp.data;
    } catch (err) {
        console.error("Status Code:", err.response?.status);
        console.error("Backend Error Data:", err.response?.data);
        throw err;
    }
}

export const getExamQuestions = async (examId) => {
    const response = await axios.get(`${API_URL}/exams/${examId}/questions`);
    return response.data;
};

export const uploadExamQuestions = async (examId, questions, cutoff) => {
    try {
        const questionPayload = questions.map((q) => {
            const options = Object.keys(q)
                .filter(key => !isNaN(key) && q[key] !== null && q[key] !== undefined)
                .sort((a, b) => Number(a) - Number(b))
                .map((key, idx) => ({
                    optionIndex: idx,
                    text: String(q[key]).trim()
                }));

            const correctOptionIndex = options.findIndex(
                (opt) => opt.text.trim() === String(q.Ans || "").trim()
            );

            return {
                text: q.Question?.trim() || "",
                marks: Number(q.Marks) || 1,
                correctOptionIndex: correctOptionIndex >= 0 ? correctOptionIndex : 0,
                options,
            };
        });

        const payload = {
            questions: questionPayload,
            cutoff: Number(cutoff) || 40.0
        };

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
export const resendInvitation = async (candidateId) => {
    try {
        const resp = await axios.post(`${API_URL}/exams/candidates/resend-invitation/${candidateId}`);
        return resp.data;
    } catch (err) {
        console.error("Failed to resend invitation:", err);
        throw err;
    }
};

export const deleteExam = async (examId) => {
    try {
        const resp = await axios.delete(`${API_URL}/exams/delete/${examId}`);
        return resp.data;
    } catch (err) {
        console.error("Failed to delete exam:", err);
        throw err;
    }
};

export const getAllUsers = async (page = 0, size = 5) => {
    try {
        const resp = await axios.get(`${API_URL}/user/users`, {
            params: { page, size }
        });
        return resp.data;
    } catch (err) {
        console.error("Error fetching users:", err);
        throw err;
    }
};

export const getAllUserGroups = async (page = 0, size = 5) => {
    try {
        const resp = await axios.get(`${API_URL}/userGroups`, {
            params: { page, size }
        });
        return resp.data;
    } catch (err) {
        console.error("Error fetching user groups:", err);
        throw err;
    }
};

export const createGroup = async (groupData) => {
    const resp = await axios.post(`${API_URL}/userGroups/create`, groupData);
    return resp.data;
};

export const deleteGroup = async (groupId) => {
    await axios.delete(`${API_URL}/userGroups/delete/${groupId}`);
};

export const getGroupMembers = async (groupId, page = 0, size = 5) => {
    try {
        const resp = await axios.get(`${API_URL}/userGroups/userList/${groupId}`, {
            params: { page, size }
        });
        return resp.data;
    } catch (err) {
        console.error("Error fetching group members:", err);
        throw err;
    }
};

export const getCandidatesOnly = async (page = 0, size = 5) => {
    try {
        const resp = await axios.get(`${API_URL}/user/candidates`, {
            params: { page, size }
        });
        return resp.data;
    } catch (err) {
        console.error("Error fetching candidates:", err);
        throw err;
    }
};

export const assignGroupToExam = async (examId, groupId) => {
    const resp = await axios.post(`${API_URL}/exams/Candidates/${examId}/${groupId}`);
    return resp.data
};

export const getExamCandidates = async (examId, page = 0, size = 10) => {
    try {
        const resp = await axios.get(`${API_URL}/candidate/candidates/${examId}`, {
            params: { page, size }
        });

        if (resp.status === 204) {
            return {
                content: [],
                totalPages: 0,
                totalElements: 0
            };
        }
        return resp.data;
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

    const payload = {
        examId: examId,
        candidateName: name,
        candidateEmail: email,
        location: location
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

export const getSubmissionsOverview = async () => {
    try {
        const resp = await axios.get(`${API_URL}/submissions/overview`);
        return resp.data;
    } catch (err) {
        console.error("Error fetching overview:", err);
        throw err;
    }
};

export const getSubmissionsByExam = async (examId, page = 0, size = 10) => {
    try {
        const resp = await axios.get(`${API_URL}/submissions/exam/${examId}`, {
            params: {
                page: page,
                size: size
            }
        });
        return resp.data;
    } catch (err) {
        console.error("Error fetching submissions:", err);
        throw err;
    }
};


export const getSubmissionDetails = async (submissionId) => {
    try {
        const resp = await axios.get(`${API_URL}/submissions/${submissionId}`);
        return resp.data;
    } catch (err) {
        console.error("Error fetching submission details:", err);
        throw err;
    }
};

export const uploadSnapshot = async (submissionId, imageBlob, type, isViolation = false, slViolation = null) => {
    const formData = new FormData();
    formData.append('submissionId', submissionId);
    formData.append('violation', isViolation);
    formData.append('type', type);

    if (slViolation !== null) {
        formData.append('sl_violation', slViolation);
    }

    formData.append('image', imageBlob, `snapshot_${Date.now()}.jpg`);

    try {
        const resp = await axios.post(`${API_URL}/snapshots`, formData);
        return resp.data;
    } catch (err) {
        console.error("Snapshot upload failed", err.response?.data || err.message);
    }
};

export const getSnapshots = async (submissionId) => {
    try {
        const resp = await axios.get(`${API_URL}/snapshots/submission/${submissionId}`);
        console.log(resp.data)
        return resp.data;
    } catch (err) {
        console.error("Error fetching snapshots:", err);
        throw err;
    }
};

export const getSecureImageUrl = async (fullUrl) => {
    try {
        const response = await axios.get(fullUrl, { responseType: 'blob' });
        return URL.createObjectURL(response.data);
    } catch (error) {
        console.error("Image fetch failed", error);
        return null;
    }
};

const refreshToken = async () => {
    const auth = JSON.parse(sessionStorage.getItem("auth"));
    if (!auth || !auth.refreshToken) throw new Error("No refresh token available");

    const resp = await refreshInstance.post(`/user/refresh`, {
        refreshToken: auth.refreshToken
    });

    const updatedAuth = {
        ...auth,
        token: `${resp.data.tokens.type} ${resp.data.tokens.accessToken}`,
        refreshToken: resp.data.tokens.refreshToken
    };
    sessionStorage.setItem("auth", JSON.stringify(updatedAuth));

    return updatedAuth.token;
};

const refreshInstance = axios.create({
    baseURL: API_URL
});

export const sendResults = async (examId) => {
    try {
        const resp = await axios.post(`${API_URL}/submissions/send-results/${examId}`);
        return resp.data;
    } catch (err) {
        console.error("Error sending results:", err);
        throw err;
    }
};

export const getCandidateResults = async (page = 0, size = 10) => {
    try {
        const resp = await axios.get(`${API_URL}/candidateUser/results`, {
            params: {
                page: page,
                size: size
            }
        });
        return resp.data;
    } catch (err) {
        console.error("Error fetching results:", err);
        throw err;
    }
};

export const searchUsers = async (searchQuery, page = 0, size = 10, sort = "name") => {
    try {
        const payload = { searchQuery };
        const resp = await axios.post(`${API_URL}/user/search`, payload, {
            params: { page, size, sort }
        });
        return resp.data;
    } catch (err) {
        console.error("Error searching users:", err);
        throw err;
    }
};

export const searchCandidates = async (searchQuery, page = 0, size = 10, sort = "name") => {
    try {
        const payload = { searchQuery };
        const resp = await axios.post(`${API_URL}/user/search-candidates`, payload, {
            params: { page, size, sort }
        });
        return resp.data;
    } catch (err) {
        console.error("Error searching candidates:", err);
        throw err;
    }
};

export const searchExams = async (query, page = 0, size = 10) => {
    try {
        const payload = { query: query };

        const resp = await axios.post(`${API_URL}/exams/search`, payload, {
            params: {
                page: page,
                size: size
            }
        });

        return resp.data;
    } catch (err) {
        console.error("Error searching exams:", err.response?.data || err.message);
        throw err;
    }
};

export const searchGroupMembers = async (groupId, query, page = 0, size = 5) => {
    try {
        const payload = { query };

        const resp = await axios.post(`${API_URL}/userGroups/userList/${groupId}`, payload, {
            params: { page, size }
        });
        return resp.data;
    } catch (err) {
        console.error("Error searching group members:", err);
        throw err;
    }
};

export const searchSubmissions = async (examId, query, page = 0, size = 5) => {
    try {
        const payload = {
            examId: examId,
            query: query
        };

        const resp = await axios.post(`${API_URL}/submissions/submission/search`, payload, {
            params: {
                page: page,
                size: size
            }
        });

        return resp.data;
    } catch (err) {
        console.error("Error searching submissions:", err.response?.data || err.message);
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

axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url.includes('/user/refresh')) {

            originalRequest._retry = true;

            try {
                const newToken = await refreshToken();
                originalRequest.headers.Authorization = newToken;
                return axios(originalRequest);
            } catch (refreshError) {
                sessionStorage.removeItem("auth");
                window.location.href = "/login?expired=true";
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);
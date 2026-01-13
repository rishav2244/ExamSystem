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
        const resp = await axios.post(`${API_URL}/user/register`,registerReqJSON);
        return resp.data;
    } catch (err) {
        throw err;
    }
}

export const createExam = async (title, duration, startTime, endTime, status, createdBy) => {
    const createExamReqJSON = {
        title : title,
        duration : duration,
        startTime: startTime,
        endTime: endTime,
        status: status,
        createdBy : createdBy
    }
    try {
        const resp = await axios.post(`${API_URL}/exams/createExam`,createExamReqJSON);
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
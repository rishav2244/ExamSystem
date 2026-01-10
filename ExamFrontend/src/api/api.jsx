import axios from "axios";

const API_URL = "http://localhost:8080/api";

// /api/user for user, goes into /login and /register

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
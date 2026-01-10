// import { useState } from "react";
// import "../App.css";

// export const Login = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [role, setRole] = useState("student");
//   const [message, setMessage] = useState("");

//   const handleLogin = async (e) => {
//     e.preventDefault();

//     const response = await fetch("http://localhost:5000/login", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify({ email, password, role })
//     });

//     const data = await response.json();
//     setMessage(data.success ? `Welcome ${data.role}` : data.message);
//   };

//   return (
//     <div className="login-card">
//       <h2>Exam Portal Login</h2>

//       <input
//         type="email"
//         placeholder="Email"
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//         required
//       />

//       <input
//         type="password"
//         placeholder="Password"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//         required
//       />

//       <select value={role} onChange={(e) => setRole(e.target.value)}>
//         <option value="student">Student</option>
//         <option value="admin">Admin</option>
//       </select>

//       <button onClick={handleLogin}>Login</button>

//       {message && <p>{message}</p>}
//     </div>
//   );
// }

import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

import { loginAttempt } from "../api/api";
import { AuthenticationContext } from "../context/AuthenticationContext";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const { login } = useContext(AuthenticationContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const userData = await loginAttempt(email, password);
      login(userData);

      if (userData.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/user");
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Login failed. Try again.";
      setMessage(errorMsg);
    }
  };

  return (
    <div className="login-card">
      <h2>Exam Portal Login</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button onClick={handleLogin}>Login</button>

      {message && <p>{message}</p>}
    </div>
  );
};

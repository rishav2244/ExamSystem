import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const users = [
  {
    email: "student@example.com",
    password: "123456",
    role: "student"
  },
  {
    email: "admin@example.com",
    password: "admin123",
    role: "admin"
  }
];

app.post("/login", (req, res) => {
  const { email, password, role } = req.body;

  const user = users.find(
    u => u.email === email && u.password === password && u.role === role
  );

  if (user) {
    res.json({ success: true, role: user.role });
  } else {
    res.json({ success: false, message: "Invalid credentials" });
  }
});

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});

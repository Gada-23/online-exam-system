const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const connectDB = require("./config/db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect Database (non-blocking - server will start even if DB connection fails initially)
connectDB().catch((err) => {
  console.error("Database connection error on startup:", err.message);
  console.log("\n⚠️  Server will continue to run, but database operations will fail.");
  console.log("Please fix the MongoDB connection and restart the server.\n");
});

// Test route
app.get("/", (req, res) => {
  res.send("Online Exam System API is running...");
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/questions", require("./routes/questionRoutes"));
app.use("/api/exams", require("./routes/examRoutes"));
app.use("/api/results", require("./routes/resultRoutes"));
app.use("/api/exit-exam", require("./routes/exitExamRoutes"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


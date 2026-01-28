const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middleware/auth");
const { startExitExam, submitExitExam } = require("../controllers/exitExamController");

router.post("/start", protect, authorize("student"), startExitExam);
router.post("/submit", protect, authorize("student"), submitExitExam);

module.exports = router;


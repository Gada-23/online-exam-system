const express = require("express");
const router = express.Router();
const {
  getExams,
  getExam,
  createExam,
  updateExam,
  deleteExam,
} = require("../controllers/examController");
const { protect, authorize } = require("../middleware/auth");

router.route("/").get(protect, getExams).post(protect, authorize("admin"), createExam);

router
  .route("/:id")
  .get(protect, getExam)
  .put(protect, authorize("admin"), updateExam)
  .delete(protect, authorize("admin"), deleteExam);

module.exports = router;

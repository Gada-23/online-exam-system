const express = require("express");
const router = express.Router();
const {
  getQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} = require("../controllers/questionController");
const { protect, authorize } = require("../middleware/auth");

router
  .route("/")
  .get(protect, authorize("admin"), getQuestions)
  .post(protect, authorize("admin"), createQuestion);

router
  .route("/:id")
  .get(protect, authorize("admin"), getQuestion)
  .put(protect, authorize("admin"), updateQuestion)
  .delete(protect, authorize("admin"), deleteQuestion);

module.exports = router;

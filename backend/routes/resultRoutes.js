const express = require("express");
const router = express.Router();
const {
  submitExam,
  getResults,
  getResult,
} = require("../controllers/resultController");
const { protect, authorize } = require("../middleware/auth");

router
  .route("/")
  .get(protect, getResults)
  .post(protect, authorize("student"), submitExam);

router.route("/:id").get(protect, getResult);

module.exports = router;

const mongoose = require("mongoose");

const examSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide an exam title"],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, "Please provide a subject"],
      trim: true,
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
        required: true,
      },
    ],
    duration: {
      type: Number, // Duration in minutes
      required: [true, "Please provide exam duration"],
      min: [1, "Duration must be at least 1 minute"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Exam", examSchema);

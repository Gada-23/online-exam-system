const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
  {
    // Normal exams use `examId`. Exit Exam attempts use `examType: "exit_exam"` and
    // keep a snapshot in this Result so the review stays consistent over time.
    examType: {
      type: String,
      enum: ["standard", "exit_exam"],
      default: "standard",
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: function () {
        return this.examType === "standard";
      },
    },
    // Stored so the UI can show a title even when examId is not used (exit_exam)
    examTitle: {
      type: String,
      trim: true,
    },
    examSubject: {
      type: String,
      trim: true,
    },
    examDuration: {
      type: Number, // minutes
      min: 1,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    answers: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
          required: true,
        },
        selectedAnswer: {
          type: String,
          required: true,
        },
        isCorrect: {
          type: Boolean,
          required: true,
        },
      },
    ],
    // Snapshot for stable review (especially for exit_exam attempts)
    questionsSnapshot: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
          required: true,
        },
        subject: {
          type: String,
          trim: true,
        },
        questionText: {
          type: String,
          required: true,
          trim: true,
        },
        options: {
          type: [String],
          required: true,
        },
        correctAnswer: {
          type: String,
          required: true,
        },
        explanation: {
          type: String,
          trim: true,
          default: "",
        },
      },
    ],
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries (do NOT enforce uniqueness; students can retry)
resultSchema.index({ studentId: 1, createdAt: -1 });
resultSchema.index({ studentId: 1, examType: 1, createdAt: -1 });

module.exports = mongoose.model("Result", resultSchema);

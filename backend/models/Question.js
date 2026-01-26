const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: [true, "Please provide a subject"],
      trim: true,
    },
    questionText: {
      type: String,
      required: [true, "Please provide question text"],
      trim: true,
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: function (v) {
          return v.length >= 2 && v.length <= 6;
        },
        message: "Options must be between 2 and 6",
      },
    },
    correctAnswer: {
      type: String,
      required: [true, "Please provide the correct answer"],
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Question", questionSchema);

const Result = require("../models/Result");
const Exam = require("../models/Exam");
const Question = require("../models/Question");

// @desc    Submit exam answers
// @route   POST /api/results
// @access  Private/Student
exports.submitExam = async (req, res) => {
  try {
    const { examId, answers } = req.body;

    // Validation
    if (!examId || !answers) {
      return res.status(400).json({
        success: false,
        message: "Please provide examId and answers",
      });
    }

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide answers array",
      });
    }

    // Get exam with questions
    const exam = await Exam.findById(examId).populate("questions");

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    // Check if student already submitted this exam
    const existingResult = await Result.findOne({
      studentId: req.user.id,
      examId: examId,
    });

    if (existingResult) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted this exam",
      });
    }

    // Calculate score
    let score = 0;
    const answerDetails = [];

    for (const answer of answers) {
      const question = exam.questions.find(
        (q) => q._id.toString() === answer.questionId
      );

      if (!question) {
        continue;
      }

      const isCorrect = question.correctAnswer === answer.selectedAnswer;

      if (isCorrect) {
        score++;
      }

      answerDetails.push({
        questionId: question._id,
        selectedAnswer: answer.selectedAnswer,
        isCorrect: isCorrect,
      });
    }

    // Create result
    const result = await Result.create({
      studentId: req.user.id,
      examId: examId,
      score: score,
      totalQuestions: exam.questions.length,
      answers: answerDetails,
    });

    const populatedResult = await Result.findById(result._id)
      .populate("examId", "title subject")
      .populate("studentId", "name email");

    res.status(201).json({
      success: true,
      data: populatedResult,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all results (admin) or student's results
// @route   GET /api/results
// @access  Private
exports.getResults = async (req, res) => {
  try {
    let query = {};

    // Students can only see their own results
    if (req.user.role === "student") {
      query.studentId = req.user.id;
    }

    const results = await Result.find(query)
      .populate("studentId", "name email")
      .populate("examId", "title subject")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single result with detailed answers
// @route   GET /api/results/:id
// @access  Private
exports.getResult = async (req, res) => {
  try {
    let query = { _id: req.params.id };

    // Students can only see their own results
    if (req.user.role === "student") {
      query.studentId = req.user.id;
    }

    const result = await Result.findOne(query)
      .populate("studentId", "name email")
      .populate("examId", "title subject duration")
      .populate("answers.questionId", "questionText options correctAnswer");

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Result not found",
      });
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

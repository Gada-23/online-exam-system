const Question = require("../models/Question");

// @desc    Get all questions
// @route   GET /api/questions
// @access  Private/Admin
exports.getQuestions = async (req, res) => {
  try {
    const { subject, difficulty } = req.query;
    let query = {};

    if (subject) {
      query.subject = subject;
    }
    if (difficulty) {
      query.difficulty = difficulty;
    }

    const questions = await Question.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: questions.length,
      data: questions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single question
// @route   GET /api/questions/:id
// @access  Private/Admin
exports.getQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    res.status(200).json({
      success: true,
      data: question,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create question
// @route   POST /api/questions
// @access  Private/Admin
exports.createQuestion = async (req, res) => {
  try {
    const { subject, questionText, options, correctAnswer, difficulty } =
      req.body;

    // Validation
    if (!subject || !questionText || !options || !correctAnswer) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    if (!Array.isArray(options) || options.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least 2 options",
      });
    }

    if (!options.includes(correctAnswer)) {
      return res.status(400).json({
        success: false,
        message: "Correct answer must be one of the options",
      });
    }

    const question = await Question.create({
      subject,
      questionText,
      options,
      correctAnswer,
      difficulty: difficulty || "medium",
    });

    res.status(201).json({
      success: true,
      data: question,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update question
// @route   PUT /api/questions/:id
// @access  Private/Admin
exports.updateQuestion = async (req, res) => {
  try {
    const { subject, questionText, options, correctAnswer, difficulty } =
      req.body;

    let question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    // Validate correct answer if options are being updated
    if (options && !options.includes(correctAnswer || question.correctAnswer)) {
      return res.status(400).json({
        success: false,
        message: "Correct answer must be one of the options",
      });
    }

    question = await Question.findByIdAndUpdate(
      req.params.id,
      {
        subject: subject || question.subject,
        questionText: questionText || question.questionText,
        options: options || question.options,
        correctAnswer: correctAnswer || question.correctAnswer,
        difficulty: difficulty || question.difficulty,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      data: question,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete question
// @route   DELETE /api/questions/:id
// @access  Private/Admin
exports.deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    await question.deleteOne();

    res.status(200).json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

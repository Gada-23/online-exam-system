const Exam = require("../models/Exam");
const Question = require("../models/Question");

// @desc    Get all exams
// @route   GET /api/exams
// @access  Private
exports.getExams = async (req, res) => {
  try {
    const exams = await Exam.find()
      .populate("questions", "questionText options")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: exams.length,
      data: exams,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single exam (without correct answers for students)
// @route   GET /api/exams/:id
// @access  Private
exports.getExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).populate(
      "questions",
      "questionText options difficulty"
    );

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    // For students, don't send correct answers
    if (req.user.role === "student") {
      const examData = exam.toObject();
      examData.questions = examData.questions.map((q) => {
        delete q.correctAnswer;
        return q;
      });
      return res.status(200).json({
        success: true,
        data: examData,
      });
    }

    // For admin, send full data
    res.status(200).json({
      success: true,
      data: exam,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create exam
// @route   POST /api/exams
// @access  Private/Admin
exports.createExam = async (req, res) => {
  try {
    const { title, subject, questions, duration } = req.body;

    // Validation
    if (!title || !subject || !questions || !duration) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one question",
      });
    }

    // Verify all questions exist
    const questionsExist = await Question.find({
      _id: { $in: questions },
    });

    if (questionsExist.length !== questions.length) {
      return res.status(400).json({
        success: false,
        message: "One or more questions not found",
      });
    }

    const exam = await Exam.create({
      title,
      subject,
      questions,
      duration,
      createdBy: req.user.id,
    });

    const populatedExam = await Exam.findById(exam._id)
      .populate("questions")
      .populate("createdBy", "name email");

    res.status(201).json({
      success: true,
      data: populatedExam,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update exam
// @route   PUT /api/exams/:id
// @access  Private/Admin
exports.updateExam = async (req, res) => {
  try {
    const { title, subject, questions, duration } = req.body;

    let exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    // Verify questions if being updated
    if (questions) {
      if (!Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Please provide at least one question",
        });
      }

      const questionsExist = await Question.find({
        _id: { $in: questions },
      });

      if (questionsExist.length !== questions.length) {
        return res.status(400).json({
          success: false,
          message: "One or more questions not found",
        });
      }
    }

    exam = await Exam.findByIdAndUpdate(
      req.params.id,
      {
        title: title || exam.title,
        subject: subject || exam.subject,
        questions: questions || exam.questions,
        duration: duration || exam.duration,
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate("questions").populate("createdBy", "name email");

    res.status(200).json({
      success: true,
      data: exam,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete exam
// @route   DELETE /api/exams/:id
// @access  Private/Admin
exports.deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    await exam.deleteOne();

    res.status(200).json({
      success: true,
      message: "Exam deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

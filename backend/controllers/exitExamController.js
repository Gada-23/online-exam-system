const mongoose = require("mongoose");
const Question = require("../models/Question");
const Result = require("../models/Result");
const exitExamConfig = require("../config/exitExam");

function assertConfigReady() {
  if (!Array.isArray(exitExamConfig.subjects) || exitExamConfig.subjects.length === 0) {
    return "Exit exam subjects are not configured yet.";
  }
  if (!Number.isInteger(exitExamConfig.baseQuestionsPerSubject) || exitExamConfig.baseQuestionsPerSubject <= 0) {
    return "Exit exam baseQuestionsPerSubject is not configured yet.";
  }
  if (!Number.isInteger(exitExamConfig.extraQuestionsTotal) || exitExamConfig.extraQuestionsTotal < 0) {
    return "Exit exam extraQuestionsTotal is not configured yet.";
  }
  if (!Number.isInteger(exitExamConfig.extraDistinctSubjects) || exitExamConfig.extraDistinctSubjects < 0) {
    return "Exit exam extraDistinctSubjects is not configured yet.";
  }
  return null;
}

// @desc    Generate a randomized Exit Exam attempt (CS-only)
// @route   POST /api/exit-exam/start
// @access  Private/Student
exports.startExitExam = async (req, res) => {
  try {
    const configError = assertConfigReady();
    if (configError) {
      return res.status(400).json({ success: false, message: configError });
    }

    const subjects = exitExamConfig.subjects;
    const basePerSubject = exitExamConfig.baseQuestionsPerSubject;
    const extraTotal = exitExamConfig.extraQuestionsTotal;
    const extraDistinctSubjects = exitExamConfig.extraDistinctSubjects;

    if (extraTotal !== extraDistinctSubjects) {
      return res.status(400).json({
        success: false,
        message: "For now, extraQuestionsTotal must equal extraDistinctSubjects (1 extra per selected course).",
      });
    }

    if (extraDistinctSubjects > subjects.length) {
      return res.status(400).json({
        success: false,
        message: "extraDistinctSubjects cannot be greater than number of subjects.",
      });
    }

    // Sample questions per subject
    const sampledQuestions = [];
    for (const subject of subjects) {
      const size = basePerSubject;

      const picked = await Question.aggregate([
        { $match: { subject } },
        { $sample: { size } },
        {
          $project: {
            _id: 1,
            subject: 1,
            questionText: 1,
            options: 1,
            difficulty: 1,
            // not used during the exam UI, but useful if needed later
            explanation: 1,
          },
        },
      ]);

      if (picked.length < size) {
        return res.status(400).json({
          success: false,
          message: `Not enough questions for '${subject}'. Needed ${size}, found ${picked.length}.`,
        });
      }

      sampledQuestions.push(...picked);
    }

    // Add extra questions from randomly selected courses (4 extra questions from 4 random courses)
    if (extraTotal > 0) {
      const shuffledSubjects = [...subjects];
      for (let i = shuffledSubjects.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledSubjects[i], shuffledSubjects[j]] = [shuffledSubjects[j], shuffledSubjects[i]];
      }

      const extraSubjects = shuffledSubjects.slice(0, extraDistinctSubjects);
      const usedIds = new Set(sampledQuestions.map((q) => q._id.toString()));

      for (const subject of extraSubjects) {
        // Try a few times to avoid duplicates against already sampled questions
        let extraPicked = [];
        for (let attempt = 0; attempt < 5 && extraPicked.length === 0; attempt++) {
          const candidate = await Question.aggregate([
            { $match: { subject, _id: { $nin: Array.from(usedIds).map((id) => new mongoose.Types.ObjectId(id)) } } },
            { $sample: { size: 1 } },
            {
              $project: {
                _id: 1,
                subject: 1,
                questionText: 1,
                options: 1,
                difficulty: 1,
                explanation: 1,
              },
            },
          ]);
          if (candidate.length === 1) extraPicked = candidate;
        }

        if (extraPicked.length === 0) {
          return res.status(400).json({
            success: false,
            message: `Not enough unique questions to add extra question for '${subject}'. Add more questions for this course.`,
          });
        }

        const q = extraPicked[0];
        usedIds.add(q._id.toString());
        sampledQuestions.push(q);
      }
    }

    // Shuffle combined set so course questions are mixed
    for (let i = sampledQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [sampledQuestions[i], sampledQuestions[j]] = [sampledQuestions[j], sampledQuestions[i]];
    }

    res.status(200).json({
      success: true,
      data: {
        examType: exitExamConfig.examType,
        title: exitExamConfig.title,
        subjectLabel: exitExamConfig.subjectLabel,
        duration: exitExamConfig.durationMinutes,
        subjects,
        rules: {
          baseQuestionsPerSubject: basePerSubject,
          extraQuestionsTotal: extraTotal,
          extraDistinctSubjects,
        },
        questions: sampledQuestions,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit an Exit Exam attempt (unlimited attempts)
// @route   POST /api/exit-exam/submit
// @access  Private/Student
exports.submitExitExam = async (req, res) => {
  try {
    const { questionIds, answers } = req.body;

    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide questionIds for this attempt",
      });
    }

    if (!Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: "Please provide answers array",
      });
    }

    const uniqueIds = Array.from(new Set(questionIds));
    const objectIds = uniqueIds
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    if (objectIds.length !== uniqueIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more questionIds are invalid",
      });
    }

    const questions = await Question.find({ _id: { $in: objectIds } });
    if (questions.length !== objectIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more questions not found",
      });
    }

    const questionById = new Map(questions.map((q) => [q._id.toString(), q]));

    let score = 0;
    const answerDetails = [];

    // Normalize answers lookup
    const selectedByQuestionId = new Map();
    for (const a of answers) {
      if (a && typeof a.questionId === "string") {
        selectedByQuestionId.set(a.questionId, a.selectedAnswer);
      }
    }

    for (const qid of questionIds) {
      const q = questionById.get(qid);
      if (!q) continue;
      const selectedAnswer = selectedByQuestionId.get(qid);

      // Treat unanswered as empty string (still record)
      const selected = typeof selectedAnswer === "string" ? selectedAnswer : "";
      const isCorrect = selected !== "" && q.correctAnswer === selected;

      if (isCorrect) score += 1;

      answerDetails.push({
        questionId: q._id,
        selectedAnswer: selected,
        isCorrect,
      });
    }

    const questionsSnapshot = questionIds
      .map((qid) => questionById.get(qid))
      .filter(Boolean)
      .map((q) => ({
        questionId: q._id,
        subject: q.subject,
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || "",
      }));

    const result = await Result.create({
      studentId: req.user.id,
      examType: "exit_exam",
      examTitle: exitExamConfig.title,
      examSubject: exitExamConfig.subjectLabel,
      examDuration: exitExamConfig.durationMinutes,
      score,
      totalQuestions: questionIds.length,
      answers: answerDetails,
      questionsSnapshot,
    });

    const populatedResult = await Result.findById(result._id).populate("studentId", "name email");

    res.status(201).json({ success: true, data: populatedResult });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


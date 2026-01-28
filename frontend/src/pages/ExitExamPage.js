import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { exitExamAPI } from "../services/api";

const ExitExamPage = () => {
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  const questionIds = useMemo(() => {
    if (!exam?.questions) return [];
    return exam.questions.map((q) => q._id);
  }, [exam]);

  const start = async () => {
    try {
      const res = await exitExamAPI.start();
      setExam(res.data.data);
      setTimeLeft(res.data.data.duration * 60);
    } catch (err) {
      console.error("Error starting exit exam:", err);
      alert(err.response?.data?.message || "Error starting exit exam");
      navigate("/student");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async () => {
    if (submitting || !exam) return;

    const answerArray = Object.entries(answers).map(([questionId, selectedAnswer]) => ({
      questionId,
      selectedAnswer,
    }));

    if (answerArray.length < exam.questions.length) {
      const confirm = window.confirm("You haven't answered all questions. Do you want to submit anyway?");
      if (!confirm) return;
    }

    setSubmitting(true);
    try {
      const res = await exitExamAPI.submit({
        questionIds,
        answers: answerArray,
      });
      navigate(`/result/${res.data.data._id}`);
    } catch (err) {
      alert(err.response?.data?.message || "Error submitting exam");
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Starting exit exam...</div>;
  }
  if (!exam) {
    return <div className="loading">Exam not available</div>;
  }

  return (
    <div className="container">
      <div className={`exam-timer ${timeLeft < 300 ? "warning" : ""}`}>
        Time Remaining: {formatTime(timeLeft)}
      </div>
      <h1 className="mb-2">{exam.title}</h1>
      <p className="mb-4">
        <strong>Program:</strong> Computer Science | <strong>Total Questions:</strong> {exam.questions.length}
      </p>
      <form>
        {exam.questions.map((question, index) => (
          <div key={question._id} className="question-card">
            <h4>
              Question {index + 1}: {question.questionText}
            </h4>
            {question.subject && (
              <p style={{ marginTop: "6px", opacity: 0.8 }}>
                <strong>Course:</strong> {question.subject}
              </p>
            )}
            <div>
              {question.options.map((option, optIndex) => (
                <div
                  key={optIndex}
                  className={`option ${answers[question._id] === option ? "selected" : ""}`}
                  onClick={() => handleAnswerChange(question._id, option)}
                >
                  <input
                    type="radio"
                    name={`question-${question._id}`}
                    value={option}
                    checked={answers[question._id] === option}
                    onChange={() => handleAnswerChange(question._id, option)}
                  />
                  <label style={{ marginLeft: "10px", cursor: "pointer" }}>{option}</label>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="text-center mt-4">
          <button
            type="button"
            className="btn btn-success btn-lg"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Exam"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExitExamPage;


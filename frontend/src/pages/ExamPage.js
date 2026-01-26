import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { examAPI, resultAPI } from "../services/api";

const ExamPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchExam();
  }, [id]);

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

  const fetchExam = async () => {
    try {
      const res = await examAPI.getExam(id);
      setExam(res.data.data);
      setTimeLeft(res.data.data.duration * 60);
    } catch (err) {
      console.error("Error fetching exam:", err);
      alert("Error loading exam");
      navigate("/student");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers({
      ...answers,
      [questionId]: answer,
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async () => {
    if (submitting) return;
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
      const res = await resultAPI.submitExam({
        examId: id,
        answers: answerArray,
      });
      navigate(`/result/${res.data.data._id}`);
    } catch (err) {
      alert(err.response?.data?.message || "Error submitting exam");
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading exam...</div>;
  }
  if (!exam) {
    return <div className="loading">Exam not found</div>;
  }

  return (
    <div className="container">
      <div className={`exam-timer ${timeLeft < 300 ? "warning" : ""}`}>
        Time Remaining: {formatTime(timeLeft)}
      </div>
      <h1 className="mb-4">{exam.title}</h1>
      <p className="mb-4">
        <strong>Subject:</strong> {exam.subject} | <strong>Total Questions:</strong> {exam.questions.length}
      </p>
      <form>
        {exam.questions.map((question, index) => (
          <div key={question._id} className="question-card">
            <h4>Question {index + 1}: {question.questionText}</h4>
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

export default ExamPage;

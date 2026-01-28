import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { resultAPI } from "../services/api";

const ResultPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResult();
  }, [id]);

  const fetchResult = async () => {
    try {
      const res = await resultAPI.getResult(id);
      setResult(res.data.data);
    } catch (err) {
      console.error("Error fetching result:", err);
      alert("Error loading result");
      navigate("/student");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading result...</div>;
  }

  if (!result) {
    return <div className="loading">Result not found</div>;
  }

  const percentage = ((result.score / result.totalQuestions) * 100).toFixed(1);
  const title = result.examId?.title || result.examTitle || "Exam";
  const subject = result.examId?.subject || result.examSubject || "";

  // Prefer stored snapshot (exit_exam or any result created after snapshot support)
  const snapshot = Array.isArray(result.questionsSnapshot) ? result.questionsSnapshot : [];
  const answersByQuestionId = new Map(
    (result.answers || []).map((a) => [a.questionId?.toString?.() || a.questionId, a])
  );

  return (
    <div className="container">
      <div className="score-display">
        <h1>Exam Results</h1>
        <h2>{title}</h2>
        {subject && <p>{subject}</p>}
        <div className="score">
          {result.score} / {result.totalQuestions}
        </div>
        <h3>{percentage}%</h3>
        <p>
          Completed on: {new Date(result.date).toLocaleString()}
        </p>
      </div>

      <div className="card">
        <h2>Question Review</h2>
        {(snapshot.length > 0 ? snapshot : []).map((question, index) => {
          const answer = answersByQuestionId.get(question.questionId?.toString?.() || question.questionId) || {
            selectedAnswer: "",
            isCorrect: false,
          };
          return (
            <div key={index} className="question-card">
              <h4>
                Question {index + 1}: {question.questionText}
              </h4>
              {question.subject && (
                <p style={{ marginTop: "6px", opacity: 0.8 }}>
                  <strong>Course:</strong> {question.subject}
                </p>
              )}
              <div>
                {question.options.map((option, optIndex) => {
                  let className = "option";
                  if (option === question.correctAnswer) {
                    className += " correct";
                  } else if (
                    option === answer.selectedAnswer &&
                    !answer.isCorrect
                  ) {
                    className += " incorrect";
                  } else if (option === answer.selectedAnswer) {
                    className += " selected";
                  }

                  return (
                    <div key={optIndex} className={className}>
                      {option}
                      {option === question.correctAnswer && (
                        <span> ✓ Correct Answer</span>
                      )}
                      {option === answer.selectedAnswer &&
                        !answer.isCorrect && <span> ✗ Your Answer</span>}
                    </div>
                  );
                })}
              </div>
              <p
                style={{
                  marginTop: "10px",
                  color: answer.isCorrect ? "#28a745" : "#dc3545",
                  fontWeight: "bold",
                }}
              >
                {answer.selectedAnswer
                  ? answer.isCorrect
                    ? "✓ Correct"
                    : "✗ Incorrect"
                  : "— Not Answered"}
              </p>

              {question.explanation && (
                <div className="mt-2" style={{ opacity: 0.95 }}>
                  <strong>Explanation:</strong> {question.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-center mt-4">
        <button
          className="btn btn-primary"
          onClick={() => navigate("/student")}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default ResultPage;

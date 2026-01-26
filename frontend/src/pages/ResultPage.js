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

  return (
    <div className="container">
      <div className="score-display">
        <h1>Exam Results</h1>
        <h2>{result.examId.title}</h2>
        <p>{result.examId.subject}</p>
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
        {result.answers.map((answer, index) => {
          const question = answer.questionId;
          return (
            <div key={index} className="question-card">
              <h4>
                Question {index + 1}: {question.questionText}
              </h4>
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
                {answer.isCorrect ? "✓ Correct" : "✗ Incorrect"}
              </p>
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

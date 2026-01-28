import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { resultAPI } from "../services/api";

const StudentDashboard = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const resultsRes = await resultAPI.getResults();
      setResults(resultsRes.data.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const exitExamResults = results.filter((r) => r.examType === "exit_exam");
  const bestAttempt =
    exitExamResults.length > 0
      ? exitExamResults.reduce((best, cur) => (cur.score > best.score ? cur : best), exitExamResults[0])
      : null;

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="container">
      <h1 className="mb-4">Computer Science Exit Exam</h1>

      <div className="card">
        <h2>Mock Exit Exam (CS only)</h2>
        <p>
          Practice the Ethiopian Exit Exam with questions from the 16 Computer Science courses.
          Each attempt is randomized from the question bank.
        </p>
        <div className="d-flex align-items-center gap-3" style={{ flexWrap: "wrap" }}>
          <button className="btn btn-primary" onClick={() => navigate("/exit-exam")}>
            Start Exit Exam
          </button>
          {bestAttempt && (
            <span className="badge bg-success">
              Best: {bestAttempt.score}/{bestAttempt.totalQuestions}
            </span>
          )}
          <span className="badge bg-secondary">Attempts: {exitExamResults.length}</span>
        </div>
      </div>

      {exitExamResults.length > 0 && (
        <div className="card">
          <h2>My Exit Exam Attempts</h2>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Exam</th>
                  <th>Score</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {exitExamResults.map((result) => (
                  <tr key={result._id}>
                    <td>{result.examTitle || "Exit Exam"}</td>
                    <td>
                      {result.score} / {result.totalQuestions}
                    </td>
                    <td>
                      {new Date(result.date).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate(`/result/${result._id}`)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;

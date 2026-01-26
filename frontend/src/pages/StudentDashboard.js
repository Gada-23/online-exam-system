import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { examAPI, resultAPI } from "../services/api";

const StudentDashboard = () => {
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [examsRes, resultsRes] = await Promise.all([
        examAPI.getExams(),
        resultAPI.getResults(),
      ]);
      setExams(examsRes.data.data);
      setResults(resultsRes.data.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const hasTakenExam = (examId) => {
    return results.some((result) => result.examId._id === examId);
  };

  const getResultForExam = (examId) => {
    return results.find((result) => result.examId._id === examId);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="container">
      <h1 className="mb-4">Student Dashboard</h1>

      <div className="card">
        <h2>Available Exams</h2>
        {exams.length === 0 ? (
          <p>No exams available</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Subject</th>
                  <th>Duration (minutes)</th>
                  <th>Questions</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((exam) => {
                  const taken = hasTakenExam(exam._id);
                  const result = getResultForExam(exam._id);

                  return (
                    <tr key={exam._id}>
                      <td>{exam.title}</td>
                      <td>{exam.subject}</td>
                      <td>{exam.duration}</td>
                      <td>{exam.questions.length}</td>
                      <td>
                        {taken ? (
                          <span className="badge bg-success">Completed</span>
                        ) : (
                          <span className="badge bg-warning">Not Taken</span>
                        )}
                      </td>
                      <td>
                        {taken ? (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() =>
                              navigate(`/result/${result._id}`)
                            }
                          >
                            View Result
                          </button>
                        ) : (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => navigate(`/exam/${exam._id}`)}
                          >
                            Take Exam
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="card">
          <h2>My Results</h2>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Exam</th>
                  <th>Subject</th>
                  <th>Score</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr key={result._id}>
                    <td>{result.examId.title}</td>
                    <td>{result.examId.subject}</td>
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

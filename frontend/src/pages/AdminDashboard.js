import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { examAPI, resultAPI } from "../services/api";

const AdminDashboard = () => {
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

  const handleDeleteExam = async (id) => {
    if (window.confirm("Are you sure you want to delete this exam?")) {
      try {
        await examAPI.deleteExam(id);
        fetchData();
      } catch (err) {
        alert("Error deleting exam");
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Admin Dashboard</h1>
        <div>
          <button
            className="btn btn-primary me-2"
            onClick={() => navigate("/admin/questions")}
          >
            Manage Questions
          </button>
          <button
            className="btn btn-success"
            onClick={() => navigate("/admin/exams/create")}
          >
            Create Exam
          </button>
        </div>
      </div>

      <div className="card">
        <h2>Exams</h2>
        {exams.length === 0 ? (
          <p>No exams created yet</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Subject</th>
                  <th>Duration (minutes)</th>
                  <th>Questions</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((exam) => (
                  <tr key={exam._id}>
                    <td>{exam.title}</td>
                    <td>{exam.subject}</td>
                    <td>{exam.duration}</td>
                    <td>{exam.questions.length}</td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm me-2"
                        onClick={() => navigate(`/admin/exams/${exam._id}`)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteExam(exam._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <h2>All Results</h2>
        {results.length === 0 ? (
          <p>No results yet</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
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
                    <td>{result.studentId.name}</td>
                    <td>{result.examId.title}</td>
                    <td>{result.examId.subject}</td>
                    <td>
                      {result.score} / {result.totalQuestions}
                    </td>
                    <td>{new Date(result.date).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate(`/admin/results/${result._id}`)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

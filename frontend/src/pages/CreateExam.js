import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { questionAPI, examAPI } from "../services/api";

const CreateExam = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    duration: "",
    selectedQuestions: [],
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await questionAPI.getQuestions();
      setQuestions(res.data.data);
    } catch (err) {
      console.error("Error fetching questions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleQuestionToggle = (questionId) => {
    setFormData({
      ...formData,
      selectedQuestions: formData.selectedQuestions.includes(questionId)
        ? formData.selectedQuestions.filter((id) => id !== questionId)
        : [...formData.selectedQuestions, questionId],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.selectedQuestions.length === 0) {
      alert("Please select at least one question");
      return;
    }

    try {
      await examAPI.createExam({
        title: formData.title,
        subject: formData.subject,
        duration: parseInt(formData.duration),
        questions: formData.selectedQuestions,
      });
      navigate("/admin");
    } catch (err) {
      alert(err.response?.data?.message || "Error creating exam");
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // Group questions by subject
  const questionsBySubject = questions.reduce((acc, question) => {
    if (!acc[question.subject]) {
      acc[question.subject] = [];
    }
    acc[question.subject].push(question);
    return acc;
  }, {});

  return (
    <div className="container">
      <h1 className="mb-4">Create Exam</h1>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Exam Title</label>
            <input
              type="text"
              name="title"
              className="form-control"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Subject</label>
            <input
              type="text"
              name="subject"
              className="form-control"
              value={formData.subject}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Duration (minutes)</label>
            <input
              type="number"
              name="duration"
              className="form-control"
              value={formData.duration}
              onChange={handleChange}
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label>
              Select Questions ({formData.selectedQuestions.length} selected)
            </label>
            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
              {Object.entries(questionsBySubject).map(([subject, subjectQuestions]) => (
                <div key={subject} className="mb-3">
                  <h5>{subject}</h5>
                  {subjectQuestions.map((question) => (
                    <div key={question._id} className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={formData.selectedQuestions.includes(
                          question._id
                        )}
                        onChange={() => handleQuestionToggle(question._id)}
                      />
                      <label className="form-check-label">
                        {question.questionText} ({question.difficulty})
                      </label>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div>
            <button type="submit" className="btn btn-success me-2">
              Create Exam
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/admin")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateExam;

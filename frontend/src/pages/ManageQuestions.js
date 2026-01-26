import React, { useState, useEffect } from "react";
import { questionAPI } from "../services/api";

const ManageQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formData, setFormData] = useState({
    subject: "",
    questionText: "",
    options: ["", ""],
    correctAnswer: "",
    difficulty: "medium",
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

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({
      ...formData,
      options: newOptions,
    });
  };

  const addOption = () => {
    if (formData.options.length < 6) {
      setFormData({
        ...formData,
        options: [...formData.options, ""],
      });
    }
  };

  const removeOption = (index) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        options: newOptions,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const filteredOptions = formData.options.filter((opt) => opt.trim() !== "");

    if (filteredOptions.length < 2) {
      alert("Please provide at least 2 options");
      return;
    }

    if (!filteredOptions.includes(formData.correctAnswer)) {
      alert("Correct answer must be one of the options");
      return;
    }

    try {
      const questionData = {
        ...formData,
        options: filteredOptions,
      };

      if (editingQuestion) {
        await questionAPI.updateQuestion(editingQuestion._id, questionData);
      } else {
        await questionAPI.createQuestion(questionData);
      }

      resetForm();
      fetchQuestions();
    } catch (err) {
      alert(err.response?.data?.message || "Error saving question");
    }
  };

  const resetForm = () => {
    setFormData({
      subject: "",
      questionText: "",
      options: ["", ""],
      correctAnswer: "",
      difficulty: "medium",
    });
    setEditingQuestion(null);
    setShowForm(false);
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setFormData({
      subject: question.subject,
      questionText: question.questionText,
      options: [...question.options],
      correctAnswer: question.correctAnswer,
      difficulty: question.difficulty,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        await questionAPI.deleteQuestion(id);
        fetchQuestions();
      } catch (err) {
        alert("Error deleting question");
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Manage Questions</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          Add Question
        </button>
      </div>

      {showForm && (
        <div className="card mb-4">
          <h2>{editingQuestion ? "Edit Question" : "Add New Question"}</h2>
          <form onSubmit={handleSubmit}>
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
              <label>Question Text</label>
              <textarea
                name="questionText"
                className="form-control"
                rows="3"
                value={formData.questionText}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Options</label>
              {formData.options.map((option, index) => (
                <div key={index} className="d-flex mb-2">
                  <input
                    type="text"
                    className="form-control me-2"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    required
                  />
                  {formData.options.length > 2 && (
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => removeOption(index)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              {formData.options.length < 6 && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={addOption}
                >
                  Add Option
                </button>
              )}
            </div>
            <div className="form-group">
              <label>Correct Answer</label>
              <select
                name="correctAnswer"
                className="form-control"
                value={formData.correctAnswer}
                onChange={handleChange}
                required
              >
                <option value="">Select correct answer</option>
                {formData.options
                  .filter((opt) => opt.trim() !== "")
                  .map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
              </select>
            </div>
            <div className="form-group">
              <label>Difficulty</label>
              <select
                name="difficulty"
                className="form-control"
                value={formData.difficulty}
                onChange={handleChange}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <button type="submit" className="btn btn-success me-2">
                {editingQuestion ? "Update" : "Create"} Question
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={resetForm}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h2>All Questions ({questions.length})</h2>
        {questions.length === 0 ? (
          <p>No questions created yet</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Question</th>
                  <th>Options</th>
                  <th>Difficulty</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((question) => (
                  <tr key={question._id}>
                    <td>{question.subject}</td>
                    <td>{question.questionText}</td>
                    <td>{question.options.length}</td>
                    <td>
                      <span className="badge bg-info">{question.difficulty}</span>
                    </td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm me-2"
                        onClick={() => handleEdit(question)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(question._id)}
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
    </div>
  );
};

export default ManageQuestions;

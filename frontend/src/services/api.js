import axios from "axios";

const API_URL = "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  getMe: () => api.get("/auth/me"),
};

// Question API (Admin only)
export const questionAPI = {
  getQuestions: () => api.get("/questions"),
  getQuestion: (id) => api.get(`/questions/${id}`),
  createQuestion: (data) => api.post("/questions", data),
  updateQuestion: (id, data) => api.put(`/questions/${id}`, data),
  deleteQuestion: (id) => api.delete(`/questions/${id}`),
};

// Exam API
export const examAPI = {
  getExams: () => api.get("/exams"),
  getExam: (id) => api.get(`/exams/${id}`),
  createExam: (data) => api.post("/exams", data),
  updateExam: (id, data) => api.put(`/exams/${id}`, data),
  deleteExam: (id) => api.delete(`/exams/${id}`),
};

// Result API
export const resultAPI = {
  submitExam: (data) => api.post("/results", data),
  getResults: () => api.get("/results"),
  getResult: (id) => api.get(`/results/${id}`),
};

export default api;

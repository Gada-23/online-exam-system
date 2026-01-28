import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import ExamPage from "./pages/ExamPage";
import ExitExamPage from "./pages/ExitExamPage";
import ResultPage from "./pages/ResultPage";
import AdminDashboard from "./pages/AdminDashboard";
import ManageQuestions from "./pages/ManageQuestions";
import CreateExam from "./pages/CreateExam";

function AppRoutes() {
  const { user } = React.useContext(AuthContext);

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to={user.role === "admin" ? "/admin" : "/student"} /> : <Login />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to={user.role === "admin" ? "/admin" : "/student"} /> : <Register />}
      />
      <Route
        path="/student"
        element={
          <PrivateRoute role="student">
            <StudentDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/exam/:id"
        element={
          <PrivateRoute role="student">
            <ExamPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/exit-exam"
        element={
          <PrivateRoute role="student">
            <ExitExamPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/result/:id"
        element={
          <PrivateRoute>
            <ResultPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <PrivateRoute role="admin">
            <AdminDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/questions"
        element={
          <PrivateRoute role="admin">
            <ManageQuestions />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/exams/create"
        element={
          <PrivateRoute role="admin">
            <CreateExam />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/exams/:id"
        element={
          <PrivateRoute role="admin">
            <CreateExam />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/results/:id"
        element={
          <PrivateRoute role="admin">
            <ResultPage />
          </PrivateRoute>
        }
      />
      <Route path="/" element={<Navigate to={user ? (user.role === "admin" ? "/admin" : "/student") : "/login"} />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;

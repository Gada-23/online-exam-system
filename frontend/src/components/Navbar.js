import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) {
    return null;
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">
          Online Exam System
        </Link>
        <div className="navbar-nav ms-auto">
          {user.role === "admin" ? (
            <>
              <Link className="nav-link" to="/admin">
                Dashboard
              </Link>
              <Link className="nav-link" to="/admin/questions">
                Questions
              </Link>
            </>
          ) : (
            <Link className="nav-link" to="/student">
              Dashboard
            </Link>
          )}
          <span className="nav-link">Welcome, {user.name}</span>
          <button className="btn btn-outline-light btn-sm ms-2" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

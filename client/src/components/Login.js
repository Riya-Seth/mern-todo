import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5050";

function Login({ onLoginSuccess, onSwitchToSignup }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [userPreview, setUserPreview] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, formData);
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setUserPreview(user); // show avatar briefly
      toast.success(`Welcome back, ${user.username}!`);

      setTimeout(() => {
        onLoginSuccess();
      }, 800);
    } catch (err) {
      console.error("Login Error:", err);
      toast.error(err.response?.data?.message || "Invalid credentials!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "450px" }}>
      <div className="card shadow p-4">
        <h3 className="text-center text-info mb-4">
          <i className="bi bi-box-arrow-in-right me-2"></i>Login
        </h3>

        {/* 🌟 User Preview after login */}
        {userPreview && (
          <div className="text-center mb-3 fade-in">
            <img
              src={
                userPreview.avatar ||
                `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(
                  userPreview.username || "User"
                )}`
              }
              alt="avatar preview"
              width="90"
              height="90"
              className="rounded-circle border border-info shadow-sm"
            />
            <p className="mt-2 fw-semibold text-secondary">
              {userPreview.username}
            </p>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-info w-100 fw-semibold"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center mt-3 mb-0">
          Don’t have an account?{" "}
          <button
            className="btn btn-link p-0 text-info"
            onClick={onSwitchToSignup}
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;

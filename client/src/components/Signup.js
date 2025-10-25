import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5050";

function Signup({ onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🌟 Preload avatar options (you can change "adventurer" style to "bottts", "croodles", etc.)
  const avatarSeeds = [
    "Aurora",
    "Blaze",
    "Cosmo",
    "Daisy",
    "Echo",
    "Frost",
    "Gale",
    "Hazel",
    "Indigo",
  ];

  const avatarOptions = avatarSeeds.map(
    (name) => `https://api.dicebear.com/9.x/adventurer/svg?seed=${name}`
  );

  // 🌟 Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🌟 Handle signup
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAvatar) {
      toast.warn("Please select an avatar!");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await axios.post(`${API_URL}/api/auth/signup`, {
        ...formData,
        avatar: selectedAvatar, // send chosen avatar
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      toast.success("Signup successful!");
      setTimeout(() => window.location.reload(), 800);
    } catch (err) {
      console.error("Signup Error:", err);
      toast.error(err.response?.data?.message || "Signup failed!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "450px" }}>
      <div className="card shadow p-4">
        <h3 className="text-center text-info mb-3">
          <i className="bi bi-person-plus-fill me-2"></i>Sign Up
        </h3>

        {/* 🌟 AVATAR SELECTION */}
        <div className="text-center mb-3">
          <p className="fw-semibold mb-2">Choose Your Avatar</p>
          <div className="d-flex flex-wrap justify-content-center gap-2">
            {avatarOptions.map((avatar, index) => (
              <img
                key={index}
                src={avatar}
                alt={`Avatar ${index + 1}`}
                width="55"
                height="55"
                onClick={() => setSelectedAvatar(avatar)}
                className={`rounded-circle border p-1 ${
                  selectedAvatar === avatar
                    ? "border-3 border-info shadow"
                    : "border-secondary"
                }`}
                style={{ cursor: "pointer", transition: "0.2s" }}
              />
            ))}
          </div>

          {selectedAvatar && (
            <div className="mt-3">
              <p className="text-muted small mb-1">Preview:</p>
              <img
                src={selectedAvatar}
                alt="Selected Avatar"
                width="90"
                height="90"
                className="rounded-circle border border-info shadow"
              />
            </div>
          )}
        </div>

        {/* 🌟 SIGNUP FORM */}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              type="text"
              name="username"
              className="form-control"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter username"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-info w-100 fw-semibold"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center mt-3 mb-0">
          Already have an account?{" "}
          <button
            className="btn btn-link p-0 text-info"
            onClick={onSwitchToLogin}
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
}

export default Signup;

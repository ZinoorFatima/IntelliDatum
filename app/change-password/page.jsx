"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/auth";
import { useRouter } from "next/navigation";

export default function ChangePassword() {
  const [auth] = useAuth();
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (!auth?.user) {
      router.push("/"); // Redirect to home page
    } else {
      setAuthChecked(true); // Allow rendering if auth is valid
    }
  }, [auth?.user, router]);

  const togglePasswordVisibility = (field) => {
    setShowPassword({
      ...showPassword,
      [field]: !showPassword[field],
    });
  };

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (form.newPassword !== form.confirmPassword) {
      setError("New passwords do not match.");
      setLoading(false);
      return;
    }

    if (!validatePassword(form.newPassword)) {
      setError(
        "Password must be at least 8 characters long, contain at least one number, one uppercase letter, one lowercase letter, and one special character."
      );
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: auth?.user?.email,
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok && data.success) {
      setSuccess("Password changed successfully!");
      setTimeout(() => router.push("/profile"), 2000);
    } else {
      setError(data.message || "Something went wrong.");
    }
  };
  if (!authChecked) return null;
  
  return (
    <div className="d-flex flex-column min-vh-100 bg-success">
      <main className="container py-5 flex-grow-1 d-flex align-items-center justify-content-center">
        <div className="row w-100 px-3">
          <div className="col-12 col-md-8 col-lg-6 mx-auto">
            <div className="card shadow-sm border-0 bg-light">
              <div className="card-body p-4 p-md-5">
                <h2 className="text-center mb-4">Change Password</h2>

                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Current Password</label>
                    <div className="position-relative">
                      <input
                        type={showPassword.currentPassword ? "text" : "password"}
                        name="currentPassword"
                        value={form.currentPassword}
                        onChange={handleChange}
                        className="form-control"
                        required
                      />
                      <span
                        onClick={() => togglePasswordVisibility("currentPassword")}
                        style={{
                          cursor: "pointer",
                          position: "absolute",
                          right: "10px",
                          top: "50%",
                          transform: "translateY(-50%)",
                        }}
                      >
                        {showPassword.currentPassword ? '🙈' : '👁'}
                      </span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">New Password</label>
                    <div className="position-relative">
                      <input
                        type={showPassword.newPassword ? "text" : "password"}
                        name="newPassword"
                        value={form.newPassword}
                        onChange={handleChange}
                        className="form-control"
                        required
                      />
                      <span
                        onClick={() => togglePasswordVisibility("newPassword")}
                        style={{
                          cursor: "pointer",
                          position: "absolute",
                          right: "10px",
                          top: "50%",
                          transform: "translateY(-50%)",
                        }}
                      >
                        {showPassword.newPassword ? '🙈' : '👁'}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-bold">Confirm New Password</label>
                    <div className="position-relative">
                      <input
                        type={showPassword.confirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        className="form-control"
                        required
                      />
                      <span
                        onClick={() => togglePasswordVisibility("confirmPassword")}
                        style={{
                          cursor: "pointer",
                          position: "absolute",
                          right: "10px",
                          top: "50%",
                          transform: "translateY(-50%)",
                        }}
                      >
                        {showPassword.confirmPassword ? '🙈' : '👁'}
                      </span>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-success w-100" disabled={loading}>
                    {loading ? 'Changing password...' : 'Change Password'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

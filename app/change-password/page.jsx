"use client";

import React, { useState } from "react";
import { useAuth } from "../context/auth";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
export default function ChangePassword() {
  const [auth] = useAuth();
  const router = useRouter();

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

  const [loading, setLoading] = useState(false);  // Added loading state

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword({
      ...showPassword,
      [field]: !showPassword[field],
    });
  };

  // Validate new password according to the required rules
  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);  // Start loading

    if (form.newPassword !== form.confirmPassword) {
      setError("New passwords do not match.");
      setLoading(false);  // Stop loading on error
      return;
    }

    if (!validatePassword(form.newPassword)) {
      setError(
        "Password must be at least 8 characters long, contain at least one number, one uppercase letter, one lowercase letter, and one special character."
      );
      setLoading(false);  // Stop loading on error
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
    setLoading(false);  // Stop loading after request completes

    if (res.ok && data.success) {
      setSuccess("Password changed successfully!");
      Swal.fire({
        icon: 'success',
        text: data.message || "Password changed successfully!",
        confirmButtonColor: '#198754',
      });
      setTimeout(() => router.push("/profile"), 2000);
    } else {
      setError(data.message || "Something went wrong.");
      Swal.fire({
        icon: 'error',
        title: 'Oops!',
        text: data.message || "something went wrong",
        confirmButtonColor: '#d33',
      });
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-success">
      <main className="container py-5 flex-grow-1 d-flex align-items-center justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-sm border-0 bg-light ">
            <div className="card-body p-5">
              <h2 className="text-center mb-4">Change Password</h2>
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
      </main>
    </div>
  );
}

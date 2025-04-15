"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/auth";
import { useRouter } from "next/navigation";

export default function ChangePassword() {
  const [auth, setAuth] = useAuth();
  const router = useRouter();
  const user = auth?.user;
  const [loadingUser, setLoadingUser] = useState(true);

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

  useEffect(() => {
    const storedAuth = localStorage.getItem("auth");
    if (!storedAuth) {
      router.push('/');
    } else {
      const parsed = JSON.parse(storedAuth);
      setAuth(parsed);
    }
  }, []);

  useEffect(() => {
    if (user) {
      setLoadingUser(false);
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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

  if (loadingUser) return null;

  return (
    <div className="bg-success min-vh-100 d-flex justify-content-center align-items-center p-3">
      <div className="bg-white rounded-4 shadow p-4 p-md-5 w-100" style={{ maxWidth: "600px" }}>
        <h2 className="text-center mb-4">Change Password</h2>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          {["currentPassword", "newPassword", "confirmPassword"].map((field, idx) => {
            const labelMap = {
              currentPassword: "Current Password",
              newPassword: "New Password",
              confirmPassword: "Confirm New Password",
            };
            return (
              <div className="mb-3" key={field}>
                <label className="form-label fw-bold">{labelMap[field]}</label>
                <div className="position-relative">
                  <input
                    type={showPassword[field] ? "text" : "password"}
                    name={field}
                    value={form[field]}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                  <span
                    onClick={() => togglePasswordVisibility(field)}
                    style={{
                      cursor: "pointer",
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                  >
                    {showPassword[field] ? "🙈" : "👁"}
                  </span>
                </div>
              </div>
            );
          })}

          <button type="submit" className="btn btn-success w-100" disabled={loading}>
            {loading ? "Changing password..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

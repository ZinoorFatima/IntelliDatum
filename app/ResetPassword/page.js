"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const ResetPassword = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  //const userId = searchParams.get("id");
  //const token = searchParams.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    let isValid = true;

    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    } else {
      setPasswordError("");
    }

    if (!confirmPassword) {
      setConfirmPasswordError("Confirm Password is required");
      isValid = false;
    } else {
      setConfirmPasswordError("");
    }

    if (isValid) {
      if (password !== confirmPassword) {
        toast.error("New Password and Confirm Password do not match!", {
          autoClose: 5000,
          position: "top-right",
        });
        return;
      }

      try {
        const res = await  fetch(`/api/auth/resetPassword`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });

        if (!res.data.success) {
          toast.error(res.data.message, {
            autoClose: 5000,
            position: "top-right",
          });
        } else {
          toast.success(res.data.message, {
            autoClose: 5000,
            position: "top-right",
          });
          setTimeout(() => {
            router.push("/signin");
          }, 2000);
        }
      } catch (error) {
        console.error("Reset Password Error:", error);
        toast.error("Something went wrong!", {
          autoClose: 5000,
          position: "top-right",
        });
      }
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#A0D49D",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "50vh",
      }}
    >
      <div
        style={{
          maxWidth: "60%",
          width: "100%",
          margin: "20px auto",
          padding: "6%",
          border: "1px solid #ccc",
          borderRadius: "20px",
          backgroundColor: "#fff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "10%" }}>Reset Password</h2>

        <form onSubmit={handleSubmit} style={{ width: "100%", textAlign: "center" }}>
          <div style={{ marginBottom: "5%" }}>
            <label htmlFor="password" style={{ display: "block", textAlign: "left", fontWeight: "bold" }}>
              New Password {passwordError && <span style={{ color: "red" }}>*</span>}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "80%",
                padding: "8px",
                boxSizing: "border-box",
              }}
              placeholder="Enter new password"
            />
            {passwordError && <p style={{ color: "red", fontSize: "12px" }}>{passwordError}</p>}
          </div>

          <div style={{ marginBottom: "5%" }}>
            <label htmlFor="confirmPassword" style={{ display: "block", textAlign: "left", fontWeight: "bold" }}>
              Confirm Password {confirmPasswordError && <span style={{ color: "red" }}>*</span>}
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{
                width: "80%",
                padding: "8px",
                boxSizing: "border-box",
              }}
              placeholder="Confirm new password"
            />
            {confirmPasswordError && <p style={{ color: "red", fontSize: "12px" }}>{confirmPasswordError}</p>}
          </div>

          <button
            type="submit"
            style={{
              width: "80%",
              padding: "10px",
              backgroundColor: "#7BC28A",
              color: "white",
              border: "none",
              borderRadius: "30px",
              cursor: "pointer",
              marginBottom: "10%",
            }}
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;

"use client";

import { useState } from "react";
import toast from "react-hot-toast";
//import { useRouter } from "next/navigation";
import Link from "next/link";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  //const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError("");

    if (!email) {
      setEmailError("Email address is required");
      return;
    }

    try {
      const res = await fetch(`/api/auth/forgotPassword`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!data.success) {
        toast.error(data.message);
      } else {
        toast.success(data.message);
        setEmail(""); // Clear input field
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong!");
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
        <h2 style={{ textAlign: "center", marginBottom: "10%" }}>Forgot Password</h2>

        {/* Email Input */}
        <div style={{ marginBottom: "5%", width: "100%", textAlign: "center" }}>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "80%",
              padding: "8px",
              boxSizing: "border-box",
            }}
            placeholder="Enter your email"
            required
          />
          {emailError && <p style={{ color: "red", fontSize: "12px" }}>{emailError}</p>}
        </div>

        <button
          type="submit"
          onClick={handleSubmit}
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

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
            gap: "5px",
          }}
        >
          <div>Remember your password?</div>
          <Link href="/signin" style={{ color: "black", fontWeight: "bold" }}>
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

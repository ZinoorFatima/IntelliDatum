"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  //const [status, setStatus] = useState({ message: '', type: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError("");
    //setStatus({ message: '', type: '' });
    if (!email) {
      setEmailError("Email is required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Invalid email format");
      return;
    }

    setIsLoading(true);

    try {
      // The server creates the code and emails it; its reply is the same whether or not the account exists
      const res = await fetch("/api/auth/create-reset-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        Swal.fire({
          icon: 'error',
          title: 'Oops!',
          text: data.message || 'Something went wrong.',
          confirmButtonColor: '#d33',
        });
        return;
      }

      Swal.fire({
        icon: 'success',
        text: data.message,
        confirmButtonColor: '#198754',
      });
      setEmail("");
      setTimeout(() => {
        router.push("/reset-password");
      }, 1500);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Oops!',
        text: 'Failed to reset' || 'Something went wrong.',
        confirmButtonColor: '#d33',
      });
    } finally {
      setIsLoading(false); // END loading
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100"
      style={{
        backgroundColor: "#198754",
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
          padding: "6%",
          border: "1px solid #ccc",
          borderRadius: "20px",
          backgroundColor: "#fff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h2 style={{ marginBottom: "10%" }}>Forgot Password</h2>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "80%",
            padding: "10px",
            marginBottom: "10px",
          }}
        />
        {emailError && <p style={{ color: "red", fontSize: "12px" }}>{emailError}</p>}
        
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          style={{
            width: "80%",
            padding: "10px",
            backgroundColor: "#198754",
            color: "white",
            border: "none",
            borderRadius: "30px",
            cursor: "pointer",
          }}
        >
          {isLoading ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
            </>
          ) : (
            "Send Reset Code"
          )}
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;

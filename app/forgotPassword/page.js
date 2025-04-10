"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import emailjs from "emailjs-com";
import { useRouter } from "next/navigation";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const router = useRouter();

  const generateResetToken = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit token
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError("");

    if (!email) {
      setEmailError("Email is required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Invalid email format");
      return;
    }

    const token = generateResetToken();

    try {
      const saveRes = await fetch("/api/auth/create-reset-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token }),
      });

      const saveData = await saveRes.json();
      if (!saveRes.ok || !saveData.success) {
        toast.error(saveData.message || "Failed to generate token.");
        return;
      }

      const randomPassword = token;
      const templateParams = {
        user_email: email,  // The email to which you are sending the password
        random_password: randomPassword,  // This will be sent in the email
        user_name: email.split('@')[0],  // You can use the part of the email before "@" as the name
      };
  

      const emailRes = await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        process.env.NEXT_PUBLIC_EMAILJS_RESET_TEMPLATE_ID, // create this template in EmailJS
        templateParams,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
      );

      if (emailRes.status === 200) {
        toast.success("Token sent to your email.");
        setEmail("");
        setTimeout(() => {
          router.push("/reset-password");
        }, 1500);
      } else {
        toast.error("Failed to send email.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100"
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
          style={{
            width: "80%",
            padding: "10px",
            backgroundColor: "#7BC28A",
            color: "white",
            border: "none",
            borderRadius: "30px",
            cursor: "pointer",
          }}
        >
          Send Reset Token
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;

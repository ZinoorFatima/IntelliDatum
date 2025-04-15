"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const SignUp = () => {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false); // 👁 Toggle
  const [loading, setLoading] = useState(false); // Loading state

  const validateForm = () => {
    if (!firstName.trim()) {
      alert("First name cannot be empty.");
      return false;
    }

    if (!lastName.trim()) {
      alert("Last name cannot be empty.");
      return false;
    }

    if (!email.trim()) {
      alert("Email is required.");
      return false;
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return false;
    }

    if (!phone.trim()) {
      alert("Phone number is required.");
      return false;
    }

    const phoneRegex = /^\d{11}$/;
    if (!phoneRegex.test(phone)) {
      alert("Phone number must be exactly 11 digits.");
      return false;
    }

    if (!password) {
      alert("Password is required.");
      return false;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?&#^])[A-Za-z\d@$!%?&#^]{8,}$/;
    if (!passwordRegex.test(password)) {
      alert(
        "Password must be at least 8 characters long and include:\n- One uppercase letter\n- One lowercase letter\n- One number\n- One special character"
      );
      return false;
    }

    return true;
  };

  const handleNavigation = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true); // Start loading

    const data = {
      FirstName: firstName,
      LastName: lastName,
      email: email,
      password: password,
      phone: phone, // Include if your API requires it
    };

    try {
      console.log("Calling API...");
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        console.log("Signup successful:", res);
        router.push("/signin");
      } else {
        console.error("Signup failed:", res);
        alert("Signup failed");
      }
    } catch (error) {
      console.error("Error during signup:", error);
      toast("Error during signup");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div
      className="bg-success"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
      }}
    >
      <div
        style={{
          maxWidth: '60%',
          width: '100%',
          margin: '20px auto',
          padding: '6%',
          border: '1px solid #ccc',
          borderRadius: '20px',
          backgroundColor: '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '8%' }}>Create Account</h2>

        <div style={{ width: '100%', marginBottom: '5%', textAlign: 'center' }}>
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            style={{ width: '80%', padding: '8px' }}
            required
          />
        </div>

        <div style={{ width: '100%', marginBottom: '5%', textAlign: 'center' }}>
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            style={{ width: '80%', padding: '8px' }}
            required
          />
        </div>

        <div style={{ width: '100%', marginBottom: '5%', textAlign: 'center' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '80%', padding: '8px' }}
            required
          />
        </div>

        <div style={{ width: '100%', marginBottom: '5%', textAlign: 'center' }}>
          <input
            type="tel"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{ width: '80%', padding: '8px' }}
            required
          />
        </div>

        <div style={{ marginBottom: '5%', width: '80%', position: 'relative', margin: '0 auto' }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '8px 40px 8px 8px' }}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
            }}
          >
            {showPassword ? '🙈' : '👁'}
          </button>
        </div>

        <button
          type="submit"
          onClick={handleNavigation}
          style={{
            width: '80%',
            padding: '10px',
            backgroundColor: '#198754',
            color: 'white',
            border: 'none',
            borderRadius: '30px',
            cursor: 'pointer',
            marginBottom: '10%',
            marginTop: '5%',
          }}
          disabled={loading}
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>

        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
          <div>Already have an account?</div>
          <Link href="/signin" style={{ color: 'black' }}>Login</Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;

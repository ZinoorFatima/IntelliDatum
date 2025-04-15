"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
      style={{
        backgroundColor: '#198754',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
      }}
    >
      <div style={{ maxWidth: '80%', width: '100%', display: 'flex', margin: '20px auto' }}>
        <div style={{ width: '30%', backgroundColor: '#f0f0f0', borderBottomLeftRadius: '20px', borderTopLeftRadius: '20px' }}>
          <Image
            src="/MistyHills.png"
            alt="Logo 1"
            width={150}
            height={150}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderBottomLeftRadius: '20px',
              borderTopLeftRadius: '20px',
            }}
          />
        </div>
        <div
          style={{
            width: '70%',
            padding: '6%',
            border: '1px solid #ccc',
            borderBottomRightRadius: '20px',
            borderTopRightRadius: '20px',
            backgroundColor: '#E5E9D2',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <h2 style={{ textAlign: 'center', marginBottom: '10%' }}>Create Account</h2>

          <div style={{ marginBottom: '5%', width: '100%', textAlign: 'center' }}>
            <input
              type="name"
              id="Firstname"
              name="Firstname"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              style={{
                width: '80%',
                padding: '8px',
                boxSizing: 'border-box',
              }}
              placeholder="First Name"
              required
            />
          </div>
          <div style={{ marginBottom: '5%', width: '100%', textAlign: 'center' }}>
            <input
              type="name"
              id="Lastname"
              name="Lastname"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              style={{
                width: '80%',
                padding: '8px',
                boxSizing: 'border-box',
              }}
              placeholder="Last Name"
              required
            />
          </div>

          <div style={{ marginBottom: '5%', width: '100%', textAlign: 'center' }}>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '80%',
                padding: '8px',
                boxSizing: 'border-box',
              }}
              placeholder="Email"
              required
            />
          </div>

          {/* Phone Input */}
          <div style={{ marginBottom: '5%', width: '100%', textAlign: 'center' }}>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{
                width: '80%',
                padding: '8px',
                boxSizing: 'border-box',
              }}
              placeholder="Phone"
              required
            />
          </div>

          {/* Password with Eye */}
          <div style={{ marginBottom: "5%", width: "100%", textAlign: "center", position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "80%",
                padding: "8px",
                paddingRight: "40px",
                boxSizing: "border-box",
              }}
              placeholder="Password"
              required
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "12%",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                fontSize: "18px",
              }}
            >
              {showPassword ? "🙈" : "👁"}
            </span>
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
            }}
            disabled={loading} // Disable button when loading
          >
            {loading ? 'Creating account...' : 'Create'}
          </button>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
            gap: '5px',
          }}>
            <div>Already have an account?</div>
            <Link href="/signin" style={{
              color: 'black'
            }}>Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;

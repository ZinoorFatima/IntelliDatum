"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/auth';
import toast from 'react-hot-toast';
import 'bootstrap/dist/css/bootstrap.min.css';

const Signin = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [auth, setAuth] = useAuth("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state

  const handleNavigation = async (e) => {
    e.preventDefault();
    
    // Set loading to true when the request starts
    setLoading(true);

    const data = {
      email: email,
      password: password
    };

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (res.ok) {
        setAuth({
          ...auth,
          user: result.user,
          token: result.token,
        });
        localStorage.setItem("auth", JSON.stringify({ user: result.user, token: result.token }));
        router.push("/");
      } else {
        alert(result.message || "Login failed");
      }
    } catch (error) {
      console.error("Error during Login:", error);
      toast("Error during Login");
    } finally {
      // Set loading to false when the request is complete
      setLoading(false);
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
          //backgroundColor: '#fff',
          backgroundColor: 'red',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '10%' }}>Login</h2>

        {/* Email Input */}
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

        {/* Password Input */}
        <div style={{ marginBottom: '5%', width: '80%', position: 'relative', margin: '0 auto' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 40px 8px 8px',
              boxSizing: 'border-box',
            }}
            placeholder="Password"
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

        <Link href="/forgotPassword" style={{ color: 'black', fontWeight: 'bold', marginBottom: '5%' ,marginTop:'5%'}}>
          Forgot Password
        </Link>

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
          disabled={loading} // Disable the button while loading
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
            gap: '5px',
          }}
        >
          <div>Do not have an account?</div>
          <Link href="/signup" style={{ color: 'black' }}>Register</Link>
        </div>
      </div>
    </div>
  );
};

export default Signin;

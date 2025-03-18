"use client"
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '../context/auth';
const Signin = () => {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [auth, setAuth] = useAuth("")

    const handleNavigation = async (e) => {
        e.preventDefault();
    
        const data = {
          email:email,
          password:password
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
            console.log("Login successful:", result);
            router.push("/");
            setAuth({
              ...auth,
              user:res.data.user,
              token:res.data.token,
            });
            localStorage.setItem('auth',JSON.stringify(res.data));
          } else {
            console.error("Login failed:", result);
            alert(result.message || "Login failed");
          }
        } catch (error) {
          console.error("Error during Login:", error);
          toast("Error during Login");
        }
      };

    return (
        <div
        style={{
          backgroundColor: '#A0D49D',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh', 
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
          <h2 style={{ textAlign: 'center', marginBottom: '10%' }}>Login</h2>
      
          {/* Email Input */}
          <div style={{ marginBottom: '5%', width: '100%', textAlign: 'center' }}>
            <input
              type="email"
              id="email"
              name="email"
              value ={email} onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '80%', // Adjust to desired width
                padding: '8px',
                boxSizing: 'border-box',
              }}
              placeholder="Email"
              required
            />
          </div>
      
          {/* Password Input */}
          <div style={{ marginBottom: '5%', width: '100%', textAlign: 'center' }}>
            <input
              type="password"
              id="password"
              name="password"
              value ={password} onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '80%', // Adjust to desired width
                padding: '8px',
                boxSizing: 'border-box',
              }}
              placeholder="Password"
            />
          </div>

          <Link href="/forgotPassword"style={{
              color:'black',
              fontWeight: 'bold',
              marginBottom:'10%'
            }}>Forgot Password</Link>
      


          <button
            type="submit"
            onClick={handleNavigation}
            style={{
              width: '80%',
              padding: '10px',
              backgroundColor: '#7BC28A',
              color: 'white',
              border: 'none',
              borderRadius: '30px',
              cursor: 'pointer',
              marginBottom: '10%',
            }}
          >
            Login
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
            <div >Don't have an account?</div>
            <Link href="/signup"style={{
              color:'black'
            }}>Register</Link>
          </div>
        </div>
      </div>
      
    );
};

export default Signin;

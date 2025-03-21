"use client"
import React from 'react'
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useState } from 'react';
const SignUp = () => {

  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  const handleNavigation = async (e) => {
    e.preventDefault();

    const data = {
      FirstName: firstName,
      LastName: lastName,
      email:email,
      password:password,
      phone: phone,  // include if your API requires it
    };

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (res.ok) {
        console.log("Signup successful:", result);
        router.push("/signin");
      } else {
        console.error("Signup failed:", result);
        alert(result.message || "Signup failed");
      }
    } catch (error) {
      console.error("Error during signup:", error);
      toast("Error during signup");
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
      <div style={{
          maxWidth: '80%',
          width: '100%',display: 'flex', margin:'20px auto'}}>

        <div style={{ width: '30%', backgroundColor: '#f0f0f0' ,borderBottomLeftRadius:'20px',}}>
        <Image
                    src="/MistyHills.png"  
                    alt="Logo 1"
                    width={150}
                    height={150}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover' ,
                      borderBottomLeftRadius:'20px',
                    }} 
                  />
          </div>
        <div
          style={{
            width: '70%',
            
            padding: '6%',
            border: '1px solid #ccc',
            borderBottomRightRadius:'20px',
            
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
              value ={firstName} onChange={(e) => setFirstName(e.target.value)}
              style={{
                width: '80%', // Adjust to desired width
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
              value ={lastName} onChange={(e) => setLastName(e.target.value)}
              style={{
                width: '80%', // Adjust to desired width
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
          {/* Phone Input */}
          <div style={{ marginBottom: '5%', width: '100%', textAlign: 'center' }}>
          <input
              type="tel"
              id="phone"
              name="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{
                width: '80%', // Adjust to desired width
                padding: '8px',
                boxSizing: 'border-box',
              }}
              placeholder="Phone"
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
              required
            />
          </div>
          

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
            Create
          </button>

      
          <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'row',
              gap: '5px',
            }}>
            <div >Already have an account?</div>
            <Link href="/signin"style={{
              color:'black'
            }}>Login</Link>
          </div>
        </div>
      </div>
  </div>
  
);
}

export default SignUp
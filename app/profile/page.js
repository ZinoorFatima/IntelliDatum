"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/auth";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [auth, setAuth] = useAuth();
  const router = useRouter();
  const user = auth?.user;
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState("/default-profile.jpg");

  useEffect(() => {
    const storedAuth = localStorage.getItem("auth");
    if (!storedAuth) {
      router.push('/');
    } else {
      const parsed = JSON.parse(storedAuth);
      setAuth(parsed);
    }
  }, [router, setAuth]);

  useEffect(() => {
    if (user) {
      setProfileImage(`/api/user/profile-picture?email=${user.email}`);
      setLoading(false);
    }
  }, [user]);

  const handleImageError = () => {
    setProfileImage("/default-profile.jpg");
  };

  if (loading) return null;

  return (
    <div className="bg-success min-vh-100 d-flex justify-content-center align-items-center p-3">
      <div className="bg-white rounded-4 shadow p-4 p-md-5 w-100" style={{ maxWidth: "600px" }}>
        <div className="d-flex flex-column align-items-center text-center mb-4">
          <Image
            src={profileImage}
            alt="Profile"
            width={100}
            height={100}
            className="rounded-circle mb-3"
            style={{
              objectFit: "cover",
              border: "3px solid #198754",
            }}
            onError={handleImageError}
          />
          <h3 className="mb-1">{user?.FirstName} {user?.LastName}</h3>
          <p className="text-muted text-break">{user?.email}</p>
        </div>

        <ul className="list-group list-group-flush mb-4">
          <li className="list-group-item d-flex justify-content-between flex-wrap">
            <span className="fw-bold">First Name:</span>
            <span>{user?.FirstName}</span>
          </li>
          <li className="list-group-item d-flex justify-content-between flex-wrap">
            <span className="fw-bold">Last Name:</span>
            <span>{user?.LastName}</span>
          </li>
          <li className="list-group-item d-flex justify-content-between flex-wrap">
            <span className="fw-bold">Email:</span>
            <span className="text-break">{user?.email}</span>
          </li>
        </ul>

        <div className="d-grid gap-2">
          <Link href="/edit-profile" className="btn btn-outline-success">Edit Profile</Link>
          <Link href="/change-password" className="btn btn-outline-secondary">Change Password</Link>
          <button
            className="btn btn-danger"
            onClick={() => {
              localStorage.removeItem("auth");
              setAuth(null);
              window.location.href = "/signin";
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

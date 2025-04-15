"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/auth";
import Image from "next/image";
import Link from "next/link";

export default function ProfilePage() {
  const [auth] = useAuth();
  const user = auth?.user;

  const [authChecked, setAuthChecked] = useState(false);
  const [profileImage, setProfileImage] = useState("/default-profile.jpg");

  useEffect(() => {
    if (!user) {
      window.location.href = "/";
    } else {
      setAuthChecked(true);
    }
  }, [user]);

  useEffect(() => {
    if (user?.email) {
      setProfileImage(`/api/user/profile-picture?email=${user.email}`);
    }
  }, [user]);

  const handleImageError = () => {
    setProfileImage("/default-profile.jpg");
  };

  // 👇 Prevent rendering until auth is confirmed
  if (!authChecked) return null;

  return (
    <div className="d-flex flex-column min-vh-100 bg-success">
      <main className="container py-5 flex-grow-1">
        <div className="row justify-content-center py-5">
          <div className="col-12 col-sm-10 col-md-8 col-lg-6">
            <div className="card shadow-sm border-0 bg-light">
              <div className="card-body p-4 p-md-5">
                {/* Profile Photo */}
                <div className="d-flex flex-column flex-sm-row align-items-center mb-4 text-center text-sm-start">
                  <div className="mb-3 mb-sm-0 me-sm-4">
                    {profileImage ? (
                      <Image
                        src={profileImage}
                        alt="Profile"
                        width={80}
                        height={80}
                        className="rounded-circle"
                        style={{
                          objectFit: "cover",
                          border: "3px solid #198754",
                        }}
                        onError={handleImageError}
                      />
                    ) : (
                      <div
                        className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center fs-3"
                        style={{ width: "80px", height: "80px" }}
                      >
                        {user?.FirstName?.charAt(0)}
                        {user?.LastName?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="mb-0">{user?.FirstName} {user?.LastName}</h3>
                    <p className="text-muted mb-0">{user?.email}</p>
                  </div>
                </div>

                {/* Info List */}
                <ul className="list-group list-group-flush mb-4">
                  <li className="list-group-item d-flex justify-content-between">
                    <span className="fw-bold">First Name:</span>
                    <span>{user?.FirstName}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between">
                    <span className="fw-bold">Last Name:</span>
                    <span>{user?.LastName}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between">
                    <span className="fw-bold">Email:</span>
                    <span className="text-break">{user?.email}</span>
                  </li>
                </ul>

                {/* Action Buttons */}
                <div className="d-flex flex-column flex-sm-row flex-wrap justify-content-center gap-2">
                  <Link href="/edit-profile" className="btn btn-outline-success w-100 w-sm-auto">
                    Edit Profile
                  </Link>
                  <Link href="/change-password" className="btn btn-outline-secondary w-100 w-sm-auto">
                    Change Password
                  </Link>
                  <button
                    className="btn btn-danger w-100 w-sm-auto"
                    onClick={() => {
                      localStorage.removeItem("auth");
                      window.location.href = "/signin";
                    }}
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

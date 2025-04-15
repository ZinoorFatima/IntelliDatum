"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/auth";
import { useRouter } from "next/navigation";

export default function EditProfile() {
  const [auth, setAuth] = useAuth();
  const [form, setForm] = useState({ FirstName: "", LastName: "" });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] =useState(true);
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

useEffect(() => {
    const storedAuth = localStorage.getItem("auth");
    if (!storedAuth) {
      router.push('/');
    } else {
      const parsed = JSON.parse(storedAuth);
      setAuth(parsed);
    }
  }, []);

  useEffect(() => {
    if (auth?.user) {
      setLoadingUser(false);
      setForm({
        FirstName: auth.user.FirstName || "",
        LastName: auth.user.LastName || "",
      });
    }

  }, [auth]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFile = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("FirstName", form.FirstName);
    formData.append("LastName", form.LastName);
    formData.append("email", auth.user.email);
    if (file) formData.append("profilePicture", file);

    try {
      const res = await fetch("/api/auth/update-profile", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      alert(data.message);

      if (data.success && data.user) {
        const updatedUser = {
          ...auth.user,
          FirstName: data.user.FirstName,
          LastName: data.user.LastName,
          profilePicture: data.user.profilePicture,
        };

        setAuth({ ...auth, user: updatedUser });
        localStorage.setItem("auth", JSON.stringify({ ...auth, user: updatedUser }));
        router.push("/profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred while updating your profile.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingUser) return null;

  return (
    <div className="bg-success min-vh-100 d-flex justify-content-center align-items-center p-3">
      <div className="bg-white rounded-4 shadow p-4 p-md-5 w-100" style={{ maxWidth: "600px" }}>
        <h2 className="mb-4 text-center">Edit Profile</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-bold">First Name</label>
            <input
              name="FirstName"
              value={form.FirstName}
              onChange={handleChange}
              className="form-control"
              placeholder="First Name"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label fw-bold">Last Name</label>
            <input
              name="LastName"
              value={form.LastName}
              onChange={handleChange}
              className="form-control"
              placeholder="Last Name"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label fw-bold">Email</label>
            <input
              name="email"
              value={auth?.user?.email || ""}
              readOnly
              className="form-control text-muted bg-light"
            />
          </div>
          <div className="mb-4">
            <label className="form-label fw-bold">Profile Picture</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="form-control"
            />
          </div>
          <button
            type="submit"
            className="btn btn-success w-100"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}

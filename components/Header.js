"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { useAuth } from "../app/context/auth";
import { useProfilePicture } from "../app/lib/useProfilePicture";
import '../app/globals.css';
const Header = () => {
  const [auth, setAuth] = useAuth();
  // fetched with the JWT; falls back to the default picture
  const [profileImage, handleImageError] = useProfilePicture(auth);

  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  const handleLogout = () => {
    setAuth({ user: null, token: "" });
    localStorage.removeItem("auth");
  };

  return (
    <nav className="navbar navbar-expand-lg bg-light shadow-sm sticky-top py-0">
      <div className="container-fluid px-4">
        {/* Brand Logo */}
        <Link href="/" className="navbar-brand d-flex align-items-center">
          <div className="ms-5 d-flex align-items-center">
            <Image
              src="/logo.png"
              alt="Intelli Datum Logo"
              width={50}
              height={50}
              className="me-2"
              priority
            />
            <span className="fw-bold text-success fs-3">IntelliDatum</span>
          </div>
        </Link>

        {/* Toggler */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Nav Links */}
        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center">
            <li className="nav-item mx-2">
              <Link href="/" className="nav-link">
                Home
              </Link>
            </li>
            <li className="nav-item mx-2">
              <Link href="/files" className="nav-link">
                Files
              </Link>
            </li>
            <li className="nav-item mx-2">
              <Link href="/contactus" className="nav-link">
                Contact
              </Link>
            </li>

            {!auth?.user ? (
              <li className="nav-item mx-2">
                <Link
                  href="/signin"
                  className="btn btn-success px-3  text-white"
                >
                  Login
                </Link>
              </li>
            ) : (
              <li className="nav-item dropdown ms-3">
                <a
                  className="nav-link dropdown-toggle btn btn-outline-success px-3"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <Image
                    src={profileImage}
                    alt="Profile Picture"
                    width={40}
                    height={40}
                    className="rounded-circle me-2"
                    style={{ objectFit: "cover" }}
                    onError={handleImageError}
                  />
                </a>
                <ul className="dropdown-menu dropdown-menu-end animate-dropdown">
                  <li>
                    <Link href="/profile" className="dropdown-item">
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard" className="dropdown-item">
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <a
                      href="/signin"
                      className="dropdown-item text-danger"
                      onClick={handleLogout}
                    >
                      Logout
                    </a>
                  </li>
                </ul>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;

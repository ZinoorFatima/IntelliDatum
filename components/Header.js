"use client"; // Required in Next.js App Router
// /dashboard/${auth?.user?.role === 1 ? "admin" : "user"}

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import {useAuth} from "../app/context/auth"
const Header = () => {
  const [auth, setAuth] = useAuth();

  // Ensure Bootstrap JavaScript is loaded
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  const handleLogout = () => {
    setAuth({ user: null, token: "" });
    localStorage.removeItem("auth");
  };

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
      <div className="container-fluid">
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarTogglerDemo01"
          aria-controls="navbarTogglerDemo01"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarTogglerDemo01">
          <Image
            src="/logo.png"
            alt="Intelli Datum Logo"
            width={80}
            height={80}
            priority
            style={{ marginLeft: "30px" }}
          />
          <Link href="/" className="navbar-brand">
            Intelli Datum
          </Link>
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link href="/" className="nav-link">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/files" className="nav-link">
                Files
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/contactus" className="nav-link">
                Contact
              </Link>
            </li>

            {/* Auth-based Navigation */}
            {!auth.user ? (
              <li className="nav-item-login">
                <Link href="/signin" className="nav-link">
                  Login
                </Link>
              </li>
            ) : (
              <li className="nav-item dropdown">
                <Link
                  href="#"
                  className="nav-link dropdown-toggle"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {auth?.user?.FirstName}
                </Link>
                <ul className="dropdown-menu">
                  <li>
                    <Link
                      href={`/profile`}
                      className="dropdown-item"
                    >
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={`/dashboard`} 
                      className="dropdown-item"
                    >
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link href="/signin" className="dropdown-item" onClick={handleLogout}>
                      Logout
                    </Link>
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

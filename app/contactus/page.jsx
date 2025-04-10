import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';

export default function ContactUs() {
  return (
    <main className="d-flex min-vh-100 bg-success bg-opacity-25 align-items-center justify-content-center p-4">
      <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center gap-5">
        {/* Left Text Section */}
        <div className="text-center text-md-start">
          <h1 className="display-4 fw-bold text-success mb-3">Contact Us</h1>
          <p className="fs-5 text-dark">
            Feel free to reach out to us through the form below.
          </p>
        </div>

        {/* Form Section */}
        <div
          className="card bg-success text-white p-4 shadow"
          style={{ width: "100%", maxWidth: "400px", borderRadius: "20px" }}
        >
          <form className="d-grid gap-3">
            <div>
              <label htmlFor="name" className="form-label text-white">
                Name
              </label>
              <input
                type="text"
                id="name"
                className="form-control bg-light border-0"
                placeholder="Your Name"
              />
            </div>

            <div>
              <label htmlFor="email" className="form-label text-white">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="form-control bg-light border-0"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="message" className="form-label text-white">
                Message
              </label>
              <textarea
                id="message"
                rows="3"
                className="form-control bg-light border-0"
                placeholder="Your message..."
              ></textarea>
            </div>

            <button type="submit" className="btn btn-dark mt-2">
              Send
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

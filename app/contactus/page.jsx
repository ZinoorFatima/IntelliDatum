"use client"; // Add this line at the top

import React, { useState ,useEffect} from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import Image from "next/image";
import emailjs from 'emailjs-com'; // Import EmailJS
import Swal from "sweetalert2";
export default function ContactUs() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  //const [status, setStatus] = useState({ message: '', type: '' });

  useEffect(() => {
    // This logic will only run on the client-side
    const authData = localStorage.getItem("authData");
    //setStatus({ message: '', type: '' });
    if (authData) {
      console.log("Authentication data:", authData);
    } else {
      console.log("No auth data found");
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission
    setIsLoading(true);
    // Use EmailJS to send the email
    emailjs
      .send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID, // Your service ID
        process.env.NEXT_PUBLIC_EMAILJS_CONTACT_TEMPLATE_ID, // Your template ID
        formData,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY // Your public user ID (the API key)
      )
      .then(
        (response) => {
          console.log('SUCCESS!', response.status, response.text);
          Swal.fire({
            icon: 'success',
            text: 'Message Sent Successfully!' || 'Message Sent Successfully!',
            confirmButtonColor: '#198754',
          });
          setFormData({ name: '', email: '', message: '' }); // Clear the form
        },
        (err) => {
          console.error('FAILED...', err);
          alert('Failed to send message. Please try again.');
          Swal.fire({
            icon: 'error',
            title: 'Oops!',
            text: "Failed to send Message. Please try again"|| 'Something went wrong.',
            confirmButtonColor: '#d33',
          });
        }
      ).finally(() => {
        setIsLoading(false); 
      });
      
  };

  return (
  <main className="position-relative min-vh-100 bg-light d-flex align-items-center justify-content-center p-3">
    <div className="container">
      <div className="row g-5 align-items-center justify-content-center">

        {/* Left: Contact Text */}
        <div className="col-12 col-md-5 text-center text-md-start">
          <h1 className="display-5 fw-bold mb-3 text-success">Contact Us</h1>
          <p className="fs-5 text-success" style={{ lineHeight: '1.6' }}>
            Feel free to reach out to us through the form below.
          </p>
        </div>

        {/* Right: Form Card */}
        <div className="col-12 col-md-6">
          <div
            className="position-relative shadow-lg p-4 bg-success"
            style={{
              borderRadius: '20px',
            }}
          >
            {/* Speech Bubble */}
            <div
              className="position-absolute"
              style={{
                top: '10px',
                right: '10px',
                width: '60px',
                height: '60px',
                zIndex: 2,
              }}
            >
              <Image
                src="/speech-bubble.png"
                alt="Speech Bubble"
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>

            {/* Form */}
            <form className="mt-4" onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="name" className="form-label fw-medium text-dark">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-control"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="email" className="form-label fw-medium text-dark">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-control"
                  placeholder="abc@gmail.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="message" className="form-label fw-medium text-dark">Message</label>
                <textarea
                  id="message"
                  name="message"
                  className="form-control"
                  rows="4"
                  placeholder="Your message..."
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                />
              </div>


              <div className="text-center">

                <button type="submit" className="btn btn-light px-4 py-2 fw-medium shadow rounded">

                {isLoading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Sending...
                  </>
                ) : (
                  "Send"
                )}

                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </main>

  );
}
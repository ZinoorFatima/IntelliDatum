"use client"; // Add this line at the top

import React, { useState ,useEffect} from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import emailjs from 'emailjs-com'; // Import EmailJS
import Swal from "sweetalert2";
export default function ContactUs() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState({ message: '', type: '' });

  useEffect(() => {
    // This logic will only run on the client-side
    const authData = localStorage.getItem("authData");
    setStatus({ message: '', type: '' });
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
            text: data.message || 'Message Sent Successfully!',
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
    <main className="position-relative d-flex min-vh-100 bg-light align-items-center justify-content-center p-4 bg-light">
      <div className="container d-flex flex-column flex-md-row justify-content-center align-items-start gap-5 position-relative">
        
        {/* Left Text Section */}
        <div className="d-flex flex-column justify-content-center text-start w-100" style={{ maxWidth: '400px', minHeight: '430px' }}>
          <div>
            <h1 className="display-4 fw-bold mb-3 text-success">Contact Us</h1>
            <p className="fs-5 text-success" style={{ lineHeight: '1.6' }}>
              Feel free to reach out to us through the form below.
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div className="position-relative d-flex justify-content-center w-100 ">
          <img
            src="/speech-bubble.png"
            alt="Speech Bubble"
            style={{
              position: 'absolute',
              top: '-55px',
              right: '-10px',
              width: '80px',
              height: '85px',
              zIndex: 2,
            }}
          />
          <div
            className="card p-4 shadow-lg position-relative bg-success"
            style={{
              width: "100%",
              maxWidth: "450px",
              borderRadius: "20px",
              backgroundColor: '#7BC28A',
              border: 'none',
              paddingTop: '3rem',
              minHeight: '430px',
              zIndex: 1,
              marginRight: '-120px',
            }}
          >
            <form className="d-grid gap-4 mt-2 bg-success" onSubmit={handleSubmit}>
              <div className="mx-auto" style={{ maxWidth: "90%", width: "100%" }}>
                <label htmlFor="name" className="form-label fw-medium" style={{ color: '#484848' }}>
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name" // Name field
                  className="form-control py-2 shadow-sm"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: 'none',
                    borderRadius: '8px',
                    height: '45px'
                  }}
                />
              </div>

              <div className="mx-auto" style={{ maxWidth: "90%", width: "100%" }}>
                <label htmlFor="email" className="form-label fw-medium" style={{ color: '#484848' }}>
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email" // Email field
                  className="form-control py-2 shadow-sm"
                  placeholder="abc@gmail.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: 'none',
                    borderRadius: '8px',
                    height: '45px'
                  }}
                />
              </div>

              <div className="mx-auto" style={{ maxWidth: "90%", width: "100%" }}>
                <label htmlFor="message" className="form-label fw-medium" style={{ color: '#484848' }}>
                  Message
                </label>
                <textarea
                  id="message"
                  name="message" // Message field
                  rows="4"
                  className="form-control py-2 shadow-sm"
                  placeholder="Your message..."
                  value={formData.message}
                  onChange={handleInputChange}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: 'none',
                    borderRadius: '8px'
                  }}
                ></textarea>
              </div>


              <div className="text-center">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-light mt-2 py-2 px-4 fw-medium shadow"
                  style={{
                    borderRadius: '8px',
                    fontSize: '1.1rem',
                    minWidth: '150px'
                  }}
                >
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
    </main>
  );
}
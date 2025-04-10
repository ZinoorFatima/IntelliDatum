"use client";

import 'bootstrap/dist/css/bootstrap.min.css';
import { useRouter } from 'next/navigation';
import { useAuth } from '../app/context/auth.js'; 


export default function Home() {
  const router = useRouter();
  const [auth] = useAuth();
  const isLoggedIn = !!auth?.token;


  return (
    <div className="bg-light min-vh-100 position-relative">


      {/* Hero Section */}
      <div className='bg-success py-5'>
        <div className="container text-white d-flex flex-column flex-md-row align-items-center justify-content-between">
          <div className="text-center text-md-start">
            <h1 className="display-4 fw-bold mb-3">Smart Data<br />Management</h1>
            <p className="lead mb-4">Unlock the potential of your data with AI-powered automation.</p>
            {!isLoggedIn && (
              <button
                className="btn btn-light text-success fw-semibold px-4 py-2"
                onClick={() => router.push("/signup")}
              >
                Get Started
              </button>
            )}
          </div>
          <div className="mt-4 mt-md-0">
            <img
              src="/hero-illustration.png"
              alt="Hero Illustration"
              className="img-fluid"
              style={{ maxWidth: '600px' }}
            />
          </div>
        </div>
      </div>


      {/* About Us Section */}
      <div className="container py-5">
        <div className="row align-items-center justify-content-center">
          <div className="col-md-6 text-center text-md-start">
            <h2 className="text-success fw-bold mb-4">About Us</h2>
            <p className="text-black text-justify fs-5">
              Welcome to Intelli Datum, where data chaos meets clarity. In collaboration with Data Insight Lab, we offer an AI-driven platform that effortlessly extracts and organizes data from any file type.
            </p>
            <p className="text-black text-justify fs-5">
              Our mission is to simplify data management, enabling you to focus on insights that matter. Let us handle the complexity while you unlock your data’s potential.
            </p>
          </div>
          <div className='col-md-1'></div>
          <div className="col-md-5 text-center mt-4 mt-md-0">
            <img
              src="/about-illustration.png"
              alt="About Illustration"
              className="img-fluid"
              style={{ maxWidth: '360px' }}
            />
          </div>
        </div>
      </div>

     {/* Features Section */}
    <div className="container py-5">
      <h2 className="text-success fw-bold text-center mb-4 border-success">Features</h2>
      <div className="row g-4">
        {[
          {
            title: 'Multi-Format File Handling',
            desc: 'Upload and process files in various formats with ease.',
            img: '/icons/file-handling.png',
          },
          {
            title: 'Smart File Detection',
            desc: 'Automatically detect file type and structure, supporting multi-record handling.',
            img: '/icons/file-detection.png',
          },
          {
            title: 'AI Pattern Recognition',
            desc: 'Identify headers and patterns to auto-generate structured data.',
            img: '/icons/pattern-recognition.png',
          },
          {
            title: 'Schema Validation',
            desc: 'Validate file format and highlight issues before processing.',
            img: '/icons/schema-validation.png',
          },
          {
            title: 'Data Organization',
            desc: 'Transform unstructured data into structured, searchable formats.',
            img: '/icons/data-organization.png',
          },
          {
            title: 'Communication',
            desc: 'Generate insights and summaries from structured data.',
            img: '/icons/communication.png',
          },
        ].map((feature, idx) => (
          <div className="col-md-4 mb-3" key={idx}>
            <div className="mb-1">
                <img
                  src={feature.img}
                  alt={feature.title}
                />
              </div>
            <div className="bg-light text-success p-4 rounded shadow   border border-success"
              style={{ boxShadow: '0 0 10px rgba(25, 135, 84, 0.3)' }}>
              
              <h5 className="fw-bold">{feature.title}</h5>
              <p className="mb-0">{feature.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Collaborators Section */}
    <div className="container py-5">
      <h2 className="text-success fw-bold text-center mb-4">Our Collaborators</h2>
      <div className="row justify-content-center align-items-center text-center">
        <div className="col-6 col-md-2 mb-4">
          <img 
            src="/logos/logo1.png" 
            alt="FAST NUCES" 
            className="img-fluid" 
            style={{ maxHeight: '80px', objectFit: 'contain' }} 
          />
        </div>
        <div className="col-6 col-md-2 mb-4">
          <img 
            src="/logos/logo2.png" 
            alt="Data Insight Lab" 
            className="img-fluid" 
            style={{ maxHeight: '80px', objectFit: 'contain' }} 
          />
        </div>
      </div>
    </div>


  </div>

  );
}

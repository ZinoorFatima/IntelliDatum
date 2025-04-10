'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    token: '',
    password: '',
  });

  const [status, setStatus] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Password validation function
  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?&#^])[A-Za-z\d@$!%?&#^]{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ message: '', type: '' });
    setLoading(true);

    // Check if password meets the criteria
    if (!validatePassword(formData.password)) {
      setStatus({
        message: 'Password must be at least 8 characters long, contain 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.',
        type: 'danger',
      });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ message: data.message, type: 'success' });

        // Wait 2 seconds and then redirect to login
        setTimeout(() => {
          router.push('/signin');
        }, 500);
      } else {
        setStatus({ message: data.message, type: 'danger' });
      }
    } catch (error) {
      console.error("Error during Resetting Password:", error);
      setStatus({ message: 'Something went wrong!', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-success bg-opacity-25 px-3">
      <div className="card shadow p-4 w-100" style={{ maxWidth: '500px' }}>
        <h3 className="text-center mb-4">Reset Password</h3>

        {status.message && (
          <div className="alert alert-${status.type}" role="alert">
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <input
              type="text"
              name="token"
              className="form-control"
              placeholder="Enter reset token"
              value={formData.token}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3 position-relative">
            <input
              type={showPassword ? 'text' : 'password'} // Toggle password visibility
              name="password"
              className="form-control"
              placeholder="Enter new password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="position-absolute top-50 end-0 translate-middle-y border-0 bg-transparent"
              onClick={() => setShowPassword(!showPassword)} // Toggle visibility on click
            >
              {showPassword ? '🙈' : '👁'} {/* Custom icons for show/hide */}
            </button>
          </div>

          <button type="submit" className="btn btn-success w-100" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
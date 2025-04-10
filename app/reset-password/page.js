'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    token: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&])[A-Za-z\d!@#$%^&]{8,}$/;
    return regex.test(password);
  };

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

    if (!validatePassword(formData.password)) {
      toast.error(
        'Password must be at least 8 characters, with 1 uppercase, 1 lowercase, 1 number, and 1 special character.'
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || 'Password reset successful.');
        setTimeout(() => {
          router.push('/signin');
        }, 1500);
      } else {
        toast.error(data.message || 'Reset failed.');
      }
    } catch (error) {
      console.error('Reset Error:', error);
      toast.error('Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex flex-column min-vh-100"
      style={{
        backgroundColor: '#198754',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem',
      }}
    >
      <div
        style={{
          maxWidth: '60%',
          width: '100%',
          padding: '6%',
          border: '1px solid #ccc',
          borderRadius: '20px',
          backgroundColor: '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <h2 style={{ marginBottom: '10%' }}>Reset Password</h2>

        <form onSubmit={handleSubmit} style={{ width: '100%', textAlign: 'center' }}>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            className="form-control mb-3"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ width: '80%', margin: 'auto' }}
          />

          <input
            type="text"
            name="token"
            placeholder="Enter reset token"
            className="form-control mb-3"
            value={formData.token}
            onChange={handleChange}
            required
            style={{ width: '80%', margin: 'auto' }}
          />

          <div className="position-relative mb-3" style={{ width: '80%', margin: 'auto' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Enter new password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="position-absolute top-50 end-0 translate-middle-y border-0 bg-transparent"
            >
              {showPassword ? '🙈' : '👁'}
            </button>
          </div>

          <button
            type="submit"
            className="btn btn-success"
            style={{
              width: '80%',
              padding: '10px',
              borderRadius: '30px',
              fontWeight: 'bold',
            }}
            disabled={loading}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

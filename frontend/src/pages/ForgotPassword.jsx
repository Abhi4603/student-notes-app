import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword } from '../api/api';

function ForgotPassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', phone: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email || !form.phone || !form.newPassword || !form.confirmPassword) {
      return setError('All fields are required.');
    }

    if (form.newPassword.length < 6) {
      return setError('Password must be at least 6 characters.');
    }

    if (form.newPassword !== form.confirmPassword) {
      return setError('Passwords do not match.');
    }

    try {
      setLoading(true);
      await forgotPassword({ email: form.email, phone: form.phone, newPassword: form.newPassword });
      alert('Password reset successful! Please log in with your new password.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>🔑 Reset Password</h2>
        <p className="auth-subtitle">Verify your identity to reset password</p>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input type="email" name="email" placeholder="Email Address" value={form.email} onChange={handleChange} />
          <input type="tel" name="phone" placeholder="Registered Phone Number" value={form.phone} onChange={handleChange} />
          <input type="password" name="newPassword" placeholder="New Password" value={form.newPassword} onChange={handleChange} />
          <input type="password" name="confirmPassword" placeholder="Confirm New Password" value={form.confirmPassword} onChange={handleChange} />
          <button type="submit" disabled={loading}>{loading ? 'Resetting...' : 'Reset Password'}</button>
        </form>
        <p className="auth-link"><Link to="/login">Back to Login</Link></p>
      </div>
    </div>
  );
}

export default ForgotPassword;

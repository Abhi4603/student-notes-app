import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../api/api';

function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (!form.name || !form.email || !form.phone || !form.password || !form.confirmPassword) {
      return setError('All fields are required.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      return setError('Please enter a valid email address.');
    }

    if (!/^\d+$/.test(form.phone)) {
      return setError('Phone number must contain only digits.');
    }

    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }

    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match.');
    }

    try {
      setLoading(true);
      await signup({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      alert('Signup successful! Please log in.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>📝 Create Account</h2>
        <p className="auth-subtitle">Join Student Notes Manager</p>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input type="text" name="name" placeholder="Full Name" value={form.name} onChange={handleChange} />
          <input type="email" name="email" placeholder="Email Address" value={form.email} onChange={handleChange} />
          <input type="tel" name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} />
          <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} />
          <input type="password" name="confirmPassword" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} />
          <button type="submit" disabled={loading}>{loading ? 'Signing up...' : 'Sign Up'}</button>
        </form>
        <p className="auth-link">Already have an account? <Link to="/login">Log In</Link></p>
      </div>
    </div>
  );
}

export default Signup;

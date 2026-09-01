import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api/api';

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      return setError('Email and password are required.');
    }

    try {
      setLoading(true);
      const { data } = await login(form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>🔐 Welcome Back</h2>
        <p className="auth-subtitle">Log in to your account</p>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input type="email" name="email" placeholder="Email Address" value={form.email} onChange={handleChange} />
          <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} />
          <button type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Log In'}</button>
        </form>
        <p className="auth-link"><Link to="/forgot-password">Forgot Password?</Link></p>
        <p className="auth-link">Don't have an account? <Link to="/signup">Sign Up</Link></p>
      </div>
    </div>
  );
}

export default Login;

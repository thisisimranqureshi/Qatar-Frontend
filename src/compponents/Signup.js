import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/Signup.css';

const Signup = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    group: ''
  });

  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:3500/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        setForm({ name: '', email: '', password: '', group: '' });
        navigate('/');
      } else {
        setMessage(data.error || 'Signup failed');
      }
    } catch (err) {
      setMessage('Server error');
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <div className="signup-left" /> {/* Logo side */}

        <div className="signup-right">
          <form onSubmit={handleSubmit} className="signup-form">
            <h2 className="signup-title">Create Your Account</h2>

            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
              className="signup-input"
            />

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              required
              className="signup-input"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="signup-input"
            />

            <input
              type="text"
              name="group"
              placeholder="Group (e.g. Sales, IT)"
              value={form.group}
              onChange={handleChange}
              required
              className="signup-input"
            />

            <button type="submit" className="signup-button">
              Sign Up
            </button>

            {message && <p className="signup-message">{message}</p>}

            <div className="signup-login-redirect">
              <span>Already have an account?</span>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="login-link"
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;

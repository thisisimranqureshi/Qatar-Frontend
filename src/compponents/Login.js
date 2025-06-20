import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/Login.css';

const Login = ({ setUserEmail, setUserName, setUserRole }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:3500/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (res.ok) {
        if (res.ok) {
          localStorage.setItem('userEmail', data.email);
          localStorage.setItem('userName', data.name);
          localStorage.setItem('userRole', data.role);
          setUserEmail(data.email);
          setUserName(data.name);
          setUserRole(data.role); // ✅ This is important!
          setMessage(data.message || 'Login successful');
          navigate('/dashboard'); // you can also use `/dashboard` here directly if you prefer
        }

      } else {
        if (data.error === 'User not found') {
          setMessage('Email is incorrect');
        } else if (data.error === 'Invalid password') {
          setMessage('Wrong password');
        } else {
          setMessage(data.error || 'Login failed');
        }
      }
    } catch (err) {
      setMessage('Server error');
    }
  };

  const handleSignupClick = () => {
    navigate('/signup');
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-left"></div>

        <div className="login-right">
          <form onSubmit={handleSubmit} className="login-form">
            <h2 className="login-title">Login</h2>

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
              className="login-input"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="login-input"
            />

            <button type="submit" className="login-button">
              Login
            </button>

            {message && <p className="login-message">{message}</p>}

            <div className="login-signup-redirect">
              Don't have an account?
              <button
                type="button"
                onClick={handleSignupClick}
                className="signup-link"
              >
                Signup
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;

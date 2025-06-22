import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/AddCompany.css';

function AddCompany() {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const navigate = useNavigate();

  const userEmail = localStorage.getItem('userEmail');
  const userName = localStorage.getItem('userName');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch('http://localhost:3500/add-company', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        location,
        image: null, // Optional: send null to match backend
        userEmail,
        userName
      })
    });

    const result = await response.json();
    if (response.ok) {
      alert('Company added!');
      navigate('/home');
    } else {
      alert(result.error || 'Failed to add company');
    }
  };

  return (
    <div className="add-company-container">
      <h2>Add New Company</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Company Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
        <button type="submit">Save Company</button>
      </form>
    </div>
  );
}

export default AddCompany;

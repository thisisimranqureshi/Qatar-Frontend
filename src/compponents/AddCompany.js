import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/AddCompany.css';

function AddCompany() {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();

  const userEmail = localStorage.getItem('userEmail');
  const userName = localStorage.getItem('userName');

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    setImageFile(file);

    if (file) {
      const base64 = await convertToBase64(file);
      setImagePreview(base64); // Show preview
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let base64Image = null;
    if (imageFile) {
      base64Image = await convertToBase64(imageFile);
    }

    const response = await fetch('http://localhost:3500/add-company', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        location,
        image: base64Image,
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
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />

        {imagePreview && (
          <div className="image-preview">
            <img src={imagePreview} alt="Preview" />
          </div>
        )}

        <button type="submit">Save Company</button>
      </form>
    </div>
  );
}

export default AddCompany;

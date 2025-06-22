import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logos from '../pics/Logo.jpg';
import './css/Home.css';

function Home() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const userName = localStorage.getItem('userName');

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    const role = localStorage.getItem('userRole');

    if (!userEmail || !role) {
      console.error('User not logged in or role/email missing');
      return;
    }

    axios
      .get('http://localhost:3500/companies', {
        params: { userEmail, role },
      })
      .then((res) => {
        setCompanies(res.data);
      })
      .catch((err) => {
        console.error('Error fetching companies:', err);
      });
  }, []);

  const handleCompanyClick = (companyId) => {
    navigate(`/type-selection/${companyId}`);
  };

  const handleDeleteCompany = async (companyId) => {
    if (!window.confirm('Are you sure you want to delete this company?')) return;

    try {
      await axios.delete(`http://localhost:3500/companies/${companyId}`);
      setCompanies(companies.filter((company) => company._id !== companyId));
    } catch (err) {
      console.error('Error deleting company:', err);
      alert('Failed to delete the company.');
    }
  };

  return (
    <div className="home-wrapper">
      <header className="home-header">
        <img src={logos} alt="Company Logo" className="logo" />
        <h1>Company Management Portal</h1>
        {userName && <p className="welcome-text">Welcome, {userName} 👋</p>}
      </header>

      <div className="company-grid">
        {companies.length === 0 ? (
          <p className="empty-message">No companies available.</p>
        ) : (
          companies.map((company) => (
            <div key={company._id} className="company-card">
              <div className="company-info" onClick={() => handleCompanyClick(company._id)}>
                {/* 🔻 Image removed to reduce load */}
                <h3>{company.name}</h3>
              </div>
              <button className="delete-button" onClick={() => handleDeleteCompany(company._id)}>
                Delete
              </button>
            </div>
          ))
        )}
      </div>

      <button className="add-button" onClick={() => navigate('/add-company')}>
        + Add Company
      </button>
    </div>
  );
}

export default Home;

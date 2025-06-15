import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './css/Home.css';

function Home() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    const role = localStorage.getItem('userRole');

    if (!userEmail || !role) {
      console.error('User not logged in or role/email missing');
      return;
    }

    axios.get('http://localhost:3500/companies', {
      params: { userEmail, role }
    })
      .then((res) => {
        setCompanies(res.data);
      })
      .catch((err) => {
        console.error("Error fetching companies:", err);
      });
  }, []);

  const handleCompanyClick = (companyId) => {
    navigate(`/company/${companyId}`);
  };

  const handleDeleteCompany = async (companyId) => {
    if (!window.confirm('Are you sure you want to delete this company?')) return;

    try {
      await axios.delete(`http://localhost:3500/companies/${companyId}`);
      setCompanies(companies.filter(company => company._id !== companyId));
    } catch (err) {
      console.error('Error deleting company:', err);
      alert('Failed to delete the company.');
    }
  };

  return (
    <div className="home-container">
      <h1>Companies</h1>
      <div className="company-list">
        {companies.length === 0 ? (
          <p>No companies available.</p>
        ) : (
          companies.map((company) => (
            <div key={company._id} className="company-card">
              <div className="company-info" onClick={() => handleCompanyClick(company._id)}>
                <img
                  src={company.image || "/pics/default-logo.jpg"}
                  alt={`${company.name} logo`}
                  className="company-image"
                />
                <p><strong>{company.name}</strong></p>
              </div>
              <button
                className="delete-button"
                onClick={() => handleDeleteCompany(company._id)}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>

      <button className="add-button" onClick={() => navigate('/add-company')}>
        Add Company
      </button>
      <button className="add-button" onClick={() => navigate('/dashboard')}>
        dashboard
      </button>
      
    </div>
  );
}

export default Home;

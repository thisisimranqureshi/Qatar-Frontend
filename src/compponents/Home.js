import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './css/Home.css';

function Home() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const userName = localStorage.getItem('userName');

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    const role = localStorage.getItem('userRole');

    if (!userEmail || !role) return;

    axios
      .get('http://localhost:3500/companies', {
        params: { userEmail, role },
      })
      .then((res) => setCompanies(res.data))
      .catch((err) => console.error('Error fetching companies:', err));
  }, []);

  const handleCompanyClick = (companyId) => {
    navigate(`/type-selection/${companyId}`);
  };

  const handleDeleteCompany = async (companyId) => {
    if (!window.confirm('Delete this company?')) return;

    try {
      await axios.delete(`http://localhost:3500/companies/${companyId}`);
      setCompanies(companies.filter((c) => c._id !== companyId));
    } catch (err) {
      console.error('Error deleting company:', err);
      alert('Failed to delete the company.');
    }
  };

  return (
    <div className="home-container">
      <div className="home-top-bar">
        <h2>Companies</h2>
        <button onClick={() => navigate('/add-company')} className="add-button">
          + Add Company
        </button>
      </div>

      {userName && <p className="user-tag">Logged in as: <strong>{userName}</strong></p>}

      <div className="company-grid">
        {companies.length === 0 ? (
          <p className="empty-message">No companies found.</p>
        ) : (
          companies.map((company) => (
            <div key={company._id} className="company-card">
              <div className="company-info" onClick={() => handleCompanyClick(company._id)}>
                <h3>{company.name}</h3>
                <p>{company.location}</p>
              </div>
              <button className="delete-button" onClick={() => handleDeleteCompany(company._id)}>
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Home;

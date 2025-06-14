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

  return (
    <div className="home-container">
      <h1>Companies</h1>
      <div className="company-list">
        {companies.length === 0 ? (
          <p>No companies available.</p>
        ) : (
          companies.map((company) => (
            <div
              key={company._id}
              className="company-card"
              onClick={() => handleCompanyClick(company._id)}
            >
              <p><strong>{company.name}</strong></p>
              {company.image && (
                <img
                  src={company.image}
                  alt={company.name}
                  className="company-image"
                />
              )}
            </div>
          ))
        )}
      </div>

      <button className="add-button" onClick={() => navigate('/add-company')}>
        Add Company
      </button>
    </div>
  );
}

export default Home;

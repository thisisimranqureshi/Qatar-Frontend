import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './css/Home.css';

function Home() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [editingCompany, setEditingCompany] = useState(null);
  const [newCompanyName, setNewCompanyName] = useState('');
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

  const handleEditClick = (company) => {
    setEditingCompany(company);
    setNewCompanyName(company.name);
  };

  const handleEditSave = async () => {
    try {
      await axios.put(`http://localhost:3500/companies/${editingCompany._id}`, {
        name: newCompanyName
      });
      // update state
      setCompanies((prev) =>
        prev.map((c) =>
          c._id === editingCompany._id
            ? { ...c, name: newCompanyName }
            : c
        )
      );
      setEditingCompany(null);
    } catch (err) {
      console.error('Error updating company:', err);
      alert('Failed to update the company name.');
    }
  };

  const handleEditCancel = () => {
    setEditingCompany(null);
  };

  return (
    <div className="home-container">
      <div className="home-top-bar">
        <h2>Companies</h2>
      </div>

      {userName && (
        <p className="user-tag">
          Logged in as: <strong>{userName}</strong>
        </p>
      )}

      <div className="company-grid">
        {companies.length === 0 ? (
          <p className="empty-message">No companies found.</p>
        ) : (
          companies.map((company) => (
            <div key={company._id} className="company-card">
              <div
                className="company-info"
                onClick={() => handleCompanyClick(company._id)}
              >
                <h3>{company.name}</h3>
                <p>{company.location}</p>
              </div>
              <div className="button-group">
                <button
                  className="edit-button"
                  onClick={() => handleEditClick(company)}
                >
                  Edit
                </button>
                <button
                  className="delete-button"
                  onClick={() => handleDeleteCompany(company._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {editingCompany && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Edit Company Name</h3>
            <input
              type="text"
              value={newCompanyName}
              onChange={(e) => setNewCompanyName(e.target.value)}
            />
            <div className="modal-buttons">
              <button onClick={handleEditSave}>Save</button>
              <button onClick={handleEditCancel}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;

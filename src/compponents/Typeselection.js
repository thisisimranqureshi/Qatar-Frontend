import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import '../compponents/css/TypeSelection.css';

const TypeSelection = () => {
  const { id: companyId } = useParams();
  const navigate = useNavigate();

  const handleSelect = async (type) => {
    try {
      const res = await axios.post('http://localhost:3500/api/company/select-type', {
        companyId,
        type,
      });

      if (res.status === 200) {
        // Navigate directly to the category input component route
        if (type === 'Revenue') {
          navigate(`/company/${companyId}/revenue-category`);
        } else if (type === 'Expense') {
          navigate(`/company/${companyId}/expense-category`);
        }
      }
    } catch (error) {
      console.error('Error saving type selection:', error);
    }
  };

  return (
    <div className="type-selection-container">
      <h2>Select Type</h2>
      <button className="type-btn expense" onClick={() => handleSelect('Expense')}>Expense</button>
      <button className="type-btn revenue" onClick={() => handleSelect('Revenue')}>Revenue</button>
    </div>
  );
};

export default TypeSelection;

// components/RevenueCategoryInput.js
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import "../compponents/css/RevenueCategoryInput.css"

const RevenueCategoryInput = () => {
  const { id: companyId } = useParams();
  const [categoryName, setCategoryName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!categoryName.trim()) return;

    // You can save this to backend if needed before navigating
    navigate(`/company/${companyId}/revenue-subcategory?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <div className="category-input-container">
      <h2>Enter Revenue Category</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          placeholder="e.g. Product Sales"
        />
        <button type="submit">Next</button>
      </form>
    </div>
  );
};

export default RevenueCategoryInput;

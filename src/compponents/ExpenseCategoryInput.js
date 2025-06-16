// components/ExpenseCategoryInput.js
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import "../compponents/css/ExpenseCategoryInput.css";

const ExpenseCategoryInput = () => {
  const { id: companyId } = useParams();
  const navigate = useNavigate();
  const [categoryName, setCategoryName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        await axios.post(`http://localhost:3500/api/expense/add-category/${companyId.trim()}`, {
            categoryName,
          });
          

    

      // Navigate to subcategory input route with query param
      navigate(`/company/${companyId}/expense-subcategory?category=${categoryName}`);
    } catch (err) {
      console.error("Error saving category:", err);
    }
  };

  return (
    <div className="category-input-container">
      <h2>Add Expense Category</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter Expense Category"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          required
        />
        <button type="submit">Next</button>
      </form>
    </div>
  );
};

export default ExpenseCategoryInput;

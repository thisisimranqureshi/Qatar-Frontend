import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import "../compponents/css/RevenueSubCategory.css";

const RevenueSubCategory = () => {
  const { id: companyId } = useParams();
  const query = new URLSearchParams(useLocation().search);
  const categoryName = query.get('category') || '';

  const [subcategory, setSubcategory] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [expectedBudget, setExpectedBudget] = useState('');
  const [actualBudget, setActualBudget] = useState('');
  const [entries, setEntries] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const res = await axios.get(`http://localhost:3500/api/revenue/subcategories?companyId=${companyId}&categoryName=${categoryName}`);

      const sortedData = res.data.sort((a, b) => {
        const monthMap = {
          Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
          Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
        };

        const getDate = (entry) => new Date(entry.year, monthMap[entry.month]);
        return getDate(b) - getDate(a); // Descending order (most recent first)
      });

      setEntries(sortedData);
    } catch (err) {
      console.error("Failed to fetch entries:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      companyId,
      categoryName,
      subcategory,
      month,
      year,
      expectedBudget: parseFloat(expectedBudget),
      actualBudget: parseFloat(actualBudget),
    };

    try {
      await axios.post(`http://localhost:3500/api/revenue/add-subcategory/${companyId}`, payload);
      fetchEntries(); // Refresh list after save
      setSubcategory('');
      setMonth('');
      setYear('');
      setExpectedBudget('');
      setActualBudget('');
    } catch (err) {
      console.error("Error saving data:", err);
    }
  };

  const paginatedEntries = entries.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);

  return (
    <div className="subcategory-form-container compact">
      <h2>Add Revenue Subcategory</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          className="full-width"
          value={subcategory}
          onChange={(e) => setSubcategory(e.target.value)}
          placeholder="Subcategory Name"
          required
        />

        <div className="input-pair">
          <select value={month} onChange={(e) => setMonth(e.target.value)} required>
            <option value="">Select Month</option>
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <select value={year} onChange={(e) => setYear(e.target.value)} required>
            <option value="">Select Year</option>
            {[2023, 2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div className="input-pair">
          <input
            type="number"
            placeholder="Expected Budget"
            value={expectedBudget}
            onChange={(e) => setExpectedBudget(e.target.value)}
            required
          />

          <input
            type="number"
            placeholder="Actual Budget"
            value={actualBudget}
            onChange={(e) => setActualBudget(e.target.value)}
            required
          />
        </div>

        <button type="submit">Save</button>
      </form>

      <table className="subcategory-table">
        <thead>
          <tr>
            <th>Subcategory</th>
            <th>Month</th>
            <th>Year</th>
            <th>Expected</th>
            <th>Actual</th>
          </tr>
        </thead>
        <tbody>
          {paginatedEntries.map((entry, idx) => (
            <tr key={idx}>
              <td>{entry.subcategory}</td>
              <td>{entry.month}</td>
              <td>{entry.year}</td>
              <td>Rs. {entry.expectedBudget.toLocaleString()}</td>
              <td>Rs. {entry.actualBudget.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        {Array.from({ length: Math.ceil(entries.length / entriesPerPage) }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={currentPage === i + 1 ? 'active' : ''}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RevenueSubCategory;

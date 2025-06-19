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
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [showManualYearInput, setShowManualYearInput] = useState(false);
  const [manualYear, setManualYear] = useState('');

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const res = await axios.get(`http://localhost:3500/api/revenue/subcategories?companyId=${companyId}&categoryName=${categoryName}`);
      const monthMap = {
        Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
        Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
      };
      const sortedData = res.data.sort((a, b) => {
        const dateA = new Date(a.year, monthMap[a.month]);
        const dateB = new Date(b.year, monthMap[b.month]);
        return dateB - dateA; // Most recent first
      });
      setEntries(sortedData);
    } catch (err) {
      console.error("Failed to fetch entries:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalYear = showManualYearInput ? manualYear : year;
    const payload = {
      companyId,
      categoryName,
      subcategory,
      month,
      year: finalYear,
      expectedBudget: parseFloat(expectedBudget),
      actualBudget: parseFloat(actualBudget),
    };

    try {
      await axios.post(`http://localhost:3500/api/revenue/add-subcategory/${companyId}`, payload);
      fetchEntries();
      setSubcategory('');
      setMonth('');
      setYear('');
      setManualYear('');
      setShowManualYearInput(false);
      setExpectedBudget('');
      setActualBudget('');
    } catch (err) {
      console.error("Error saving data:", err);
    }
  };

  const groupBySubcategory = (data) => {
    const groups = {};
    data.forEach(entry => {
      if (!groups[entry.subcategory]) {
        groups[entry.subcategory] = [];
      }
      groups[entry.subcategory].push(entry);
    });
    return groups;
  };

  const uniqueYears = [...new Set(entries.map(e => e.year))];
  const filteredEntries = entries.filter(entry => {
    const matchYear = selectedYear ? entry.year.toString() === selectedYear : true;
    const matchMonth = selectedMonth ? entry.month === selectedMonth : true;
    return matchYear && matchMonth;
  });
  const groupedEntries = groupBySubcategory(filteredEntries);

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
            {months.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          {!showManualYearInput ? (
            <select value={year} onChange={(e) => {
              if (e.target.value === 'custom') {
                setShowManualYearInput(true);
                setYear('');
              } else {
                setYear(e.target.value);
              }
            }} required>
              <option value="">Select Year</option>
              {uniqueYears.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
              <option value="custom">Other (Enter manually)</option>
            </select>
          ) : (
            <input
              type="number"
              value={manualYear}
              onChange={(e) => setManualYear(e.target.value)}
              placeholder="Enter Year"
              required
              className="full-width"
            />
          )}
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

      {uniqueYears.length > 0 && (
        <div className="filter-dropdown-wrapper">
          <select
            className="year-filter-dropdown"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="">Show All Years</option>
            {uniqueYears.map((yr) => (
              <option key={yr} value={yr}>{yr}</option>
            ))}
          </select>

          <select
            className="month-filter-dropdown"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            <option value="">Show All Months</option>
            {months.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      )}

      <div className="subcategory-table-container">
        {Object.keys(groupedEntries).map((subName, idx) => {
          const subEntries = groupedEntries[subName];
          const totalExpected = subEntries.reduce((sum, entry) => sum + entry.expectedBudget, 0);
          const totalActual = subEntries.reduce((sum, entry) => sum + entry.actualBudget, 0);

          return (
            <div key={idx} className="subcategory-table-wrapper">
              <h3 className="subcategory-heading">{subName}</h3>
              <table className="subcategory-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Year</th>
                    <th>Expected</th>
                    <th>Actual</th>
                  </tr>
                </thead>
                <tbody>
                  {subEntries.map((entry, i) => (
                    <tr key={i}>
                      <td>{entry.month}</td>
                      <td>{entry.year}</td>
                      <td>Rs. {entry.expectedBudget.toLocaleString()}</td>
                      <td>Rs. {entry.actualBudget.toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="total-row">
                    <td colSpan="2" style={{ fontWeight: 'bold' }}>Total</td>
                    <td style={{ fontWeight: 'bold' }}>Rs. {totalExpected.toLocaleString()}</td>
                    <td style={{ fontWeight: 'bold' }}>Rs. {totalActual.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RevenueSubCategory;
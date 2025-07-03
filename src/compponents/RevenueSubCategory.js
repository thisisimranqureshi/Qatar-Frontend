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

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3500/api/revenue/subcategories?companyId=${companyId}&categoryName=${categoryName}`
      );
      const monthMap = {
        Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
        Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
      };
      const sorted = res.data.sort((a, b) => {
        const dateA = new Date(a.year, monthMap[a.month]);
        const dateB = new Date(b.year, monthMap[b.month]);
        return dateB - dateA;
      });
      setEntries(sorted);
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
      fetchEntries();
      setSubcategory('');
      setMonth('');
      setYear('');
      setExpectedBudget('');
      setActualBudget('');
    } catch (err) {
      console.error("Error saving data:", err);
    }
  };

  const groupBySubcategory = (data) => {
    const grouped = {};
    data.forEach(entry => {
      if (!grouped[entry.subcategory]) {
        grouped[entry.subcategory] = [];
      }
      grouped[entry.subcategory].push(entry);
    });
    return grouped;
  };

  const uniqueYears = [...new Set(entries.map(e => e.year))];
  const filteredEntries = entries.filter(entry => {
    const matchYear = selectedYear ? entry.year.toString() === selectedYear : true;
    const matchMonth = selectedMonth ? entry.month === selectedMonth : true;
    return matchYear && matchMonth;
  });

  const groupedEntries = groupBySubcategory(filteredEntries);

  return (
    <div className="revenue-subcategory-form-container">
      <h2 className="revenue-category-title">
        Category: {categoryName || 'N/A'}
      </h2>

      <h3>Add Revenue Subcategory</h3>

      <form onSubmit={handleSubmit}>
        <div className="revenue-input-trio">
          <input
            type="text"
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            placeholder="Subcategory Name"
            required
          />
          <select value={month} onChange={(e) => setMonth(e.target.value)} required>
            <option value="">Select Month</option>
            {months.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="Enter Year"
            required
          />
        </div>

        <div className="revenue-input-trio">
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
          <button type="submit">Save</button>
        </div>
      </form>

      {uniqueYears.length > 0 && (
        <div className="revenue-filter-dropdown-wrapper">
          <select
            className="revenue-year-filter-dropdown"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="">Show All Years</option>
            {uniqueYears.map((yr) => (
              <option key={yr} value={yr}>{yr}</option>
            ))}
          </select>

          <select
            className="revenue-month-filter-dropdown"
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

      <div className="revenue-subcategory-table-container">
        {
          Object.entries(groupedEntries).reduce((rows, [name, subEntries], idx, arr) => {
            if (idx % 2 === 0) {
              const second = arr[idx + 1];

              rows.push(
                <div key={idx} className="revenue-subcategory-row">
                  {[
                    [name, subEntries],
                    ...(second ? [second] : [])
                  ].map(([subName, entries], i) => {
                    const totalExpected = entries.reduce((sum, entry) => sum + entry.expectedBudget, 0);
                    const totalActual = entries.reduce((sum, entry) => sum + entry.actualBudget, 0);

                    return (
                      <div key={i} className="revenue-subcategory-table-wrapper">
                        <h3 className="revenue-subcategory-heading">{subName}</h3>
                        <table className="revenue-subcategory-table">
                          <thead>
                            <tr>
                              <th>Month</th>
                              <th>Year</th>
                              <th>Expected</th>
                              <th>Actual</th>
                            </tr>
                          </thead>
                          <tbody>
                            {entries.map((entry, j) => (
                              <tr key={j}>
                                <td>{entry.month}</td>
                                <td>{entry.year}</td>
                                <td>Rs. {entry.expectedBudget.toLocaleString()}</td>
                                <td>Rs. {entry.actualBudget.toLocaleString()}</td>
                              </tr>
                            ))}
                            <tr className="revenue-total-row">
                              <td colSpan="2">Total</td>
                              <td>Rs. {totalExpected.toLocaleString()}</td>
                              <td>Rs. {totalActual.toLocaleString()}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    );
                  })}
                </div>
              );
            }
            return rows;
          }, [])
        }
      </div>

      <div className="revenue-grand-total">
        <h3>Grand Total</h3>
        <table className="revenue-grand-total-table">
          <thead>
            <tr>
              <th>Total Expected revenue</th>
              <th>Total Actual Revenue</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Rs. {filteredEntries.reduce((sum, e) => sum + e.expectedBudget, 0).toLocaleString()}</td>
              <td>Rs. {filteredEntries.reduce((sum, e) => sum + e.actualBudget, 0).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RevenueSubCategory;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './css/Companydetail.css';

const CompanyDetails = () => {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [newEntries, setNewEntries] = useState({});

  useEffect(() => {
    axios.get(`http://localhost:3500/company/${id}`).then(res => {
      setCompany(res.data);
    });
  }, [id]);

  const handleInputChange = (index, field, value, type = 'month') => {
    setNewEntries(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        [type]: {
          ...prev[index]?.[type],
          [field]: value
        }
      }
    }));
  };

  const handleAddEntry = async (index) => {
    const entry = newEntries[index]?.month;
    if (!entry?.month || entry.budget === undefined || entry.expense === undefined)
      return alert("Fill all monthly fields");

    try {
      await axios.post(`http://localhost:3500/company/${id}/update-category`, {
        categoryIndex: index,
        month: entry.month,
        monthlyBudget: Number(entry.budget),
        monthlyExpense: Number(entry.expense)
      });

      const updated = await axios.get(`http://localhost:3500/company/${id}`);
      setCompany(updated.data);
      setNewEntries(prev => ({ ...prev, [index]: { ...prev[index], month: {} } }));
    } catch (err) {
      console.error(err);
      alert("Error adding monthly entry");
    }
  };

  const handleAddYearlyEntry = async (index) => {
    const entry = newEntries[index]?.year;
    if (!entry?.year || entry.budget === undefined || entry.expense === undefined)
      return alert("Fill all yearly fields");

    try {
      await axios.post(`http://localhost:3500/company/${id}/update-category`, {
        categoryIndex: index,
        year: entry.year,
        yearlyBudget: Number(entry.budget),
        yearlyExpense: Number(entry.expense)
      });

      const updated = await axios.get(`http://localhost:3500/company/${id}`);
      setCompany(updated.data);
      setNewEntries(prev => ({ ...prev, [index]: { ...prev[index], year: {} } }));
    } catch (err) {
      console.error(err);
      alert("Error adding yearly entry");
    }
  };

  const handleDelete = async (index, monthKey) => {
    try {
      await axios.post(`http://localhost:3500/company/${id}/delete-month`, {
        categoryIndex: index,
        monthKey
      });
      const updated = await axios.get(`http://localhost:3500/company/${id}`);
      setCompany({ ...updated.data });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteYearly = async (index, yearKey) => {
    try {
      await axios.post(`http://localhost:3500/company/${id}/delete-year`, {
        categoryIndex: index,
        yearKey
      });
      const updated = await axios.get(`http://localhost:3500/company/${id}`);
      setCompany(updated.data);
    } catch (err) {
      console.error(err);
      alert("Error deleting yearly entry");
    }
  };

  const handleUpdate = async (index, monthKey, budget, expense) => {
    try {
      await axios.post(`http://localhost:3500/company/${id}/update-category`, {
        categoryIndex: index,
        month: monthKey,
        monthlyBudget: budget,
        monthlyExpense: expense
      });
      const updated = await axios.get(`http://localhost:3500/company/${id}`);
      setCompany(updated.data);
    } catch (err) {
      console.error(err);
    }
  };

  const getCategoryTotals = (category) => {
    let totalBudget = 0, totalExpense = 0;

    if (category.yearly && typeof category.yearly === 'object') {
      Object.values(category.yearly).forEach(entry => {
        totalBudget += entry.budget || 0;
        totalExpense += entry.expense || 0;
      });
    }

    return { totalBudget, totalExpense };
  };

  const getMonthlyTotals = (category) => {
    let totalBudget = 0, totalExpense = 0;

    if (category.monthly && typeof category.monthly === 'object') {
      Object.values(category.monthly).forEach(entry => {
        totalBudget += entry.budget || 0;
        totalExpense += entry.expense || 0;
      });
    }

    return { totalBudget, totalExpense };
  };

  const getCompanyTotals = () => {
    let totalBudget = 0;
    let totalExpense = 0;

    company.categories.forEach(category => {
      if (category.yearly && typeof category.yearly === 'object') {
        Object.values(category.yearly).forEach(entry => {
          totalBudget += entry.budget || 0;
          totalExpense += entry.expense || 0;
        });
      }
    });

    return { totalBudget, totalExpense };
  };

  if (!company) return <div className="loading">Loading...</div>;

  const { totalBudget, totalExpense } = getCompanyTotals();
  const profit = totalBudget - totalExpense;

  return (
    <div className="details-container">
      <h2>{company.name} - {company.location}</h2>

      <div className="add-category-section">
        <h3>Add New Category</h3>
        <div className="input-group">
          <input
            type="text"
            placeholder="Enter category name"
            value={newEntries.newCategory || ''}
            onChange={(e) =>
              setNewEntries(prev => ({ ...prev, newCategory: e.target.value }))
            }
          />
          <button
            className="add-category-btn"
            onClick={async () => {
              const name = newEntries.newCategory;
              if (!name) return alert("Category name required");

              try {
                await axios.post(`http://localhost:3500/company/${id}/add-category`, { name });
                const updated = await axios.get(`http://localhost:3500/company/${id}`);
                setCompany(updated.data);
                setNewEntries(prev => ({ ...prev, newCategory: '' }));
              } catch (err) {
                console.error(err);
                alert("Error adding category");
              }
            }}
          >
            Add Category
          </button>
        </div>
      </div>

      {company.categories.map((cat, index) => {
        const monthlyEntries = Object.entries(cat.monthly || {});
        const yearlyEntries = Object.entries(cat.yearly || {});
        const yearlyTotals = getCategoryTotals(cat);
        const monthlyTotals = getMonthlyTotals(cat);

        return (
          <div key={index} className="category-box">
            <h3>Category: {cat.name}</h3>

            <table className="budget-table">
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Budget</th>
                  <th>Expense</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {yearlyEntries.map(([year, { budget, expense }], i) => (
                  <tr key={i}>
                    <td>{year}</td>
                    <td>{budget}</td>
                    <td>{expense}</td>
                    <td>
                      <button onClick={() => handleDeleteYearly(index, year)}>Delete</button>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td>
                    <input
                      placeholder="2025"
                      value={newEntries[index]?.year?.year || ''}
                      onChange={(e) => handleInputChange(index, 'year', e.target.value, 'year')}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      placeholder="Budget"
                      value={newEntries[index]?.year?.budget || ''}
                      onChange={(e) => handleInputChange(index, 'budget', e.target.value, 'year')}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      placeholder="Expense"
                      value={newEntries[index]?.year?.expense || ''}
                      onChange={(e) => handleInputChange(index, 'expense', e.target.value, 'year')}
                    />
                  </td>
                  <td>
                    <button onClick={() => handleAddYearlyEntry(index)}>Add Entry</button>
                  </td>
                </tr>
              </tbody>
            </table>

            <table className="budget-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Budget</th>
                  <th>Expense</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {monthlyEntries.map(([month, { budget, expense }], i) => (
                  <tr key={i}>
                    <td>{month}</td>
                    <td>
                      <input
                        type="number"
                        defaultValue={budget}
                        onBlur={(e) => handleUpdate(index, month, Number(e.target.value), expense)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        defaultValue={expense}
                        onBlur={(e) => handleUpdate(index, month, budget, Number(e.target.value))}
                      />
                    </td>
                    <td>
                      <button onClick={() => handleDelete(index, month)}>Delete</button>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td>
                    <input
                      placeholder="2025-June"
                      value={newEntries[index]?.month?.month || ''}
                      onChange={(e) => handleInputChange(index, 'month', e.target.value, 'month')}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      placeholder="Budget"
                      value={newEntries[index]?.month?.budget || ''}
                      onChange={(e) => handleInputChange(index, 'budget', e.target.value, 'month')}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      placeholder="Expense"
                      value={newEntries[index]?.month?.expense || ''}
                      onChange={(e) => handleInputChange(index, 'expense', e.target.value, 'month')}
                    />
                  </td>
                  <td>
                    <button onClick={() => handleAddEntry(index)}>Add Entry</button>
                  </td>
                </tr>
                <tr>
                  <td><strong>Total</strong></td>
                  <td><strong>{monthlyTotals.totalBudget}</strong></td>
                  <td><strong>{monthlyTotals.totalExpense}</strong></td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      })}

      <div className="summary-section">
        <h2>Company Summary</h2>
        <p><strong>Total Budget:</strong> {totalBudget}</p>
        <p><strong>Total Expense:</strong> {totalExpense}</p>
        <p><strong>Profit/Loss:</strong> {profit}</p>
      </div>
    </div>
  );
};

export default CompanyDetails;

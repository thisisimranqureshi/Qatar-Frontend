import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './css/Companydetail.css';

const CompanyDetails = () => {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [newSector, setNewSector] = useState('');
  const [newCategoryInputs, setNewCategoryInputs] = useState({});
  const [newEntries, setNewEntries] = useState({});

  const fetchCompany = async () => {
    const res = await axios.get(`http://localhost:3500/company/${id}`);
    setCompany(res.data);
  };

  useEffect(() => {
    fetchCompany();
  }, [id]);

  const handleAddSector = async () => {
    if (!newSector.trim()) return alert("Sector name required");
    try {
      await axios.post(`http://localhost:3500/company/${id}/add-sector`, { sectorName: newSector });
      await fetchCompany();
      setNewSector('');
    } catch (err) {
      console.error(err);
      alert("Error adding sector");
    }
  };

  const handleAddCategory = async (sectorIndex) => {
    const categoryName = newCategoryInputs[sectorIndex];
    if (!categoryName) return alert("Category name required");
    try {
      await axios.post(`http://localhost:3500/company/${id}/add-category`, {
        sectorIndex,
        categoryName
      });
      await fetchCompany();
      setNewCategoryInputs(prev => ({ ...prev, [sectorIndex]: '' }));
    } catch (err) {
      console.error(err);
      alert("Error adding category");
    }
  };

  const handleInputChange = (sectorIndex, categoryIndex, field, value, type = 'month') => {
    setNewEntries(prev => ({
      ...prev,
      [sectorIndex]: {
        ...prev[sectorIndex],
        [categoryIndex]: {
          ...prev[sectorIndex]?.[categoryIndex],
          [type]: {
            ...prev[sectorIndex]?.[categoryIndex]?.[type],
            [field]: value,
          },
        },
      },
    }));
  };

  const handleAddEntry = async (sectorIndex, categoryIndex, type = 'month') => {
    const entry = newEntries[sectorIndex]?.[categoryIndex]?.[type];
    const period = type === 'month' ? entry?.month : entry?.year;

    if (!period || entry?.budget === undefined || entry?.expense === undefined)
      return alert(`Fill all ${type} fields`);

    const route =
      type === 'month'
        ? '/update-cat'
        : '/update-yearly-category';

    try {
      await axios.post(`http://localhost:3500/company/${id}${route}`, {
        sectorIndex,
        categoryIndex,
        [type === 'month' ? 'month' : 'month']: period,
        [`${type}lyBudget`]: Number(entry.budget),
        [`${type}lyExpense`]: Number(entry.expense),
      });

      await fetchCompany();

      setNewEntries(prev => ({
        ...prev,
        [sectorIndex]: {
          ...prev[sectorIndex],
          [categoryIndex]: {
            ...prev[sectorIndex]?.[categoryIndex],
            [type]: {},
          },
        },
      }));
    } catch (err) {
      console.error(`Error adding ${type}ly entry`, err);
      alert(`Error adding ${type}ly entry`);
    }
  };

  const getCompanyTotals = () => {
    let totalBudget = 0;
    let totalExpense = 0;
    company?.sectors?.forEach(sector => {
      sector.categories?.forEach(cat => {
        Object.values(cat.yearly || {}).forEach(entry => {
          totalBudget += entry.budget || 0;
          totalExpense += entry.expense || 0;
        });
      });
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
        <h3>Add New Sector</h3>
        <div className="input-group">
          <input
            type="text"
            placeholder="Enter sector name"
            value={newSector}
            onChange={(e) => setNewSector(e.target.value)}
          />
          <button className="add-category-btn" onClick={handleAddSector}>
            Add Sector
          </button>
        </div>
      </div>

      {company.sectors?.map((sector, sIdx) => (
        <div key={sIdx} className="sector-box">
          <h3>Sector: {sector.sectorName}</h3>

          <div className="input-group">
            <input
              type="text"
              placeholder="Add category name"
              value={newCategoryInputs[sIdx] || ''}
              onChange={(e) =>
                setNewCategoryInputs(prev => ({ ...prev, [sIdx]: e.target.value }))
              }
            />
            <button onClick={() => handleAddCategory(sIdx)}>Add Category</button>
          </div>

          {sector.categories?.map((cat, catIndex) => (
            <div key={catIndex} className="category-box">
              <h4>Category: {cat.name}</h4>

              <div className="input-group">
                <input
                  type="text"
                  placeholder="Month"
                  value={newEntries[sIdx]?.[catIndex]?.month?.month || ''}
                  onChange={(e) =>
                    handleInputChange(sIdx, catIndex, 'month', e.target.value, 'month')
                  }
                />
                <input
                  type="number"
                  placeholder="Monthly Budget"
                  value={newEntries[sIdx]?.[catIndex]?.month?.budget || ''}
                  onChange={(e) =>
                    handleInputChange(sIdx, catIndex, 'budget', e.target.value, 'month')
                  }
                />
                <input
                  type="number"
                  placeholder="Monthly Expense"
                  value={newEntries[sIdx]?.[catIndex]?.month?.expense || ''}
                  onChange={(e) =>
                    handleInputChange(sIdx, catIndex, 'expense', e.target.value, 'month')
                  }
                />
                <button onClick={() => handleAddEntry(sIdx, catIndex, 'month')}>Add Monthly</button>
              </div>

              <div className="input-group">
                <input
                  type="text"
                  placeholder="Year"
                  value={newEntries[sIdx]?.[catIndex]?.year?.year || ''}
                  onChange={(e) =>
                    handleInputChange(sIdx, catIndex, 'year', e.target.value, 'year')
                  }
                />
                <input
                  type="number"
                  placeholder="Yearly Budget"
                  value={newEntries[sIdx]?.[catIndex]?.year?.budget || ''}
                  onChange={(e) =>
                    handleInputChange(sIdx, catIndex, 'budget', e.target.value, 'year')
                  }
                />
                <input
                  type="number"
                  placeholder="Yearly Expense"
                  value={newEntries[sIdx]?.[catIndex]?.year?.expense || ''}
                  onChange={(e) =>
                    handleInputChange(sIdx, catIndex, 'expense', e.target.value, 'year')
                  }
                />
                <button onClick={() => handleAddEntry(sIdx, catIndex, 'year')}>Add Yearly</button>
              </div>

              <div className="saved-entries">
                <h5>Saved Monthly Entries:</h5>
                {Object.entries(cat.monthly || {}).map(([month, val]) => (
                  <div key={month}>
                    {month}: Budget = {val.budget}, Expense = {val.expense}
                  </div>
                ))}

                <h5>Saved Yearly Entries:</h5>
                {Object.entries(cat.yearly || {}).map(([year, val]) => (
                  <div key={year}>
                    {year}: Budget = {val.budget}, Expense = {val.expense}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}

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

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProfitLossBarChart from './charts/ProfitLossBarChart';
import "../compponents/css/Dashboard.css";

const Dashboard = () => {
  const [stage, setStage] = useState("managers");
  const [managers, setManagers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [selectedManager, setSelectedManager] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [activeTab, setActiveTab] = useState({});

  // ✅ Fixed: use correct localStorage key
  const userRole = localStorage.getItem("userRole");
  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    if (!userRole || !userEmail) {
      console.error("Missing userRole or userEmail");
      return;
    }

    if (userRole === "ceo") {
      axios.get('http://localhost:3500/api/users')
        .then(res => setManagers(res.data))
        .catch(err => console.error(err));
    } else {
      axios.get('http://localhost:3500/companies', {
        params: {
          userEmail,
          role: userRole
        }
      }).then(async res => {
        const rawCompanies = res.data;
        const detailedCompanies = await Promise.all(
          rawCompanies.map(async (c) => {
            const full = await axios.get(`http://localhost:3500/company/${c._id}`);
            return full.data;
          })
        );
        setCompanies(detailedCompanies);
        setStage("companies");
      }).catch(err => console.error("Error loading manager companies:", err));
    }
  }, [userEmail, userRole]);

  const handleManagerClick = async (manager) => {
    setSelectedManager(manager);
    setCompanies([]);
    setCategoryData([]);

    try {
      const res = await axios.get(`http://localhost:3500/companies`, {
        params: {
          userEmail: manager.email,
          role: 'manager'
        }
      });

      const rawCompanies = res.data;

      const detailedCompanies = await Promise.all(
        rawCompanies.map(async (c) => {
          const full = await axios.get(`http://localhost:3500/company/${c._id}`);
          return full.data;
        })
      );

      setCompanies(detailedCompanies);
      setStage("companies");
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompanyClick = (company) => {
    setSelectedCompany(company);

    const revenue = company.revenueEntries || [];
    const expense = company.expenseEntries || [];

    const categoriesSet = new Set([
      ...revenue.map(entry => entry.categoryName),
      ...expense.map(entry => entry.categoryName),
    ]);

    const mergedCategoryData = Array.from(categoriesSet).map(category => ({
      categoryName: category,
      revenueEntries: revenue.filter(e => e.categoryName === category),
      expenseEntries: expense.filter(e => e.categoryName === category)
    }));

    setCategoryData(mergedCategoryData);
    setStage("categories");
  };

  const handleBack = () => {
    if (stage === "categories") {
      setCategoryData([]);
      setSelectedCompany(null);
      setStage("companies");
    } else if (stage === "companies" && userRole === "ceo") {
      setCompanies([]);
      setSelectedManager(null);
      setStage("managers");
    }
  };

  const toggleTab = (category, tab) => {
    setActiveTab(prev => ({ ...prev, [category]: tab }));
  };

  const totalExpectedRevenue = categoryData.reduce((acc, cat) =>
    acc + cat.revenueEntries.reduce((sum, e) => sum + Number(e.expectedBudget || 0), 0), 0);
  const totalActualRevenue = categoryData.reduce((acc, cat) =>
    acc + cat.revenueEntries.reduce((sum, e) => sum + Number(e.actualBudget || 0), 0), 0);
  const totalExpectedExpense = categoryData.reduce((acc, cat) =>
    acc + cat.expenseEntries.reduce((sum, e) =>
      sum + (e.subcategories?.reduce((s, sub) => s + Number(sub.expectedBudget || 0), 0) || 0), 0), 0);
  const totalActualExpense = categoryData.reduce((acc, cat) =>
    acc + cat.expenseEntries.reduce((sum, e) =>
      sum + (e.subcategories?.reduce((s, sub) => s + Number(sub.actualBudget || 0), 0) || 0), 0), 0);

  const expectedProfitLoss = totalExpectedRevenue - totalExpectedExpense;
  const actualProfitLoss = totalActualRevenue - totalActualExpense;

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">{userRole === "ceo" ? "CEO Dashboard" : "Your Companies"}</h2>

      {(userRole === "ceo" && stage !== 'managers') || (userRole !== "ceo" && stage !== 'companies') ? (
        <button className="back-button" onClick={handleBack}>Back</button>
      ) : null}

      {/* CEO Stage: View Groups */}
      {stage === "managers" && userRole === "ceo" && (
        <div className="card-list">
          {managers.map(manager => (
            <div className="card" key={manager._id} onClick={() => handleManagerClick(manager)}>
              <h4>{manager.group}</h4>
              <p>{manager.name}</p>
            </div>
          ))}
        </div>
      )}

      {/* Company Cards */}
      {stage === "companies" && (
        <>
          <div className="card-list">
            {companies.map(company => (
              <div className="card" key={company._id} onClick={() => handleCompanyClick(company)}>
                <h4>{company.name}</h4>
              </div>
            ))}
          </div>

          {companies.length === 0 && userRole === "ceo" && (
            <p style={{ textAlign: 'center', marginTop: '40px' }}>👈 Click a group to view its companies.</p>
          )}

          <div style={{ width: '100%', maxWidth: '800px', margin: '30px auto' }}>
            <ProfitLossBarChart companies={companies} />
          </div>
        </>
      )}

      {/* Category View */}
      {stage === "categories" && (
        <>
          <div className="totals-box">
            <h3>Grand Totals</h3>
            <p><strong>Total Expected Revenue:</strong> {totalExpectedRevenue}</p>
            <p><strong>Total Actual Revenue:</strong> {totalActualRevenue}</p>
            <p><strong>Total Expected Expense:</strong> {totalExpectedExpense}</p>
            <p><strong>Total Actual Expense:</strong> {totalActualExpense}</p>
            <p><strong>Profit / Loss (Expected):</strong> {expectedProfitLoss}</p>
            <p><strong>Profit / Loss (Actual):</strong> {actualProfitLoss}</p>
          </div>

          <div className="category-box-wrapper">
            {categoryData.map((cat, idx) => (
              <div key={idx} className="category-combined-box">
                <h3>{cat.categoryName}</h3>

                <div className="tab-buttons">
                  <button
                    className={activeTab[cat.categoryName] === 'revenue' ? 'tab-active' : ''}
                    onClick={() => toggleTab(cat.categoryName, 'revenue')}
                  >
                    Revenue
                  </button>
                  <button
                    className={activeTab[cat.categoryName] === 'expense' ? 'tab-active' : ''}
                    onClick={() => toggleTab(cat.categoryName, 'expense')}
                  >
                    Expense
                  </button>
                </div>

                {/* Revenue Table */}
                {activeTab[cat.categoryName] !== 'expense' && (
                  <div className="subtable">
                    <table>
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
                        {cat.revenueEntries.map((entry, i) => (
                          <tr key={i}>
                            <td>{entry.subcategory}</td>
                            <td>{entry.month}</td>
                            <td>{entry.year}</td>
                            <td>{entry.expectedBudget}</td>
                            <td>{entry.actualBudget}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Expense Table */}
                {activeTab[cat.categoryName] === 'expense' && (
                  <div className="subtable">
                    <table>
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
                        {cat.expenseEntries.flatMap(e =>
                          (e.subcategories || []).map((sub, i) => (
                            <tr key={i}>
                              <td>{sub.subcategory}</td>
                              <td>{sub.month}</td>
                              <td>{sub.year}</td>
                              <td>{sub.expectedBudget}</td>
                              <td>{sub.actualBudget}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;

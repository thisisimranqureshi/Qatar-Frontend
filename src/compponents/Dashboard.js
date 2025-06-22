import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProfitLossBarChart from './charts/ProfitLossBarChart';
import GroupMonthlySummary from './charts/GroupMonthlySummary';
import GroupYearlySummary from './charts/GroupYearlySummary';
import GroupProfitLossBarChart from './charts/GroupProfitLossBarChart';
import "../compponents/css/Dashboard.css";

const Dashboard = () => {
  const [stage, setStage] = useState("managers");
  const [managers, setManagers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [selectedManager, setSelectedManager] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [activeTab, setActiveTab] = useState({});
  const [groupProfitLossData, setGroupProfitLossData] = useState([]);

  const userRole = localStorage.getItem("userRole");
  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    if (!userRole || !userEmail) {
      console.error("Missing userRole or userEmail");
      return;
    }

    if (userRole === "ceo") {
      axios.get('http://localhost:3500/api/users')
        .then(async res => {
          const mgrs = res.data;
          setManagers(mgrs);

          // 🔄 Fetch company data for each manager and calculate group totals
          const groupData = await Promise.all(mgrs.map(async m => {
            const res = await axios.get('http://localhost:3500/companies', {
              params: { userEmail: m.email, role: 'manager' }
            });

            const detailed = await Promise.all(res.data.map(async c => {
              const { data } = await axios.get(`http://localhost:3500/company/${c._id}`);
              return data;
            }));

            const revenue = detailed.flatMap(c => c.revenueEntries || []);
            const expenses = detailed.flatMap(c => c.expenseEntries || []);
            const subExpenses = expenses.flatMap(e => e.subcategories || []);

            const totalRev = revenue.reduce((sum, r) => sum + (+r.actualBudget || 0), 0);
            const totalExp = subExpenses.reduce((sum, e) => sum + (+e.actualBudget || 0), 0);

            return {
              group: m.group,
              revenue: totalRev,
              expense: totalExp,
              profit: totalRev - totalExp
            };
          }));

          setGroupProfitLossData(groupData);
        })
        .catch(err => console.error(err));
    } else {
      axios.get('http://localhost:3500/companies', { params: { userEmail, role: userRole } })
        .then(async res => {
          const raw = res.data;
          const detailed = await Promise.all(raw.map(async c => {
            const { data } = await axios.get(`http://localhost:3500/company/${c._id}`);
            return data;
          }));
          setCompanies(detailed);
          setStage("companies");
        })
        .catch(err => console.error(err));
    }
  }, [userEmail, userRole]);

  const handleManagerClick = async manager => {
    setSelectedManager(manager);
    setCompanies([]);
    setCategoryData([]);
    try {
      const res = await axios.get('http://localhost:3500/companies', {
        params: { userEmail: manager.email, role: 'manager' }
      });
      const raw = res.data;
      const detailed = await Promise.all(raw.map(async c => {
        const { data } = await axios.get(`http://localhost:3500/company/${c._id}`);
        return data;
      }));
      setCompanies(detailed);
      setStage("companies");
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompanyClick = company => {
    setSelectedCompany(company);
    const rev = company.revenueEntries || [];
    const exp = company.expenseEntries || [];
    const cats = [...new Set([...rev.map(e => e.categoryName), ...exp.map(e => e.categoryName)])];
    const merged = cats.map(cat => ({
      categoryName: cat,
      revenueEntries: rev.filter(e => e.categoryName === cat),
      expenseEntries: exp.filter(e => e.categoryName === cat),
    }));
    setCategoryData(merged);
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

  const toggleTab = (category, tab) =>
    setActiveTab(prev => ({ ...prev, [category]: tab }));

  const totals = {
    expectedRevenue: 0,
    actualRevenue: 0,
    expectedExpense: 0,
    actualExpense: 0,
  };

  categoryData.forEach(cat => {
    cat.revenueEntries.forEach(e => {
      totals.expectedRevenue += +e.expectedBudget || 0;
      totals.actualRevenue += +e.actualBudget || 0;
    });
    cat.expenseEntries.forEach(e => {
      (e.subcategories || []).forEach(s => {
        totals.expectedExpense += +s.expectedBudget || 0;
        totals.actualExpense += +s.actualBudget || 0;
      });
    });
  });

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">
        {userRole === "ceo" ? "Dashboard" : "Your Companies"}
      </h2>

      {((userRole === "ceo" && stage !== 'managers') ||
        (userRole !== "ceo" && stage !== 'companies')) && (
        <button className="back-button" onClick={handleBack}>Back</button>
      )}

      {/* 🔹 GROUP (CEO) STAGE */}
      {stage === "managers" && userRole === "ceo" && (
        <>
          <div className="card-list">
            {managers.map(m => (
              <div className="card" key={m._id} onClick={() => handleManagerClick(m)}>
                <h4>{m.group}</h4>
                <p>{m.name}</p>
              </div>
            ))}
          </div>

          {groupProfitLossData.length > 0 && (
            <div style={{ margin: '40px auto', maxWidth: 900 }}>
              <h3 style={{ textAlign: 'center' }}>Group-wise Profit & Loss</h3>
              <GroupProfitLossBarChart data={groupProfitLossData} />
            </div>
          )}
        </>
      )}

      {/* 🔹 COMPANY STAGE */}
      {stage === "companies" && (
        <>
          <div className="card-list">
            {companies.map(comp => (
              <div className="card" key={comp._id} onClick={() => handleCompanyClick(comp)}>
                <h4>{comp.name}</h4>
              </div>
            ))}
          </div>

          {companies.length === 0 && userRole === "ceo" && (
            <p style={{ textAlign: 'center', marginTop: 40 }}>
              👈 Click a group to view its companies.
            </p>
          )}

          <div style={{ margin: '30px auto', maxWidth: 800 }}>
            <ProfitLossBarChart companies={companies} />
          </div>

          <div style={{ margin: '30px auto', maxWidth: 800 }}>
            <GroupMonthlySummary companies={companies} />
          </div>

          <div style={{ margin: '30px auto', maxWidth: 800 }}>
            <GroupYearlySummary companies={companies} />
          </div>
        </>
      )}

      {/* 🔹 CATEGORY STAGE */}
      {stage === "categories" && (
        <>
          <div className="totals-box">
            <h3>Grand Totals</h3>
            <p><strong>Total Expected Revenue:</strong> {totals.expectedRevenue}</p>
            <p><strong>Total Actual Revenue:</strong> {totals.actualRevenue}</p>
            <p><strong>Total Expected Expense:</strong> {totals.expectedExpense}</p>
            <p><strong>Total Actual Expense:</strong> {totals.actualExpense}</p>
            <p><strong>Profit/Loss (Expected):</strong> {totals.expectedRevenue - totals.expectedExpense}</p>
            <p><strong>Profit/Loss (Actual):</strong> {totals.actualRevenue - totals.actualExpense}</p>
          </div>

          <div className="category-box-wrapper">
            {categoryData.map((cat, idx) => (
              <div key={idx} className="category-combined-box">
                <h3>{cat.categoryName}</h3>
                <div className="tab-buttons">
                  {['revenue','expense'].map(tab => (
                    <button
                      key={tab}
                      className={activeTab[cat.categoryName] === tab ? 'tab-active' : ''}
                      onClick={() => toggleTab(cat.categoryName, tab)}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Tables */}
                {!activeTab[cat.categoryName] || activeTab[cat.categoryName] === 'revenue' ? (
                  <div className="subtable">
                    <table><thead><tr>
                      <th>Subcategory</th><th>Month</th><th>Year</th><th>Expected</th><th>Actual</th>
                    </tr></thead>
                    <tbody>
                      {cat.revenueEntries.map((e,i) => (
                        <tr key={i}>
                          <td>{e.subcategory}</td><td>{e.month}</td>
                          <td>{e.year}</td><td>{e.expectedBudget}</td><td>{e.actualBudget}</td>
                        </tr>
                      ))}
                    </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="subtable">
                    <table><thead><tr>
                      <th>Subcategory</th><th>Month</th><th>Year</th><th>Expected</th><th>Actual</th>
                    </tr></thead>
                    <tbody>
                      {cat.expenseEntries.flatMap((e) => 
                        (e.subcategories || []).map((s,i) => (
                          <tr key={i}>
                            <td>{s.subcategory}</td><td>{s.month}</td>
                            <td>{s.year}</td><td>{s.expectedBudget}</td><td>{s.actualBudget}</td>
                          </tr>
                      )))}
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

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProfitLossBarChart from './charts/ProfitLossBarChart';
import GroupMonthlySummary from './charts/GroupMonthlySummary';
import GroupYearlySummary from './charts/GroupYearlySummary';
import GroupProfitLossBarChart from './charts/GroupProfitLossBarChart';
import TotalRevenue from './charts/Totalrevenue';
import TopCompaniesPieChart from './charts/TopCompaniesPiecharts';
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
  const [totalRevenueByYear, setTotalRevenueByYear] = useState([]);
  const [topCompaniesPieData, setTopCompaniesPieData] = useState([]);

  const userRole = localStorage.getItem("userRole");
  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    if (!userRole || !userEmail) return;

    if (userRole === "ceo" || userRole === "admin") {
      axios.get('http://localhost:3500/api/users')
        .then(async res => {
          const mgrs = res.data.filter(u => u.role === 'manager');
          setManagers(mgrs);

          let allRevenueEntries = [];
          let allCompanies = [];

          const groupData = await Promise.all(
            mgrs.map(async (m) => {
              const res = await axios.get('http://localhost:3500/companies', {
                params: { userEmail: m.email, role: 'manager' }
              });

              const detailed = await Promise.all(
                res.data.map(async (c) => {
                  const { data } = await axios.get(`http://localhost:3500/company/${c._id}`);
                  return data;
                })
              );

              allCompanies.push(...detailed);

              const revenue = detailed.flatMap(c => c.revenueEntries || []);
              allRevenueEntries.push(...revenue);

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
            })
          );

          setGroupProfitLossData(groupData);

          const revenueByYear = {};
          allRevenueEntries.forEach(entry => {
            const year = entry.year;
            if (year) {
              if (!revenueByYear[year]) revenueByYear[year] = 0;
              revenueByYear[year] += Number(entry.actualBudget || 0);
            }
          });

          const chartData = Object.entries(revenueByYear)
            .map(([year, totalRevenue]) => ({
              name: year,
              actual: totalRevenue
            }))
            .sort((a, b) => Number(a.name) - Number(b.name));

          setTotalRevenueByYear(chartData);

          // ✅ Prepare data for Top Companies Pie Chart
          const companyProfits = allCompanies.map((c) => {
            const totalRev = (c.revenueEntries || []).reduce(
              (sum, e) => sum + (+e.actualBudget || 0), 0);
            const totalExp = (c.expenseEntries || [])
              .flatMap(e => e.subcategories || [])
              .reduce((sum, s) => sum + (+s.actualBudget || 0), 0);
          
            return {
              companyName: c.name,
              profit: totalRev - totalExp,
            };
          });
          
          // ✅ Only include companies with positive profit
          const top5 = companyProfits
            .filter(c => c.profit > 0)
            .sort((a, b) => b.profit - a.profit)
            .slice(0, 5);
          
          setTopCompaniesPieData(top5);
          
        })
        .catch(err => console.error(err));
    } else {
      axios.get('http://localhost:3500/companies', {
        params: { userEmail, role: userRole }
      })
        .then(async res => {
          const raw = res.data;
          const detailed = await Promise.all(
            raw.map(async c => {
              const { data } = await axios.get(`http://localhost:3500/company/${c._id}`);
              return data;
            })
          );
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
      const detailed = await Promise.all(
        res.data.map(async c => {
          const { data } = await axios.get(`http://localhost:3500/company/${c._id}`);
          return data;
        })
      );
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
    } else if (stage === "companies" && (userRole === "ceo" || userRole === "admin")) {
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

  const companyProfitLossData = companies.map((company) => {
    const totalActualRevenue = (company.revenueEntries || []).reduce(
      (sum, e) => sum + (+e.actualBudget || 0), 0);
    const totalActualExpense = (company.expenseEntries || [])
      .flatMap(e => e.subcategories || [])
      .reduce((sum, s) => sum + (+s.actualBudget || 0), 0);

    return {
      companyName: company.name,
      profit: totalActualRevenue - totalActualExpense,
    };
  });

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">
        {(userRole === "ceo" || userRole === "admin") ? "Dashboard" : "Your Companies"}
      </h2>

      {((userRole === "ceo" || userRole === "admin") && stage !== 'managers') ||
        (userRole !== "ceo" && userRole !== "admin" && stage !== 'companies') ? (
        <button className="back-button" onClick={handleBack}>Back</button>
      ) : null}

      {stage === "managers" && (userRole === "ceo" || userRole === "admin") && (
        <>
          <div className="card-list">
            {managers.map(m => (
              <div className="card" key={m._id} onClick={() => handleManagerClick(m)}>
                <h4>{m.group}</h4>
                <p>{m.name}</p>
              </div>
            ))}
          </div>

          {(groupProfitLossData.length > 0 && totalRevenueByYear.length > 0) && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '20px',
              margin: '40px auto',
              maxWidth: 1000,
            }}>
              <div style={{ flex: '1 1 45%', minWidth: 300 }}>
                <h4 style={{ textAlign: 'center', marginBottom: 10 }}>Group Profit & Loss</h4>
                <GroupProfitLossBarChart data={groupProfitLossData} small />
              </div>
              <div style={{ flex: '1 1 45%', minWidth: 300 }}>
                <h4 style={{ textAlign: 'center', marginBottom: 10 }}>Total Revenue (Yearly)</h4>
                <TotalRevenue data={totalRevenueByYear} small />
              </div>
            </div>
          )}

          {topCompaniesPieData.length > 0 && (
            <div style={{ marginTop: 40, maxWidth: 600, marginLeft: "auto", marginRight: "auto" }}>
              <h4 style={{ textAlign: 'center', marginBottom: 10 }}>
                Top 5 Companies by Profit/Loss
              </h4>
              <TopCompaniesPieChart data={topCompaniesPieData} />
            </div>
          )}
        </>
      )}

      {stage === "companies" && (
        <>
          <div className="card-list">
            {companies.map(comp => (
              <div className="card" key={comp._id} onClick={() => handleCompanyClick(comp)}>
                <h4>{comp.name}</h4>
              </div>
            ))}
          </div>

          {companies.length === 0 && (userRole === "ceo" || userRole === "admin") && (
            <p style={{ textAlign: 'center', marginTop: 40 }}>
              👈 Click a group to view its companies.
            </p>
          )}

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px',
            marginTop: 30,
          }}>
            <div style={{ flex: '1 1 45%', minWidth: 300 }}>
              <h4 style={{ textAlign: 'center', marginBottom: 10 }}>Profit/Loss by Company</h4>
              <ProfitLossBarChart companies={companies} />
            </div>
            <div style={{ flex: '1 1 45%', minWidth: 300 }}>
              <h4 style={{ textAlign: 'center', marginBottom: 10 }}>Top 5 Companies (Profit/Loss)</h4>
              <TopCompaniesPieChart data={companyProfitLossData} />
            </div>
          </div>

          <div className="dashboard-chart-row">
            <div className="dashboard-chart-box">
              <GroupMonthlySummary companies={companies} />
            </div>
            <div className="dashboard-chart-box">
              <GroupYearlySummary companies={companies} />
            </div>
          </div>
        </>
      )}

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
                  {['revenue', 'expense'].map(tab => (
                    <button
                      key={tab}
                      className={activeTab[cat.categoryName] === tab ? 'tab-active' : ''}
                      onClick={() => toggleTab(cat.categoryName, tab)}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>

                {!activeTab[cat.categoryName] || activeTab[cat.categoryName] === 'revenue' ? (
                  <div className="subtable">
                    <table><thead><tr>
                      <th>Subcategory</th><th>Month</th><th>Year</th><th>Expected</th><th>Actual</th>
                    </tr></thead>
                      <tbody>
                        {cat.revenueEntries.map((e, i) => (
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
                          (e.subcategories || []).map((s, i) => (
                            <tr key={i}>
                              <td>{s.subcategory}</td><td>{s.month}</td>
                              <td>{s.year}</td><td>{s.expectedBudget}</td><td>{s.actualBudget}</td>
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

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import '../compponents/css/Dashboard.css';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#00C49F'];

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [categoryComparison, setCategoryComparison] = useState([]);
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [companySummaries, setCompanySummaries] = useState([]);

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    const role = localStorage.getItem("userRole");

    if (email && role) {
      axios.get(`http://localhost:3500/dashboard?userEmail=${email}&role=${role}`)
        .then(res => {
          setData(res.data.graphData);
          setTotalBudget(res.data.totalBudget);
          setTotalExpense(res.data.totalExpense);
          setCompanySummaries(res.data.companySummaries);
        })
        .catch(err => console.error("Dashboard error:", err));

      axios.get(`http://localhost:3500/category-comparison?userEmail=${email}&role=${role}`)
        .then(res => {
          setCategoryComparison(res.data);
        })
        .catch(err => console.error("Category comparison error:", err));
    }
  }, []);

  const chartWidth = Math.max(data.length * 80, 600);
  const categoryChartWidth = Math.max(categoryComparison.length * 80, 600);

  return (
    <div className="dashboard-container">
      {/* Summary Cards */}
      <div className="card-group">
        <div className="card-content">
          <h2>Total Budget</h2>
          <p className="text-green-600">Rs. {(totalBudget || 0).toLocaleString()}</p>
          <p className="text-red-600">Rs. {(totalExpense || 0).toLocaleString()}</p>
          <p className={(totalBudget - totalExpense >= 0 ? 'text-green-700' : 'text-red-700')}>
            Rs. {((totalBudget || 0) - (totalExpense || 0)).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Yearly Budget vs Expense Chart */}
      <div className="bar-chart-container">
        <h3 className="chart-title">Yearly Budget vs Expense</h3>
        <div className="chart-scroll-wrapper">
          <div style={{ minWidth: '600px', width: `${chartWidth}px` }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="budget" fill="#8884d8" name="Budget" />
                <Bar dataKey="expense" fill="#82ca9d" name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Pie Chart for Company Budget Distribution */}
      <div className="pie-chart-container">
        <h3 className="chart-title">Budget Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={companySummaries}
              dataKey="budget"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label
            >
              {companySummaries.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Category-wise Budget vs Expense */}
      <div className="bar-chart-container">
        <h3 className="chart-title">Category-wise Yearly Budget vs Expense</h3>
        {categoryComparison.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '1rem', color: '#999' }}>
            No category data available
          </p>
        ) : (
          <div className="chart-scroll-wrapper">
            <div style={{ minWidth: '600px', width: `${categoryChartWidth}px` }}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryComparison}>
                  <XAxis dataKey="categoryName" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="yearlyBudget" fill="#ffc658" name="Yearly Budget" />
                  <Bar dataKey="yearlyExpense" fill="#ff8042" name="Yearly Expense" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

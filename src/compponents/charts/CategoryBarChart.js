// components/charts/CompanyProfitBarChart.js
import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

const CompanyProfitBarChart = ({ companies }) => {
  const chartData = companies.map(company => {
    const totalExpectedRevenue = company.revenueEntries?.reduce((acc, e) => acc + Number(e.expectedBudget || 0), 0) || 0;
    const totalActualRevenue = company.revenueEntries?.reduce((acc, e) => acc + Number(e.actualBudget || 0), 0) || 0;

    const totalExpectedExpense = company.expenseEntries?.reduce((acc, e) =>
      acc + (e.subcategories?.reduce((sum, sub) => sum + Number(sub.expectedBudget || 0), 0) || 0), 0) || 0;

    const totalActualExpense = company.expenseEntries?.reduce((acc, e) =>
      acc + (e.subcategories?.reduce((sum, sub) => sum + Number(sub.actualBudget || 0), 0) || 0), 0) || 0;

    return {
      name: company.name,
      ExpectedProfit: totalExpectedRevenue - totalExpectedExpense,
      ActualProfit: totalActualRevenue - totalActualExpense,
    };
  });

  return (
    <div style={{ width: '100%', height: 400, marginTop: 30 }}>
      <h3 style={{ textAlign: 'center', color: '#00C49F' }}>Company-wise Profit / Loss</h3>
      <ResponsiveContainer>
        <BarChart data={chartData}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="ExpectedProfit" fill="#8884d8" />
          <Bar dataKey="ActualProfit" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CompanyProfitBarChart;

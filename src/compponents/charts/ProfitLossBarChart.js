// src/compponents/charts/ProfitLossBarChart.js
import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from 'recharts';

const ProfitLossBarChart = ({ companies }) => {
  const data = companies.map(company => {
    const expectedRevenue = company.revenueEntries?.reduce((acc, e) => acc + Number(e.expectedBudget || 0), 0) || 0;
    const actualRevenue = company.revenueEntries?.reduce((acc, e) => acc + Number(e.actualBudget || 0), 0) || 0;

    const expectedExpense = company.expenseEntries?.reduce((acc, e) => {
      return acc + (e.subcategories?.reduce((sum, sub) => sum + Number(sub.expectedBudget || 0), 0) || 0);
    }, 0) || 0;

    const actualExpense = company.expenseEntries?.reduce((acc, e) => {
      return acc + (e.subcategories?.reduce((sum, sub) => sum + Number(sub.actualBudget || 0), 0) || 0);
    }, 0) || 0;

    return {
      name: company.name,
      actualProfitLoss: actualRevenue - actualExpense
    };
  });

  return (
    <div className="chart-container">
      <h3 className="chart-title">Company Profit/Loss</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="actualProfitLoss" fill="#00C49F" barSize={35} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProfitLossBarChart;

// src/compponents/charts/ProfitLossBarChart.js
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const ProfitLossBarChart = ({ companies }) => {
  const data = companies.map(company => {
    const expectedRevenue = company.revenueEntries?.reduce(
      (acc, e) => acc + Number(e.expectedBudget || 0), 0
    ) || 0;

    const actualRevenue = company.revenueEntries?.reduce(
      (acc, e) => acc + Number(e.actualBudget || 0), 0
    ) || 0;

    const expectedExpense = company.expenseEntries?.reduce((acc, e) => {
      return acc + (e.subcategories?.reduce(
        (sum, sub) => sum + Number(sub.expectedBudget || 0), 0
      ) || 0);
    }, 0) || 0;

    const actualExpense = company.expenseEntries?.reduce((acc, e) => {
      return acc + (e.subcategories?.reduce(
        (sum, sub) => sum + Number(sub.actualBudget || 0), 0
      ) || 0);
    }, 0) || 0;

    return {
      name: company.name,
      actualProfitLoss: actualRevenue - actualExpense
    };
  });

  return (
    <div style={{ width: '100%', height: 300, marginTop: 20 }}>
      <h3 style={{ textAlign: 'center' }}>Company Profit/Loss</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 20, left: 10, bottom: 60 }}
          barCategoryGap={20}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            angle={-30}
            textAnchor="end"
            interval={0}
            height={60}
            style={{ fontSize: 12 }}
          />
          <YAxis style={{ fontSize: 12 }} />
          <Tooltip formatter={(value) => `PKR ${value.toLocaleString()}`} />
          <Legend />
          <Bar dataKey="actualProfitLoss" fill="#00C49F" barSize={30} name="Profit / Loss" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProfitLossBarChart;

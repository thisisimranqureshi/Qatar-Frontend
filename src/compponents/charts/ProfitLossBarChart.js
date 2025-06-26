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
  Cell,
} from 'recharts';

const ProfitLossBarChart = ({ companies }) => {
  const data = companies.map(company => {
    const actualRevenue = company.revenueEntries?.reduce(
      (acc, e) => acc + Number(e.actualBudget || 0), 0
    ) || 0;

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
    <div style={{ width: '100%', maxWidth: 400, height: 240, margin: '20px auto' }}>
      <h4 style={{ textAlign: 'center', marginBottom: 10 }}>Profit/Loss</h4>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 40 }}
          barCategoryGap={10}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            angle={-20}
            textAnchor="end"
            interval={0}
            height={40}
            style={{ fontSize: 10 }}
          />
          <YAxis style={{ fontSize: 10 }} />
          <Tooltip formatter={(value) => `PKR ${value.toLocaleString()}`} />
          <Legend verticalAlign="top" height={20} />
          <Bar dataKey="actualProfitLoss" name="Profit / Loss" barSize={20}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.actualProfitLoss >= 0 ? '#00C49F' : '#FF4D4F'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProfitLossBarChart;

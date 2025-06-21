import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from 'recharts';

const GroupYearlySummary = ({ companies }) => {
  const yearlyMap = {};

  companies.forEach(company => {
    // Revenue
    (company.revenueEntries || []).forEach(entry => {
      const year = entry.year;
      if (!yearlyMap[year]) {
        yearlyMap[year] = { year, totalRevenue: 0, totalExpense: 0 };
      }
      yearlyMap[year].totalRevenue += Number(entry.actualBudget || 0);
    });

    // Expenses
    (company.expenseEntries || []).forEach(exp => {
      (exp.subcategories || []).forEach(sub => {
        const year = sub.year;
        if (!yearlyMap[year]) {
          yearlyMap[year] = { year, totalRevenue: 0, totalExpense: 0 };
        }
        yearlyMap[year].totalExpense += Number(sub.actualBudget || 0);
      });
    });
  });

  const data = Object.values(yearlyMap).sort((a, b) => a.year - b.year);

  return (
    <div style={{ width: '100%', height: 300, marginTop: 20 }}>
      <h3 style={{ textAlign: 'center' }}>Yearly Summary</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 20, left: 10, bottom: 60 }}
          barCategoryGap={12}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="year"
            angle={-30}
            textAnchor="end"
            interval={0}
            height={60}
            style={{ fontSize: 12 }}
          />
          <YAxis style={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="totalRevenue" fill="#00C49F" name="Revenue" barSize={20} />
          <Bar dataKey="totalExpense" fill="#FF6F61" name="Expense" barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GroupYearlySummary;

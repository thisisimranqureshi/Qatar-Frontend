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
    <div style={{ width: '100%', height: 240, marginTop: 15 }}>
      <h4 style={{ textAlign: 'center', fontSize: 15, marginBottom: 5 }}>Yearly Revenue vs Expense</h4>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: 5, bottom: 45 }}
          barCategoryGap={6}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="year"
            angle={-30}
            textAnchor="end"
            interval={0}
            height={50}
            style={{ fontSize: 11 }}
          />
          <YAxis style={{ fontSize: 11 }} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 10 }} />
          <Bar dataKey="totalRevenue" fill="#00C49F" name="Revenue" barSize={12} />
          <Bar dataKey="totalExpense" fill="#FF6F61" name="Expense" barSize={12} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GroupYearlySummary;

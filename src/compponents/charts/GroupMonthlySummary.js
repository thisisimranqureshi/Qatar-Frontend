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

const monthOrder = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const GroupMonthlySummary = ({ companies }) => {
  const monthlyMap = {};

  companies.forEach(company => {
    (company.revenueEntries || []).forEach(entry => {
      const month = entry.month;
      if (!monthlyMap[month]) {
        monthlyMap[month] = { month, totalRevenue: 0, totalExpense: 0 };
      }
      monthlyMap[month].totalRevenue += Number(entry.actualBudget || 0);
    });

    (company.expenseEntries || []).forEach(exp => {
      (exp.subcategories || []).forEach(sub => {
        const month = sub.month;
        if (!monthlyMap[month]) {
          monthlyMap[month] = { month, totalRevenue: 0, totalExpense: 0 };
        }
        monthlyMap[month].totalExpense += Number(sub.actualBudget || 0);
      });
    });
  });

  const data = Object.values(monthlyMap).sort(
    (a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month)
  );

  return (
    <div style={{ width: '100%', height: 240, marginTop: 52 }}>
      <h4 style={{ textAlign: 'center', fontSize: 15, marginBottom: 5 }}>Monthly Revenue vs Expense</h4>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: 5, bottom: 45 }}
          barCategoryGap={6}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            angle={-30}
            textAnchor="end"
            interval={0}
            height={50}
            style={{ fontSize: 10 }}
          />
          <YAxis style={{ fontSize: 10 }} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 10 }} />
          <Bar dataKey="totalRevenue" fill="#00C49F" name="Revenue" barSize={12} />
          <Bar dataKey="totalExpense" fill="#FF6F61" name="Expense" barSize={12} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GroupMonthlySummary;

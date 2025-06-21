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
    <div style={{ width: '100%', height: 300, marginTop: 20 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 20, left: 10, bottom: 60 }}
          barCategoryGap={8}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            angle={-35}
            textAnchor="end"
            interval={0}
            height={60}
            style={{ fontSize: 11 }}
          />
          <YAxis style={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="totalRevenue" fill="#00C49F" name="Revenue" barSize={18} />
          <Bar dataKey="totalExpense" fill="#FF6F61" name="Expense" barSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GroupMonthlySummary;

// TopCompaniesPieChart.js
import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = ["#00C49F", "#82ca9d", "#90ee90", "#66cc99", "#339966"]; // all green tones

const TopCompaniesPieChart = ({ data }) => {
  // ✅ Filter out loss-making companies (profit <= 0)
  const profitable = data.filter((item) => item.profit > 0);

  // Sort descending by profit
  const sorted = profitable
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 5);

  if (sorted.length === 0) {
    return <p style={{ textAlign: "center" }}>No profitable companies to show.</p>;
  }

  return (
    <div style={{ height: 250, width: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={sorted}
            dataKey="profit"
            nameKey="companyName"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={({ companyName }) => companyName}
          >
            {sorted.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => `Rs. ${Number(value).toLocaleString()}`}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopCompaniesPieChart;

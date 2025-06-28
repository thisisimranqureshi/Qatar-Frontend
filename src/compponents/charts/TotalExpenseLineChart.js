import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const TotalExpense = ({ data, small }) => {
  if (!data || data.length === 0) {
    return <p style={{ textAlign: "center" }}>No expense data available.</p>;
  }

  return (
    <div style={{ width: "100%", height: small ? 250 : 400 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip
            formatter={(value) =>
              `Rs. ${Number(value).toLocaleString()}`
            }
          />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#FF8042"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TotalExpense;

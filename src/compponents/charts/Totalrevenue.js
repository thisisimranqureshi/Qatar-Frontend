import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

const TotalRevenue = ({ data, small }) => {
  return (
    <div style={{ height: small ? 200 : 300, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: small ? 10 : 12 }} />
          <YAxis tick={{ fontSize: small ? 10 : 12 }} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#82ca9d"
            strokeWidth={small ? 2 : 3}
            name="Actual Revenue"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TotalRevenue;

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const GroupProfitLossBarChart = ({ data, small }) => {
  const chartData = data.map(group => ({
    group: group.group,
    profit: group.revenue - group.expense,
  }));

  return (
    <div style={{ height: small ? 200 : 250, width: '100%', margin: 'auto' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 20, left: 10, bottom: 40 }}
          barCategoryGap={8}
        >
          <XAxis
            dataKey="group"
            angle={-30}
            textAnchor="end"
            interval={0}
            tick={{ fontSize: small ? 10 : 11 }}
          />
          <YAxis tick={{ fontSize: small ? 10 : 12 }} />
          <Tooltip formatter={value => `Rs. ${value.toLocaleString()}`} />
          <Bar dataKey="profit" name="Profit/Loss" barSize={small ? 20 : 28}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.profit >= 0 ? '#4CAF50' : '#F44336'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GroupProfitLossBarChart;

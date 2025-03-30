import React, { useState } from 'react';
import { PieChart, Pie, Sector, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface WasteBreakdown {
  food_trays: number;
  unfinished_burgers: number;
  milk_cartons: number;
  vegetable_portions: number;
  fruit_portions: number;
}

interface PieChartProps {
  data: WasteBreakdown;
}

const COLORS = {
  food_trays: "#22c55e",
  unfinished_burgers: "#eab308",
  milk_cartons: "#3b82f6", 
  vegetable_portions: "#10b981",
  fruit_portions: "#ef4444"
};

const RADIAN = Math.PI / 180;

const renderActiveShape = (props: any) => {
  const { 
    cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent, value, name 
  } = props;
  
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  const EMOJI_MAP: Record<string, string> = {
    food_trays: "🍱",
    unfinished_burgers: "🍔",
    milk_cartons: "🥛",
    vegetable_portions: "🥦",
    fruit_portions: "🍎",
  };

  const LABELS: Record<string, string> = {
    food_trays: "Food Trays",
    unfinished_burgers: "Burgers",
    milk_cartons: "Milk",
    vegetable_portions: "Vegetables",
    fruit_portions: "Fruits",
  };

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill="#fff" style={{ fontSize: '14px' }}>
        {EMOJI_MAP[payload.name]} {LABELS[payload.name]}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke="#374151"
        strokeWidth={2}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#fff">{`${value.toFixed(1)}%`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
        {`(${(percent * 100).toFixed(1)}%)`}
      </text>
    </g>
  );
};

const InteractivePieChart: React.FC<PieChartProps> = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Convert data object to array for Recharts
  const formatData = () => {
    return Object.entries(data)
      .filter(([_, value]) => value > 0)
      .map(([key, value]) => ({
        name: key,
        value: value
      }));
  };

  const chartData = formatData();

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const EMOJI_MAP: Record<string, string> = {
        food_trays: "🍱",
        unfinished_burgers: "🍔",
        milk_cartons: "🥛",
        vegetable_portions: "🥦",
        fruit_portions: "🍎",
      };

      const LABELS: Record<string, string> = {
        food_trays: "Food Trays",
        unfinished_burgers: "Burgers",
        milk_cartons: "Milk",
        vegetable_portions: "Vegetables",
        fruit_portions: "Fruits",
      };

      return (
        <div className="bg-gray-800 p-2 border border-gray-700 rounded shadow-lg">
          <p className="text-sm text-white">
            {EMOJI_MAP[payload[0].name]} {LABELS[payload[0].name]}: {payload[0].value.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-800 rounded-lg border border-gray-700">
        <p className="text-gray-400">No waste data available</p>
      </div>
    );
  }

  if (chartData.length === 1) {
    // Special case for only one waste type
    const wasteType = chartData[0].name;
    const emoji = {
      food_trays: "🍱",
      unfinished_burgers: "🍔",
      milk_cartons: "🥛",
      vegetable_portions: "🥦",
      fruit_portions: "🍎",
    }[wasteType] || '';

    const label = {
      food_trays: "Food Trays",
      unfinished_burgers: "Burgers",
      milk_cartons: "Milk",
      vegetable_portions: "Vegetables",
      fruit_portions: "Fruits",
    }[wasteType] || '';

    return (
      <div className="flex flex-col items-center justify-center h-48 bg-gray-800 rounded-lg border border-gray-700">
        <div className="text-3xl mb-2">{emoji}</div>
        <p className="text-white font-medium">{label}: 100%</p>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={70}
            fill="#8884d8"
            dataKey="value"
            onMouseEnter={onPieEnter}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[entry.name as keyof typeof COLORS] || '#6b7280'} 
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default InteractivePieChart; 
"use client";

import type React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, DotProps } from 'recharts';
import { useTheme } from 'next-themes'; // Assuming next-themes is or can be installed for theme-aware charts

interface StatsChartProps {
  data: any[];
  dataKey: string;
  name: string;
  unit?: string;
  color?: string; // hex color string
  yAxisDomain?: [number | string, number | string];
}

// Custom Dot component to satisfy Recharts type, can be customized further if needed
const CustomDot: React.FC<DotProps & { r?: number }> = (props) => {
  const { cx, cy, stroke, fill, r, payload, value } = props;
  if (cx === undefined || cy === undefined) return null;
  return <circle cx={cx} cy={cy} r={r || 3} stroke={stroke} fill={fill} />;
};


export const StatsChart: React.FC<StatsChartProps> = ({ data, dataKey, name, unit = "", color, yAxisDomain = ['auto', 'auto'] }) => {
  const { theme } = useTheme();
  
  // Default colors, can be overridden by props
  const defaultColor = "var(--custom-chart-line)"; // Using the CSS variable defined in globals.css
  const finalColor = color || defaultColor;
  
  const gridColor = theme === 'dark' ? "hsl(var(--border))" : "hsl(var(--border))"; // Or specific dark/light grid colors
  const textColor = theme === 'dark' ? "hsl(var(--foreground))" : "hsl(var(--foreground))";


  if (!data || data.length < 3) {
    return <p className="text-center text-muted-foreground py-8">Not enough data to display chart. Log at least three rounds.</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} strokeOpacity={0.3} />
        <XAxis dataKey="roundDateShort" tick={{ fontSize: 10, fill: textColor }} />
        <YAxis tick={{ fontSize: 10, fill: textColor }} domain={yAxisDomain} allowDecimals={true} />
        <Tooltip
          formatter={(value: number) => `${value}${unit}`}
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            borderColor: "hsl(var(--border))",
            color: "hsl(var(--foreground))",
            fontSize: "12px",
            borderRadius: "var(--radius)"
          }}
          labelStyle={{ color: "hsl(var(--foreground))" }}
        />
        <Legend wrapperStyle={{ fontSize: "12px", color: textColor }} />
        <Line
          type="monotone"
          dataKey={dataKey}
          name={name}
          stroke={finalColor}
          strokeWidth={2}
          activeDot={{ r: 6, fill: finalColor, stroke: finalColor }}
          dot={<CustomDot r={3} />}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

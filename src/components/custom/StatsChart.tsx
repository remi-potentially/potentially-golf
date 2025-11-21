

"use client";

import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, DotProps, ReferenceLine, Label as RechartsLabel } from 'recharts';
import { useTheme } from 'next-themes';

interface StatsChartProps {
  data: any[];
  originalData: any[]; 
  dataKey: string;
  name: string;
  unit?: string;
  color?: string;
  yAxisDomain?: [number | string, number | string];
  tickFormatter?: (value: any) => string;
  showAverageLine?: boolean;
  yAxisLabel?: string;
}

const ConditionalColorDot: React.FC<DotProps & { payload?: any }> = (props) => {
  const { cx, cy, stroke, payload } = props;
  const greenColor = "hsl(var(--success))";
  const blueColor = "hsl(var(--chart-1))";

  if (cx === undefined || cy === undefined || payload?.[props.dataKey] === null) return null;

  const dotColor = payload.isNineHole ? blueColor : greenColor;

  return <circle cx={cx} cy={cy} r={3} stroke={dotColor} fill={dotColor} />;
};

export const StatsChart: React.FC<StatsChartProps> = ({ data, originalData, dataKey, name, unit = "", color, yAxisDomain, tickFormatter, showAverageLine = true, yAxisLabel }) => {
  const { theme } = useTheme();
  
  const finalColor = color || "hsl(var(--success))";
  const gridColor = "hsl(var(--border))";
  const textColor = "hsl(var(--foreground))";

  const averageData = useMemo(() => {
    if (!showAverageLine || !originalData || originalData.length === 0) return null;

    const validValues = originalData.map(d => d[dataKey]).filter(v => v !== null && v !== undefined && !isNaN(v));
    if (validValues.length < 2) return null; 
    
    const avg = validValues.reduce((sum, v) => sum + v, 0) / validValues.length;
    
    const formattedAvgForLabel = tickFormatter ? tickFormatter(avg) : `${avg.toFixed(1)}${unit}`;
    
    return {
      value: avg,
      label: `Avg: ${formattedAvgForLabel}`
    };
  }, [originalData, dataKey, showAverageLine, tickFormatter, unit]);


  if (!data || data.length < 2) {
    return <p className="text-center text-muted-foreground py-8">Not enough data to display chart. Log at least two rounds.</p>;
  }
  
  const hasDataForLine = data.some(d => d[dataKey] !== null && d[dataKey] !== undefined);
  if (!hasDataForLine) {
    return <p className="text-center text-muted-foreground py-8">No valid data logged for this stat yet.</p>;
  }


  const defaultFormatter = (value: number) => (value !== null && value !== undefined ? `${value}${unit}` : '');
  const finalFormatter = tickFormatter || defaultFormatter;

  const yDomain = yAxisDomain ? yAxisDomain : ['dataMin - 1', 'dataMax + 1'];

  return (
    <div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 15 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} strokeOpacity={0.3} />
          <XAxis dataKey="roundDateShort" tick={{ fontSize: 10, fill: textColor }} angle={-30} textAnchor="end" interval={0} />
          <YAxis tick={{ fontSize: 10, fill: textColor }} domain={yDomain} allowDecimals={true} tickFormatter={finalFormatter}>
            {yAxisLabel && <RechartsLabel value={yAxisLabel} angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fill: textColor, fontSize: 12 }} />}
          </YAxis>
          <Tooltip
            formatter={(value: number, name: string, props) => {
              const nineHoleSuffix = props.payload.isNineHole ? ' (9 holes)' : ' (18 holes)';
              const formattedName = `${props.name}${nineHoleSuffix}`;
              return [finalFormatter(value), formattedName];
            }}
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              borderColor: "hsl(var(--border))",
              color: "hsl(var(--foreground))",
              fontSize: "12px",
              borderRadius: "var(--radius)"
            }}
            labelStyle={{ color: "hsl(var(--foreground))" }}
          />

          {averageData && (
            <ReferenceLine y={averageData.value} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" />
          )}
          
          <Line
            type="monotone"
            dataKey={dataKey}
            name={name}
            stroke={finalColor}
            strokeWidth={2}
            activeDot={{ r: 6 }}
            dot={<ConditionalColorDot dataKey={dataKey} />}
            connectNulls={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

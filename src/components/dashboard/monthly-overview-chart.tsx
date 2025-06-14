"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MonthlyData } from "@/lib/types";
import { useTheme } from "next-themes"; // Assuming next-themes is used for dark/light mode, standard in shadcn setups

interface MonthlyOverviewChartProps {
  data: MonthlyData[];
}

export function MonthlyOverviewChart({ data }: MonthlyOverviewChartProps) {
  const { theme } = useTheme(); // Or determine colors based on CSS variables

  // Define colors based on theme, these are examples
  const incomeColor = theme === 'dark' ? "hsl(var(--chart-2))" : "rgba(34, 197, 94, 0.7)"; // Emerald-like
  const expenseColor = theme === 'dark' ? "hsl(var(--chart-1))" : "rgba(239, 68, 68, 0.7)"; // Rose-like
  const textColor = theme === 'dark' ? "hsl(var(--muted-foreground))" : "hsl(var(--muted-foreground))";


  if (!data || data.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-foreground">Monthly Overview</CardTitle>
        </CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center">
          <p className="text-muted-foreground">No data available to display chart.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="shadow-lg col-span-1">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-foreground">Monthly Overview</CardTitle>
      </CardHeader>
      <CardContent className="pl-2 pr-6">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
            <XAxis 
              dataKey="month" 
              stroke={textColor}
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis 
              stroke={textColor}
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(value) => `$${value}`} 
            />
            <Tooltip
              cursor={{ fill: 'hsl(var(--muted))', fillOpacity: 0.3 }}
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))', 
                borderRadius: 'var(--radius)', 
                borderColor: 'hsl(var(--border))' 
              }}
            />
            <Legend wrapperStyle={{ fontSize: '14px' }} />
            <Bar dataKey="income" fill={incomeColor} name="Income" radius={[4, 4, 0, 0]} barSize={20}/>
            <Bar dataKey="expenses" fill={expenseColor} name="Expenses" radius={[4, 4, 0, 0]} barSize={20}/>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

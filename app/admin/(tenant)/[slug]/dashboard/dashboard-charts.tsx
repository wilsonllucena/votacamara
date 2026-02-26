"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const data = [
  {
    name: "SEG",
    total: Math.floor(Math.random() * 10) + 2,
  },
  {
    name: "TER",
    total: Math.floor(Math.random() * 20) + 10,
  },
  {
    name: "QUA",
    total: Math.floor(Math.random() * 10) + 5,
  },
  {
    name: "QUI",
    total: Math.floor(Math.random() * 30) + 20,
  },
  {
    name: "SEX",
    total: Math.floor(Math.random() * 15) + 5,
  },
  {
    name: "SAB",
    total: Math.floor(Math.random() * 5) + 1,
  },
  {
    name: "DOM",
    total: 0,
  },
]

// Cor alinhada ao tema — usa variável CSS do tema (hex)
const BAR_FILL = "var(--primary)"

export function DashboardCharts() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="var(--muted-foreground)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="var(--muted-foreground)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip
          cursor={{ fill: "transparent" }}
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid var(--border)",
            backgroundColor: "var(--card)",
            color: "var(--card-foreground)",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          }}
        />
        <Bar dataKey="total" fill={BAR_FILL} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

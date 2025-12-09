"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface AnalyticsChartsProps {
  activityByDay: Array<{ date: string; diseases: number; total: number }>
  diseaseDistribution: Record<string, number>
}

export default function AnalyticsCharts({ activityByDay, diseaseDistribution }: AnalyticsChartsProps) {
  const diseaseChartData = Object.entries(diseaseDistribution).map(([name, count]) => ({
    name,
    count,
  }))

  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ]

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Activity Timeline */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Activity Timeline (Last 7 Days)</CardTitle>
          <CardDescription>Daily disease detection activity across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              diseases: {
                label: "Disease Detections",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="diseases"
                  stroke="var(--color-diseases)"
                  name="Disease Detections"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Disease Distribution */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Disease Distribution</CardTitle>
          <CardDescription>Breakdown of detected fish diseases</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              count: {
                label: "Count",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={diseaseChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-count)">
                  {diseaseChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}

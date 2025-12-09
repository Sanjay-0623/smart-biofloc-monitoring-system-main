"use client"

import { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from "recharts"

type Point = { t: string | number; score: number; category: string }

export function WaterQualityChart() {
  const [data, setData] = useState<Point[]>([])

  useEffect(() => {
    function onSeries(e: any) {
      setData(e.detail)
    }
    window.addEventListener("biofloc:series", onSeries)
    return () => window.removeEventListener("biofloc:series", onSeries)
  }, [])

  return (
    <div className="h-72 w-full">
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-full text-slate-500">
          <p className="text-sm">Upload CSV data to visualize trends</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis dataKey="t" tick={{ fontSize: 12, fill: "#94a3b8" }} stroke="#475569" />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#94a3b8" }} stroke="#475569" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "8px",
                color: "#e2e8f0",
              }}
            />
            <ReferenceLine
              y={70}
              stroke="#22d3ee"
              strokeDasharray="4 4"
              label={{ value: "Good", position: "right", fill: "#22d3ee", fontSize: 12 }}
            />
            <ReferenceLine
              y={45}
              stroke="#fb923c"
              strokeDasharray="4 4"
              label={{ value: "Warning", position: "right", fill: "#fb923c", fontSize: 12 }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#06b6d4"
              strokeWidth={3}
              dot={{ fill: "#0891b2", r: 4 }}
              activeDot={{ r: 6, fill: "#22d3ee" }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

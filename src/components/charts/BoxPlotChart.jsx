import React from 'react'
import { ResponsiveContainer, ComposedChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Line, Scatter } from 'recharts'

/**
 * BoxPlotChart — Renders a simplified box plot using Recharts ComposedChart.
 * Displays min, Q1, median, Q3, max for a numerical column grouped by category.
 */

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0]?.payload
    if (!d) return null
    return (
      <div className="p-3 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-700 text-xs space-y-1">
        <p className="font-bold text-blue-300">{d.category || d.name}</p>
        {d.min !== undefined && <p className="text-slate-300">Min: {d.min}</p>}
        {d.q1 !== undefined && <p className="text-slate-300">Q1: {d.q1}</p>}
        {d.median !== undefined && <p className="text-teal-300 font-bold">Median: {d.median}</p>}
        {d.q3 !== undefined && <p className="text-slate-300">Q3: {d.q3}</p>}
        {d.max !== undefined && <p className="text-slate-300">Max: {d.max}</p>}
        {d.count !== undefined && <p className="text-slate-400 font-mono">N = {d.count}</p>}
      </div>
    )
  }
  return null
}

export default function BoxPlotChart({ data = [], height = 260 }) {
  if (!data || data.length === 0) {
    return <div className="h-40 flex items-center justify-center text-xs text-slate-400">No data available</div>
  }

  // Transform data for a simple box representation:
  // Use stacked bars: bottom (min→Q1), box (Q1→Q3), with median line
  const chartData = data.map(d => ({
    ...d,
    name: d.category || d.name,
    base: d.q1,             // Bottom of box
    boxHeight: d.q3 - d.q1, // Box IQR height
    medianVal: d.median,
    rangeBottom: d.min,
    rangeTop: d.max
  }))

  return (
    <div className="space-y-3">
      {/* Simplified table-based box plot display */}
      <div className="space-y-2">
        {chartData.map((item, idx) => {
          const range = item.max - item.min || 1
          const q1Pct = ((item.q1 - item.min) / range) * 100
          const iqrPct = ((item.q3 - item.q1) / range) * 100
          const medianPct = ((item.median - item.min) / range) * 100

          return (
            <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">{item.name}</span>
                <span className="font-mono text-slate-500 text-[11px]">N = {item.count}</span>
              </div>

              {/* Visual bar */}
              <div className="relative h-5 bg-slate-200 rounded-full overflow-hidden">
                {/* IQR Box */}
                <div
                  className="absolute h-full bg-blue-400/60 border-x-2 border-blue-600"
                  style={{ left: `${q1Pct}%`, width: `${iqrPct}%` }}
                />
                {/* Median Line */}
                <div
                  className="absolute h-full w-0.5 bg-slate-900"
                  style={{ left: `${medianPct}%` }}
                />
              </div>

              {/* Labels */}
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>Min: {item.min}</span>
                <span>Q1: {item.q1}</span>
                <span className="font-bold text-slate-700">Md: {item.median}</span>
                <span>Q3: {item.q3}</span>
                <span>Max: {item.max}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

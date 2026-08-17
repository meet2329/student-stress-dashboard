import React from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  ReferenceLine
} from 'recharts'

const CustomTooltip = ({ active, payload, xKey, yKey, unit = '' }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="p-3 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-700 text-xs space-y-1">
        <p className="font-bold text-blue-400">{data[xKey] || data.range || data.category || data.age || data.type}</p>
        <p className="text-slate-300">
          <span className="font-semibold">Student Count:</span> {data.count || data[yKey]} students
        </p>
        {data.percentage && (
          <p className="text-slate-400 font-mono text-[11px]">
            Cohort Proportion: {data.percentage}%
          </p>
        )}
        {data.avgStress && (
          <p className="text-amber-300 font-semibold text-[11px] pt-1 border-t border-slate-700">
            Avg Stress: {data.avgStress} / 100
          </p>
        )}
      </div>
    )
  }
  return null
}

export default function UnivariateHistogram({
  data = [],
  xKey = 'range',
  yKey = 'count',
  meanVal,
  meanLabel = 'Mean',
  barColor = '#3B82F6',
  height = 260,
  showPercentage = false
}) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 15, right: 10, bottom: 25, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
          <XAxis
            dataKey={xKey}
            tick={{ fill: '#64748B', fontSize: 11 }}
            tickLine={{ stroke: '#CBD5E1' }}
            interval={0}
            angle={-15}
            textAnchor="end"
          />
          <YAxis
            tick={{ fill: '#64748B', fontSize: 11 }}
            tickLine={{ stroke: '#CBD5E1' }}
          />
          <Tooltip content={<CustomTooltip xKey={xKey} yKey={yKey} />} />

          {meanVal && (
            <ReferenceLine
              x={meanVal}
              stroke="#EF4444"
              strokeDasharray="3 3"
              strokeWidth={2}
              label={{ value: `${meanLabel}: ${meanVal}`, fill: '#EF4444', fontSize: 10, position: 'top' }}
            />
          )}

          <Bar dataKey={yKey} radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color || barColor}
                opacity={0.9}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

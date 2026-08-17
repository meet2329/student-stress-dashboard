import React from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-700 text-xs space-y-1">
        <p className="font-bold text-blue-300">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-slate-200">
            <span className="font-semibold" style={{ color: p.color }}>{p.name}:</span> {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function GroupedBarChart({ data = [], xKey = 'group', yKey = 'mean', height = 260 }) {
  if (!data || data.length === 0) {
    return <div className="h-40 flex items-center justify-center text-xs text-slate-400">No data available</div>
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
        <XAxis
          dataKey={xKey}
          tick={{ fontSize: 11, fill: '#64748B' }}
          axisLine={{ stroke: '#CBD5E1' }}
          tickLine={false}
          interval={0}
          angle={data.length > 5 ? -25 : 0}
          textAnchor={data.length > 5 ? 'end' : 'middle'}
          height={data.length > 5 ? 60 : 30}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#64748B' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey={yKey} name="Average" fill="#3B82F6" radius={[6, 6, 0, 0]} maxBarSize={50} />
        {data[0]?.count !== undefined && (
          <Bar dataKey="count" name="Count" fill="#0D9488" radius={[6, 6, 0, 0]} maxBarSize={50} />
        )}
      </BarChart>
    </ResponsiveContainer>
  )
}

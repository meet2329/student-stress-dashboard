import React from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts'

const COLORS = ['#3B82F6', '#0D9488', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#10B981', '#6366F1', '#14B8A6', '#F97316']

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-700 text-xs space-y-1">
        <p className="font-bold text-blue-300">{label}</p>
        <p className="text-slate-200">
          <span className="font-semibold">Count:</span> {payload[0].value}
        </p>
      </div>
    )
  }
  return null
}

export default function GenericBarChart({ data = [], xKey = 'category', yKey = 'count', height = 260, barColor }) {
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
          angle={data.length > 6 ? -30 : 0}
          textAnchor={data.length > 6 ? 'end' : 'middle'}
          height={data.length > 6 ? 60 : 30}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#64748B' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey={yKey} radius={[6, 6, 0, 0]} maxBarSize={50}>
          {data.map((_, idx) => (
            <Cell key={idx} fill={barColor || COLORS[idx % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

import React, { useState } from 'react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts'

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="p-3 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-700 text-xs space-y-1">
        <p className="font-bold text-blue-400">{data.category || data.name || data.type}</p>
        <p className="text-slate-300">
          <span className="font-semibold">Count:</span> {data.count} students
        </p>
        <p className="text-teal-300 font-mono font-bold text-[11px]">
          Proportion: {data.percentage}%
        </p>
      </div>
    )
  }
  return null
}

export default function UnivariateDonut({
  data = [],
  centerTitle = 'Total',
  centerValue = '3,000',
  height = 260
}) {
  const [activeIndex, setActiveIndex] = useState(null)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Donut Container with Center Label */}
      <div className="relative" style={{ width: 220, height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={data}
              dataKey="count"
              nameKey="category"
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={88}
              paddingAngle={3}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color || ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]}
                  stroke="#FFFFFF"
                  strokeWidth={2}
                  opacity={activeIndex === null || activeIndex === index ? 1 : 0.6}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {centerTitle}
          </span>
          <span className="text-lg font-extrabold text-slate-900 tabular-nums">
            {centerValue}
          </span>
        </div>
      </div>

      {/* Legend List */}
      <div className="flex-1 space-y-2 text-xs w-full">
        {data.map((item, idx) => (
          <div
            key={idx}
            onMouseEnter={() => setActiveIndex(idx)}
            onMouseLeave={() => setActiveIndex(null)}
            className={`
              flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer
              ${activeIndex === idx ? 'bg-slate-100 border-slate-300' : 'bg-slate-50/70 border-slate-200/70'}
            `}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color || ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'][idx % 5] }}
              />
              <span className="font-semibold text-slate-800 truncate">
                {item.category || item.name}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 font-mono text-[11px]">
              <span className="text-slate-500 font-medium">N={item.count}</span>
              <span className="font-bold text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                {item.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

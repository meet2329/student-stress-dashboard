import React, { useState } from 'react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts'
import {
  CHART_PALETTE,
  SmartChartTooltip,
  formatMetricValue
} from '../../utils/dynamicChartUtils'

export default function UnivariateDonut({
  data = [],
  colName,
  centerTitle = 'Total',
  centerValue,
  height = 260
}) {
  const [activeIndex, setActiveIndex] = useState(null)

  if (!data || data.length === 0) {
    return <div className="h-40 flex items-center justify-center text-xs text-slate-400">No category data</div>
  }

  const totalCount = data.reduce((sum, item) => sum + (Number(item.count) || 0), 0)
  const displayCenterVal = centerValue !== undefined ? centerValue : formatMetricValue(totalCount)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 w-full">
      {/* Donut Container with Center Label */}
      <div className="relative shrink-0" style={{ width: 220, height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={
                <SmartChartTooltip
                  columnName={colName}
                  valueLabel="Count"
                />
              }
            />
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
                  fill={entry.color || CHART_PALETTE[index % CHART_PALETTE.length]}
                  stroke="#FFFFFF"
                  strokeWidth={2}
                  opacity={activeIndex === null || activeIndex === index ? 1 : 0.6}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate max-w-[140px]">
            {centerTitle}
          </span>
          <span className="text-base font-extrabold text-slate-900 tabular-nums">
            {displayCenterVal}
          </span>
        </div>
      </div>

      {/* Legend List (Adaptive, handles long category names without breaking layout) */}
      <div className="flex-1 space-y-1.5 text-xs w-full max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
        {data.map((item, idx) => {
          const categoryName = String(item.category || item.name || '')
          const color = item.color || CHART_PALETTE[idx % CHART_PALETTE.length]
          const isSelected = activeIndex === idx

          return (
            <div
              key={idx}
              onMouseEnter={() => setActiveIndex(idx)}
              onMouseLeave={() => setActiveIndex(null)}
              title={`${categoryName} (${item.count} records, ${item.percentage}%)`}
              className={`
                flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer gap-2
                ${isSelected ? 'bg-blue-50/80 border-blue-200' : 'bg-slate-50/70 border-slate-200/70 hover:bg-slate-100/80'}
              `}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="font-semibold text-slate-800 text-xs truncate">
                  {categoryName}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 font-mono text-[11px]">
                <span className="text-slate-500 font-medium">N={formatMetricValue(item.count)}</span>
                <span className="font-bold text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs">
                  {item.percentage}%
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

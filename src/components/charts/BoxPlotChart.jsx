import React from 'react'
import { formatMetricValue } from '../../utils/dynamicChartUtils'

/**
 * BoxPlotChart — Renders an intuitive 5-number distribution summary
 * Displays Min, Q1, Median, Mean, Q3, Max, and IQR for a numerical column.
 */

export default function BoxPlotChart({ data = [], height = 260 }) {
  if (!data || data.length === 0) {
    return <div className="h-40 flex items-center justify-center text-xs text-slate-400">No distribution data available</div>
  }

  const chartData = data.map(d => ({
    ...d,
    name: d.category || d.name || 'Feature Distribution',
    min: d.min ?? 0,
    q1: d.q1 ?? 0,
    median: d.median ?? 0,
    q3: d.q3 ?? 0,
    max: d.max ?? 0,
    count: d.count ?? 0
  }))

  return (
    <div className="space-y-3 w-full">
      <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
        {chartData.map((item, idx) => {
          const range = (item.max - item.min) || 1
          const q1Pct = Math.max(0, Math.min(100, ((item.q1 - item.min) / range) * 100))
          const iqrPct = Math.max(2, Math.min(100 - q1Pct, ((item.q3 - item.q1) / range) * 100))
          const medianPct = Math.max(0, Math.min(100, ((item.median - item.min) / range) * 100))

          return (
            <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2.5 hover:bg-slate-100/60 transition-colors">
              <div className="flex items-center justify-between text-xs gap-2">
                <span className="font-bold text-slate-800 truncate max-w-[260px]" title={item.name}>
                  {item.name}
                </span>
                <span className="font-mono text-slate-500 text-[11px] shrink-0">
                  N = {formatMetricValue(item.count)}
                </span>
              </div>

              {/* Visual Box-Whisker Bar */}
              <div className="relative h-6 bg-slate-200/80 rounded-full overflow-hidden border border-slate-300/80">
                {/* IQR Box (Q1 to Q3) */}
                <div
                  className="absolute h-full bg-gradient-to-r from-blue-500/50 to-indigo-500/50 border-x-2 border-indigo-600 shadow-inner"
                  style={{ left: `${q1Pct}%`, width: `${iqrPct}%` }}
                  title={`Interquartile Range (IQR): ${formatMetricValue(item.q1)} to ${formatMetricValue(item.q3)}`}
                />
                {/* Median Indicator */}
                <div
                  className="absolute h-full w-1 bg-slate-900 shadow-md"
                  style={{ left: `${medianPct}%` }}
                  title={`Median: ${formatMetricValue(item.median)}`}
                />
              </div>

              {/* 5-Number Summary Ticks */}
              <div className="flex flex-wrap items-center justify-between text-[10px] font-mono text-slate-600 gap-1 pt-0.5">
                <span>Min: <strong className="text-slate-800">{formatMetricValue(item.min)}</strong></span>
                <span>Q1: <strong className="text-blue-700">{formatMetricValue(item.q1)}</strong></span>
                <span className="font-bold text-indigo-900 bg-white px-1.5 py-0.5 rounded border border-indigo-200 shadow-2xs">
                  Median: {formatMetricValue(item.median)}
                </span>
                <span>Q3: <strong className="text-purple-700">{formatMetricValue(item.q3)}</strong></span>
                <span>Max: <strong className="text-slate-800">{formatMetricValue(item.max)}</strong></span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

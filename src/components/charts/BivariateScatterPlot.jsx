import React, { useState, useMemo } from 'react'
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Scatter,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  ReferenceLine
} from 'recharts'
import { BarChart3, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { formatMetricValue, SmartChartTooltip } from '../../utils/dynamicChartUtils'

export default function BivariateScatterPlot({
  data = [],
  xAxisLabel = 'X Variable',
  yAxisLabel = 'Y Variable',
  correlation = 0,
  slope = 0,
  intercept = 0,
  rSquared = 0,
  height = 270
}) {
  const [viewMode, setViewMode] = useState('bars') // 'bars' | 'scatter'

  const isPositive = correlation >= 0

  // Calculate dynamic stats
  const { yMean, yMin, yMax } = useMemo(() => {
    if (!data || data.length === 0) return { yMean: 0, yMin: 0, yMax: 100 }
    const yVals = data.map(d => Number(d.y)).filter(n => !isNaN(n))
    if (yVals.length === 0) return { yMean: 0, yMin: 0, yMax: 100 }
    const sum = yVals.reduce((a, b) => a + b, 0)
    return {
      yMean: parseFloat((sum / yVals.length).toFixed(2)),
      yMin: Math.min(...yVals),
      yMax: Math.max(...yVals)
    }
  }, [data])

  // Color generator based on relative scale
  const getBarColor = (val) => {
    const range = (yMax - yMin) || 1
    const pct = (val - yMin) / range
    if (isPositive) {
      if (pct > 0.7) return '#EF4444' // High impact
      if (pct > 0.4) return '#F59E0B' // Medium impact
      return '#3B82F6' // Normal
    } else {
      if (pct > 0.7) return '#10B981' // High protective
      if (pct > 0.4) return '#0D9488' // Medium protective
      return '#3B82F6' // Normal
    }
  }

  const chartData = useMemo(() => {
    return (data || []).map((d) => ({
      ...d,
      bracket: `${formatMetricValue(d.x)}`,
      regressionY: slope && intercept ? parseFloat((slope * Number(d.x) + intercept).toFixed(2)) : undefined
    }))
  }, [data, slope, intercept])

  return (
    <div className="space-y-3 w-full">
      {/* Top Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
        {/* Pearson Stats */}
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <span className="flex items-center gap-1 font-bold shrink-0">
            {isPositive ? (
              <ArrowUpRight className="w-4 h-4 text-rose-600" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-emerald-600" />
            )}
            <span className={isPositive ? 'text-rose-700' : 'text-emerald-700'}>
              {isPositive ? 'Positive Association' : 'Inverse / Buffer'}
            </span>
          </span>
          <span className="text-slate-300">•</span>
          <span className="font-mono text-slate-800 font-bold shrink-0">
            r = {correlation > 0 ? `+${correlation.toFixed(2)}` : correlation.toFixed(2)}
          </span>
          <span className="text-slate-300">•</span>
          <span className="font-mono text-slate-500 shrink-0">
            R² = {rSquared ? rSquared.toFixed(3) : (correlation * correlation).toFixed(3)}
          </span>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-white rounded-xl p-0.5 border border-slate-200 shadow-2xs shrink-0">
          <button
            onClick={() => setViewMode('bars')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
              viewMode === 'bars'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3 h-3" />
            <span>Bracket View</span>
          </button>
          <button
            onClick={() => setViewMode('scatter')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
              viewMode === 'scatter'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3 h-3" />
            <span>Regression Line</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div style={{ width: '100%', height }}>
        {viewMode === 'bars' ? (
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 15, right: 15, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="bracket"
                tick={{ fill: '#475569', fontSize: 10, fontWeight: 600 }}
                axisLine={{ stroke: '#CBD5E1' }}
                tickLine={{ stroke: '#CBD5E1' }}
              />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fill: '#64748B', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => formatMetricValue(v)}
              />
              <Tooltip
                content={
                  <SmartChartTooltip
                    columnName={`${xAxisLabel} → ${yAxisLabel}`}
                    valueLabel={yAxisLabel}
                  />
                }
              />
              {yMean > 0 && (
                <ReferenceLine
                  y={yMean}
                  stroke="#94A3B8"
                  strokeDasharray="3 3"
                  label={{ value: `Avg: ${yMean}`, fill: '#94A3B8', fontSize: 10, position: 'top' }}
                />
              )}
              <Bar dataKey="y" radius={[6, 6, 0, 0]} maxBarSize={44}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getBarColor(entry.y)}
                    opacity={0.9}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer>
            <ComposedChart data={chartData} margin={{ top: 12, right: 20, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis
                dataKey="x"
                type="number"
                domain={['auto', 'auto']}
                name={xAxisLabel}
                tick={{ fill: '#64748B', fontSize: 10 }}
                axisLine={{ stroke: '#CBD5E1' }}
                tickLine={{ stroke: '#CBD5E1' }}
                tickFormatter={(v) => formatMetricValue(v)}
              />
              <YAxis
                dataKey="y"
                type="number"
                domain={['auto', 'auto']}
                name={yAxisLabel}
                tick={{ fill: '#64748B', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => formatMetricValue(v)}
              />
              <Tooltip
                content={
                  <SmartChartTooltip
                    columnName={`${xAxisLabel} vs. ${yAxisLabel}`}
                    valueLabel={yAxisLabel}
                  />
                }
              />
              {slope !== 0 && (
                <Line
                  type="linear"
                  dataKey="regressionY"
                  stroke="#EF4444"
                  strokeWidth={2}
                  dot={false}
                  name="Trendline"
                />
              )}
              <Scatter data={chartData} fill="#3B82F6" />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Direct Plain-Language Insight Strip */}
      <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 flex items-center justify-between">
        <span>
          <strong>Interpretation:</strong> Higher {xAxisLabel.toLowerCase().replace('(hours)', '').replace('(0-100)', '')} leads to <strong>{isPositive ? 'higher stress' : 'lower stress (protective)'}</strong>.
        </span>
        <span className="font-mono text-slate-500 hidden sm:inline">Trend: y = {slope}x + {intercept}</span>
      </div>
    </div>
  )
}

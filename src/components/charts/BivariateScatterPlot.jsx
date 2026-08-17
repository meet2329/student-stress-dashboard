import React, { useState } from 'react'
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
import { BarChart3, TrendingUp, Sparkles, ArrowUpRight, ArrowDownRight } from 'lucide-react'

const CustomScatterTooltip = ({ active, payload, xLabel, yLabel }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="p-3 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-700 text-xs space-y-1">
        <p className="font-bold text-teal-300">Observation Point</p>
        <p className="text-slate-300">
          <span className="font-semibold">{xLabel}:</span> {data.x}
        </p>
        <p className="text-slate-300">
          <span className="font-semibold">{yLabel}:</span> {data.y} / 100
        </p>
        {data.count && (
          <p className="text-slate-400 font-mono text-[11px]">
            Cohort: N = {data.count} students
          </p>
        )}
        {data.level && (
          <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
            data.level === 'Very High' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
            data.level === 'High' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
            data.level === 'Moderate' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
            'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
          }`}>
            {data.level} Stress Tier
          </span>
        )}
      </div>
    )
  }
  return null
}

const CustomBarTooltip = ({ active, payload, xLabel }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="p-3 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-700 text-xs space-y-1">
        <p className="font-bold text-blue-400">{xLabel}: {data.bracket || data.x}</p>
        <p className="text-amber-300 font-extrabold text-sm">
          Avg Stress: {data.y} / 100
        </p>
        {data.count && (
          <p className="text-slate-300 text-[11px]">
            Students in Bracket: N = {data.count}
          </p>
        )}
        <p className="text-slate-400 text-[11px]">
          Status: <strong>{data.level} Stress</strong>
        </p>
      </div>
    )
  }
  return null
}

export default function BivariateScatterPlot({
  data = [],
  xAxisLabel = 'X Variable',
  yAxisLabel = 'Stress Score',
  correlation = 0,
  slope = 0,
  intercept = 0,
  rSquared = 0,
  pVal = 0.001,
  height = 270
}) {
  // Default to the intuitive Bracket View for easier understanding
  const [viewMode, setViewMode] = useState('bars') // 'bars' | 'scatter'

  const isPositive = correlation >= 0

  // Format data for clear bracket visualization
  const bracketData = data.map((d) => {
    let bracket = `${d.x}`
    if (xAxisLabel.includes('Screen') || xAxisLabel.includes('Sleep') || xAxisLabel.includes('Study') || xAxisLabel.includes('Social')) {
      bracket = `${d.x} hrs`
    } else if (xAxisLabel.includes('Attendance')) {
      bracket = `${d.x}%`
    } else if (xAxisLabel.includes('Exam')) {
      bracket = `${d.x} exams`
    } else if (xAxisLabel.includes('Assignment')) {
      bracket = `${d.x}/wk`
    } else if (xAxisLabel.includes('Anxiety') || xAxisLabel.includes('Family') || xAxisLabel.includes('Peer')) {
      bracket = `Score ${d.x}`
    }

    return {
      ...d,
      bracket,
      trend: parseFloat((slope * d.x + intercept).toFixed(2))
    }
  })

  const getBarColor = (stressScore) => {
    if (stressScore >= 75) return '#EF4444' // Red
    if (stressScore >= 65) return '#F59E0B' // Amber
    if (stressScore >= 55) return '#3B82F6' // Blue
    return '#10B981' // Green
  }

  return (
    <div className="space-y-3">
      {/* Top Header Controls: Switch between Easy Bar View and Detailed Scatter */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
        {/* Pearson Stats */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1 font-bold">
            {isPositive ? (
              <ArrowUpRight className="w-4 h-4 text-rose-600" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-emerald-600" />
            )}
            <span className={isPositive ? 'text-rose-700' : 'text-emerald-700'}>
              {isPositive ? 'Stress Multiplier' : 'Protective Buffer'}
            </span>
          </span>
          <span className="text-slate-300">|</span>
          <span className="font-mono text-slate-800 font-bold">
            r = {correlation > 0 ? `+${correlation.toFixed(2)}` : correlation.toFixed(2)}
          </span>
          <span className="text-slate-300">|</span>
          <span className="font-mono text-slate-500">
            R² = {rSquared ? rSquared.toFixed(3) : (correlation * correlation).toFixed(3)}
          </span>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-white rounded-lg p-0.5 border border-slate-200 shadow-2xs">
          <button
            onClick={() => setViewMode('bars')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 ${
              viewMode === 'bars'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3 h-3" />
            <span>Easy Bracket View</span>
          </button>
          <button
            onClick={() => setViewMode('scatter')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 ${
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
          /* High Clarity Bracket Bar Chart */
          <ResponsiveContainer>
            <BarChart data={bracketData} margin={{ top: 15, right: 10, bottom: 25, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="bracket"
                tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
                tickLine={{ stroke: '#CBD5E1' }}
              />
              <YAxis
                domain={[35, 90]}
                unit=" pts"
                tick={{ fill: '#64748B', fontSize: 11 }}
                tickLine={{ stroke: '#CBD5E1' }}
              />
              <Tooltip content={<CustomBarTooltip xLabel={xAxisLabel} />} />
              <ReferenceLine y={64.2} stroke="#94A3B8" strokeDasharray="3 3" label={{ value: 'Cohort Avg: 64.2', fill: '#94A3B8', fontSize: 10, position: 'top' }} />
              <Bar dataKey="y" radius={[6, 6, 0, 0]}>
                {bracketData.map((entry, index) => (
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
          /* Scatter Plot with Regression Trendline */
          <ResponsiveContainer>
            <ComposedChart data={bracketData} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="x"
                type="number"
                domain={['dataMin - 0.5', 'dataMax + 0.5']}
                name={xAxisLabel}
                tick={{ fill: '#64748B', fontSize: 11 }}
                tickLine={{ stroke: '#CBD5E1' }}
              />
              <YAxis
                dataKey="y"
                type="number"
                domain={[35, 90]}
                unit=" pts"
                tick={{ fill: '#64748B', fontSize: 11 }}
                tickLine={{ stroke: '#CBD5E1' }}
              />
              <Tooltip content={<CustomScatterTooltip xLabel={xAxisLabel} yLabel={yAxisLabel} />} />
              <Line
                type="linear"
                dataKey="trend"
                stroke={isPositive ? '#EF4444' : '#10B981'}
                strokeWidth={2.5}
                strokeDasharray="4 4"
                dot={false}
                activeDot={false}
                name="Linear Fit"
              />
              <Scatter
                dataKey="y"
                fill="#3B82F6"
                stroke="#1D4ED8"
                strokeWidth={1.5}
                opacity={0.85}
              />
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

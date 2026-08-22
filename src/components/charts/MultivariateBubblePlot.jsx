import React from 'react'
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts'
import { formatMetricValue, SmartChartTooltip } from '../../utils/dynamicChartUtils'

export default function MultivariateBubblePlot({
  data = [],
  xLabel = 'X-Axis Metric',
  yLabel = 'Y-Axis Metric',
  zLabel = 'Bubble Size Metric',
  height = 320
}) {
  const getColor = (level) => {
    switch (level) {
      case 'Very High':
      case 'Critical':
        return '#EF4444'
      case 'High':
      case 'Elevated':
        return '#F59E0B'
      case 'Moderate':
      case 'Standard':
        return '#3B82F6'
      case 'Low':
      case 'Optimal':
        return '#10B981'
      default:
        return '#3B82F6'
    }
  }

  // Normalize data keys if using x, y, z
  const normalizedData = (data || []).map((d, i) => ({
    id: d.id || i + 1,
    screenTime: Number(d.screenTime ?? d.x ?? 0),
    stressScore: Number(d.stressScore ?? d.y ?? 0),
    sleepHours: Number(d.sleepHours ?? d.z ?? 5),
    stressLevel: d.stressLevel ?? d.category ?? 'Standard',
    xLabel,
    yLabel,
    zLabel
  }))

  return (
    <div className="space-y-3 w-full">
      {/* Dimension Key */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
        <div className="flex flex-wrap items-center gap-3 min-w-0">
          <span className="truncate max-w-[200px]" title={xLabel}><strong>X-Axis:</strong> {xLabel}</span>
          <span className="text-slate-300">•</span>
          <span className="truncate max-w-[200px]" title={yLabel}><strong>Y-Axis:</strong> {yLabel}</span>
          <span className="text-slate-300">•</span>
          <span className="truncate max-w-[200px]" title={zLabel}><strong>Size:</strong> {zLabel}</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-semibold shrink-0">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>Optimal</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>Standard</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>High</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>Elevated</span>
        </div>
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <ScatterChart margin={{ top: 12, right: 24, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis
              dataKey="screenTime"
              type="number"
              domain={['auto', 'auto']}
              name={xLabel}
              tick={{ fill: '#64748B', fontSize: 10 }}
              axisLine={{ stroke: '#CBD5E1' }}
              tickLine={{ stroke: '#CBD5E1' }}
              tickFormatter={(v) => formatMetricValue(v)}
              label={{
                value: xLabel.length > 28 ? xLabel.slice(0, 26) + '…' : xLabel,
                position: 'insideBottom',
                offset: -12,
                fill: '#64748B',
                fontSize: 10,
                fontWeight: 600
              }}
            />
            <YAxis
              dataKey="stressScore"
              type="number"
              domain={['auto', 'auto']}
              name={yLabel}
              tick={{ fill: '#64748B', fontSize: 10 }}
              axisLine={{ stroke: '#CBD5E1' }}
              tickLine={{ stroke: '#CBD5E1' }}
              tickFormatter={(v) => formatMetricValue(v)}
              label={{
                value: yLabel.length > 24 ? yLabel.slice(0, 22) + '…' : yLabel,
                angle: -90,
                position: 'insideLeft',
                fill: '#64748B',
                fontSize: 10,
                fontWeight: 600
              }}
            />
            {/* ZAxis controls bubble diameter */}
            <ZAxis
              dataKey="sleepHours"
              type="number"
              range={[120, 700]}
              name={zLabel}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload
                  return (
                    <div className="p-3.5 bg-slate-950 text-slate-100 rounded-2xl shadow-2xl border border-slate-700/80 text-xs space-y-1 min-w-[200px]">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400 border-b border-slate-800 pb-1">
                        Observation #{d.id}
                      </div>
                      <p className="text-slate-300">
                        <span className="font-semibold text-slate-400">{d.xLabel}:</span> <strong className="font-mono text-white">{formatMetricValue(d.screenTime)}</strong>
                      </p>
                      <p className="text-slate-300">
                        <span className="font-semibold text-slate-400">{d.yLabel}:</span> <strong className="font-mono text-white">{formatMetricValue(d.stressScore)}</strong>
                      </p>
                      <p className="text-blue-300 font-medium">
                        <span className="font-semibold text-slate-400">{d.zLabel}:</span> <strong className="font-mono text-teal-300">{formatMetricValue(d.sleepHours)}</strong>
                      </p>
                      <div className="pt-1">
                        <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {d.stressLevel}
                        </span>
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Scatter data={normalizedData} opacity={0.85}>
              {normalizedData.map((entry, index) => (
                <Cell
                  key={`bubble-${index}`}
                  fill={getColor(entry.stressLevel)}
                  stroke="#FFFFFF"
                  strokeWidth={1.5}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

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

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="p-3 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-700 text-xs space-y-1">
        <p className="font-bold text-teal-300">Student Profile #{data.id}</p>
        <p className="text-slate-300">
          <span className="font-semibold">Screen Time (X):</span> {data.screenTime} hrs/day
        </p>
        <p className="text-slate-300">
          <span className="font-semibold">Stress Score (Y):</span> {data.stressScore} / 100
        </p>
        <p className="text-blue-300 font-medium">
          <span className="font-semibold">Sleep Duration (Size):</span> {data.sleepHours} hrs/night
        </p>
        <p className="text-slate-400">
          <span className="font-semibold">Anxiety Rating:</span> {data.anxiety} / 5.0
        </p>
        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
          data.stressLevel === 'Very High' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
          data.stressLevel === 'High' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
          data.stressLevel === 'Moderate' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
          'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
        }`}>
          {data.stressLevel} Stress
        </span>
      </div>
    )
  }
  return null
}

export default function MultivariateBubblePlot({
  data = [],
  height = 320
}) {
  const getColor = (level) => {
    switch (level) {
      case 'Very High': return '#EF4444'
      case 'High': return '#F59E0B'
      case 'Moderate': return '#3B82F6'
      case 'Low': return '#10B981'
      default: return '#3B82F6'
    }
  }

  return (
    <div className="space-y-3">
      {/* Dimension Key */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
        <div className="flex items-center gap-4">
          <span><strong>X-Axis:</strong> Screen Time</span>
          <span><strong>Y-Axis:</strong> Stress Score</span>
          <span><strong>Bubble Size:</strong> Sleep Hours (Larger = More Sleep)</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-semibold">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>Low</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>Moderate</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>High</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>Very High</span>
        </div>
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis
              dataKey="screenTime"
              type="number"
              domain={[1.5, 10.5]}
              name="Screen Time"
              unit=" hrs"
              tick={{ fill: '#64748B', fontSize: 11 }}
              label={{ value: 'Daily Screen Time (Hours)', position: 'bottom', offset: 5, fill: '#64748B', fontSize: 11, fontWeight: 600 }}
            />
            <YAxis
              dataKey="stressScore"
              type="number"
              domain={[40, 90]}
              name="Stress Score"
              unit=" pts"
              tick={{ fill: '#64748B', fontSize: 11 }}
              label={{ value: 'Stress Score (0–100)', angle: -90, position: 'insideLeft', offset: 10, fill: '#64748B', fontSize: 11, fontWeight: 600 }}
            />
            {/* ZAxis controls bubble diameter */}
            <ZAxis
              dataKey="sleepHours"
              type="number"
              range={[120, 700]}
              name="Sleep Hours"
            />
            <Tooltip content={<CustomTooltip />} />
            <Scatter data={data} opacity={0.85}>
              {data.map((entry, index) => (
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

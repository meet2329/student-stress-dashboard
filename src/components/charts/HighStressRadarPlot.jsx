import React from 'react'
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip
} from 'recharts'

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-700 text-xs space-y-1">
        <p className="font-bold text-amber-400">{payload[0]?.payload?.metric}</p>
        <p className="text-rose-400 font-semibold">
          High-Risk Profile: {payload[0]?.value} (Normalized %)
        </p>
        <p className="text-blue-400 font-semibold">
          Overall Average: {payload[1]?.value} (Normalized %)
        </p>
      </div>
    )
  }
  return null
}

export default function HighStressRadarPlot({ 
  data = null, 
  cohortSize = '3,000',
  targetName = 'Stress',
  height = 300 
}) {
  // Normalized 0-100 values for radar symmetry
  const defaultData = [
    { metric: 'Anxiety Level', highRisk: 86, overall: 62 },
    { metric: 'Screen Exposure', highRisk: 84, overall: 58 },
    { metric: 'Assignment Density', highRisk: 78, overall: 48 },
    { metric: 'Study Fatigue', highRisk: 75, overall: 52 },
    { metric: 'Exam Pressure', highRisk: 82, overall: 55 },
    { metric: 'Sleep Quality', highRisk: 42, overall: 68 },
    { metric: 'Family Buffer', highRisk: 38, overall: 66 },
    { metric: 'Physical Activity', highRisk: 30, overall: 54 }
  ]

  const radarData = data && data.length >= 3 ? data : defaultData

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
          <PolarGrid stroke="#E2E8F0" />
          <PolarAngleAxis
            dataKey="metric"
            tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: '#94A3B8', fontSize: 10 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: 10, fontSize: 11, fontWeight: 600 }}
          />
          <Radar
            name="High-Risk Student Profile (Upper Quartile)"
            dataKey="highRisk"
            stroke="#EF4444"
            fill="#EF4444"
            fillOpacity={0.25}
            strokeWidth={2}
          />
          <Radar
            name="Overall Cohort Baseline (N=3,000)"
            dataKey="overall"
            stroke="#3B82F6"
            fill="#3B82F6"
            fillOpacity={0.15}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}

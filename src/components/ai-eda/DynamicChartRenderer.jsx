/**
 * DynamicChartRenderer — Central chart dispatch component
 * Accepts a chart specification JSON from the AI plan and renders
 * the appropriate chart using existing or new chart components.
 */

import React, { useMemo } from 'react'
import ChartCard from '../common/ChartCard'
import GenericBarChart from '../charts/GenericBarChart'
import GroupedBarChart from '../charts/GroupedBarChart'
import BoxPlotChart from '../charts/BoxPlotChart'
import { useAIEda } from '../../context/AIEdaContext'
import { mean, stdDev, pearsonCorrelation } from '../../utils/csvAnalyticsEngine'
import {
  computeHistogramData,
  computeCategoryData,
  computeScatterData
} from '../../utils/chartRecommendationEngine'
import {
  ResponsiveContainer,
  BarChart, Bar,
  ScatterChart, Scatter,
  XAxis, YAxis,
  Tooltip, CartesianGrid, Cell,
  PieChart, Pie
} from 'recharts'

const COLORS = ['#3B82F6', '#0D9488', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#10B981', '#6366F1', '#14B8A6', '#F97316']

// ─── Scatter Chart Wrapper ─────────────────────────────────────────────────────

function ScatterChartWrapper({ data, xKey = 'x', yKey = 'y', xLabel, yLabel }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
        <XAxis dataKey={xKey} name={xLabel} tick={{ fontSize: 11, fill: '#64748B' }} />
        <YAxis dataKey={yKey} name={yLabel} tick={{ fontSize: 11, fill: '#64748B' }} />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload?.length) {
              const d = payload[0].payload
              return (
                <div className="p-3 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-700 text-xs space-y-1">
                  <p className="text-slate-300"><span className="font-semibold text-blue-300">{xLabel}:</span> {d[xKey]}</p>
                  <p className="text-slate-300"><span className="font-semibold text-teal-300">{yLabel}:</span> {d[yKey]}</p>
                  {d.count && <p className="text-slate-400 font-mono">N = {d.count}</p>}
                </div>
              )
            }
            return null
          }}
        />
        <Scatter data={data} fill="#3B82F6">
          {data.map((_, idx) => (
            <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  )
}

// ─── Donut Chart Wrapper ───────────────────────────────────────────────────────

function DonutChartWrapper({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={95}
          paddingAngle={3}
          dataKey="count"
          nameKey="category"
          label={({ category, percentage }) => `${category} (${percentage}%)`}
          labelLine={false}
        >
          {data.map((_, idx) => (
            <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload?.length) {
              const d = payload[0].payload
              return (
                <div className="p-3 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-700 text-xs">
                  <p className="font-bold text-blue-300">{d.category}</p>
                  <p className="text-slate-200">Count: {d.count} ({d.percentage}%)</p>
                </div>
              )
            }
            return null
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

// ─── Heatmap Wrapper ───────────────────────────────────────────────────────────

function HeatmapWrapper({ variables, matrix }) {
  if (!variables || !matrix) return null

  const getColor = (val) => {
    if (val >= 0.7) return '#065F46'
    if (val >= 0.4) return '#059669'
    if (val >= 0.2) return '#34D399'
    if (val >= 0) return '#A7F3D0'
    if (val >= -0.2) return '#FECDD3'
    if (val >= -0.4) return '#FDA4AF'
    if (val >= -0.7) return '#E11D48'
    return '#9F1239'
  }

  return (
    <div className="overflow-x-auto">
      <table className="text-[10px]">
        <thead>
          <tr>
            <th className="p-1.5 text-left font-bold text-slate-500"></th>
            {variables.map(v => (
              <th key={v} className="p-1.5 text-center font-bold text-slate-600 max-w-[60px] truncate" title={v}>
                {v.length > 8 ? v.slice(0, 7) + '…' : v}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, i) => (
            <tr key={i}>
              <td className="p-1.5 font-bold text-slate-600 whitespace-nowrap max-w-[80px] truncate" title={row.variable}>
                {row.variable.length > 10 ? row.variable.slice(0, 9) + '…' : row.variable}
              </td>
              {variables.map(v => {
                const val = row[v]
                return (
                  <td
                    key={v}
                    className="p-1 text-center font-mono font-bold"
                    style={{ backgroundColor: getColor(val), color: Math.abs(val) > 0.4 ? '#fff' : '#334155', minWidth: 42 }}
                    title={`${row.variable} × ${v}: ${typeof val === 'number' ? val.toFixed(3) : val}`}
                  >
                    {typeof val === 'number' ? val.toFixed(2) : '—'}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Main Dynamic Chart Renderer ───────────────────────────────────────────────

export default function DynamicChartRenderer({ chartSpec }) {
  const { analysisData, datasetProfile } = useAIEda()

  const rows = analysisData?.rows || []

  const chartContent = useMemo(() => {
    if (!chartSpec || rows.length === 0) return null

    const { chartType } = chartSpec

    switch (chartType) {
      case 'histogram': {
        const data = computeHistogramData(rows, chartSpec.column)
        return <GenericBarChart data={data} xKey="range" yKey="count" />
      }

      case 'bar': {
        const data = computeCategoryData(rows, chartSpec.column)
        return <GenericBarChart data={data} xKey="category" yKey="count" />
      }

      case 'donut':
      case 'pie': {
        const data = computeCategoryData(rows, chartSpec.column)
        return <DonutChartWrapper data={data} />
      }

      case 'scatter': {
        const xCol = chartSpec.x || chartSpec.columns?.[0]
        const yCol = chartSpec.y || chartSpec.columns?.[1]
        if (!xCol || !yCol) return null
        const data = computeScatterData(rows, xCol, yCol)
        return <ScatterChartWrapper data={data} xKey="x" yKey="y" xLabel={xCol} yLabel={yCol} />
      }

      case 'groupedBar': {
        const data = chartSpec.groupData || []
        if (data.length === 0 && chartSpec.x && chartSpec.y) {
          // Compute group data dynamically
          const groups = {}
          rows.forEach(r => {
            const key = String(r[chartSpec.x] ?? '').trim()
            const val = Number(r[chartSpec.y])
            if (key && !isNaN(val)) {
              if (!groups[key]) groups[key] = []
              groups[key].push(val)
            }
          })
          const groupMeans = Object.entries(groups)
            .map(([group, vals]) => ({ group, mean: parseFloat(mean(vals).toFixed(2)), count: vals.length }))
            .sort((a, b) => b.mean - a.mean)
            .slice(0, 10)
          return <GroupedBarChart data={groupMeans} />
        }
        return <GroupedBarChart data={data} />
      }

      case 'boxplot': {
        const colName = chartSpec.column
        if (!colName) return null
        const profile = datasetProfile?.columnProfiles?.find(c => c.name === colName)
        if (!profile) return null
        const boxData = [{
          category: colName,
          min: profile.min,
          q1: profile.q1,
          median: profile.median,
          q3: profile.q3,
          max: profile.max,
          count: profile.nonEmpty
        }]
        return <BoxPlotChart data={boxData} />
      }

      case 'heatmap': {
        return <HeatmapWrapper variables={chartSpec.variables} matrix={chartSpec.matrix} />
      }

      case 'bubble': {
        // Render as scatter with size encoding
        const xCol = chartSpec.x || chartSpec.columns?.[0]
        const yCol = chartSpec.y || chartSpec.columns?.[1]
        if (!xCol || !yCol) return null
        const data = computeScatterData(rows, xCol, yCol)
        return <ScatterChartWrapper data={data} xKey="x" yKey="y" xLabel={xCol} yLabel={yCol} />
      }

      default:
        return (
          <div className="h-40 flex items-center justify-center text-xs text-slate-400">
            Unsupported chart type: {chartType}
          </div>
        )
    }
  }, [chartSpec, rows, datasetProfile])

  if (!chartSpec) return null

  return (
    <ChartCard
      title={chartSpec.title || 'Chart'}
      subtitle={chartSpec.column ? `Column: ${chartSpec.column}` : (chartSpec.columns?.join(', ') || '')}
      tag={chartSpec.chartType?.toUpperCase()}
      whyDone={chartSpec.reason}
      columnsUsed={chartSpec.column || chartSpec.columns?.join(' × ') || (chartSpec.x && chartSpec.y ? `${chartSpec.x} × ${chartSpec.y}` : '')}
    >
      {chartContent}
    </ChartCard>
  )
}

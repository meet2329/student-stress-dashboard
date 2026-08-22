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
import UnivariateDonut from '../charts/UnivariateDonut'
import { useAIEda } from '../../context/AIEdaContext'
import { mean } from '../../utils/csvAnalyticsEngine'
import {
  computeHistogramData,
  computeCategoryData,
  computeScatterData
} from '../../utils/chartRecommendationEngine'
import {
  CHART_PALETTE,
  SmartChartTooltip,
  formatMetricValue
} from '../../utils/dynamicChartUtils'
import {
  ResponsiveContainer,
  ScatterChart, Scatter,
  XAxis, YAxis,
  Tooltip, CartesianGrid, Cell
} from 'recharts'

// ─── Scatter Chart Wrapper with Dynamic Ticks & Tooltip ─────────────────────────

function ScatterChartWrapper({ data, xKey = 'x', yKey = 'y', xLabel, yLabel }) {
  if (!data || data.length === 0) {
    return <div className="h-40 flex items-center justify-center text-xs text-slate-400">No scatter points</div>
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ScatterChart margin={{ top: 12, right: 24, bottom: 20, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
        <XAxis
          dataKey={xKey}
          name={xLabel}
          tick={{ fontSize: 10, fill: '#64748B' }}
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
          dataKey={yKey}
          name={yLabel}
          tick={{ fontSize: 10, fill: '#64748B' }}
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
        <Tooltip
          content={
            <SmartChartTooltip
              columnName={`${xLabel} vs. ${yLabel}`}
              valueLabel="Coordinates"
            />
          }
        />
        <Scatter data={data} fill="#3B82F6">
          {data.map((_, idx) => (
            <Cell key={idx} fill={CHART_PALETTE[idx % CHART_PALETTE.length]} fillOpacity={0.8} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  )
}

// ─── Heatmap Wrapper with Responsive Tooltips & Long Name Support ───────────────

function HeatmapWrapper({ variables, matrix }) {
  if (!variables || !matrix || variables.length === 0) return null

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
    <div className="overflow-x-auto custom-scrollbar p-1 max-w-full">
      <table className="text-[10px] w-full border-collapse">
        <thead>
          <tr>
            <th className="p-1.5 text-left font-bold text-slate-500 bg-slate-50 sticky left-0 z-10">Variable</th>
            {variables.map(v => (
              <th
                key={v}
                title={v}
                className="p-1.5 text-center font-bold text-slate-600 max-w-[80px] truncate"
              >
                {v.length > 12 ? v.slice(0, 11) + '…' : v}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, i) => (
            <tr key={i} className="hover:bg-slate-50 transition-colors">
              <td
                title={row.variable}
                className="p-1.5 font-bold text-slate-700 whitespace-nowrap max-w-[120px] truncate bg-white sticky left-0 z-10 border-r border-slate-200"
              >
                {row.variable.length > 14 ? row.variable.slice(0, 13) + '…' : row.variable}
              </td>
              {variables.map(v => {
                const val = row[v]
                const isHigh = Math.abs(val) > 0.4
                return (
                  <td
                    key={v}
                    className="p-1.5 text-center font-mono font-bold transition-all rounded-xs border border-white"
                    style={{
                      backgroundColor: getColor(val),
                      color: isHigh ? '#ffffff' : '#1e293b',
                      minWidth: 46
                    }}
                    title={`${row.variable} × ${v}\nPearson Correlation (r): ${typeof val === 'number' ? val.toFixed(3) : val}`}
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
  const { analysisData, datasetProfile, rawDataset } = useAIEda()

  const rows = analysisData?.rows || rawDataset?.rows || []

  const chartContent = useMemo(() => {
    if (!chartSpec || rows.length === 0) return null

    const { chartType } = chartSpec

    switch (chartType) {
      case 'histogram': {
        const data = computeHistogramData(rows, chartSpec.column)
        return <GenericBarChart data={data} xKey="range" yKey="count" colName={chartSpec.column} />
      }

      case 'bar': {
        const data = computeCategoryData(rows, chartSpec.column)
        return <GenericBarChart data={data} xKey="category" yKey="count" colName={chartSpec.column} />
      }

      case 'donut':
      case 'pie': {
        const data = computeCategoryData(rows, chartSpec.column)
        // Guard: If there are >6 categories or very long strings, adapt to horizontal bar chart to prevent cramped pie
        if (data.length > 6) {
          return (
            <div className="space-y-2">
              <div className="text-[10px] text-amber-700 font-semibold bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg inline-block">
                ⚡ Auto-adapted to Horizontal Bar for high readability ({data.length} categories)
              </div>
              <GenericBarChart
                data={data}
                xKey="category"
                yKey="count"
                colName={chartSpec.column}
                forcedOrientation="horizontal"
              />
            </div>
          )
        }
        return <UnivariateDonut data={data} colName={chartSpec.column} />
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
            .slice(0, 12)
          return (
            <GroupedBarChart
              data={groupMeans}
              groupCol={chartSpec.x}
              metricCol={chartSpec.y}
            />
          )
        }
        return (
          <GroupedBarChart
            data={data}
            groupCol={chartSpec.x || chartSpec.columns?.[0]}
            metricCol={chartSpec.y || chartSpec.columns?.[1]}
          />
        )
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

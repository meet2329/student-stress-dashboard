import React, { useMemo } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  ReferenceLine
} from 'recharts'
import {
  CHART_PALETTE,
  getOptimalLabelConfig,
  SmartXAxisTick,
  SmartChartTooltip,
  formatMetricValue
} from '../../utils/dynamicChartUtils'

export default function UnivariateHistogram({
  data = [],
  xKey = 'range',
  yKey = 'count',
  colName,
  meanVal,
  meanLabel = 'Mean',
  barColor = '#3B82F6',
  height = 260,
  showPercentage = false
}) {
  const config = useMemo(() => {
    return getOptimalLabelConfig(data, xKey)
  }, [data, xKey])

  if (!data || data.length === 0) {
    return <div className="h-40 flex items-center justify-center text-xs text-slate-400">No histogram data</div>
  }

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{
            top: 15,
            right: 12,
            bottom: Math.max(6, config.xAxisHeight - 20),
            left: -10
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
          <XAxis
            dataKey={xKey}
            height={config.xAxisHeight}
            tick={
              <SmartXAxisTick
                angle={config.angle}
                textAnchor={config.textAnchor}
                fontSize={config.fontSize}
                maxChars={16}
              />
            }
            tickLine={{ stroke: '#CBD5E1' }}
            axisLine={{ stroke: '#CBD5E1' }}
            interval={0}
          />
          <YAxis
            tick={{ fill: '#64748B', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => formatMetricValue(v)}
          />
          <Tooltip
            content={
              <SmartChartTooltip
                columnName={colName}
                valueLabel="Records"
                extraInfo={meanVal ? `Dataset Mean: ${meanVal}` : undefined}
              />
            }
          />

          {meanVal && (
            <ReferenceLine
              x={meanVal}
              stroke="#EF4444"
              strokeDasharray="3 3"
              strokeWidth={2}
              label={{ value: `${meanLabel}: ${meanVal}`, fill: '#EF4444', fontSize: 10, position: 'top' }}
            />
          )}

          <Bar dataKey={yKey} radius={[6, 6, 0, 0]} maxBarSize={48}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color || barColor || CHART_PALETTE[index % CHART_PALETTE.length]}
                opacity={0.9}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

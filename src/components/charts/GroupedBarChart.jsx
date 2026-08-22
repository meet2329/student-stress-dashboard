import React, { useMemo } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Cell
} from 'recharts'
import {
  CHART_PALETTE,
  getOptimalLabelConfig,
  SmartXAxisTick,
  SmartYAxisTick,
  SmartChartTooltip,
  formatMetricValue
} from '../../utils/dynamicChartUtils'

export default function GroupedBarChart({
  data = [],
  xKey = 'group',
  yKey = 'mean',
  colName,
  groupCol,
  metricCol,
  height
}) {
  const config = useMemo(() => {
    return getOptimalLabelConfig(data, xKey)
  }, [data, xKey])

  if (!data || data.length === 0) {
    return <div className="h-40 flex items-center justify-center text-xs text-slate-400">No group data available</div>
  }

  const effectiveHeight = height || config.recommendedHeight
  const isHorizontal = config.orientation === 'horizontal'

  return (
    <ResponsiveContainer width="100%" height={effectiveHeight}>
      {isHorizontal ? (
        // Horizontal Grouped Layout
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 8, right: 24, left: 4, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 10, fill: '#64748B' }}
            axisLine={{ stroke: '#CBD5E1' }}
            tickLine={false}
            tickFormatter={(v) => formatMetricValue(v)}
          />
          <YAxis
            type="category"
            dataKey={xKey}
            width={config.yAxisWidth}
            tick={<SmartYAxisTick fontSize={config.fontSize} maxChars={config.truncateLength} />}
            axisLine={{ stroke: '#CBD5E1' }}
            tickLine={false}
            interval={0}
          />
          <Tooltip
            content={
              <SmartChartTooltip
                columnName={colName || (groupCol && metricCol ? `${groupCol} × ${metricCol}` : undefined)}
                valueLabel="Group Average"
              />
            }
          />
          <Bar dataKey={yKey} name="Average" fill="#3B82F6" radius={[0, 6, 6, 0]} maxBarSize={32}>
            {data.map((_, idx) => (
              <Cell key={idx} fill={CHART_PALETTE[idx % CHART_PALETTE.length]} />
            ))}
          </Bar>
        </BarChart>
      ) : (
        // Vertical Grouped Layout
        <BarChart
          layout="horizontal"
          data={data}
          margin={config.margin}
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
                maxChars={config.truncateLength}
              />
            }
            axisLine={{ stroke: '#CBD5E1' }}
            tickLine={false}
            interval={0}
          />
          <YAxis
            type="number"
            tick={{ fontSize: 10, fill: '#64748B' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => formatMetricValue(v)}
          />
          <Tooltip
            content={
              <SmartChartTooltip
                columnName={colName || (groupCol && metricCol ? `${groupCol} × ${metricCol}` : undefined)}
                valueLabel="Group Average"
              />
            }
          />
          <Bar dataKey={yKey} name="Average" fill="#3B82F6" radius={[6, 6, 0, 0]} maxBarSize={44}>
            {data.map((_, idx) => (
              <Cell key={idx} fill={CHART_PALETTE[idx % CHART_PALETTE.length]} />
            ))}
          </Bar>
          {data[0]?.count !== undefined && (
            <Bar dataKey="count" name="Cohort N" fill="#0D9488" radius={[6, 6, 0, 0]} maxBarSize={44} />
          )}
        </BarChart>
      )}
    </ResponsiveContainer>
  )
}

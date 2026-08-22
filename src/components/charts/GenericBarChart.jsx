import React, { useMemo } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
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

export default function GenericBarChart({
  data = [],
  xKey = 'category',
  yKey = 'count',
  colName,
  height,
  barColor,
  forcedOrientation
}) {
  const config = useMemo(() => {
    const calculated = getOptimalLabelConfig(data, xKey)
    if (forcedOrientation) {
      calculated.orientation = forcedOrientation
    }
    return calculated
  }, [data, xKey, forcedOrientation])

  if (!data || data.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-xs text-slate-400">
        No data available
      </div>
    )
  }

  const effectiveHeight = height || config.recommendedHeight
  const isHorizontal = config.orientation === 'horizontal'

  const chart = (
    <ResponsiveContainer width="100%" height={effectiveHeight}>
      {isHorizontal ? (
        // ─── Horizontal Bar Chart Layout ──────────────────────────────────────
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
            content={<SmartChartTooltip columnName={colName} valueLabel="Count" />}
          />
          <Bar dataKey={yKey} radius={[0, 6, 6, 0]} maxBarSize={36}>
            {data.map((_, idx) => (
              <Cell
                key={idx}
                fill={barColor || CHART_PALETTE[idx % CHART_PALETTE.length]}
              />
            ))}
          </Bar>
        </BarChart>
      ) : (
        // ─── Vertical Bar Chart Layout ────────────────────────────────────────
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
            content={<SmartChartTooltip columnName={colName} valueLabel="Count" />}
          />
          <Bar dataKey={yKey} radius={[6, 6, 0, 0]} maxBarSize={48}>
            {data.map((_, idx) => (
              <Cell
                key={idx}
                fill={barColor || CHART_PALETTE[idx % CHART_PALETTE.length]}
              />
            ))}
          </Bar>
        </BarChart>
      )}
    </ResponsiveContainer>
  )

  // If there are many categories in horizontal mode, allow a smooth scrollable container
  if (isHorizontal && data.length > 12) {
    return (
      <div className="w-full overflow-y-auto max-h-[420px] pr-2 custom-scrollbar">
        {chart}
      </div>
    )
  }

  return chart
}

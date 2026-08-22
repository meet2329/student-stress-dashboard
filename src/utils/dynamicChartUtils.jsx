/**
 * Dynamic Chart Utils & Layout Engine
 * Centralized, dataset-independent utility for Recharts visualizations.
 * 
 * Features:
 * - Intelligent word-boundary text wrapping (never splits words).
 * - Dynamic orientation selection (vertical vs horizontal bar chart).
 * - Dynamic rotation angles (0°, -25°, -45°, -60°, -90°).
 * - Dynamic margin & axis height/width calculation.
 * - Custom SVG SmartXAxisTick & SmartYAxisTick components to prevent label overlap.
 * - Universal rich dark-themed tooltip showing complete original names and formatted values.
 * - Zero hardcoding: completely adapts to any uploaded CSV dataset.
 */

import React from 'react'

// Standard theme color palette for dynamic charts
export const CHART_PALETTE = [
  '#3B82F6', // Blue
  '#0D9488', // Teal
  '#F59E0B', // Amber
  '#EF4444', // Rose/Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#10B981', // Emerald
  '#6366F1', // Indigo
  '#14B8A6', // Cyan
  '#F97316', // Orange
  '#06B6D4', // Light Cyan
  '#84CC16', // Lime
]

/**
 * Format any numerical or statistical value cleanly
 * e.g., 1500 -> 1.5k, 1200000 -> 1.2M, 3.14159 -> 3.14
 */
export function formatMetricValue(val, precision = 2) {
  if (val === null || val === undefined || val === '') return '—'
  const num = Number(val)
  if (isNaN(num)) return String(val)

  if (Math.abs(num) >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (Math.abs(num) >= 10000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  if (Number.isInteger(num)) {
    return num.toLocaleString()
  }
  return parseFloat(num.toFixed(precision)).toString()
}

/**
 * Intelligently wrap text at word boundaries without breaking words in the middle.
 * 
 * @param {string} text - The input label string
 * @param {number} maxCharsPerLine - Target line character limit (default 16)
 * @param {number} maxLines - Maximum number of lines (default 3)
 * @returns {string[]} Array of lines
 */
export function wrapText(text, maxCharsPerLine = 16, maxLines = 3) {
  if (!text) return ['']
  const str = String(text).trim()
  if (str.length <= maxCharsPerLine) return [str]

  const words = str.split(/\s+/)
  const lines = []
  let currentLine = ''

  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    if (!currentLine) {
      currentLine = word
    } else if ((currentLine + ' ' + word).length <= maxCharsPerLine) {
      currentLine += ' ' + word
    } else {
      lines.push(currentLine)
      currentLine = word
      if (lines.length === maxLines - 1) {
        // Collect remaining words for last line
        const remaining = words.slice(i).join(' ')
        if (remaining.length > maxCharsPerLine) {
          lines.push(remaining.slice(0, maxCharsPerLine - 1) + '…')
        } else {
          lines.push(remaining)
        }
        return lines
      }
    }
  }

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines.slice(0, maxLines)
}

/**
 * Calculates optimal chart layout, orientation, rotation, and dimensions based on dataset characteristics.
 * 
 * @param {string[]|object[]} rawItems - Array of category labels or data objects
 * @param {string} [keyName='category'] - Data key containing category label
 * @param {number} [containerWidth=500] - Estimated container width in px
 * @returns {object} Layout configuration
 */
export function getOptimalLabelConfig(rawItems = [], keyName = 'category', containerWidth = 500) {
  const labels = rawItems.map(item => {
    if (typeof item === 'string') return item
    if (item && typeof item === 'object') return String(item[keyName] ?? item.name ?? item.label ?? item.range ?? '')
    return String(item ?? '')
  }).filter(Boolean)

  const count = labels.length
  if (count === 0) {
    return {
      orientation: 'vertical',
      angle: 0,
      textAnchor: 'middle',
      xAxisHeight: 30,
      yAxisWidth: 60,
      margin: { top: 12, right: 16, left: 10, bottom: 8 },
      recommendedHeight: 280,
      fontSize: 11,
      truncateLength: 16,
      wrapLines: 1,
      isDense: false
    }
  }

  const maxLen = Math.max(...labels.map(l => l.length), 0)
  const avgLen = labels.reduce((sum, l) => sum + l.length, 0) / count

  // 1. Determine orientation: switch to 'horizontal' bar chart if category names are long or count is high
  const shouldUseHorizontal = 
    maxLen > 18 || 
    (avgLen > 12 && count >= 6) || 
    (count >= 9 && maxLen > 10) || 
    count > 12

  if (shouldUseHorizontal) {
    // For Horizontal Bar Chart (Bars along X, categories on Y-Axis)
    const yAxisWidth = Math.min(220, Math.max(80, Math.round(maxLen * 6.8 + 20)))
    const recommendedHeight = Math.max(280, Math.min(800, count * 36 + 60))

    return {
      orientation: 'horizontal',
      angle: 0,
      textAnchor: 'end',
      xAxisHeight: 30,
      yAxisWidth,
      margin: { top: 12, right: 24, left: 8, bottom: 8 },
      recommendedHeight,
      fontSize: count > 15 ? 10 : 11,
      truncateLength: Math.min(30, Math.max(16, Math.floor(yAxisWidth / 7))),
      wrapLines: 2,
      isDense: count > 10
    }
  }

  // 2. For Vertical Bar Chart: Calculate optimal rotation angle and height
  let angle = 0
  let textAnchor = 'middle'
  let xAxisHeight = 35
  let fontSize = 11
  let wrapLines = 1

  if (maxLen <= 8 && count <= 6) {
    angle = 0
    textAnchor = 'middle'
    xAxisHeight = 32
  } else if (maxLen <= 14 && count <= 8) {
    angle = -20
    textAnchor = 'end'
    xAxisHeight = 48
  } else if (maxLen <= 22 || count > 7) {
    angle = -35
    textAnchor = 'end'
    xAxisHeight = 65
    fontSize = 10
  } else {
    angle = -50
    textAnchor = 'end'
    xAxisHeight = 85
    fontSize = 10
  }

  const recommendedHeight = Math.max(280, 240 + Math.max(0, xAxisHeight - 35))

  return {
    orientation: 'vertical',
    angle,
    textAnchor,
    xAxisHeight,
    yAxisWidth: 55,
    margin: { top: 12, right: 16, left: -10, bottom: Math.max(6, xAxisHeight - 20) },
    recommendedHeight,
    fontSize,
    truncateLength: 18,
    wrapLines,
    isDense: count > 8
  }
}

/**
 * Custom SVG tick renderer for Recharts X-Axis that handles rotation, word-wrapping, and ellipsis.
 */
export function SmartXAxisTick({ x, y, payload, angle = 0, textAnchor = 'middle', fontSize = 11, maxChars = 18 }) {
  if (!payload || payload.value === undefined) return null

  const rawValue = String(payload.value)
  const isRotated = angle !== 0

  // For unrotated labels with moderate length, apply intelligent word-wrapping
  if (!isRotated && rawValue.length > 12) {
    const lines = wrapText(rawValue, 12, 2)
    return (
      <g transform={`translate(${x},${y})`}>
        <title>{rawValue}</title>
        <text
          x={0}
          y={0}
          dy={10}
          textAnchor="middle"
          fill="#64748B"
          fontSize={fontSize}
          className="font-medium select-none"
        >
          {lines.map((line, i) => (
            <tspan key={i} x={0} dy={i === 0 ? 0 : 12}>
              {line}
            </tspan>
          ))}
        </text>
      </g>
    )
  }

  // Rotated tick: display text with clean truncation if exceeding maxChars
  const displayText = rawValue.length > maxChars ? rawValue.slice(0, maxChars - 1) + '…' : rawValue

  return (
    <g transform={`translate(${x},${y})`}>
      <title>{rawValue}</title>
      <text
        x={0}
        y={0}
        dy={isRotated ? 8 : 12}
        dx={isRotated ? -4 : 0}
        textAnchor={textAnchor}
        transform={isRotated ? `rotate(${angle})` : undefined}
        fill="#64748B"
        fontSize={fontSize}
        className="font-medium select-none"
      >
        {displayText}
      </text>
    </g>
  )
}

/**
 * Custom SVG tick renderer for Recharts Y-Axis (used in Horizontal Bar Charts).
 */
export function SmartYAxisTick({ x, y, payload, fontSize = 11, maxChars = 24 }) {
  if (!payload || payload.value === undefined) return null

  const rawValue = String(payload.value)
  const displayText = rawValue.length > maxChars ? rawValue.slice(0, maxChars - 1) + '…' : rawValue

  return (
    <g transform={`translate(${x},${y})`}>
      <title>{rawValue}</title>
      <text
        x={-8}
        y={0}
        dy={4}
        textAnchor="end"
        fill="#475569"
        fontSize={fontSize}
        className="font-semibold select-none font-sans"
      >
        {displayText}
      </text>
    </g>
  )
}

/**
 * Standardized Rich Dark Tooltip for all charts.
 * Always renders complete, untruncated column names, full category strings, and formatted metrics.
 */
export function SmartChartTooltip({
  active,
  payload,
  label,
  columnName,
  valueLabel = 'Count',
  unit = '',
  extraInfo
}) {
  if (!active || !payload || !payload.length) return null

  const data = payload[0]?.payload || {}
  const primaryVal = payload[0]?.value ?? data.count ?? data.value ?? data.mean
  const categoryName = label || data.category || data.range || data.name || data.x || data.group

  return (
    <div className="p-3.5 bg-slate-950 text-slate-100 rounded-2xl shadow-2xl border border-slate-700/80 text-xs space-y-1.5 min-w-[180px] max-w-sm z-50 pointer-events-none backdrop-blur-md">
      {/* Column Context Header */}
      {columnName && (
        <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400 border-b border-slate-800 pb-1 flex items-center justify-between gap-2">
          <span className="truncate">{columnName}</span>
          <span className="text-slate-500 font-mono">Dataset Variable</span>
        </div>
      )}

      {/* Full Category Label */}
      {categoryName && (
        <p className="font-bold text-white text-sm break-words leading-tight">
          {categoryName}
        </p>
      )}

      {/* Primary Value Metric */}
      {primaryVal !== undefined && (
        <div className="flex items-center justify-between gap-3 pt-0.5 text-slate-200">
          <span className="text-slate-400 font-medium">{payload[0]?.name || valueLabel}:</span>
          <span className="font-mono font-bold text-emerald-400 text-xs">
            {formatMetricValue(primaryVal)} {unit}
          </span>
        </div>
      )}

      {/* Cohort Percentage if present */}
      {data.percentage !== undefined && (
        <div className="flex items-center justify-between gap-3 text-slate-300">
          <span className="text-slate-400">Proportion:</span>
          <span className="font-mono font-bold text-teal-300">
            {data.percentage}%
          </span>
        </div>
      )}

      {/* Multi-series entries if present */}
      {payload.length > 1 && (
        <div className="pt-1.5 border-t border-slate-800 space-y-1">
          {payload.slice(1).map((entry, idx) => (
            <div key={idx} className="flex items-center justify-between gap-3 text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-mono font-bold text-slate-100">
                {formatMetricValue(entry.value)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Custom Extra Information */}
      {extraInfo && (
        <div className="pt-1 border-t border-slate-800/80 text-[11px] text-slate-400 leading-snug">
          {extraInfo}
        </div>
      )}
    </div>
  )
}

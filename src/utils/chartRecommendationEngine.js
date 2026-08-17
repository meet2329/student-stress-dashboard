/**
 * Chart Recommendation Engine
 * Deterministic fallback that selects appropriate chart types based on column data types.
 * Used when NVIDIA AI is unavailable or as validation for AI-generated chart specs.
 */

import { pearsonCorrelation, linearRegression, mean } from './csvAnalyticsEngine'

// ─── Chart Type Mapping by Data Type Combination ───────────────────────────────

const CHART_RULES = {
  // Univariate
  numerical_single: ['histogram', 'boxplot'],
  categorical_single_low: ['bar', 'donut'],       // ≤ 8 categories
  categorical_single_high: ['bar'],                // > 8 categories
  boolean_single: ['donut'],

  // Bivariate
  numerical_numerical: ['scatter'],
  categorical_numerical: ['groupedBar', 'boxplot'],
  numerical_categorical: ['groupedBar', 'boxplot'],
  categorical_categorical: ['groupedBar'],

  // Multivariate
  multi_numerical: ['heatmap', 'bubble'],
}

// ─── Univariate Chart Selection ────────────────────────────────────────────────

export function selectUnivariateCharts(profile) {
  const charts = []

  profile.columnProfiles.forEach(col => {
    if (col.isIdLike || col.isConstant || col.inferredType === 'empty' || col.inferredType === 'date') return

    if (col.inferredType === 'numerical') {
      charts.push({
        chartType: 'histogram',
        column: col.name,
        title: `Distribution of ${col.name}`,
        reason: `"${col.name}" is a numerical variable (range: ${col.min} – ${col.max}, mean: ${col.mean}). A histogram reveals the shape and spread of its distribution.`,
        dataType: 'numerical',
        stats: { min: col.min, max: col.max, mean: col.mean, median: col.median, std: col.std }
      })
    }

    if (col.inferredType === 'categorical' || col.inferredType === 'boolean') {
      const catCount = col.uniqueCount || 0
      if (catCount <= 8) {
        charts.push({
          chartType: 'donut',
          column: col.name,
          title: `${col.name} Composition`,
          reason: `"${col.name}" is categorical with ${catCount} categories. A donut chart shows the proportional breakdown.`,
          dataType: 'categorical',
          categories: col.topCategories
        })
      } else {
        charts.push({
          chartType: 'bar',
          column: col.name,
          title: `${col.name} — Top Categories`,
          reason: `"${col.name}" has ${catCount} categories. A bar chart of the top values highlights the most frequent categories.`,
          dataType: 'categorical',
          categories: (col.topCategories || []).slice(0, 10)
        })
      }
    }
  })

  return charts
}

// ─── Bivariate Chart Selection ─────────────────────────────────────────────────

export function selectBivariateCharts(profile, rows) {
  const charts = []
  const numCols = profile.columnProfiles.filter(c =>
    c.inferredType === 'numerical' && !c.isIdLike && !c.isConstant
  )
  const catCols = profile.columnProfiles.filter(c =>
    (c.inferredType === 'categorical' || c.inferredType === 'boolean') && !c.isIdLike && !c.isConstant && c.uniqueCount >= 2 && c.uniqueCount <= 20
  )

  // Numerical × Numerical: top pairs by |correlation|
  if (numCols.length >= 2) {
    const pairs = []
    for (let i = 0; i < numCols.length; i++) {
      for (let j = i + 1; j < numCols.length; j++) {
        const xVals = rows.map(r => Number(r[numCols[i].name])).filter(n => !isNaN(n))
        const yVals = rows.map(r => Number(r[numCols[j].name])).filter(n => !isNaN(n))
        const r = pearsonCorrelation(xVals, yVals)
        pairs.push({ x: numCols[i].name, y: numCols[j].name, r, absR: Math.abs(r) })
      }
    }

    pairs.sort((a, b) => b.absR - a.absR)
    const topPairs = pairs.slice(0, Math.min(6, pairs.length))

    topPairs.forEach(pair => {
      const xVals = rows.map(r => Number(r[pair.x])).filter(n => !isNaN(n))
      const yVals = rows.map(r => Number(r[pair.y])).filter(n => !isNaN(n))
      const reg = linearRegression(xVals, yVals)

      charts.push({
        chartType: 'scatter',
        columns: [pair.x, pair.y],
        x: pair.x,
        y: pair.y,
        title: `${pair.x} vs ${pair.y}`,
        reason: `Both "${pair.x}" and "${pair.y}" are numerical. Pearson r = ${pair.r > 0 ? '+' : ''}${pair.r.toFixed(2)} suggests a ${pair.absR > 0.5 ? 'strong' : pair.absR > 0.3 ? 'moderate' : 'weak'} ${pair.r >= 0 ? 'positive' : 'negative'} relationship.`,
        dataType: 'numerical_numerical',
        correlation: pair.r,
        slope: reg.slope,
        intercept: reg.intercept,
        rSquared: parseFloat((pair.r * pair.r).toFixed(3))
      })
    })
  }

  // Categorical × Numerical: group mean comparisons
  if (catCols.length > 0 && numCols.length > 0) {
    const maxCatCharts = Math.min(4, catCols.length * numCols.length)
    let count = 0

    for (const cat of catCols) {
      for (const num of numCols) {
        if (count >= maxCatCharts) break

        const groups = {}
        rows.forEach(r => {
          const key = String(r[cat.name] ?? '').trim()
          const val = Number(r[num.name])
          if (key && !isNaN(val)) {
            if (!groups[key]) groups[key] = []
            groups[key].push(val)
          }
        })

        const groupMeans = Object.entries(groups)
          .map(([group, vals]) => ({ group, mean: parseFloat(mean(vals).toFixed(2)), count: vals.length }))
          .sort((a, b) => b.mean - a.mean)
          .slice(0, 10)

        if (groupMeans.length >= 2) {
          charts.push({
            chartType: 'groupedBar',
            columns: [cat.name, num.name],
            x: cat.name,
            y: num.name,
            title: `${num.name} by ${cat.name}`,
            reason: `Comparing average "${num.name}" across "${cat.name}" categories reveals whether group membership affects the numerical outcome.`,
            dataType: 'categorical_numerical',
            groupData: groupMeans
          })
          count++
        }
      }
    }
  }

  return charts
}

// ─── Multivariate Chart Selection ──────────────────────────────────────────────

export function selectMultivariateCharts(profile, rows) {
  const charts = []
  const numCols = profile.columnProfiles.filter(c =>
    c.inferredType === 'numerical' && !c.isIdLike && !c.isConstant
  )

  // Correlation Heatmap: need at least 3 numerical columns
  if (numCols.length >= 3) {
    const variables = numCols.slice(0, 12).map(c => c.name) // cap at 12 for readability
    const matrix = []

    for (let i = 0; i < variables.length; i++) {
      const row = {}
      for (let j = 0; j < variables.length; j++) {
        if (i === j) {
          row[variables[j]] = 1.0
        } else {
          const xVals = rows.map(r => Number(r[variables[i]])).filter(n => !isNaN(n))
          const yVals = rows.map(r => Number(r[variables[j]])).filter(n => !isNaN(n))
          row[variables[j]] = pearsonCorrelation(xVals, yVals)
        }
      }
      matrix.push({ variable: variables[i], ...row })
    }

    charts.push({
      chartType: 'heatmap',
      columns: variables,
      title: `${variables.length}×${variables.length} Correlation Matrix`,
      reason: `With ${numCols.length} numerical variables, a correlation heatmap reveals the pairwise linear relationships and helps identify collinearity and key drivers.`,
      dataType: 'multi_numerical',
      variables,
      matrix
    })
  }

  // Bubble chart: need at least 3 numerical columns + optionally a categorical for color
  if (numCols.length >= 3) {
    const catCols = profile.columnProfiles.filter(c =>
      (c.inferredType === 'categorical') && !c.isIdLike && c.uniqueCount >= 2 && c.uniqueCount <= 8
    )

    charts.push({
      chartType: 'bubble',
      columns: [numCols[0].name, numCols[1].name, numCols[2].name],
      x: numCols[0].name,
      y: numCols[1].name,
      size: numCols[2].name,
      color: catCols.length > 0 ? catCols[0].name : null,
      title: `${numCols[0].name} × ${numCols[1].name} × ${numCols[2].name}`,
      reason: `A bubble chart maps three numerical dimensions simultaneously: X-axis (${numCols[0].name}), Y-axis (${numCols[1].name}), and bubble size (${numCols[2].name})${catCols.length > 0 ? `, colored by ${catCols[0].name}` : ''}.`,
      dataType: 'multi_numerical'
    })
  }

  return charts
}

// ─── KPI Generation ────────────────────────────────────────────────────────────

export function generateKpis(profile, rows) {
  const kpis = []

  // Total records
  kpis.push({
    title: 'Total Records',
    value: profile.totalRows.toLocaleString(),
    unit: 'rows',
    subtitle: `${profile.totalCols} columns detected`,
    deltaType: 'neutral',
    delta: `${profile.numericalColumns.length} numerical, ${profile.categoricalColumns.length} categorical`,
    statusColor: 'blue',
    iconName: 'Database'
  })

  // First numerical column mean
  const numCols = profile.columnProfiles.filter(c => c.inferredType === 'numerical' && !c.isIdLike && !c.isConstant)
  if (numCols.length > 0) {
    const primaryNum = numCols[0]
    kpis.push({
      title: `Average ${primaryNum.name}`,
      value: primaryNum.mean,
      unit: '',
      subtitle: `Range: ${primaryNum.min} – ${primaryNum.max}`,
      deltaType: 'neutral',
      delta: `Median: ${primaryNum.median}`,
      statusColor: 'teal',
      iconName: 'TrendingUp'
    })

    if (numCols.length > 1) {
      const second = numCols[1]
      kpis.push({
        title: `Average ${second.name}`,
        value: second.mean,
        unit: '',
        subtitle: `Std Dev: ${second.std}`,
        deltaType: 'neutral',
        delta: `Range: ${second.min} – ${second.max}`,
        statusColor: 'amber',
        iconName: 'Activity'
      })
    }

    if (numCols.length > 2) {
      const third = numCols[2]
      kpis.push({
        title: `Average ${third.name}`,
        value: third.mean,
        unit: '',
        subtitle: `Median: ${third.median}`,
        deltaType: 'neutral',
        delta: `Std Dev: ${third.std}`,
        statusColor: 'emerald',
        iconName: 'BarChart3'
      })
    }
  }

  // First categorical column dominant
  const catCols = profile.columnProfiles.filter(c =>
    (c.inferredType === 'categorical' || c.inferredType === 'boolean') && !c.isIdLike && !c.isConstant && c.topCategories?.length > 0
  )
  if (catCols.length > 0) {
    const primary = catCols[0]
    const top = primary.topCategories[0]
    kpis.push({
      title: `Most Common ${primary.name}`,
      value: top.value,
      unit: `${top.pct}%`,
      subtitle: `${primary.uniqueCount} unique categories`,
      deltaType: 'positive',
      delta: `${top.count} occurrences`,
      statusColor: 'blue',
      iconName: 'Tag'
    })
  }

  // Domain
  if (profile.domainInfo) {
    kpis.push({
      title: 'Detected Domain',
      value: profile.domainInfo.domain,
      unit: '',
      subtitle: `Confidence: ${profile.domainInfo.confidence}`,
      deltaType: profile.domainInfo.confidence === 'High' ? 'positive' : 'neutral',
      delta: `${profile.domainInfo.matchedKeywords} keyword matches`,
      statusColor: 'emerald',
      iconName: 'Globe'
    })
  }

  return kpis.slice(0, 6) // Max 6 KPIs
}

// ─── Compute Histogram Data for a Numerical Column ─────────────────────────────

export function computeHistogramData(rows, colName, bucketCount = 6) {
  const values = rows.map(r => Number(r[colName])).filter(n => !isNaN(n))
  if (values.length === 0) return []

  const min = Math.min(...values)
  const max = Math.max(...values)
  if (min === max) return [{ range: String(min), count: values.length }]

  const step = (max - min) / bucketCount
  const buckets = []

  for (let i = 0; i < bucketCount; i++) {
    const lo = min + i * step
    const hi = i === bucketCount - 1 ? max + 0.001 : min + (i + 1) * step
    const count = values.filter(v => v >= lo && v < hi).length
    buckets.push({
      range: `${lo.toFixed(1)}–${(i === bucketCount - 1 ? max : hi).toFixed(1)}`,
      count
    })
  }

  return buckets
}

// ─── Compute Category Data for a Categorical Column ────────────────────────────

export function computeCategoryData(rows, colName) {
  const freq = {}
  rows.forEach(r => {
    const val = String(r[colName] ?? '').trim()
    if (val) freq[val] = (freq[val] || 0) + 1
  })

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([category, count]) => ({
      category,
      count,
      percentage: parseFloat(((count / rows.length) * 100).toFixed(1))
    }))
}

// ─── Compute Binned Scatter Data ───────────────────────────────────────────────

export function computeScatterData(rows, xCol, yCol) {
  const pairs = rows
    .map(r => ({ x: Number(r[xCol]), y: Number(r[yCol]) }))
    .filter(p => !isNaN(p.x) && !isNaN(p.y))

  if (pairs.length === 0) return []

  pairs.sort((a, b) => a.x - b.x)
  const binCount = Math.min(8, Math.max(3, Math.floor(pairs.length / 5)))
  const chunkSize = Math.ceil(pairs.length / binCount)
  const binned = []

  for (let i = 0; i < pairs.length; i += chunkSize) {
    const chunk = pairs.slice(i, i + chunkSize)
    const avgX = mean(chunk.map(c => c.x))
    const avgY = mean(chunk.map(c => c.y))
    binned.push({
      x: parseFloat(avgX.toFixed(2)),
      y: parseFloat(avgY.toFixed(2)),
      count: chunk.length
    })
  }

  return binned
}

// ─── AI Insight Generation (Fallback) ──────────────────────────────────────────

export function generateFallbackInsights(profile, rows) {
  const insights = []

  // Correlations between numerical columns
  const numCols = profile.columnProfiles.filter(c =>
    c.inferredType === 'numerical' && !c.isIdLike && !c.isConstant
  )

  if (numCols.length >= 2) {
    for (let i = 0; i < numCols.length && insights.length < 5; i++) {
      for (let j = i + 1; j < numCols.length && insights.length < 5; j++) {
        const xVals = rows.map(r => Number(r[numCols[i].name])).filter(n => !isNaN(n))
        const yVals = rows.map(r => Number(r[numCols[j].name])).filter(n => !isNaN(n))
        const r = pearsonCorrelation(xVals, yVals)

        if (Math.abs(r) > 0.3) {
          const direction = r > 0 ? 'positive' : 'negative'
          const strength = Math.abs(r) > 0.6 ? 'strong' : 'moderate'
          insights.push({
            id: insights.length + 1,
            observation: `${numCols[i].name} and ${numCols[j].name} show a ${strength} ${direction} relationship.`,
            evidence: `Pearson correlation coefficient r = ${r > 0 ? '+' : ''}${r.toFixed(3)}, R² = ${(r * r).toFixed(3)}.`,
            interpretation: `As ${numCols[i].name} ${r > 0 ? 'increases' : 'increases'}, ${numCols[j].name} tends to ${r > 0 ? 'increase' : 'decrease'}. This is a statistical association, not a causal claim.`,
            confidence: Math.abs(r) > 0.5 ? 'High' : 'Moderate',
            severity: Math.abs(r) > 0.5 ? 'High' : 'Moderate'
          })
        }
      }
    }
  }

  // Distribution insights
  numCols.forEach(col => {
    if (insights.length >= 8) return
    if (col.std !== undefined && col.mean !== undefined && col.mean !== 0) {
      const cv = (col.std / Math.abs(col.mean)) * 100
      if (cv > 50) {
        insights.push({
          id: insights.length + 1,
          observation: `"${col.name}" shows high variability.`,
          evidence: `Coefficient of variation = ${cv.toFixed(1)}%, standard deviation = ${col.std}, mean = ${col.mean}.`,
          interpretation: `The data in this column is highly dispersed around the mean, suggesting significant differences across records.`,
          confidence: 'High',
          severity: 'Moderate'
        })
      }
    }
  })

  return insights
}

// ─── Recommendation Generation (Fallback) ──────────────────────────────────────

export function generateFallbackRecommendations(profile, insights) {
  const recs = []

  if (insights.length === 0) {
    return [{
      id: 1,
      title: 'Insufficient Evidence',
      description: 'The dataset does not contain enough measurable relationships to generate reliable recommendations. Consider adding more variables or records.',
      priority: 'Low',
      evidence: 'No significant correlations detected.'
    }]
  }

  insights.forEach((insight, idx) => {
    if (recs.length >= 5) return
    recs.push({
      id: idx + 1,
      title: `Investigate: ${insight.observation.split('.')[0]}`,
      description: `Based on the observed ${insight.confidence.toLowerCase()}-confidence pattern, further analysis or data collection is recommended to understand the underlying mechanism.`,
      priority: insight.confidence === 'High' ? 'High' : 'Medium',
      evidence: insight.evidence
    })
  })

  return recs
}

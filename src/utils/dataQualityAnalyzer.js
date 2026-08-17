/**
 * Data Quality Analyzer
 * Inspects a profiled dataset for quality issues, computes a quality score,
 * and determines if analysis should proceed.
 */

// ─── Missing Data Analysis ─────────────────────────────────────────────────────

function analyzeMissing(columnProfiles, totalRows) {
  const issues = []
  let totalMissing = 0

  columnProfiles.forEach(col => {
    totalMissing += col.missingCount
    if (col.missingPct > 50) {
      issues.push({
        type: 'missing_excessive',
        severity: 'critical',
        column: col.name,
        message: `Column "${col.name}" has ${col.missingPct}% missing values (${col.missingCount} of ${totalRows} rows).`,
        value: col.missingPct
      })
    } else if (col.missingPct > 20) {
      issues.push({
        type: 'missing_high',
        severity: 'warning',
        column: col.name,
        message: `Column "${col.name}" has ${col.missingPct}% missing values.`,
        value: col.missingPct
      })
    } else if (col.missingPct > 0) {
      issues.push({
        type: 'missing_minor',
        severity: 'info',
        column: col.name,
        message: `Column "${col.name}" has ${col.missingPct}% missing values (${col.missingCount} rows).`,
        value: col.missingPct
      })
    }
  })

  const totalCells = totalRows * columnProfiles.length
  const overallMissingPct = totalCells > 0 ? parseFloat(((totalMissing / totalCells) * 100).toFixed(2)) : 0

  return { totalMissing, overallMissingPct, issues }
}

// ─── Duplicate Detection ───────────────────────────────────────────────────────

function analyzeDuplicates(rows, headers) {
  const seen = new Set()
  let duplicateCount = 0

  rows.forEach(row => {
    const key = headers.map(h => String(row[h] ?? '')).join('|')
    if (seen.has(key)) {
      duplicateCount++
    } else {
      seen.add(key)
    }
  })

  const issues = []
  const duplicatePct = rows.length > 0 ? parseFloat(((duplicateCount / rows.length) * 100).toFixed(1)) : 0

  if (duplicateCount > 0) {
    issues.push({
      type: 'duplicates',
      severity: duplicatePct > 10 ? 'warning' : 'info',
      column: null,
      message: `${duplicateCount} exact duplicate rows detected (${duplicatePct}% of dataset).`,
      value: duplicateCount
    })
  }

  return { duplicateCount, duplicatePct, issues }
}

// ─── Category Inconsistency Detection ──────────────────────────────────────────

function analyzeCategoryConsistency(columnProfiles) {
  const issues = []

  columnProfiles.forEach(col => {
    if ((col.inferredType === 'categorical' || col.inferredType === 'boolean') && col.categoryCounts) {
      const keys = Object.keys(col.categoryCounts)
      const normalizedGroups = {}

      keys.forEach(k => {
        const norm = k.toLowerCase().trim().replace(/\s+/g, ' ')
        if (!normalizedGroups[norm]) normalizedGroups[norm] = []
        normalizedGroups[norm].push(k)
      })

      Object.entries(normalizedGroups).forEach(([norm, variants]) => {
        if (variants.length > 1) {
          issues.push({
            type: 'category_inconsistency',
            severity: 'warning',
            column: col.name,
            message: `Column "${col.name}" has inconsistent category values: ${variants.map(v => `"${v}"`).join(', ')} (likely same category).`,
            value: variants
          })
        }
      })
    }
  })

  return { issues }
}

// ─── Outlier Detection (IQR method) ────────────────────────────────────────────

function analyzeOutliers(columnProfiles, rows) {
  const issues = []
  const outlierDetails = {}

  columnProfiles.forEach(col => {
    if (col.inferredType === 'numerical' && col.q1 !== undefined && col.q3 !== undefined && col.iqr > 0) {
      const lowerBound = col.q1 - 1.5 * col.iqr
      const upperBound = col.q3 + 1.5 * col.iqr
      const values = rows.map(r => Number(r[col.name])).filter(n => !isNaN(n))
      const outliers = values.filter(v => v < lowerBound || v > upperBound)

      if (outliers.length > 0) {
        const outlierPct = parseFloat(((outliers.length / values.length) * 100).toFixed(1))
        outlierDetails[col.name] = {
          count: outliers.length,
          pct: outlierPct,
          lowerBound: parseFloat(lowerBound.toFixed(2)),
          upperBound: parseFloat(upperBound.toFixed(2)),
          minOutlier: parseFloat(Math.min(...outliers).toFixed(2)),
          maxOutlier: parseFloat(Math.max(...outliers).toFixed(2))
        }

        if (outlierPct > 10) {
          issues.push({
            type: 'outliers_many',
            severity: 'warning',
            column: col.name,
            message: `Column "${col.name}" has ${outliers.length} potential outliers (${outlierPct}%) outside IQR bounds [${lowerBound.toFixed(1)}, ${upperBound.toFixed(1)}].`,
            value: outlierPct
          })
        } else if (outliers.length > 0) {
          issues.push({
            type: 'outliers_few',
            severity: 'info',
            column: col.name,
            message: `Column "${col.name}" has ${outliers.length} potential outliers (${outlierPct}%).`,
            value: outlierPct
          })
        }
      }
    }
  })

  return { outlierDetails, issues }
}

// ─── Invalid / Suspicious Data Detection ───────────────────────────────────────

function analyzeInvalidData(columnProfiles, rows) {
  const issues = []

  columnProfiles.forEach(col => {
    if (col.inferredType === 'numerical') {
      const lowerName = col.name.toLowerCase()

      // Check for unexpected negatives in typically positive columns
      const positiveKeywords = ['age', 'price', 'salary', 'income', 'count', 'quantity', 'hours', 'days', 'score', 'rate', 'amount', 'population', 'distance', 'weight', 'height']
      const shouldBePositive = positiveKeywords.some(kw => lowerName.includes(kw))

      if (shouldBePositive && col.min !== undefined && col.min < 0) {
        issues.push({
          type: 'invalid_negative',
          severity: 'warning',
          column: col.name,
          message: `Column "${col.name}" contains negative values (min = ${col.min}) but is expected to be positive.`,
          value: col.min
        })
      }

      // Check for percentage columns out of range
      const pctKeywords = ['percent', 'pct', 'rate', 'ratio', 'percentage']
      const isPctLike = pctKeywords.some(kw => lowerName.includes(kw))

      if (isPctLike && col.max !== undefined && col.max > 100) {
        issues.push({
          type: 'invalid_percentage',
          severity: 'info',
          column: col.name,
          message: `Column "${col.name}" has values exceeding 100 (max = ${col.max}). Verify if this is a percentage column.`,
          value: col.max
        })
      }
    }
  })

  return { issues }
}

// ─── Constant & Low-Variance Detection ─────────────────────────────────────────

function analyzeVariance(columnProfiles) {
  const issues = []

  columnProfiles.forEach(col => {
    if (col.isConstant && !col.isIdLike) {
      issues.push({
        type: 'constant_column',
        severity: 'info',
        column: col.name,
        message: `Column "${col.name}" has only ${col.uniqueCount} unique value(s) — no analytical variance.`,
        value: col.uniqueCount
      })
    }
  })

  return { issues }
}

// ─── Quality Score Calculation ──────────────────────────────────────────────────

function calculateQualityScore(allIssues, totalRows, totalCols) {
  let score = 100

  allIssues.forEach(issue => {
    switch (issue.severity) {
      case 'critical':
        score -= 15
        break
      case 'warning':
        score -= 5
        break
      case 'info':
        score -= 1
        break
    }
  })

  // Bonus penalties for structural problems
  if (totalRows < 5) score -= 20
  if (totalCols < 2) score -= 15

  score = Math.max(0, Math.min(100, score))

  let category
  if (score >= 90) category = 'Excellent'
  else if (score >= 75) category = 'Good'
  else if (score >= 60) category = 'Needs Attention'
  else if (score >= 40) category = 'Poor'
  else category = 'Critical'

  return { score, category }
}

// ─── Decision Gate ─────────────────────────────────────────────────────────────

function determineGateDecision(qualityScore, allIssues) {
  const criticalCount = allIssues.filter(i => i.severity === 'critical').length
  const warningCount = allIssues.filter(i => i.severity === 'warning').length

  if (criticalCount >= 3 || qualityScore.score < 40) {
    return {
      decision: 'block',
      message: 'The uploaded dataset contains significant quality issues that may affect analytical reliability.',
      canProceed: false
    }
  }

  if (criticalCount > 0 || warningCount >= 3 || qualityScore.score < 60) {
    return {
      decision: 'warn',
      message: 'Dataset has quality issues. Analysis can continue, but some results may be affected.',
      canProceed: true
    }
  }

  return {
    decision: 'pass',
    message: 'Dataset quality is acceptable for analysis.',
    canProceed: true
  }
}

// ─── Main Analyzer Function ────────────────────────────────────────────────────

/**
 * Analyze data quality of a profiled dataset
 * @param {{ headers: string[], rows: object[] }} parsedDataset — from parseCSV
 * @param {{ columnProfiles: object[], totalRows: number, totalCols: number }} profile — from profileDataset
 * @returns {object} Complete quality report
 */
export function analyzeDataQuality(parsedDataset, profile) {
  const { headers, rows } = parsedDataset
  const { columnProfiles, totalRows, totalCols } = profile

  const missing = analyzeMissing(columnProfiles, totalRows)
  const duplicates = analyzeDuplicates(rows, headers)
  const categoryConsistency = analyzeCategoryConsistency(columnProfiles)
  const outliers = analyzeOutliers(columnProfiles, rows)
  const invalidData = analyzeInvalidData(columnProfiles, rows)
  const variance = analyzeVariance(columnProfiles)

  const allIssues = [
    ...missing.issues,
    ...duplicates.issues,
    ...categoryConsistency.issues,
    ...outliers.issues,
    ...invalidData.issues,
    ...variance.issues
  ]

  const qualityScore = calculateQualityScore(allIssues, totalRows, totalCols)
  const gateDecision = determineGateDecision(qualityScore, allIssues)

  return {
    qualityScore,
    gateDecision,
    summary: {
      totalIssues: allIssues.length,
      critical: allIssues.filter(i => i.severity === 'critical').length,
      warnings: allIssues.filter(i => i.severity === 'warning').length,
      info: allIssues.filter(i => i.severity === 'info').length,
      totalMissing: missing.totalMissing,
      overallMissingPct: missing.overallMissingPct,
      duplicateCount: duplicates.duplicateCount,
      duplicatePct: duplicates.duplicatePct,
    },
    issues: allIssues,
    outlierDetails: outliers.outlierDetails,
  }
}

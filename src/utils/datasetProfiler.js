/**
 * Generic Dataset Profiler
 * Detects column types, computes per-column statistics, infers domain, and identifies likely targets.
 * Reuses statistical functions from the existing csvAnalyticsEngine.
 */

import { mean, stdDev } from './csvAnalyticsEngine'

// ─── Data Type Detection ───────────────────────────────────────────────────────

const DATE_PATTERNS = [
  /^\d{4}-\d{2}-\d{2}$/,                       // 2024-01-15
  /^\d{2}\/\d{2}\/\d{4}$/,                     // 01/15/2024
  /^\d{2}-\d{2}-\d{4}$/,                       // 15-01-2024
  /^\d{4}\/\d{2}\/\d{2}$/,                     // 2024/01/15
  /^\w{3}\s\d{1,2},?\s\d{4}$/,                 // Jan 15, 2024
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/,            // ISO datetime
]

const BOOLEAN_VALUES = new Set(['true', 'false', 'yes', 'no', '0', '1', 'y', 'n', 't', 'f'])

const ID_PATTERNS = [/^id$/i, /^_id$/i, /id$/i, /^index$/i, /^key$/i, /^code$/i, /^no$/i, /^number$/i, /^serial/i, /^sr/i]

function isDateValue(val) {
  if (typeof val !== 'string') return false
  return DATE_PATTERNS.some(p => p.test(val.trim()))
}

function isBooleanValue(val) {
  return BOOLEAN_VALUES.has(String(val).toLowerCase().trim())
}

function isIdLikeColumn(colName, uniqueRatio, totalRows) {
  const nameMatch = ID_PATTERNS.some(p => p.test(colName))
  const highUniqueness = uniqueRatio > 0.95 && totalRows > 10
  return nameMatch || highUniqueness
}

// ─── Column Type Inference ─────────────────────────────────────────────────────

function inferColumnType(colName, values) {
  const nonEmpty = values.filter(v => v !== null && v !== undefined && String(v).trim() !== '')
  if (nonEmpty.length === 0) return 'empty'

  const sampleSize = Math.min(nonEmpty.length, 200)
  const sample = nonEmpty.slice(0, sampleSize)

  // Check boolean
  const boolCount = sample.filter(v => isBooleanValue(v)).length
  if (boolCount / sampleSize > 0.9) return 'boolean'

  // Check date
  const dateCount = sample.filter(v => isDateValue(v)).length
  if (dateCount / sampleSize > 0.8) return 'date'

  // Check numerical
  const numCount = sample.filter(v => {
    const n = Number(v)
    return !isNaN(n) && String(v).trim() !== ''
  }).length
  if (numCount / sampleSize > 0.85) return 'numerical'

  // Default categorical
  return 'categorical'
}

// ─── Per-Column Profiling ──────────────────────────────────────────────────────

function profileColumn(colName, values, totalRows) {
  const nonEmpty = values.filter(v => v !== null && v !== undefined && String(v).trim() !== '')
  const missingCount = totalRows - nonEmpty.length
  const missingPct = totalRows > 0 ? parseFloat(((missingCount / totalRows) * 100).toFixed(1)) : 0
  const uniqueValues = new Set(nonEmpty.map(v => String(v).trim().toLowerCase()))
  const uniqueCount = uniqueValues.size
  const cardinality = totalRows > 0 ? parseFloat((uniqueCount / totalRows).toFixed(3)) : 0
  const inferredType = inferColumnType(colName, values)

  const profile = {
    name: colName,
    inferredType,
    totalValues: totalRows,
    nonEmpty: nonEmpty.length,
    missingCount,
    missingPct,
    uniqueCount,
    cardinality,
    isIdLike: false,
    isConstant: uniqueCount <= 1,
    isHighCardinality: cardinality > 0.8 && uniqueCount > 50,
  }

  // ID-like detection
  profile.isIdLike = isIdLikeColumn(colName, cardinality, totalRows)

  if (inferredType === 'numerical') {
    const nums = nonEmpty.map(Number).filter(n => !isNaN(n))
    if (nums.length > 0) {
      profile.min = parseFloat(Math.min(...nums).toFixed(2))
      profile.max = parseFloat(Math.max(...nums).toFixed(2))
      profile.mean = parseFloat(mean(nums).toFixed(2))
      profile.std = parseFloat(stdDev(nums).toFixed(2))
      // Median
      const sorted = [...nums].sort((a, b) => a - b)
      const mid = Math.floor(sorted.length / 2)
      profile.median = sorted.length % 2 === 0
        ? parseFloat(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2))
        : parseFloat(sorted[mid].toFixed(2))
      // Quartiles
      const q1Idx = Math.floor(sorted.length * 0.25)
      const q3Idx = Math.floor(sorted.length * 0.75)
      profile.q1 = parseFloat(sorted[q1Idx].toFixed(2))
      profile.q3 = parseFloat(sorted[q3Idx].toFixed(2))
      profile.iqr = parseFloat((profile.q3 - profile.q1).toFixed(2))
    }
  }

  if (inferredType === 'categorical' || inferredType === 'boolean') {
    const freq = {}
    nonEmpty.forEach(v => {
      const key = String(v).trim()
      freq[key] = (freq[key] || 0) + 1
    })
    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1])
    profile.topCategories = sorted.slice(0, 10).map(([value, count]) => ({
      value,
      count,
      pct: parseFloat(((count / nonEmpty.length) * 100).toFixed(1))
    }))
    profile.categoryCounts = freq
  }

  return profile
}

// ─── Domain Inference ──────────────────────────────────────────────────────────

const DOMAIN_KEYWORDS = {
  'Education': ['student', 'grade', 'score', 'exam', 'gpa', 'attendance', 'study', 'university', 'school', 'course', 'marks', 'class', 'teacher', 'semester'],
  'Healthcare': ['patient', 'diagnosis', 'blood', 'heart', 'disease', 'hospital', 'medical', 'treatment', 'symptom', 'health', 'bmi', 'cholesterol', 'glucose'],
  'Sales / Retail': ['sales', 'revenue', 'product', 'order', 'customer', 'price', 'quantity', 'discount', 'profit', 'purchase', 'item', 'store', 'transaction'],
  'Finance': ['income', 'salary', 'investment', 'loan', 'credit', 'debit', 'bank', 'interest', 'tax', 'budget', 'expense', 'portfolio'],
  'Human Resources': ['employee', 'department', 'designation', 'experience', 'hire', 'attrition', 'performance', 'leave', 'overtime', 'promotion', 'tenure'],
  'Transportation': ['vehicle', 'accident', 'road', 'speed', 'distance', 'fuel', 'route', 'traffic', 'driver', 'flight', 'delay'],
  'Real Estate': ['property', 'house', 'rent', 'area', 'sqft', 'bedroom', 'bathroom', 'location', 'listing', 'mortgage'],
  'Environment': ['temperature', 'weather', 'rainfall', 'humidity', 'pollution', 'emission', 'climate', 'wind', 'air_quality'],
}

function inferDomain(headers, sampleValues) {
  const allText = [...headers, ...sampleValues.flat().map(String)].join(' ').toLowerCase()
  const scores = {}

  for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
    scores[domain] = keywords.filter(kw => allText.includes(kw)).length
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
  if (sorted.length > 0 && sorted[0][1] >= 2) {
    return { domain: sorted[0][0], confidence: sorted[0][1] >= 4 ? 'High' : 'Moderate', matchedKeywords: sorted[0][1] }
  }
  return { domain: 'General / Unknown', confidence: 'Low', matchedKeywords: 0 }
}

// ─── Target Column Detection ───────────────────────────────────────────────────

const TARGET_KEYWORDS = ['target', 'label', 'outcome', 'result', 'score', 'status', 'class', 'prediction', 'output', 'response', 'y']

function detectPotentialTargets(columnProfiles) {
  const candidates = columnProfiles
    .filter(c => !c.isIdLike && !c.isConstant && c.inferredType !== 'empty')
    .map(c => {
      let targetScore = 0
      const lowerName = c.name.toLowerCase().replace(/[_\s-]/g, '')

      // Name-based scoring
      TARGET_KEYWORDS.forEach(kw => {
        if (lowerName.includes(kw)) targetScore += 3
      })

      // Last column bias (common convention)
      if (c === columnProfiles[columnProfiles.length - 1]) targetScore += 1

      // Categorical with low cardinality = likely classification target
      if (c.inferredType === 'categorical' && c.uniqueCount >= 2 && c.uniqueCount <= 20) targetScore += 2

      // Numerical with bounded range = likely regression target
      if (c.inferredType === 'numerical' && c.uniqueCount >= 5 && !c.isHighCardinality) targetScore += 1

      return { column: c.name, type: c.inferredType, score: targetScore }
    })
    .filter(c => c.score > 0)
    .sort((a, b) => b.score - a.score)

  return candidates.slice(0, 3)
}

// ─── Main Profiler Function ────────────────────────────────────────────────────

/**
 * Profile a parsed dataset (headers + rows from csvAnalyticsEngine.parseCSV)
 * @param {{ headers: string[], rows: object[] }} parsedDataset
 * @returns {object} Complete dataset profile
 */
export function profileDataset(parsedDataset) {
  const { headers, rows } = parsedDataset
  const totalRows = rows.length
  const totalCols = headers.length

  // Extract column values
  const columnValues = {}
  headers.forEach(h => {
    columnValues[h] = rows.map(r => r[h])
  })

  // Profile each column
  const columnProfiles = headers.map(h => profileColumn(h, columnValues[h], totalRows))

  // Aggregate type counts
  const typeCounts = {
    numerical: columnProfiles.filter(c => c.inferredType === 'numerical').length,
    categorical: columnProfiles.filter(c => c.inferredType === 'categorical').length,
    date: columnProfiles.filter(c => c.inferredType === 'date').length,
    boolean: columnProfiles.filter(c => c.inferredType === 'boolean').length,
    empty: columnProfiles.filter(c => c.inferredType === 'empty').length,
  }

  // ID-like and constant columns
  const idColumns = columnProfiles.filter(c => c.isIdLike).map(c => c.name)
  const constantColumns = columnProfiles.filter(c => c.isConstant).map(c => c.name)
  const highCardinalityColumns = columnProfiles.filter(c => c.isHighCardinality).map(c => c.name)

  // Domain inference
  const sampleRows = rows.slice(0, 20).map(r => headers.map(h => r[h]))
  const domainInfo = inferDomain(headers, sampleRows)

  // Target detection
  const potentialTargets = detectPotentialTargets(columnProfiles)

  // Analysable columns (exclude IDs, constants, empties)
  const analysableColumns = columnProfiles.filter(
    c => !c.isIdLike && !c.isConstant && c.inferredType !== 'empty'
  )
  const numericalColumns = analysableColumns.filter(c => c.inferredType === 'numerical')
  const categoricalColumns = analysableColumns.filter(c => c.inferredType === 'categorical' || c.inferredType === 'boolean')

  return {
    totalRows,
    totalCols,
    headers,
    columnProfiles,
    typeCounts,
    idColumns,
    constantColumns,
    highCardinalityColumns,
    domainInfo,
    potentialTargets,
    analysableColumns: analysableColumns.map(c => c.name),
    numericalColumns: numericalColumns.map(c => c.name),
    categoricalColumns: categoricalColumns.map(c => c.name),
    dateColumns: columnProfiles.filter(c => c.inferredType === 'date').map(c => c.name),
  }
}

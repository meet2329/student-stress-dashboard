/**
 * Safe Preprocessor
 * Performs non-destructive transformations on a COPY of the dataset.
 * Every transformation is logged in a preprocessing report.
 */

// ─── Create Analysis Copy ──────────────────────────────────────────────────────

function deepCopyRows(rows) {
  return rows.map(r => ({ ...r }))
}

// ─── Duplicate Removal ─────────────────────────────────────────────────────────

function removeDuplicates(rows, headers) {
  const seen = new Set()
  const unique = []
  let removedCount = 0

  rows.forEach(row => {
    const key = headers.map(h => String(row[h] ?? '')).join('|')
    if (seen.has(key)) {
      removedCount++
    } else {
      seen.add(key)
      unique.push(row)
    }
  })

  return { rows: unique, removedCount }
}

// ─── Whitespace / Case Normalization for Categorical Columns ───────────────────

function normalizeCategories(rows, columnProfiles) {
  const changes = []

  columnProfiles.forEach(col => {
    if (col.inferredType !== 'categorical' && col.inferredType !== 'boolean') return
    if (!col.categoryCounts) return

    // Build normalization map: group variants by lowercase-trimmed form
    const keys = Object.keys(col.categoryCounts)
    const normalizedGroups = {}

    keys.forEach(k => {
      const norm = k.toLowerCase().trim().replace(/\s+/g, ' ')
      if (!normalizedGroups[norm]) normalizedGroups[norm] = []
      normalizedGroups[norm].push(k)
    })

    // For groups with multiple variants, pick the most frequent as canonical
    const renameMap = {}
    Object.entries(normalizedGroups).forEach(([, variants]) => {
      if (variants.length > 1) {
        // Most frequent variant becomes canonical
        const sorted = variants.sort((a, b) => (col.categoryCounts[b] || 0) - (col.categoryCounts[a] || 0))
        const canonical = sorted[0]
        sorted.slice(1).forEach(v => {
          renameMap[v] = canonical
        })
      }
    })

    if (Object.keys(renameMap).length > 0) {
      let changeCount = 0
      rows.forEach(row => {
        const val = String(row[col.name] ?? '').trim()
        if (renameMap[val]) {
          row[col.name] = renameMap[val]
          changeCount++
        }
      })

      if (changeCount > 0) {
        changes.push({
          type: 'category_normalization',
          column: col.name,
          message: `Normalized ${Object.keys(renameMap).length} variant(s) in "${col.name}" (${changeCount} values updated).`,
          details: renameMap
        })
      }
    }

    // Trim whitespace for all values
    rows.forEach(row => {
      if (row[col.name] !== null && row[col.name] !== undefined) {
        const original = String(row[col.name])
        const trimmed = original.trim()
        if (original !== trimmed) {
          row[col.name] = trimmed
        }
      }
    })
  })

  return { changes }
}

// ─── Missing Value Imputation ──────────────────────────────────────────────────

function imputeMissing(rows, columnProfiles) {
  const changes = []

  columnProfiles.forEach(col => {
    if (col.missingCount === 0) return

    if (col.inferredType === 'numerical' && col.median !== undefined) {
      let imputedCount = 0
      rows.forEach(row => {
        const val = row[col.name]
        if (val === null || val === undefined || String(val).trim() === '' || isNaN(Number(val))) {
          row[col.name] = col.median
          imputedCount++
        }
      })

      if (imputedCount > 0) {
        changes.push({
          type: 'missing_imputation',
          column: col.name,
          message: `Imputed ${imputedCount} missing numerical values in "${col.name}" with median (${col.median}).`,
          method: 'median',
          count: imputedCount
        })
      }
    }

    if ((col.inferredType === 'categorical' || col.inferredType === 'boolean') && col.topCategories?.length > 0) {
      const mode = col.topCategories[0].value
      let imputedCount = 0
      rows.forEach(row => {
        const val = row[col.name]
        if (val === null || val === undefined || String(val).trim() === '') {
          row[col.name] = mode
          imputedCount++
        }
      })

      if (imputedCount > 0) {
        changes.push({
          type: 'missing_imputation',
          column: col.name,
          message: `Imputed ${imputedCount} missing categorical values in "${col.name}" with mode ("${mode}").`,
          method: 'mode',
          count: imputedCount
        })
      }
    }
  })

  return { changes }
}

// ─── Type Conversion (strings → numbers) ───────────────────────────────────────

function convertTypes(rows, columnProfiles) {
  const changes = []

  columnProfiles.forEach(col => {
    if (col.inferredType === 'numerical') {
      let convertedCount = 0
      rows.forEach(row => {
        const val = row[col.name]
        if (typeof val === 'string') {
          const num = Number(val.trim().replace(/,/g, ''))
          if (!isNaN(num)) {
            row[col.name] = num
            convertedCount++
          }
        }
      })

      if (convertedCount > 0) {
        changes.push({
          type: 'type_conversion',
          column: col.name,
          message: `Converted ${convertedCount} string values to numbers in "${col.name}".`,
          count: convertedCount
        })
      }
    }
  })

  return { changes }
}

// ─── Main Preprocessor ─────────────────────────────────────────────────────────

/**
 * Preprocess a dataset non-destructively
 * @param {{ headers: string[], rows: object[] }} parsedDataset
 * @param {{ columnProfiles: object[] }} profile — from datasetProfiler
 * @param {object} options — which transformations to apply
 * @returns {{ rows: object[], report: object }}
 */
export function preprocessDataset(parsedDataset, profile, options = {}) {
  const {
    removeDuplicates: doDuplicates = true,
    normalizeCategories: doNormalize = true,
    imputeMissing: doImpute = true,
    convertTypes: doConvert = true
  } = options

  const originalRowCount = parsedDataset.rows.length
  let rows = deepCopyRows(parsedDataset.rows)
  const allChanges = []

  // 1. Type conversion
  if (doConvert) {
    const { changes } = convertTypes(rows, profile.columnProfiles)
    if (changes && changes.length > 0) changes.forEach(c => allChanges.push(c))
  }

  // 2. Duplicate removal
  let duplicatesRemoved = 0
  if (doDuplicates) {
    const result = removeDuplicates(rows, parsedDataset.headers)
    rows = result.rows
    duplicatesRemoved = result.removedCount
    if (duplicatesRemoved > 0) {
      allChanges.push({
        type: 'duplicate_removal',
        column: null,
        message: `Removed ${duplicatesRemoved} exact duplicate rows.`,
        count: duplicatesRemoved
      })
    }
  }

  // 3. Category normalization
  if (doNormalize) {
    const { changes } = normalizeCategories(rows, profile.columnProfiles)
    if (changes && changes.length > 0) changes.forEach(c => allChanges.push(c))
  }

  // 4. Missing value imputation
  if (doImpute) {
    const { changes } = imputeMissing(rows, profile.columnProfiles)
    if (changes && changes.length > 0) changes.forEach(c => allChanges.push(c))
  }

  const report = {
    originalRows: originalRowCount,
    analyzedRows: rows.length,
    duplicatesRemoved,
    totalChanges: allChanges.length,
    changes: allChanges,
    timestamp: new Date().toISOString()
  }

  return { rows, report }
}

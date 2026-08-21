/**
 * AI EDA Service — Generic NVIDIA NIM Integration for Dynamic Dataset Analysis
 * Reuses the existing NVIDIA NIM proxy endpoint (/api/nvidia) and API key infrastructure.
 * Sends compact dataset metadata (NOT raw CSV) to the AI for structured analysis.
 */

import { DEFAULT_NVIDIA_MODEL, AVAILABLE_NVIDIA_MODELS } from './nvidiaAiService'
import {
  selectUnivariateCharts,
  selectBivariateCharts,
  selectMultivariateCharts,
  generateKpis,
  generateFallbackInsights,
  generateFallbackRecommendations
} from '../utils/chartRecommendationEngine'

// Re-export for convenience
export { DEFAULT_NVIDIA_MODEL, AVAILABLE_NVIDIA_MODELS }

// ─── Build Compact Dataset Summary for AI ──────────────────────────────────────

function buildDatasetSummary(profile, qualityReport) {
  const colSummaries = profile.columnProfiles
    .filter(c => !c.isIdLike)
    .slice(0, 20)
    .map(c => {
      const base = {
        name: c.name,
        type: c.inferredType,
        missing: c.missingPct + '%',
        unique: c.uniqueCount,
      }
      if (c.inferredType === 'numerical') {
        base.min = c.min
        base.max = c.max
        base.mean = c.mean
        base.median = c.median
        base.std = c.std
      }
      if (c.inferredType === 'categorical' && c.topCategories) {
        base.topCategories = c.topCategories.slice(0, 5).map(t => `${t.value} (${t.pct}%)`)
      }
      return base
    })

  return {
    totalRows: profile.totalRows,
    totalCols: profile.totalCols,
    detectedDomain: profile.domainInfo?.domain || 'Unknown',
    domainConfidence: profile.domainInfo?.confidence || 'Low',
    numericalColumns: profile.numericalColumns,
    categoricalColumns: profile.categoricalColumns,
    potentialTargets: profile.potentialTargets?.slice(0, 3),
    dataQualityScore: qualityReport?.qualityScore?.score,
    dataQualityCategory: qualityReport?.qualityScore?.category,
    columnSummaries: colSummaries
  }
}

// ─── NVIDIA AI Structured Prompt ───────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert university data scientist and student wellbeing analytics specialist performing exploratory data analysis on a user-uploaded dataset.

You will receive a compact dataset profile containing column names, types, statistics, and quality metrics.

Your task:
1. Understand the dataset's purpose and domain context.
2. Identify the most important columns and their analytical roles (e.g. stress drivers vs resilience buffers).
3. Recommend KPIs that can be calculated from the data (with the exact column names and aggregation formula).
4. Select the most meaningful univariate, bivariate, and multivariate visualizations (including correlation heatmaps, 4D surfaces, and multi-factor interactions).
5. Generate evidence-based insights with statistical backing, clear plain-English takeaways, and concrete actionable tips.
6. Generate practical, highly actionable recommendations for both Students (daily lifestyle/study habits) and Universities/Institutions (scheduling, wellness policies).

You MUST respond with ONLY valid JSON matching this exact structure:
{
  "datasetUnderstanding": {
    "purpose": "string describing the dataset's likely purpose",
    "domain": "string (e.g., Education & Wellbeing, Sales, Healthcare)",
    "keyColumns": ["column1", "column2"],
    "summary": "2-3 sentence executive summary"
  },
  "kpis": [
    {
      "title": "string",
      "column": "exact_column_name",
      "aggregation": "mean|sum|count|max|min|mode|countDistinct",
      "unit": "string or empty",
      "subtitle": "string"
    }
  ],
  "univariateCharts": [
    {
      "chartType": "histogram|bar|donut",
      "column": "exact_column_name",
      "title": "string",
      "reason": "Why this chart was selected for this column"
    }
  ],
  "bivariateCharts": [
    {
      "chartType": "scatter|groupedBar",
      "x": "exact_column_name",
      "y": "exact_column_name",
      "title": "string",
      "reason": "Why these two variables are paired"
    }
  ],
  "multivariateCharts": [
    {
      "chartType": "heatmap|bubble|interaction",
      "columns": ["col1", "col2", "col3"],
      "title": "string",
      "reason": "Why this multi-dimensional view is meaningful",
      "plainEnglish": "1 sentence layman explanation of what these combined factors reveal"
    }
  ],
  "insights": [
    {
      "category": "🚨 Risk Multiplier|🛡️ Protective Buffer|⚡ Compounding Factor|📊 Cohort Trend",
      "title": "string (clear, student-friendly headline)",
      "observation": "What pattern was observed in the data",
      "evidence": "Statistical evidence (e.g. Pearson r = +0.42, p < 0.001, 17.6% variance)",
      "plainEnglish": "1-2 sentence simple layman explanation of what this means in daily student life",
      "actionTip": "Practical action tip for students or faculty",
      "confidence": "High|Moderate|Low",
      "severity": "High|Moderate|Low"
    }
  ],
  "recommendations": [
    {
      "targetAudience": "Student|University",
      "badge": "⚡ Quick Win|🔄 Sustainable Habit|🎯 High Impact|🏫 Support Policy",
      "title": "string (actionable title)",
      "description": "Clear explanation of what to do and why it helps",
      "priority": "High|Medium|Low",
      "effort": "Easy|Moderate|Institutional",
      "impact": "Expected reduction in stress / fatigue",
      "evidence": "What data pattern supports this recommendation",
      "actionSteps": [
        "Step 1 practical action",
        "Step 2 practical action",
        "Step 3 practical action"
      ]
    }
  ]
}

RULES:
- Use ONLY column names that exist in the dataset profile.
- Do NOT invent non-existent column names.
- Do NOT claim direct causal proof unless evidence supports it; use correlation and associations accurately.
- Make all explanations easy to understand for non-technical students and academic decision-makers.
- Return ONLY raw parseable JSON. No markdown code fences.`

// ─── Call NVIDIA NIM API with Fast Timeout ──────────────────────────────────────

async function callNvidiaApi(apiKey, model, datasetSummary) {
  const proxyEndpoint = '/api/nvidia/chat/completions'
  const cleanKey = (apiKey || '').trim()

  if (!cleanKey || cleanKey.length < 10) {
    return null
  }

  const targetModel = model || DEFAULT_NVIDIA_MODEL

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 6000) // 6s fast timeout

    const response = await fetch(proxyEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cleanKey}`
      },
      body: JSON.stringify({
        model: targetModel,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Dataset Profile:\n${JSON.stringify(datasetSummary, null, 2)}` }
        ],
        temperature: 0.15,
        top_p: 0.85,
        max_tokens: 2200,
        stream: false
      }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (response.ok) {
      const data = await response.json()
      const content = data.choices?.[0]?.message?.content
      if (content) {
        const cleaned = content
          .replace(/^```json\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/```\s*$/i, '')
          .trim()
        return { result: JSON.parse(cleaned), model: targetModel, isAiFallback: false }
      }
    } else {
      console.warn(`AI EDA: API returned HTTP ${response.status}. Using fast local synthesis engine.`)
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      console.warn('AI EDA: NVIDIA API call timed out (6s). Switched to instant local synthesis.')
    } else {
      console.warn('AI EDA: Network notice:', err.message)
    }
  }

  return null
}

// ─── Validate AI Response ──────────────────────────────────────────────────────

function validateAiResponse(response, profile) {
  if (!response || typeof response !== 'object') return null

  const validColumns = new Set(profile.headers)

  // Validate chart column references
  const validateCharts = (charts) => {
    if (!Array.isArray(charts)) return []
    return charts.filter(chart => {
      if (chart.column && !validColumns.has(chart.column)) return false
      if (chart.x && !validColumns.has(chart.x)) return false
      if (chart.y && !validColumns.has(chart.y)) return false
      if (chart.columns && !chart.columns.every(c => validColumns.has(c))) return false
      return true
    })
  }

  return {
    datasetUnderstanding: response.datasetUnderstanding || null,
    kpis: Array.isArray(response.kpis)
      ? response.kpis.filter(k => !k.column || validColumns.has(k.column)).slice(0, 6)
      : [],
    univariateCharts: validateCharts(response.univariateCharts),
    bivariateCharts: validateCharts(response.bivariateCharts),
    multivariateCharts: validateCharts(response.multivariateCharts),
    insights: Array.isArray(response.insights) ? response.insights.slice(0, 8) : [],
    recommendations: Array.isArray(response.recommendations) ? response.recommendations.slice(0, 6) : [],
  }
}

// ─── Compute KPI Values from Actual Data ───────────────────────────────────────

function computeKpiValues(kpiSpecs, rows, profile) {
  return kpiSpecs.map(spec => {
    const col = profile.columnProfiles.find(c => c.name === spec.column)
    let value = '—'

    if (col && spec.aggregation) {
      const vals = rows.map(r => r[spec.column]).filter(v => v !== null && v !== undefined && String(v).trim() !== '')

      switch (spec.aggregation) {
        case 'mean':
          value = col.inferredType === 'numerical' ? col.mean : vals.length
          break
        case 'sum': {
          const nums = vals.map(Number).filter(n => !isNaN(n))
          value = nums.length > 0 ? parseFloat(nums.reduce((a, b) => a + b, 0).toFixed(2)) : 0
          break
        }
        case 'count':
          value = vals.length
          break
        case 'max':
          value = col.inferredType === 'numerical' ? col.max : vals.length
          break
        case 'min':
          value = col.inferredType === 'numerical' ? col.min : vals.length
          break
        case 'mode':
          value = col.topCategories?.[0]?.value || '—'
          break
        case 'countDistinct':
          value = col.uniqueCount || 0
          break
        default:
          value = col.mean || col.uniqueCount || vals.length
      }
    } else if (!spec.column) {
      // Non-column KPI (e.g., total records)
      if (spec.aggregation === 'count') value = rows.length
    }

    return {
      ...spec,
      value: typeof value === 'number' ? (value > 1000 ? value.toLocaleString() : value) : value
    }
  })
}

// ─── Main Analysis Function ────────────────────────────────────────────────────

/**
 * Analyze a dataset using NVIDIA AI with deterministic fallback
 * @param {object} params
 * @param {string} params.apiKey — NVIDIA API key
 * @param {string} params.model — NVIDIA model to use
 * @param {{ headers: string[], rows: object[] }} params.parsedDataset
 * @param {object} params.profile — from datasetProfiler
 * @param {object} params.qualityReport — from dataQualityAnalyzer
 * @returns {object} Complete analysis plan
 */
export async function analyzeDatasetForEda({
  apiKey,
  model = DEFAULT_NVIDIA_MODEL,
  parsedDataset,
  profile,
  qualityReport
}) {
  const { rows } = parsedDataset
  const datasetSummary = buildDatasetSummary(profile, qualityReport)

  // Attempt NVIDIA AI analysis
  if (apiKey && apiKey.trim()) {
    try {
      const aiResult = await callNvidiaApi(apiKey, model, datasetSummary)

      if (aiResult) {
        const validated = validateAiResponse(aiResult.result, profile)

        if (validated) {
          // Compute actual KPI values from data
          const computedKpis = validated.kpis.length > 0
            ? computeKpiValues(validated.kpis, rows, profile)
            : generateKpis(profile, rows)

          return {
            isAiFallback: false,
            model: aiResult.model,
            datasetUnderstanding: validated.datasetUnderstanding,
            kpis: computedKpis,
            univariateCharts: validated.univariateCharts.length > 0
              ? validated.univariateCharts
              : selectUnivariateCharts(profile),
            bivariateCharts: validated.bivariateCharts.length > 0
              ? validated.bivariateCharts
              : selectBivariateCharts(profile, rows),
            multivariateCharts: validated.multivariateCharts.length > 0
              ? validated.multivariateCharts
              : selectMultivariateCharts(profile, rows),
            insights: validated.insights.length > 0
              ? validated.insights.map((ins, i) => ({ id: i + 1, ...ins }))
              : generateFallbackInsights(profile, rows),
            recommendations: validated.recommendations.length > 0
              ? validated.recommendations.map((rec, i) => ({ id: i + 1, ...rec }))
              : generateFallbackRecommendations(profile, generateFallbackInsights(profile, rows)),
          }
        }
      }
    } catch (err) {
      console.warn('AI EDA: NVIDIA analysis failed, using local fallback:', err.message)
    }
  }

  // Deterministic fallback — no AI used
  return {
    isAiFallback: true,
    model: null,
    datasetUnderstanding: {
      purpose: `Analysis of a ${profile.domainInfo?.domain || 'general'} dataset with ${profile.totalRows} records and ${profile.totalCols} variables.`,
      domain: profile.domainInfo?.domain || 'General',
      keyColumns: profile.potentialTargets?.map(t => t.column) || profile.numericalColumns.slice(0, 3),
      summary: `This dataset contains ${profile.totalRows} rows across ${profile.totalCols} columns (${profile.numericalColumns.length} numerical, ${profile.categoricalColumns.length} categorical). Data quality score: ${qualityReport?.qualityScore?.score || 'N/A'}/100.`
    },
    kpis: generateKpis(profile, rows),
    univariateCharts: selectUnivariateCharts(profile),
    bivariateCharts: selectBivariateCharts(profile, rows),
    multivariateCharts: selectMultivariateCharts(profile, rows),
    insights: generateFallbackInsights(profile, rows),
    recommendations: generateFallbackRecommendations(profile, generateFallbackInsights(profile, rows)),
  }
}

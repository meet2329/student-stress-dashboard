/**
 * AI EDA Context — Separate state management for the generic AI-powered EDA workspace.
 * Completely isolated from the existing FilterContext (Student Stress mode).
 */

import React, { createContext, useContext, useState, useMemo, useCallback } from 'react'
import { parseCSV } from '../utils/csvAnalyticsEngine'
import { profileDataset } from '../utils/datasetProfiler'
import { analyzeDataQuality } from '../utils/dataQualityAnalyzer'
import { preprocessDataset } from '../utils/safePreprocessor'
import { analyzeDatasetForEda, DEFAULT_NVIDIA_MODEL } from '../services/aiEdaService'

const AIEdaContext = createContext(null)

// Pipeline stages
export const STAGES = {
  EMPTY: 'empty',
  UPLOADING: 'uploading',
  VALIDATING: 'validating',
  PROFILING: 'profiling',
  QUALITY_CHECK: 'quality_check',
  PREPROCESSING: 'preprocessing',
  AI_ANALYZING: 'ai_analyzing',
  READY: 'ready',
  ERROR: 'error'
}

export function AIEdaProvider({ children }) {
  // ─── Pipeline State ────────────────────────────────────────────────────────
  const [pipelineStage, setPipelineStage] = useState(STAGES.EMPTY)
  const [pipelineError, setPipelineError] = useState(null)

  // ─── Dataset State ─────────────────────────────────────────────────────────
  const [fileName, setFileName] = useState(null)
  const [rawDataset, setRawDataset] = useState(null)         // { headers, rows }
  const [datasetProfile, setDatasetProfile] = useState(null)  // from datasetProfiler
  const [dataQuality, setDataQuality] = useState(null)        // from dataQualityAnalyzer
  const [preprocessingReport, setPreprocessingReport] = useState(null)
  const [analysisData, setAnalysisData] = useState(null)      // preprocessed { headers, rows }
  const [aiPlan, setAiPlan] = useState(null)                  // from aiEdaService
  const [isAiFallback, setIsAiFallback] = useState(false)

  // ─── Completed stage tracking ──────────────────────────────────────────────
  const completedStages = useMemo(() => {
    const stages = []
    if (rawDataset) stages.push('uploaded')
    if (datasetProfile) stages.push('structure_detected', 'profiled')
    if (dataQuality) stages.push('quality_checked')
    if (preprocessingReport) stages.push('preprocessed')
    if (aiPlan) stages.push('ai_analyzed', 'visualization_planned')
    if (pipelineStage === STAGES.READY) stages.push('dashboard_ready')
    return stages
  }, [rawDataset, datasetProfile, dataQuality, preprocessingReport, aiPlan, pipelineStage])

  // ─── Upload & Process Dataset ──────────────────────────────────────────────
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

  const uploadDataset = useCallback(async (csvText, name = 'dataset.csv') => {
    try {
      setPipelineError(null)
      setPipelineStage(STAGES.UPLOADING)
      await sleep(50)

      // 1. Parse CSV (reusing existing engine)
      setPipelineStage(STAGES.VALIDATING)
      const parsed = parseCSV(csvText)
      if (parsed.rows.length < 2) {
        throw new Error(`Dataset has only ${parsed.rows.length} row(s). At least 2 data rows are required.`)
      }
      if (parsed.headers.length < 2) {
        throw new Error(`Dataset has only ${parsed.headers.length} column(s). At least 2 columns are required.`)
      }
      setRawDataset(parsed)
      setFileName(name)
      await sleep(60)

      // 2. Profile dataset
      setPipelineStage(STAGES.PROFILING)
      const profile = profileDataset(parsed)
      setDatasetProfile(profile)
      await sleep(60)

      // 3. Data quality analysis
      setPipelineStage(STAGES.QUALITY_CHECK)
      const quality = analyzeDataQuality(parsed, profile)
      setDataQuality(quality)
      await sleep(60)

      // 4. Preprocessing
      setPipelineStage(STAGES.PREPROCESSING)
      const { rows: cleanRows, report } = preprocessDataset(parsed, profile)
      setPreprocessingReport(report)
      const cleanedDataset = { headers: parsed.headers, rows: cleanRows }
      setAnalysisData(cleanedDataset)
      await sleep(60)

      // 5. AI Analysis
      setPipelineStage(STAGES.AI_ANALYZING)
      const apiKey = import.meta.env.VITE_NVIDIA_API_KEY || localStorage.getItem('NVIDIA_API_KEY') || ''
      const model = import.meta.env.VITE_NVIDIA_MODEL || DEFAULT_NVIDIA_MODEL

      const plan = await analyzeDatasetForEda({
        apiKey,
        model,
        parsedDataset: cleanedDataset,
        profile,
        qualityReport: quality
      })

      setAiPlan(plan)
      setIsAiFallback(plan.isAiFallback)
      await sleep(50)

      // 6. Done
      setPipelineStage(STAGES.READY)

    } catch (err) {
      console.error('AI EDA Pipeline error:', err)
      setPipelineError(err.message || 'Failed to process dataset.')
      setPipelineStage(STAGES.ERROR)
    }
  }, [])

  // ─── Re-run AI Analysis ────────────────────────────────────────────────────
  const rerunAiAnalysis = useCallback(async () => {
    if (!analysisData || !datasetProfile || !dataQuality) return

    try {
      setPipelineStage(STAGES.AI_ANALYZING)
      setPipelineError(null)

      const apiKey = import.meta.env.VITE_NVIDIA_API_KEY || localStorage.getItem('NVIDIA_API_KEY') || ''
      const model = import.meta.env.VITE_NVIDIA_MODEL || DEFAULT_NVIDIA_MODEL

      const plan = await analyzeDatasetForEda({
        apiKey,
        model,
        parsedDataset: analysisData,
        profile: datasetProfile,
        qualityReport: dataQuality
      })

      setAiPlan(plan)
      setIsAiFallback(plan.isAiFallback)
      setPipelineStage(STAGES.READY)
    } catch (err) {
      console.error('AI EDA re-analysis error:', err)
      setPipelineError(err.message)
      setPipelineStage(STAGES.ERROR)
    }
  }, [analysisData, datasetProfile, dataQuality])

  // ─── Reset Workspace ───────────────────────────────────────────────────────
  const resetWorkspace = useCallback(() => {
    setPipelineStage(STAGES.EMPTY)
    setPipelineError(null)
    setFileName(null)
    setRawDataset(null)
    setDatasetProfile(null)
    setDataQuality(null)
    setPreprocessingReport(null)
    setAnalysisData(null)
    setAiPlan(null)
    setIsAiFallback(false)
  }, [])

  // ─── Snapshot Export & Load ───────────────────────────────────────────────
  const exportAIEdaSnapshot = useCallback(() => ({
    fileName,
    rawDataset,
    datasetProfile,
    dataQuality,
    preprocessingReport,
    analysisData,
    aiPlan,
    isAiFallback,
    pipelineStage
  }), [fileName, rawDataset, datasetProfile, dataQuality, preprocessingReport, analysisData, aiPlan, isAiFallback, pipelineStage])

  const loadAIEdaSnapshot = useCallback((snapshot) => {
    if (!snapshot) return
    if (snapshot.fileName !== undefined) setFileName(snapshot.fileName)
    if (snapshot.rawDataset !== undefined) setRawDataset(snapshot.rawDataset)
    if (snapshot.datasetProfile !== undefined) setDatasetProfile(snapshot.datasetProfile)
    if (snapshot.dataQuality !== undefined) setDataQuality(snapshot.dataQuality)
    if (snapshot.preprocessingReport !== undefined) setPreprocessingReport(snapshot.preprocessingReport)
    if (snapshot.analysisData !== undefined) setAnalysisData(snapshot.analysisData)
    if (snapshot.aiPlan !== undefined) setAiPlan(snapshot.aiPlan)
    if (snapshot.isAiFallback !== undefined) setIsAiFallback(Boolean(snapshot.isAiFallback))
    setPipelineStage(snapshot.pipelineStage || STAGES.READY)
  }, [])

  // ─── Context Value ─────────────────────────────────────────────────────────
  const value = useMemo(() => ({
    // Pipeline
    pipelineStage,
    pipelineError,
    completedStages,

    // Data
    fileName,
    rawDataset,
    datasetProfile,
    dataQuality,
    preprocessingReport,
    analysisData,
    aiPlan,
    isAiFallback,

    // Actions
    uploadDataset,
    rerunAiAnalysis,
    resetWorkspace,
    exportAIEdaSnapshot,
    loadAIEdaSnapshot,
  }), [
    pipelineStage, pipelineError, completedStages,
    fileName, rawDataset, datasetProfile, dataQuality,
    preprocessingReport, analysisData, aiPlan, isAiFallback,
    uploadDataset, rerunAiAnalysis, resetWorkspace,
    exportAIEdaSnapshot, loadAIEdaSnapshot
  ])

  return (
    <AIEdaContext.Provider value={value}>
      {children}
    </AIEdaContext.Provider>
  )
}

export function useAIEda() {
  const context = useContext(AIEdaContext)
  if (!context) {
    throw new Error('useAIEda must be used within an AIEdaProvider')
  }
  return context
}

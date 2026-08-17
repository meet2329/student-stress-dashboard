import React, { createContext, useContext, useState, useMemo, useEffect } from 'react'
import defaultKpis from '../data/kpis.json'
import defaultDistributions from '../data/distributions.json'
import defaultBivariate from '../data/bivariate.json'
import defaultInsights from '../data/insights.json'
import { parseCSV, computeDashboardFromRows } from '../utils/csvAnalyticsEngine'
import { analyzeDatasetWithNvidia, DEFAULT_NVIDIA_MODEL } from '../services/nvidiaAiService'

const FilterContext = createContext(null)

export function FilterProvider({ children }) {
  const [selectedGender, setSelectedGender] = useState('All')
  const [selectedUniversity, setSelectedUniversity] = useState('All')
  const [selectedStressLevel, setSelectedStressLevel] = useState('All')
  const [methodologyOpen, setMethodologyOpen] = useState(false)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [ingestionStudioOpen, setIngestionStudioOpen] = useState(false)
  const [nvidiaModalOpen, setNvidiaModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [customDataset, setCustomDataset] = useState(null)
  const [uploadError, setUploadError] = useState(null)

  // NVIDIA AI States: Load from .env first, then fallback to localStorage
  const [nvidiaApiKey, setNvidiaApiKey] = useState(() => {
    return import.meta.env.VITE_NVIDIA_API_KEY || localStorage.getItem('NVIDIA_API_KEY') || ''
  })
  const [nvidiaModel, setNvidiaModel] = useState(() => {
    return import.meta.env.VITE_NVIDIA_MODEL || DEFAULT_NVIDIA_MODEL
  })
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false)
  const [aiAnalysisResult, setAiAnalysisResult] = useState(null)
  const [aiError, setAiError] = useState(null)

  // Persist API Key to localStorage if manually updated
  useEffect(() => {
    if (nvidiaApiKey) {
      localStorage.setItem('NVIDIA_API_KEY', nvidiaApiKey)
    }
  }, [nvidiaApiKey])

  const isFiltered = useMemo(() => {
    return selectedGender !== 'All' || selectedUniversity !== 'All' || selectedStressLevel !== 'All' || searchQuery.trim() !== ''
  }, [selectedGender, selectedUniversity, selectedStressLevel, searchQuery])

  const resetFilters = () => {
    setSelectedGender('All')
    setSelectedUniversity('All')
    setSelectedStressLevel('All')
    setSearchQuery('')
  }

  // Load user CSV file and optionally run NVIDIA AI analysis
  const loadCustomCsvText = async (csvText, fileName = 'custom_dataset.csv', triggerAi = true) => {
    try {
      setUploadError(null)
      setAiError(null)
      const { headers, rows } = parseCSV(csvText)
      if (rows.length < 5) {
        throw new Error(`CSV file contains only ${rows.length} rows. Please provide at least 5 records.`)
      }

      const computed = computeDashboardFromRows(rows, headers)
      const datasetObj = {
        fileName,
        rowCount: rows.length,
        ...computed
      }
      setCustomDataset(datasetObj)
      setUploadModalOpen(false)

      // Automatically execute NVIDIA AI analysis
      if (triggerAi && nvidiaApiKey.trim()) {
        await executeNvidiaAnalysis(datasetObj, nvidiaApiKey, nvidiaModel)
      }
    } catch (err) {
      console.error('CSV Processing error:', err)
      setUploadError(err.message || 'Failed to parse CSV file.')
      throw err
    }
  }

  // Trigger NVIDIA AI on currently loaded dataset
  const executeNvidiaAnalysis = async (datasetToAnalyze, keyToUse, modelToUse) => {
    const targetDataset = datasetToAnalyze || customDataset
    const key = keyToUse || nvidiaApiKey || import.meta.env.VITE_NVIDIA_API_KEY
    const model = modelToUse || nvidiaModel || import.meta.env.VITE_NVIDIA_MODEL || DEFAULT_NVIDIA_MODEL

    if (!key || !key.trim()) {
      setAiError('NVIDIA API Key is required. Please add your key in .env or the settings modal.')
      setNvidiaModalOpen(true)
      return
    }

    try {
      setIsAnalyzingAi(true)
      setAiError(null)

      const result = await analyzeDatasetWithNvidia({
        apiKey: key,
        model: model,
        datasetSummary: {
          totalRecords: targetDataset ? targetDataset.rowCount : 3000,
          variables: targetDataset ? targetDataset.headers : ['Age', 'Gender', 'Stress_Score', 'Sleep_Hours', 'Screen_Time', 'Anxiety_Level', 'Study_Hours']
        },
        kpis: targetDataset ? targetDataset.kpis : defaultKpis,
        correlations: [
          { factor: 'Anxiety Level', r: targetDataset ? targetDataset.bivariate.anxietyVsStress.correlation : 0.51 },
          { factor: 'Screen Time', r: targetDataset ? targetDataset.bivariate.screenVsStress.correlation : 0.42 },
          { factor: 'Sleep Hours', r: targetDataset ? targetDataset.bivariate.sleepVsStress.correlation : -0.38 },
          { factor: 'Study Hours', r: targetDataset ? targetDataset.bivariate.studyVsStress.correlation : 0.28 }
        ],
        distributions: {
          stressLevel: targetDataset ? targetDataset.stressLevelDist : defaultDistributions.stressLevel
        }
      })

      setAiAnalysisResult(result)
    } catch (err) {
      console.error('NVIDIA AI Analysis error:', err)
      setAiError(err.message || 'Failed to complete NVIDIA AI analysis.')
    } finally {
      setIsAnalyzingAi(false)
    }
  }

  const clearCustomDataset = () => {
    setCustomDataset(null)
    setAiAnalysisResult(null)
    setUploadError(null)
    setAiError(null)
  }

  // Generate downloadable sample CSV
  const downloadSampleCsv = () => {
    const sampleHeaders = [
      'Student_ID',
      'Age',
      'Gender',
      'University_Type',
      'Family_Income_Level',
      'Study_Hours',
      'Class_Attendance',
      'Exam_Frequency',
      'Assignment_Load',
      'Sleep_Hours',
      'Screen_Time',
      'Social_Media_Use',
      'Physical_Exercise',
      'Anxiety_Level',
      'Family_Support',
      'Peer_Pressure',
      'Stress_Score'
    ]

    const sampleRows = [
      ['STU_0001', 20, 'Female', 'Public University', 'Upper-Middle', 4.5, 85.0, 4, 3, 6.5, 5.2, 2.5, 3, 3.2, 3.8, 2.5, 62.4],
      ['STU_0002', 21, 'Male', 'Private University', 'Lower-Middle', 5.5, 75.0, 5, 5, 5.0, 7.8, 3.5, 1, 4.2, 2.1, 3.8, 76.5],
      ['STU_0003', 19, 'Female', 'Research Institute', 'High', 3.5, 92.0, 3, 2, 7.5, 4.0, 1.5, 4, 2.0, 4.5, 1.8, 48.0],
      ['STU_0004', 22, 'Male', 'Public University', 'Low', 6.0, 65.0, 6, 6, 4.5, 8.5, 4.2, 0, 4.8, 1.8, 4.5, 84.2],
      ['STU_0005', 20, 'Non-Binary', 'Private University', 'Upper-Middle', 4.0, 80.0, 4, 4, 6.0, 6.0, 2.8, 2, 3.0, 3.2, 3.0, 64.0]
    ]

    const csvContent = [
      sampleHeaders.join(','),
      ...sampleRows.map(r => r.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', 'student_stress_sample_dataset.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Active combined metrics
  const activeKpis = customDataset ? customDataset.kpis : defaultKpis
  const activeDistributions = useMemo(() => {
    if (!customDataset) return defaultDistributions
    return {
      ...defaultDistributions,
      stressLevel: customDataset.stressLevelDist || defaultDistributions.stressLevel,
      stressScoreHistogram: customDataset.stressScoreHistogram || defaultDistributions.stressScoreHistogram,
      topStressFactors: customDataset.topStressFactors || defaultDistributions.topStressFactors
    }
  }, [customDataset])

  const activeBivariate = useMemo(() => {
    if (!customDataset) return defaultBivariate
    return {
      ...defaultBivariate,
      ...customDataset.bivariate
    }
  }, [customDataset])

  // Active insights (AI generated if available, otherwise default empirical)
  const activeInsights = useMemo(() => {
    if (aiAnalysisResult) {
      return {
        keyFindings: aiAnalysisResult.keyFindings || defaultInsights.keyFindings,
        recommendations: aiAnalysisResult.domainRecommendations || defaultInsights.recommendations,
        highStressProfile: {
          ...defaultInsights.highStressProfile,
          title: aiAnalysisResult.highStressProfilePersona?.title || defaultInsights.highStressProfile.title,
          summary: aiAnalysisResult.highStressProfilePersona?.summary || defaultInsights.highStressProfile.summary
        },
        finalDataStory: {
          headline: aiAnalysisResult.finalDataStory?.headline || defaultInsights.finalDataStory.headline,
          leadTakeaway: aiAnalysisResult.finalDataStory?.leadTakeaway || defaultInsights.finalDataStory.leadTakeaway,
          keyTakeaways: [
            { label: 'AI Risk Driver', text: aiAnalysisResult.finalDataStory?.primaryRiskDriver || 'Identified dominant risk factor.' },
            { label: 'AI Protective Buffer', text: aiAnalysisResult.finalDataStory?.primaryProtectiveBuffer || 'Identified primary resilience buffer.' },
            { label: 'Statistical Verdict', text: aiAnalysisResult.finalDataStory?.statisticalVerdict || 'Empirically validated patterns.' },
            { label: 'AI Synthesis', text: aiAnalysisResult.aiExecutiveSummary || 'Full AI analysis completed.' }
          ],
          disclaimer: defaultInsights.finalDataStory.disclaimer
        },
        isAiGenerated: true,
        aiExecutiveSummary: aiAnalysisResult.aiExecutiveSummary,
        smartGraphSelections: aiAnalysisResult.smartGraphSelections
      }
    }
    return defaultInsights
  }, [aiAnalysisResult])

  const value = {
    selectedGender,
    setSelectedGender,
    selectedUniversity,
    setSelectedUniversity,
    selectedStressLevel,
    setSelectedStressLevel,
    methodologyOpen,
    setMethodologyOpen,
    uploadModalOpen,
    setUploadModalOpen,
    ingestionStudioOpen,
    setIngestionStudioOpen,
    nvidiaModalOpen,
    setNvidiaModalOpen,
    searchQuery,
    setSearchQuery,
    isFiltered,
    resetFilters,
    customDataset,
    loadCustomCsvText,
    clearCustomDataset,
    downloadSampleCsv,
    uploadError,
    activeKpis,
    activeDistributions,
    activeBivariate,
    activeInsights,
    // NVIDIA AI
    nvidiaApiKey,
    setNvidiaApiKey,
    nvidiaModel,
    setNvidiaModel,
    isAnalyzingAi,
    aiAnalysisResult,
    aiError,
    executeNvidiaAnalysis
  }

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  )
}

export function useFilter() {
  const context = useContext(FilterContext)
  if (!context) {
    throw new Error('useFilter must be used within a FilterProvider')
  }
  return context
}

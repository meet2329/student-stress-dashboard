import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  UploadCloud, 
  Sparkles, 
  Cpu, 
  Database, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  Zap, 
  Download, 
  RefreshCw, 
  AlertCircle,
  Activity,
  Layers,
  ShieldCheck,
  X
} from 'lucide-react'
import { useFilter } from '../../context/FilterContext'

export default function AiDatasetIngestionStudio({ isOpen, onClose }) {
  const { 
    loadCustomCsvText, 
    customDataset, 
    downloadSampleCsv, 
    clearCustomDataset,
    nvidiaModel,
    isAnalyzingAi
  } = useFilter()

  const [dragOver, setDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileContent, setFileContent] = useState(null)
  const [ingestionStep, setIngestionStep] = useState(0) // 0 = ready, 1 = parsing, 2 = AI reasoning, 3 = complete
  const [errorMessage, setErrorMessage] = useState('')
  const fileInputRef = useRef(null)

  if (!isOpen) return null

  const handleFile = (file) => {
    if (!file || !file.name.endsWith('.csv')) {
      setErrorMessage('Please select a valid comma-delimited .csv file.')
      return
    }
    setErrorMessage('')
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target.result
      const previewLines = text.split(/\r?\n/).slice(0, 5).join('\n')
      setFileContent({
        raw: text,
        preview: previewLines,
        size: (file.size / 1024).toFixed(1) + ' KB'
      })
    }
    reader.readAsText(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleStartAiIngestion = async () => {
    if (!fileContent || !fileContent.raw) return
    try {
      setErrorMessage('')
      setIngestionStep(1) // Step 1: Parsing
      
      setTimeout(async () => {
        setIngestionStep(2) // Step 2: NVIDIA AI reasoning
        try {
          await loadCustomCsvText(fileContent.raw, selectedFile ? selectedFile.name : 'custom_dataset.csv', true)
          setIngestionStep(3) // Step 3: Complete
          setTimeout(() => {
            onClose()
            setIngestionStep(0)
          }, 1200)
        } catch (err) {
          setErrorMessage(err.message || 'Failed to process dataset with NVIDIA AI.')
          setIngestionStep(0)
        }
      }, 900)
    } catch (err) {
      setErrorMessage(err.message || 'Failed to process CSV file.')
      setIngestionStep(0)
    }
  }

  const handleUseBenchmark = () => {
    clearCustomDataset()
    onClose()
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Studio Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 260 }}
          className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10 text-white"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-md">
                <Cpu className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                  <span>AI Dataset Ingestion Studio</span>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full border border-emerald-400/30 font-mono">
                    NVIDIA Nemotron 70B
                  </span>
                </h3>
                <p className="text-xs text-slate-300 font-medium">
                  Upload your student CSV to autonomously synthesize custom graphs & insights
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
            {/* Error Banner */}
            {errorMessage && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Ingestion Notice:</p>
                  <p>{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Ingestion Steps Visual Progress (if processing) */}
            {ingestionStep > 0 ? (
              <div className="p-6 rounded-3xl bg-slate-950/80 border border-emerald-500/30 space-y-4 text-center">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-400/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                  <RefreshCw className="w-8 h-8 animate-spin" />
                </div>

                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white">
                    {ingestionStep === 1 && 'Step 1/3: Parsing CSV & Detecting Variables...'}
                    {ingestionStep === 2 && 'Step 2/3: NVIDIA Nemotron 70B Reasoning on Correlations & Regressions...'}
                    {ingestionStep === 3 && 'Step 3/3: Dashboard Synthesis Complete!'}
                  </h4>
                  <p className="text-xs text-slate-400 font-mono">
                    {ingestionStep === 1 && 'Extracting headers, continuous scales, and discrete cohorts'}
                    {ingestionStep === 2 && 'Computing Bivariate Regressions & Generating Custom Action Framework'}
                    {ingestionStep === 3 && 'Redirecting to your personalized student stress dashboard'}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-400"
                    initial={{ width: '10%' }}
                    animate={{ 
                      width: ingestionStep === 1 ? '40%' : ingestionStep === 2 ? '85%' : '100%' 
                    }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </div>
            ) : (
              <>
                {/* Drag & Drop Upload Zone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  className={`
                    p-8 rounded-3xl border-2 border-dashed text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3
                    ${dragOver 
                      ? 'border-emerald-400 bg-emerald-500/10 scale-[1.01]' 
                      : 'border-slate-700 bg-slate-950/60 hover:bg-slate-950 hover:border-slate-500'
                    }
                  `}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => e.target.files && handleFile(e.target.files[0])}
                  />
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center shadow-md">
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white">
                      Drop your cleaned student CSV dataset here
                    </p>
                    <p className="text-xs text-slate-400 font-medium">
                      Or click to browse from your computer (Standard comma-delimited <code>.csv</code>)
                    </p>
                  </div>
                </div>

                {/* File Preview */}
                {fileContent && (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                      <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                        <FileText className="w-4 h-4" />
                        {selectedFile?.name} ({fileContent.size})
                      </span>
                      <span className="font-mono text-slate-400">Header Preview</span>
                    </div>
                    <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto p-2 bg-slate-900/90 rounded-xl leading-relaxed max-h-32">
                      {fileContent.preview}
                    </pre>
                  </div>
                )}

                {/* Dual Options Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Download Template */}
                  <button
                    type="button"
                    onClick={downloadSampleCsv}
                    className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-400" />
                    <span>Download Sample CSV Template</span>
                  </button>

                  {/* Benchmark 3k */}
                  <button
                    type="button"
                    onClick={handleUseBenchmark}
                    className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-emerald-400 transition-colors flex items-center justify-center gap-2"
                  >
                    <Database className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Use 3,000 University Benchmark</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>

            <button
              disabled={!fileContent || ingestionStep > 0}
              onClick={handleStartAiIngestion}
              className={`
                px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg
                ${fileContent && ingestionStep === 0
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-500/25 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }
              `}
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>Generate AI Dashboard from CSV</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

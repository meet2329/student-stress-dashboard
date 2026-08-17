import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  UploadCloud, 
  X, 
  FileText, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Database,
  RotateCcw,
  Cpu,
  Key,
  Zap,
  RefreshCw
} from 'lucide-react'
import { useFilter } from '../../context/FilterContext'

export default function DatasetUploadModal() {
  const { 
    uploadModalOpen, 
    setUploadModalOpen, 
    loadCustomCsvText, 
    customDataset, 
    clearCustomDataset,
    downloadSampleCsv,
    uploadError,
    nvidiaApiKey,
    setNvidiaApiKey,
    isAnalyzingAi
  } = useFilter()

  const [dragOver, setDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)
  const [enableAiAnalysis, setEnableAiAnalysis] = useState(true)
  const [tempApiKey, setTempApiKey] = useState(nvidiaApiKey)
  const fileInputRef = useRef(null)

  if (!uploadModalOpen) return null

  const handleFile = (file) => {
    if (!file || !file.name.endsWith('.csv')) {
      alert('Please select a valid .csv file.')
      return
    }
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target.result
      const previewLines = text.split(/\r?\n/).slice(0, 5).join('\n')
      setFilePreview({
        rawText: text,
        previewText: previewLines,
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

  const handleApply = async () => {
    if (filePreview && filePreview.rawText) {
      if (tempApiKey && tempApiKey.trim() !== nvidiaApiKey) {
        setNvidiaApiKey(tempApiKey.trim())
      }
      await loadCustomCsvText(
        filePreview.rawText, 
        selectedFile ? selectedFile.name : 'custom_dataset.csv',
        enableAiAnalysis && !!tempApiKey.trim()
      )
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setUploadModalOpen(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col z-10"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-teal-400">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Upload Cleaned Student Dataset (CSV)
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Dynamic client-side statistical calculation & optional NVIDIA AI reasoning
                </p>
              </div>
            </div>
            <button
              onClick={() => setUploadModalOpen(false)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
            {/* Status indicator if custom dataset is already active */}
            {customDataset && (
              <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold text-teal-900">Custom Dataset Active: {customDataset.fileName}</p>
                    <p className="text-teal-700 font-mono">N = {customDataset.rowCount} student records processed</p>
                  </div>
                </div>
                <button
                  onClick={clearCustomDataset}
                  className="px-3 py-1.5 rounded-xl bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restore Default (3k)
                </button>
              </div>
            )}

            {/* Error message */}
            {uploadError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Upload Failed:</p>
                  <p>{uploadError}</p>
                </div>
              </div>
            )}

            {/* Drag & Drop Area */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              className={`
                p-8 rounded-3xl border-2 border-dashed text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3
                ${dragOver ? 'border-blue-500 bg-blue-50/60 scale-[1.01]' : 'border-slate-300 bg-slate-50/80 hover:bg-slate-100/80 hover:border-slate-400'}
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => e.target.files && handleFile(e.target.files[0])}
              />
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-xs">
                <UploadCloud className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-800">
                  Click to upload or drag & drop your CSV file here
                </p>
                <p className="text-xs text-slate-500 font-medium">
                  Supported format: standard comma-delimited <code>.csv</code> (UTF-8)
                </p>
              </div>
            </div>

            {/* File Preview */}
            {filePreview && (
              <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                  <span className="font-bold text-teal-300 flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    {selectedFile?.name} ({filePreview.size})
                  </span>
                  <span className="font-mono text-slate-400">Preview (First 5 lines)</span>
                </div>
                <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto p-2 bg-slate-950/80 rounded-xl leading-relaxed max-h-36">
                  {filePreview.previewText}
                </pre>
              </div>
            )}

            {/* NVIDIA AI Integration Panel inside upload modal */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white border border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    NVIDIA AI Reasoning Engine (Llama 3.3 70B)
                  </span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-emerald-300">
                  <input
                    type="checkbox"
                    checked={enableAiAnalysis}
                    onChange={(e) => setEnableAiAnalysis(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Enable AI Insights</span>
                </label>
              </div>

              {enableAiAnalysis && (
                <div className="space-y-2 pt-1 border-t border-slate-700/80">
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={tempApiKey}
                      onChange={(e) => setTempApiKey(e.target.value)}
                      placeholder="Enter your NVIDIA API Key (nvapi-...)"
                      className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-950/80 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">
                    The NVIDIA model will read your CSV metrics and generate personalized findings, actions, and risk personas!
                  </p>
                </div>
              )}
            </div>

            {/* Download Sample Template */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <p className="font-bold text-slate-800">Need a sample CSV file structure?</p>
                <p className="text-slate-500">Download the formatted CSV dataset template to inspect column names.</p>
              </div>
              <button
                type="button"
                onClick={downloadSampleCsv}
                className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold transition-colors flex items-center gap-1.5 flex-shrink-0 shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <span>Download Sample CSV</span>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <button
              onClick={() => setUploadModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/70 transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={!filePreview || isAnalyzingAi}
              onClick={handleApply}
              className={`
                px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md
                ${filePreview && !isAnalyzingAi
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25 cursor-pointer' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }
              `}
            >
              {isAnalyzingAi ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing & Reasoning with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  <span>Apply Dataset & Compute Analytics</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

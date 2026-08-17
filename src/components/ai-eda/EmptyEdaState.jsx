import React, { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { UploadCloud, Sparkles, Database, FileText, ArrowRight, Cpu } from 'lucide-react'
import { useAIEda } from '../../context/AIEdaContext'

export default function EmptyEdaState() {
  const { uploadDataset } = useAIEda()
  const fileInputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState(null)

  const handleFile = (file) => {
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please select a valid .csv file.')
      return
    }
    if (file.size > 50 * 1024 * 1024) {
      setError('File size exceeds 50MB limit. Please use a smaller dataset.')
      return
    }
    setError(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      uploadDataset(e.target.result, file.name)
    }
    reader.readAsText(file)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-16 px-6"
    >
      {/* Icon */}
      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center mb-8 shadow-xl shadow-blue-500/20">
        <Cpu className="w-12 h-12 text-white" />
      </div>

      {/* Title */}
      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight text-center mb-3">
        AI-Powered Data Analytics
      </h2>
      <p className="text-sm text-slate-500 font-medium text-center max-w-lg mb-8 leading-relaxed">
        Upload a CSV dataset and let AI automatically understand, validate, analyze, and visualize your data.
      </p>

      {/* Upload Zone */}
      <div
        className={`
          relative w-full max-w-lg p-8 rounded-3xl border-2 border-dashed transition-all cursor-pointer
          ${dragOver
            ? 'border-blue-500 bg-blue-50/50 scale-[1.02]'
            : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50/30'
          }
        `}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0])
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-2xl bg-blue-100/70 text-blue-600">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-bold text-slate-800">
              Drop your CSV file here or <span className="text-blue-600">browse</span>
            </p>
            <p className="text-xs text-slate-400">Supported format: CSV (max 50MB)</p>
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-4 text-xs text-rose-600 font-semibold">{error}</p>
      )}

      {/* Pipeline Preview */}
      <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl w-full">
        {[
          { icon: FileText, label: 'Validate & Profile', color: 'blue' },
          { icon: Database, label: 'Quality Analysis', color: 'teal' },
          { icon: Sparkles, label: 'AI Understanding', color: 'amber' },
          { icon: ArrowRight, label: 'Dynamic Dashboard', color: 'emerald' },
        ].map((step, idx) => (
          <div key={idx} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <step.icon className={`w-5 h-5 text-${step.color}-500`} />
            <span className="text-[11px] font-semibold text-slate-600 text-center">{step.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

import React, { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  UploadCloud, 
  Sparkles, 
  Database, 
  FileText, 
  ArrowRight, 
  Cpu,
  GraduationCap,
  Activity,
  DollarSign,
  ShoppingBag,
  CheckCircle2,
  ShieldCheck,
  Zap,
  BarChart3
} from 'lucide-react'
import { useAIEda } from '../../context/AIEdaContext'
import { SAMPLE_DATASETS } from '../../data/sampleDatasets'

const DOMAIN_ICONS = {
  GraduationCap,
  Activity,
  DollarSign,
  ShoppingBag
}

export default function EmptyEdaState() {
  const { uploadDataset } = useAIEda()
  const fileInputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState(null)
  const [loadingSampleId, setLoadingSampleId] = useState(null)

  const handleFile = (file) => {
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please select a valid .csv file.')
      return
    }
    if (file.size > 200 * 1024 * 1024) {
      setError('File size exceeds 200MB limit. Please use a smaller dataset.')
      return
    }
    setError(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      uploadDataset(e.target.result, file.name)
    }
    reader.readAsText(file)
  }

  const handleLoadSample = (sample) => {
    setLoadingSampleId(sample.id)
    setError(null)
    setTimeout(() => {
      uploadDataset(sample.csv, `${sample.id}_dataset.csv`)
    }, 150)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-10"
    >
      {/* Hero Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
          <span>Automated Domain-Adaptive EDA</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          AI-Powered Data Analytics
        </h2>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
          Upload any CSV dataset. The engine automatically inspects data structure, evaluates data health, computes statistical distributions, and synthesizes key insights.
        </p>
      </div>

      {/* Upload Zone */}
      <div
        className={`
          relative w-full max-w-2xl mx-auto p-8 sm:p-10 rounded-3xl border-2 border-dashed transition-all cursor-pointer shadow-xs
          ${dragOver
            ? 'border-blue-500 bg-blue-50/70 scale-[1.01] shadow-blue-500/10'
            : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-slate-50/70 hover:shadow-md'
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

        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <p className="text-base font-bold text-slate-800">
              Drag & drop your CSV dataset here, or <span className="text-blue-600 underline">Browse File</span>
            </p>
            <p className="text-xs text-slate-400 font-medium">
              Supported file format: standard CSV (comma-delimited) up to 200MB
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-md mx-auto p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 text-center font-bold">
          {error}
        </div>
      )}

      {/* Instant 1-Click Sample Datasets */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Or Explore with Instant Sample Datasets
            </h3>
            <p className="text-xs text-slate-500">
              Click any domain below to load a dataset and view real-time automated EDA
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400">
            {SAMPLE_DATASETS.length} datasets ready
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SAMPLE_DATASETS.map((sample, idx) => {
            const Icon = DOMAIN_ICONS[sample.icon] || Database
            const isLoading = loadingSampleId === sample.id

            return (
              <motion.div
                key={sample.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-blue-600">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
                      {sample.badge}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">
                      {sample.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-1 line-clamp-2">
                      {sample.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-slate-100 pt-2">
                    <span>{sample.rows} rows</span>
                    <span>{sample.cols} cols</span>
                  </div>

                  <button
                    onClick={() => handleLoadSample(sample)}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span>Loading...</span>
                    ) : (
                      <>
                        <span>Load Sample</span>
                        <ArrowRight className="w-3 h-3" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Feature Guarantee Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
        {[
          { icon: FileText, label: '1. Ingestion & Profiling', desc: 'Type inference & distributions' },
          { icon: ShieldCheck, label: '2. Data Health Check', desc: 'Missingness & outlier checks' },
          { icon: Sparkles, label: '3. AI Understanding', desc: 'Pattern synthesis & insights' },
          { icon: BarChart3, label: '4. Dynamic Dashboard', desc: 'Interactive charts & KPIs' },
        ].map((step, idx) => (
          <div key={idx} className="flex flex-col items-center text-center gap-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <step.icon className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-bold text-slate-800">{step.label}</span>
            <span className="text-[11px] text-slate-400">{step.desc}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

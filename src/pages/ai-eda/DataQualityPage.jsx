import React from 'react'
import { motion } from 'framer-motion'
import { useAIEda, STAGES } from '../../context/AIEdaContext'
import DataQualityDashboard from '../../components/ai-eda/DataQualityDashboard'
import SectionHeader from '../../components/common/SectionHeader'
import { useNavigate } from 'react-router-dom'
import { Database, ShieldCheck, ArrowRight } from 'lucide-react'

export default function DataQualityPage() {
  const { pipelineStage, dataQuality, datasetProfile, fileName } = useAIEda()
  const navigate = useNavigate()

  if (pipelineStage === STAGES.EMPTY) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
          <Database className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-800">No Dataset Active</h3>
          <p className="text-xs text-slate-500 font-medium max-w-sm">
            Upload a CSV dataset or select a sample on the overview page to run automated data quality & integrity checks.
          </p>
        </div>
        <button
          onClick={() => navigate('/ai-eda')}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-all shadow-sm cursor-pointer"
        >
          <span>Go to Overview & Upload</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    )
  }

  if (!dataQuality) {
    return (
      <div className="py-24 text-center space-y-2">
        <p className="text-sm text-slate-600 font-semibold">Performing automated data quality analysis...</p>
        <p className="text-xs text-slate-400">Inspecting missingness, duplicate rows, categorical variants, and outliers.</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 pb-12"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SectionHeader
          title="Data Quality & Integrity Assessment"
          subtitle={`Validation metrics for ${fileName || 'uploaded dataset'} (${datasetProfile?.totalRows?.toLocaleString() || 0} observations across ${datasetProfile?.totalCols || 0} features)`}
        />
      </div>

      {/* Dataset Architecture KPI Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total Rows', value: datasetProfile?.totalRows?.toLocaleString() || '—' },
          { label: 'Total Columns', value: datasetProfile?.totalCols || '—' },
          { label: 'Numerical', value: datasetProfile?.numericalColumns?.length || 0 },
          { label: 'Categorical', value: datasetProfile?.categoricalColumns?.length || 0 },
          { label: 'ID Variables', value: datasetProfile?.idColumns?.length || 0 },
          { label: 'Constant Columns', value: datasetProfile?.constantColumns?.length || 0 },
        ].map((item, i) => (
          <div key={i} className="p-3.5 rounded-2xl bg-white border border-slate-200/90 text-center shadow-2xs">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{item.label}</p>
            <p className="text-lg font-black text-slate-800 font-mono mt-0.5">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Main Quality Dashboard */}
      <DataQualityDashboard />
    </motion.div>
  )
}

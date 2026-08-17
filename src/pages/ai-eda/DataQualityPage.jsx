import React from 'react'
import { motion } from 'framer-motion'
import { useAIEda, STAGES } from '../../context/AIEdaContext'
import DataQualityDashboard from '../../components/ai-eda/DataQualityDashboard'
import SectionHeader from '../../components/common/SectionHeader'
import { useNavigate } from 'react-router-dom'

export default function DataQualityPage() {
  const { pipelineStage, dataQuality, datasetProfile, fileName } = useAIEda()
  const navigate = useNavigate()

  if (pipelineStage === STAGES.EMPTY) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <p className="text-sm text-slate-500 font-medium">No dataset loaded.</p>
        <button
          onClick={() => navigate('/ai-eda')}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-all"
        >
          Go to Overview & Upload
        </button>
      </div>
    )
  }

  if (!dataQuality) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-slate-400 font-medium">Quality analysis is still processing...</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <SectionHeader
        title="Data Quality Analysis"
        subtitle={`Quality assessment for ${fileName || 'uploaded dataset'} — ${datasetProfile?.totalRows?.toLocaleString() || 0} rows × ${datasetProfile?.totalCols || 0} columns`}
      />

      {/* Dataset Structure Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total Rows', value: datasetProfile?.totalRows?.toLocaleString() || '—' },
          { label: 'Total Columns', value: datasetProfile?.totalCols || '—' },
          { label: 'Numerical', value: datasetProfile?.numericalColumns?.length || 0 },
          { label: 'Categorical', value: datasetProfile?.categoricalColumns?.length || 0 },
          { label: 'ID-like', value: datasetProfile?.idColumns?.length || 0 },
          { label: 'Constant', value: datasetProfile?.constantColumns?.length || 0 },
        ].map((item, i) => (
          <div key={i} className="p-3 rounded-xl bg-white border border-slate-200/80 text-center shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</p>
            <p className="text-xl font-extrabold text-slate-800 mt-1">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Column Profiles Table */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-800">Column Profiles</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th className="text-left px-4 py-2.5 font-bold text-slate-600">Column</th>
                <th className="text-left px-4 py-2.5 font-bold text-slate-600">Type</th>
                <th className="text-right px-4 py-2.5 font-bold text-slate-600">Unique</th>
                <th className="text-right px-4 py-2.5 font-bold text-slate-600">Missing</th>
                <th className="text-right px-4 py-2.5 font-bold text-slate-600">Min</th>
                <th className="text-right px-4 py-2.5 font-bold text-slate-600">Max</th>
                <th className="text-right px-4 py-2.5 font-bold text-slate-600">Mean</th>
                <th className="text-left px-4 py-2.5 font-bold text-slate-600">Top Values</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {datasetProfile?.columnProfiles?.map((col, idx) => {
                const typeColors = {
                  numerical: 'bg-blue-100 text-blue-800 border-blue-200',
                  categorical: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                  boolean: 'bg-purple-100 text-purple-800 border-purple-200',
                  date: 'bg-amber-100 text-amber-800 border-amber-200',
                  empty: 'bg-slate-100 text-slate-600 border-slate-200',
                }
                return (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-2 font-mono font-bold text-slate-800">
                      {col.name}
                      {col.isIdLike && <span className="ml-1 text-[9px] text-slate-400">(ID)</span>}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${typeColors[col.inferredType] || typeColors.empty}`}>
                        {col.inferredType}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right font-mono text-slate-600">{col.uniqueCount}</td>
                    <td className="px-4 py-2 text-right">
                      <span className={`font-mono ${col.missingPct > 10 ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                        {col.missingPct}%
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right font-mono text-slate-500">{col.min ?? '—'}</td>
                    <td className="px-4 py-2 text-right font-mono text-slate-500">{col.max ?? '—'}</td>
                    <td className="px-4 py-2 text-right font-mono text-slate-500">{col.mean ?? '—'}</td>
                    <td className="px-4 py-2 text-left text-slate-500 max-w-[160px] truncate">
                      {col.topCategories
                        ? col.topCategories.slice(0, 3).map(t => t.value).join(', ')
                        : '—'
                      }
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quality Dashboard */}
      <DataQualityDashboard />
    </motion.div>
  )
}

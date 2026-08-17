import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles, RefreshCw, Trash2, FileText, Cpu, AlertTriangle } from 'lucide-react'
import { useAIEda, STAGES } from '../../context/AIEdaContext'
import EmptyEdaState from '../../components/ai-eda/EmptyEdaState'
import PipelineProgress from '../../components/ai-eda/PipelineProgress'
import DynamicKpiGrid from '../../components/ai-eda/DynamicKpiGrid'
import DynamicChartRenderer from '../../components/ai-eda/DynamicChartRenderer'
import SectionHeader from '../../components/common/SectionHeader'

export default function AIEdaOverviewPage() {
  const {
    pipelineStage, fileName, datasetProfile, aiPlan,
    isAiFallback, rerunAiAnalysis, resetWorkspace
  } = useAIEda()

  // Empty state
  if (pipelineStage === STAGES.EMPTY) return <EmptyEdaState />

  // Processing state
  if (pipelineStage !== STAGES.READY && pipelineStage !== STAGES.ERROR) {
    return (
      <div className="max-w-xl mx-auto py-16">
        <PipelineProgress />
      </div>
    )
  }

  // Error state
  if (pipelineStage === STAGES.ERROR) {
    return (
      <div className="max-w-xl mx-auto py-16">
        <PipelineProgress />
        <div className="mt-6 flex justify-center">
          <button
            onClick={resetWorkspace}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all"
          >
            <Trash2 className="w-4 h-4" /> Reset & Upload New Dataset
          </button>
        </div>
      </div>
    )
  }

  // Ready state — render dashboard
  const topCharts = aiPlan?.univariateCharts?.slice(0, 2) || []

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-mono font-bold text-slate-600">{fileName}</span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-bold border border-slate-200">
              {datasetProfile?.totalRows?.toLocaleString()} rows × {datasetProfile?.totalCols} cols
            </span>
            {datasetProfile?.domainInfo?.domain && (
              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                {datasetProfile.domainInfo.domain}
              </span>
            )}
          </div>
          {isAiFallback && (
            <div className="flex items-center gap-1.5 text-[11px] text-amber-600 font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Local Analytical Fallback — configure NVIDIA API key for AI-powered analysis</span>
            </div>
          )}
          {!isAiFallback && aiPlan?.model && (
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
              <Cpu className="w-3.5 h-3.5" />
              <span>AI-Powered Analysis via {aiPlan.model}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={rerunAiAnalysis}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Re-run AI
          </button>
          <button
            onClick={resetWorkspace}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" /> New Dataset
          </button>
        </div>
      </div>

      {/* AI Understanding */}
      {aiPlan?.datasetUnderstanding && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-teal-50 border border-blue-200/60">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-bold text-slate-800">AI Dataset Understanding</h3>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">{aiPlan.datasetUnderstanding.summary}</p>
          {aiPlan.datasetUnderstanding.keyColumns?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase mr-1">Key Columns:</span>
              {aiPlan.datasetUnderstanding.keyColumns.map((col, i) => (
                <span key={i} className="px-2 py-0.5 rounded-md bg-white text-blue-700 text-[10px] font-mono font-bold border border-blue-200/80">
                  {col}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* KPIs */}
      <div>
        <SectionHeader
          title="Key Performance Indicators"
          subtitle="Auto-generated metrics from your dataset"
        />
        <DynamicKpiGrid />
      </div>

      {/* Top Charts Preview */}
      {topCharts.length > 0 && (
        <div>
          <SectionHeader
            title="Distribution Overview"
            subtitle="Primary univariate distributions from your data"
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {topCharts.map((chart, idx) => (
              <DynamicChartRenderer key={idx} chartSpec={chart} />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}

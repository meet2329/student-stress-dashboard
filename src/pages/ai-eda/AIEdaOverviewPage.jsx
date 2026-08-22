import React from 'react'
import { motion } from 'framer-motion'
import { 
  Sparkles, 
  RefreshCw, 
  Trash2, 
  FileText, 
  Cpu, 
  AlertTriangle,
  ArrowRight,
  Database,
  Layers,
  BarChart3,
  GitBranch,
  BrainCircuit,
  Lightbulb,
  Target
} from 'lucide-react'
import { useAIEda, STAGES } from '../../context/AIEdaContext'
import EmptyEdaState from '../../components/ai-eda/EmptyEdaState'
import PipelineProgress from '../../components/ai-eda/PipelineProgress'
import DynamicKpiGrid from '../../components/ai-eda/DynamicKpiGrid'
import DynamicChartRenderer from '../../components/ai-eda/DynamicChartRenderer'
import SectionHeader from '../../components/common/SectionHeader'
import CardTilt3D from '../../components/3d/CardTilt3D'
import { Link } from 'react-router-dom'

export default function AIEdaOverviewPage() {
  const {
    pipelineStage, fileName, datasetProfile, aiPlan,
    isAiFallback, rerunAiAnalysis, resetWorkspace
  } = useAIEda()

  // 1. Empty state
  if (pipelineStage === STAGES.EMPTY) return <EmptyEdaState />

  // 2. Processing state
  if (pipelineStage !== STAGES.READY && pipelineStage !== STAGES.ERROR) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4">
        <PipelineProgress />
      </div>
    )
  }

  // 3. Error state
  if (pipelineStage === STAGES.ERROR) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 space-y-6">
        <PipelineProgress />
        <div className="flex justify-center">
          <button
            onClick={resetWorkspace}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-md cursor-pointer"
          >
            <Trash2 className="w-4 h-4" /> Reset & Upload New Dataset
          </button>
        </div>
      </div>
    )
  }

  // 4. Ready state — render dashboard
  const topCharts = [
    ...(aiPlan?.univariateCharts?.slice(0, 2) || []),
    ...(aiPlan?.bivariateCharts?.slice(0, 1) || []),
    ...(aiPlan?.multivariateCharts?.slice(0, 1) || [])
  ]

  const topInsights = aiPlan?.insights?.slice(0, 3) || []

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 pb-12"
    >
      {/* ─── Hero Overview Banner ─────────────────────────────────────────── */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-950 to-blue-950 text-white border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-teal-500/20 text-teal-300 text-xs font-extrabold uppercase tracking-wider border border-teal-500/30">
                {datasetProfile?.domainInfo?.domain || 'Dataset Analyzed'}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white/10 text-slate-300 text-xs font-mono border border-white/10 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                {fileName || 'dataset.csv'}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white/10 text-slate-300 text-xs font-mono border border-white/10">
                {datasetProfile?.totalRows?.toLocaleString()} rows × {datasetProfile?.totalCols} cols
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Automated Exploratory Data Analysis
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Computed empirical statistics across {datasetProfile?.numericalColumns?.length || 0} numerical and {datasetProfile?.categoricalColumns?.length || 0} categorical variables.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <button
              onClick={rerunAiAnalysis}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Re-run AI
            </button>
            <button
              onClick={resetWorkspace}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold border border-white/15 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> New Dataset
            </button>
          </div>
        </div>

        {/* Engine Status Line */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
          {isAiFallback ? (
            <div className="flex items-center gap-1.5 text-amber-300">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Deterministic Synthesis Engine Active</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <Cpu className="w-3.5 h-3.5" />
              <span>AI Reasoning Engine Active via {aiPlan?.model || 'NVIDIA NIM'}</span>
            </div>
          )}

          <Link to="/ai-eda/quality" className="text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1">
            Data Quality Report <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* ─── AI Understanding Card ────────────────────────────────────────── */}
      {aiPlan?.datasetUnderstanding && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-teal-50/60 border border-blue-200/80 shadow-2xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              AI Dataset Understanding & Synthesis
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
            {aiPlan.datasetUnderstanding.summary}
          </p>
          {aiPlan.datasetUnderstanding.keyColumns?.length > 0 && (
            <div className="pt-1 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                Key Analytical Features:
              </span>
              {aiPlan.datasetUnderstanding.keyColumns.map((col, i) => (
                <span key={i} className="px-2.5 py-0.5 rounded-lg bg-white text-blue-700 text-xs font-mono font-bold border border-blue-200 shadow-2xs">
                  {col}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Key Performance Indicators ───────────────────────────────────── */}
      <div className="space-y-4">
        <SectionHeader
          title="Key Performance Indicators"
          subtitle="Auto-computed statistical metrics and aggregates from your dataset"
        />
        <DynamicKpiGrid />
      </div>

      {/* ─── Top Analytical Findings ──────────────────────────────────────── */}
      {topInsights.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <SectionHeader
              title="Top Analytical Insights"
              subtitle="Evidence-based associations and statistical anomalies discovered in the data"
            />
            <Link
              to="/ai-eda/insights"
              className="text-xs font-bold text-blue-600 hover:text-blue-500 flex items-center gap-1"
            >
              View All Insights ({aiPlan?.insights?.length || 0}) <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topInsights.map((ins, idx) => (
              <CardTilt3D key={idx} maxTilt={5} scaleOnHover={1.02} className="h-full">
                <div
                  className="p-5 rounded-2xl bg-white/95 backdrop-blur-xs border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 h-full"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                        {ins.category || 'Correlation'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        ins.severity === 'High' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ins.confidence || 'High'} Confidence
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">
                      {ins.title || ins.observation}
                    </h4>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {ins.interpretation || ins.observation}
                    </p>
                  </div>

                  {ins.evidence && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 font-mono text-[11px] text-slate-700 truncate" title={ins.evidence}>
                      {ins.evidence}
                    </div>
                  )}
                </div>
              </CardTilt3D>
            ))}
          </div>
        </div>
      )}

      {/* ─── Recommended Charts Preview ───────────────────────────────────── */}
      {topCharts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <SectionHeader
              title="Recommended Visualizations"
              subtitle="Primary distributions and bivariate relationships automatically selected"
            />
            <div className="flex items-center gap-3 text-xs font-bold">
              <Link to="/ai-eda/univariate" className="text-blue-600 hover:text-blue-500">
                Univariate
              </Link>
              <span className="text-slate-300">•</span>
              <Link to="/ai-eda/bivariate" className="text-blue-600 hover:text-blue-500">
                Bivariate
              </Link>
              <span className="text-slate-300">•</span>
              <Link to="/ai-eda/multivariate" className="text-blue-600 hover:text-blue-500">
                Multivariate
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {topCharts.map((chart, idx) => (
              <DynamicChartRenderer key={idx} chartSpec={chart} />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}

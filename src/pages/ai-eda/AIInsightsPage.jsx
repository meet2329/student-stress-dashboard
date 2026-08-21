import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle2, 
  ShieldAlert, 
  ShieldCheck, 
  Lightbulb, 
  ArrowRight,
  Database,
  Layers,
  Filter
} from 'lucide-react'
import { useAIEda, STAGES } from '../../context/AIEdaContext'
import SectionHeader from '../../components/common/SectionHeader'
import { useNavigate } from 'react-router-dom'

function InsightCard({ insight, index }) {
  const isRisk = insight.category?.includes('Risk') || insight.severity === 'High'
  const isBuffer = insight.category?.includes('Buffer') || insight.category?.includes('Wellness')
  
  const borderClass = isRisk
    ? 'border-l-rose-500 bg-gradient-to-br from-white to-rose-50/20'
    : isBuffer
      ? 'border-l-emerald-500 bg-gradient-to-br from-white to-emerald-50/20'
      : 'border-l-blue-500 bg-gradient-to-br from-white to-blue-50/20'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm border-l-4 ${borderClass} space-y-4 hover:shadow-md transition-all`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${
            isRisk ? 'bg-rose-100 text-rose-800 border border-rose-200' :
            isBuffer ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
            'bg-blue-100 text-blue-800 border border-blue-200'
          }`}>
            {insight.category || (isRisk ? '🚨 Risk Multiplier' : '💡 Analytical Finding')}
          </span>
          <span className="text-[10px] font-bold font-mono text-slate-400">
            CONFIDENCE: {insight.confidence || 'High'}
          </span>
        </div>

        <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
          insight.severity === 'High' ? 'bg-rose-50 text-rose-700' :
          insight.severity === 'Moderate' ? 'bg-amber-50 text-amber-700' :
          'bg-teal-50 text-teal-700'
        }`}>
          {insight.severity || 'Moderate'} Impact
        </span>
      </div>

      {/* Main Title & Plain English Explanation */}
      <div className="space-y-1.5">
        <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
          {insight.title || insight.observation}
        </h3>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
          {insight.plainEnglish || insight.interpretation || insight.observation}
        </p>
      </div>

      {/* Data Evidence & Statistical Foundation */}
      {insight.evidence && (
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
            <span>Mathematical Evidence from Your Dataset:</span>
          </p>
          <p className="text-xs text-slate-800 font-mono font-semibold">
            {insight.evidence}
          </p>
        </div>
      )}

      {/* Actionable Tip */}
      {(insight.actionTip || insight.interpretation) && (
        <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2 leading-relaxed">
          <Lightbulb className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-950 font-bold">Practical Action: </strong>
            <span>{insight.actionTip || insight.interpretation}</span>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default function AIInsightsPage() {
  const { pipelineStage, aiPlan, isAiFallback, fileName, datasetProfile } = useAIEda()
  const navigate = useNavigate()
  const [filterTab, setFilterTab] = useState('all') // 'all' | 'risk' | 'buffer'

  const rawInsights = aiPlan?.insights || []

  const filteredInsights = useMemo(() => {
    if (filterTab === 'all') return rawInsights
    if (filterTab === 'risk') {
      return rawInsights.filter(ins => ins.category?.includes('Risk') || ins.category?.includes('Compounding') || ins.severity === 'High')
    }
    if (filterTab === 'buffer') {
      return rawInsights.filter(ins => ins.category?.includes('Buffer') || ins.category?.includes('Wellness') || ins.category?.includes('Protective'))
    }
    return rawInsights
  }, [rawInsights, filterTab])

  if (pipelineStage === STAGES.EMPTY) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
          <Database className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-800">No Dataset Active</h3>
          <p className="text-xs text-slate-500 font-medium max-w-sm">
            Upload a CSV dataset on the overview page to synthesize actionable insights and statistical findings.
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

  if (pipelineStage !== STAGES.READY) {
    return (
      <div className="py-24 text-center space-y-2">
        <p className="text-sm text-slate-600 font-semibold">Synthesizing analytical insights...</p>
        <p className="text-xs text-slate-400">Extracting risk drivers and protective resilience buffers.</p>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SectionHeader
          title="Data-Driven Insights & Findings"
          subtitle={`Actionable patterns discovered in ${fileName || 'your dataset'} across ${datasetProfile?.totalRows?.toLocaleString() || 0} observations`}
          badge="Actionable Analytics"
        />

        {/* Filter Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs flex-shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              filterTab === 'all' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Insights ({rawInsights.length})
          </button>
          <button
            onClick={() => setFilterTab('risk')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              filterTab === 'risk' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🚨 Risk Drivers
          </button>
          <button
            onClick={() => setFilterTab('buffer')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              filterTab === 'buffer' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🛡️ Protective Buffers
          </button>
        </div>
      </div>

      {/* Engine Status Banner */}
      {!isAiFallback ? (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>AI Reasoning Active: Findings synthesized with advanced natural language reasoning and backed by empirical statistics.</span>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-800 font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span>Automated Statistical Synthesis: All insights are generated from verified bivariate and multivariate regressions in your data.</span>
        </div>
      )}

      {/* List of Insights */}
      {filteredInsights.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-2">
          <p className="text-sm font-bold text-slate-700">No matching insights in this category.</p>
          <p className="text-xs text-slate-400">Click 'All Insights' to view all findings.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInsights.map((insight, idx) => (
            <InsightCard key={insight.id || idx} insight={insight} index={idx} />
          ))}
        </div>
      )}

      {/* Analytical Disclaimer */}
      <div className="p-4 rounded-2xl bg-slate-900 text-white text-xs border border-slate-800 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold text-white">Interpretative Standard</p>
          <p className="text-slate-300 leading-relaxed">
            All insights reflect empirical mathematical associations within your uploaded dataset. Statistical correlation does not imply direct causation. Use these findings to inform evidence-based strategies and domain-specific decision-making.
          </p>
        </div>
      </div>
    </motion.div>
  )
}

import React from 'react'
import { motion } from 'framer-motion'
import { Lightbulb, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react'
import { useAIEda, STAGES } from '../../context/AIEdaContext'
import SectionHeader from '../../components/common/SectionHeader'
import { useNavigate } from 'react-router-dom'

function RecommendationCard({ rec, index }) {
  const priorityColors = {
    High: 'bg-rose-50 border-rose-200 text-rose-700',
    Medium: 'bg-amber-50 border-amber-200 text-amber-700',
    Low: 'bg-blue-50 border-blue-200 text-blue-700',
  }
  const priorityBadge = {
    High: 'bg-rose-100 text-rose-800 border-rose-300',
    Medium: 'bg-amber-100 text-amber-800 border-amber-300',
    Low: 'bg-blue-100 text-blue-700 border-blue-300',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className={`p-5 rounded-2xl border shadow-sm ${priorityColors[rec.priority] || 'bg-slate-50 border-slate-200 text-slate-700'}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-2">
          <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <h4 className="text-sm font-bold">{rec.title}</h4>
        </div>
        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border flex-shrink-0 ${priorityBadge[rec.priority] || priorityBadge.Low}`}>
          {rec.priority} Priority
        </span>
      </div>

      <p className="text-xs leading-relaxed mb-3 ml-6">{rec.description}</p>

      {rec.evidence && (
        <div className="ml-6 p-2.5 rounded-lg bg-white/60 border border-current/10">
          <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5 opacity-60">Evidence</p>
          <p className="text-xs font-mono">{rec.evidence}</p>
        </div>
      )}
    </motion.div>
  )
}

export default function RecommendationsPage() {
  const { pipelineStage, aiPlan, isAiFallback } = useAIEda()
  const navigate = useNavigate()

  if (pipelineStage === STAGES.EMPTY) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <p className="text-sm text-slate-500 font-medium">No dataset loaded.</p>
        <button onClick={() => navigate('/ai-eda')} className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500">
          Go to Overview & Upload
        </button>
      </div>
    )
  }

  if (pipelineStage !== STAGES.READY) {
    return <div className="py-20 text-center text-sm text-slate-400 font-medium">Processing dataset...</div>
  }

  const recs = aiPlan?.recommendations || []

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <SectionHeader
        title="Recommendations"
        subtitle="Evidence-based actionable recommendations derived from the data analysis"
      />

      {isAiFallback && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700 font-medium flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5" />
          Recommendations generated from local statistical analysis. Configure NVIDIA API key for AI-enhanced results.
        </div>
      )}

      {recs.length === 0 ? (
        <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center">
          <p className="text-sm text-slate-500 font-medium">Insufficient evidence for recommendations.</p>
          <p className="text-xs text-slate-400 mt-1">The dataset doesn't contain enough measurable relationships to generate reliable recommendations.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recs.map((rec, idx) => (
            <RecommendationCard key={rec.id || idx} rec={rec} index={idx} />
          ))}
        </div>
      )}

      {/* Next Steps */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200/80">
        <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          <ArrowRight className="w-4 h-4 text-blue-500" />
          Next Steps
        </h4>
        <ul className="space-y-2 ml-6">
          {[
            'Validate these findings with domain expertise before making decisions.',
            'Consider collecting additional data to strengthen the evidence base.',
            'Re-run the analysis with different datasets to confirm patterns.',
            'Use the data quality page to review and address any data issues.',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
              {step}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  )
}

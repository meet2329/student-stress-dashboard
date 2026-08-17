import React from 'react'
import { motion } from 'framer-motion'
import { Check, Loader2, Circle, AlertCircle } from 'lucide-react'
import { useAIEda, STAGES } from '../../context/AIEdaContext'

const PIPELINE_STEPS = [
  { key: 'uploaded', label: 'Dataset Uploaded', stages: [STAGES.UPLOADING, STAGES.VALIDATING] },
  { key: 'structure_detected', label: 'Structure Detected', stages: [STAGES.PROFILING] },
  { key: 'quality_checked', label: 'Data Quality Checked', stages: [STAGES.QUALITY_CHECK] },
  { key: 'preprocessed', label: 'Preprocessing Applied', stages: [STAGES.PREPROCESSING] },
  { key: 'ai_analyzed', label: 'AI Analysis Complete', stages: [STAGES.AI_ANALYZING] },
  { key: 'dashboard_ready', label: 'Dashboard Ready', stages: [STAGES.READY] },
]

export default function PipelineProgress() {
  const { pipelineStage, pipelineError, completedStages } = useAIEda()

  if (pipelineStage === STAGES.EMPTY || pipelineStage === STAGES.READY) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm"
    >
      <h3 className="text-sm font-bold text-slate-800 mb-4">Processing Pipeline</h3>

      <div className="space-y-3">
        {PIPELINE_STEPS.map((step, idx) => {
          const isCompleted = completedStages.includes(step.key)
          const isCurrent = step.stages.includes(pipelineStage)
          const isError = pipelineStage === STAGES.ERROR && !isCompleted && idx === PIPELINE_STEPS.findIndex(s => !completedStages.includes(s.key))

          return (
            <motion.div
              key={step.key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isCompleted ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/70' :
                isCurrent ? 'bg-blue-50 text-blue-700 border border-blue-200/70' :
                isError ? 'bg-rose-50 text-rose-700 border border-rose-200/70' :
                'bg-slate-50 text-slate-400 border border-slate-200/50'
              }`}
            >
              {isCompleted ? (
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-4 h-4 text-blue-500 flex-shrink-0 animate-spin" />
              ) : isError ? (
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" />
              )}
              <span className="flex-1">{step.label}</span>
              {isCurrent && <span className="text-[10px] font-mono text-blue-400">Processing...</span>}
            </motion.div>
          )
        })}
      </div>

      {pipelineError && (
        <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
          <p className="font-bold mb-1">Pipeline Error</p>
          <p className="text-rose-600">{pipelineError}</p>
        </div>
      )}
    </motion.div>
  )
}

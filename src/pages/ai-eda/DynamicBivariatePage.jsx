import React from 'react'
import { motion } from 'framer-motion'
import { useAIEda, STAGES } from '../../context/AIEdaContext'
import DynamicChartRenderer from '../../components/ai-eda/DynamicChartRenderer'
import SectionHeader from '../../components/common/SectionHeader'
import { useNavigate } from 'react-router-dom'

export default function DynamicBivariatePage() {
  const { pipelineStage, aiPlan, datasetProfile, isAiFallback } = useAIEda()
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

  const charts = aiPlan?.bivariateCharts || []

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <SectionHeader
        title="Bivariate Analysis"
        subtitle="Two-variable relationships: correlations, group comparisons, and scatter patterns"
      />

      {isAiFallback && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700 font-medium flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-300">LOCAL</span>
          Pair selection and correlation analysis performed using deterministic statistical methods
        </div>
      )}

      {charts.length === 0 ? (
        <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center">
          <p className="text-sm text-slate-500 font-medium">Insufficient data for bivariate analysis.</p>
          <p className="text-xs text-slate-400 mt-1">At least 2 compatible columns (numerical or categorical) are needed.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {charts.map((chart, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
            >
              <DynamicChartRenderer chartSpec={chart} />
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

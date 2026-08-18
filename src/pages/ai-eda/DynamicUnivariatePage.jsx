import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAIEda, STAGES } from '../../context/AIEdaContext'
import DynamicChartRenderer from '../../components/ai-eda/DynamicChartRenderer'
import SectionHeader from '../../components/common/SectionHeader'
import { useNavigate } from 'react-router-dom'
import { Database, ArrowRight, BarChart3, Filter, PieChart } from 'lucide-react'

export default function DynamicUnivariatePage() {
  const { pipelineStage, aiPlan, datasetProfile, isAiFallback } = useAIEda()
  const navigate = useNavigate()
  const [filterType, setFilterType] = useState('all') // 'all' | 'numerical' | 'categorical'

  const allCharts = aiPlan?.univariateCharts || []

  const filteredCharts = useMemo(() => {
    if (filterType === 'all') return allCharts
    return allCharts.filter(chart => {
      if (filterType === 'numerical') return chart.dataType === 'numerical' || chart.chartType === 'histogram' || chart.chartType === 'boxplot'
      if (filterType === 'categorical') return chart.dataType === 'categorical' || chart.chartType === 'bar' || chart.chartType === 'donut' || chart.chartType === 'pie'
      return true
    })
  }, [allCharts, filterType])

  const numCount = allCharts.filter(c => c.dataType === 'numerical' || c.chartType === 'histogram' || c.chartType === 'boxplot').length
  const catCount = allCharts.filter(c => c.dataType === 'categorical' || c.chartType === 'bar' || c.chartType === 'donut' || c.chartType === 'pie').length

  if (pipelineStage === STAGES.EMPTY) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
          <Database className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-800">No Dataset Active</h3>
          <p className="text-xs text-slate-500 font-medium max-w-sm">
            Upload a CSV dataset on the overview page to explore univariate distributions.
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
        <p className="text-sm text-slate-600 font-semibold">Generating univariate distributions...</p>
        <p className="text-xs text-slate-400">Computing histograms, boxplots, and category distributions.</p>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SectionHeader
          title="Univariate Distribution Analysis"
          subtitle={`Single-variable profiling for ${datasetProfile?.analysableColumns?.length || allCharts.length} analysable features`}
        />

        {/* Filter Pills */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs flex-shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              filterType === 'all' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Charts ({allCharts.length})
          </button>
          <button
            onClick={() => setFilterType('numerical')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              filterType === 'numerical' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Numerical ({numCount})
          </button>
          <button
            onClick={() => setFilterType('categorical')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              filterType === 'categorical' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Categorical ({catCount})
          </button>
        </div>
      </div>

      {/* Grid of All Univariate Charts */}
      {filteredCharts.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-2">
          <p className="text-sm font-bold text-slate-700">No matching univariate charts found.</p>
          <p className="text-xs text-slate-400">Try selecting 'All Charts' to view all generated distributions.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCharts.map((chart, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <DynamicChartRenderer chartSpec={chart} />
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

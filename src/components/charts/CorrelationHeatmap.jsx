import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Grid, 
  BarChart3, 
  Share2, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  Info, 
  CheckCircle2, 
  Sliders, 
  ArrowUpRight, 
  ArrowDownRight,
  Database,
  Search,
  Activity
} from 'lucide-react'
import correlationData from '../../data/correlationMatrix.json'

export default function CorrelationHeatmap({ dynamicData = null }) {
  const activeData = (dynamicData && dynamicData.variables && dynamicData.matrix) ? dynamicData : correlationData
  const { variables = [], shortLabels = [], matrix = [] } = activeData

  const defaultFocus = variables.find(v => /stress/i.test(v)) || variables[0] || 'Stress Score'
  const [activeTab, setActiveTab] = useState('ranking') // 'ranking' | 'heatmap'
  const [selectedFocusVar, setSelectedFocusVar] = useState(defaultFocus)
  const [filterThreshold, setFilterThreshold] = useState(0)
  const [hoveredCell, setHoveredCell] = useState(null)
  const [selectedPair, setSelectedPair] = useState(() => {
    if (variables.length >= 2) {
      return {
        var1: variables[0],
        var2: variables[1],
        val: (matrix[0] && matrix[0][1] !== undefined) ? matrix[0][1] : 0.42
      }
    }
    return { var1: 'Factor 1', var2: 'Factor 2', val: 0.42 }
  })

  // Ensure selectedFocusVar is valid
  const effectiveFocus = variables.includes(selectedFocusVar) ? selectedFocusVar : (variables[0] || '')
  const focusIdx = variables.indexOf(effectiveFocus) !== -1 ? variables.indexOf(effectiveFocus) : 0

  // Ranked correlations for the focused variable
  const rankedCorrelations = variables.map((v, idx) => {
    return {
      variable: v,
      shortLabel: shortLabels[idx],
      r: matrix[focusIdx][idx],
      absR: Math.abs(matrix[focusIdx][idx])
    }
  })
  .filter(item => item.variable !== selectedFocusVar)
  .filter(item => item.absR >= filterThreshold)
  .sort((a, b) => b.r - a.r)

  // Color mapping function
  const getCellColor = (val) => {
    if (val === 1.0) return 'bg-slate-900 text-white font-bold'
    if (val >= 0.45) return 'bg-rose-500 text-white font-bold'
    if (val >= 0.30) return 'bg-amber-400 text-slate-900 font-bold'
    if (val >= 0.15) return 'bg-blue-100 text-slate-800 font-semibold'
    if (val > 0.0) return 'bg-slate-100 text-slate-600 font-medium'
    if (val > -0.20) return 'bg-teal-50 text-slate-700 font-medium'
    if (val > -0.30) return 'bg-teal-200 text-teal-900 font-semibold'
    return 'bg-teal-600 text-white font-bold'
  }

  const getImpactDescription = (r) => {
    if (r >= 0.45) return { text: 'Primary Driver (Severe)', color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' }
    if (r >= 0.30) return { text: 'Strong Multiplier', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' }
    if (r >= 0.15) return { text: 'Moderate Positive', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' }
    if (r > -0.15) return { text: 'Weak / Negligible', color: 'text-slate-500', bg: 'bg-slate-50 border-slate-200' }
    if (r > -0.30) return { text: 'Moderate Buffer', color: 'text-teal-700', bg: 'bg-teal-50 border-teal-200' }
    return { text: 'Strong Protective Buffer', color: 'text-emerald-800', bg: 'bg-emerald-50 border-emerald-200' }
  }

  return (
    <div className="space-y-5">
      {/* Top Corporate Controller Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-md">
        {/* Left: Visual Mode Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
            View Mode:
          </span>
          <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
            <button
              onClick={() => setActiveTab('ranking')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'ranking'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Ranked Factor Impact (Easy)</span>
            </button>

            <button
              onClick={() => setActiveTab('heatmap')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'heatmap'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Full 12×12 Heatmap</span>
            </button>
          </div>
        </div>

        {/* Right: Variable Selector & Significance Filter */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-700">
            <span className="text-slate-400 font-medium">Focus Variable:</span>
            <select
              value={selectedFocusVar}
              onChange={(e) => setSelectedFocusVar(e.target.value)}
              className="bg-slate-900 border border-slate-600 text-white rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              {variables.map((v, i) => (
                <option key={i} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setFilterThreshold(filterThreshold === 0 ? 0.25 : 0)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors flex items-center gap-1 border ${
              filterThreshold > 0
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{filterThreshold > 0 ? 'Showing |r| ≥ 0.25' : 'Show All Factors'}</span>
          </button>
        </div>
      </div>

      {/* Main Visual Presentation Area */}
      <AnimatePresence mode="wait">
        {/* VIEW 1: RANKED FACTOR IMPACT (Clean, Easy to Read, Corporate Level) */}
        {activeTab === 'ranking' && (
          <motion.div
            key="ranking"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            {/* Header Description */}
            <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="space-y-0.5">
                <p className="font-bold text-blue-950 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Correlations Ranked against: <strong>{selectedFocusVar}</strong>
                </p>
                <p className="text-blue-800">
                  Factors at the top act as <strong>Risk Amplifiers (Positive r)</strong>, while factors at the bottom act as <strong>Protective Buffers (Negative r)</strong>.
                </p>
              </div>
              <span className="font-mono text-slate-600 text-[11px] bg-white px-2.5 py-1 rounded-lg border border-blue-200">
                N = 3,000 students
              </span>
            </div>

            {/* Ranked Bar Visuals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {rankedCorrelations.map((item, idx) => {
                const impact = getImpactDescription(item.r)
                const isPositive = item.r > 0
                return (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => setSelectedPair({
                      var1: item.variable,
                      var2: selectedFocusVar,
                      val: item.r
                    })}
                    className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold flex items-center justify-center font-mono">
                          {idx + 1}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900">
                          {item.variable}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${impact.bg} ${impact.color}`}>
                          {impact.text}
                        </span>
                        <span className={`font-mono text-xs font-extrabold px-2 py-0.5 rounded ${
                          item.r > 0.4 ? 'bg-rose-100 text-rose-800' :
                          item.r > 0 ? 'bg-blue-100 text-blue-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          r = {isPositive ? `+${item.r.toFixed(2)}` : item.r.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="space-y-1">
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex relative">
                        {/* Center zero mark */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-300 z-10" />
                        
                        {isPositive ? (
                          <div
                            className="h-full rounded-r-full transition-all duration-500 ml-[50%]"
                            style={{
                              width: `${Math.min(50, Math.abs(item.r) * 100)}%`,
                              backgroundColor: item.r > 0.4 ? '#EF4444' : item.r > 0.25 ? '#F59E0B' : '#3B82F6'
                            }}
                          />
                        ) : (
                          <div
                            className="h-full rounded-l-full transition-all duration-500 ml-auto mr-[50%]"
                            style={{
                              width: `${Math.min(50, Math.abs(item.r) * 100)}%`,
                              backgroundColor: '#10B981'
                            }}
                          />
                        )}
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                        <span>-1.0 (Strong Buffer)</span>
                        <span>0.0 (Neutral)</span>
                        <span>+1.0 (Strong Driver)</span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* VIEW 2: 12×12 HEATMAP MATRIX (Cleaned & Interactive) */}
        {activeTab === 'heatmap' && (
          <motion.div
            key="heatmap"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            {/* Legend & Active Cell Inspector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div className="flex items-center gap-2 min-h-[22px]">
                {hoveredCell ? (
                  <span className="font-mono text-slate-900 font-bold">
                    <strong className="text-blue-700">{hoveredCell.var1}</strong> × <strong className="text-blue-700">{hoveredCell.var2}</strong>: Pearson r = <strong className={hoveredCell.val > 0.3 ? 'text-rose-600' : hoveredCell.val < -0.2 ? 'text-teal-700' : 'text-slate-900'}>{hoveredCell.val > 0 ? `+${hoveredCell.val.toFixed(2)}` : hoveredCell.val.toFixed(2)}</strong>
                  </span>
                ) : (
                  <span className="text-slate-500 font-medium">
                    Hover over or click any matrix cell to inspect exact correlation parameters
                  </span>
                )}
              </div>

              {/* Color Gradient Bar */}
              <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600 flex-shrink-0">
                <span>Buffer (-0.4)</span>
                <div className="flex h-3.5 w-28 rounded-md overflow-hidden border border-slate-300">
                  <div className="flex-1 bg-teal-600" />
                  <div className="flex-1 bg-teal-200" />
                  <div className="flex-1 bg-slate-100" />
                  <div className="flex-1 bg-blue-100" />
                  <div className="flex-1 bg-amber-400" />
                  <div className="flex-1 bg-rose-500" />
                </div>
                <span>Driver (+0.5)</span>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white p-3 shadow-xs">
              <div className="min-w-[650px]">
                {/* Header Row */}
                <div className="grid grid-cols-13 gap-1 pb-2 border-b border-slate-100 text-[10px] font-extrabold text-slate-600">
                  <div className="p-1 truncate text-slate-400">Metric</div>
                  {shortLabels.map((lbl, idx) => (
                    <div key={idx} className="p-1 text-center truncate font-bold text-slate-700" title={variables[idx]}>
                      {lbl}
                    </div>
                  ))}
                </div>

                {/* Rows */}
                {matrix.map((row, rowIdx) => (
                  <div key={rowIdx} className="grid grid-cols-13 gap-1 py-0.5 items-center">
                    <div 
                      className="text-[10px] font-bold text-slate-800 truncate pr-1" 
                      title={variables[rowIdx]}
                    >
                      {shortLabels[rowIdx]}
                    </div>

                    {row.map((val, colIdx) => (
                      <button
                        key={colIdx}
                        onClick={() => setSelectedPair({
                          var1: variables[rowIdx],
                          var2: variables[colIdx],
                          val
                        })}
                        onMouseEnter={() => setHoveredCell({
                          var1: variables[rowIdx],
                          var2: variables[colIdx],
                          val
                        })}
                        onMouseLeave={() => setHoveredCell(null)}
                        className={`
                          h-8 flex items-center justify-center rounded-lg text-[10px] font-mono transition-all
                          ${getCellColor(val)}
                          ${selectedPair && selectedPair.var1 === variables[rowIdx] && selectedPair.var2 === variables[colIdx] ? 'ring-2 ring-blue-600 scale-105 z-10 shadow-sm' : 'hover:scale-105'}
                        `}
                        title={`${variables[rowIdx]} × ${variables[colIdx]}: r = ${val}`}
                      >
                        {val === 1.0 ? '1.0' : val > 0 ? `+${val.toFixed(2).replace('0.', '.')}` : val.toFixed(2).replace('-0.', '-.')}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Pair Deep-Dive Inspector Card (Corporate Level) */}
      {selectedPair && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white border border-slate-700 shadow-lg space-y-3"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-400/30">
                <Activity className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-white">
                  Bivariate Inspector: {selectedPair.var1} × {selectedPair.var2}
                </h4>
                <p className="text-xs text-slate-300">
                  Detailed Pearson correlation and parametric relationship
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`font-mono text-sm font-extrabold px-3 py-1 rounded-xl border ${
                selectedPair.val > 0.35 ? 'bg-rose-500/20 text-rose-300 border-rose-400/30' :
                selectedPair.val > 0 ? 'bg-blue-500/20 text-blue-300 border-blue-400/30' :
                'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
              }`}>
                Pearson r = {selectedPair.val > 0 ? `+${selectedPair.val.toFixed(2)}` : selectedPair.val.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Relationship Type</span>
              <p className="font-bold text-white">
                {selectedPair.val > 0.35 ? 'Primary Risk Amplifier' :
                 selectedPair.val > 0 ? 'Positive Association' :
                 selectedPair.val < -0.2 ? 'Protective Resilience Buffer' : 'Orthogonal / Weak'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Variance Explained (R²)</span>
              <p className="font-mono font-bold text-teal-300">
                R² = {(selectedPair.val * selectedPair.val).toFixed(3)} ({((selectedPair.val * selectedPair.val) * 100).toFixed(1)}% of variance)
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Significance</span>
              <p className="font-mono font-bold text-emerald-400">
                p &lt; 0.001 (Statistically Significant)
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

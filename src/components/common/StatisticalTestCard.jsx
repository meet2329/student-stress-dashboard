import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, ChevronDown, ChevronUp, BookOpen, Activity } from 'lucide-react'

export default function StatisticalTestCard({
  testName,
  question,
  statisticLabel,
  statisticValue,
  pValue,
  alpha = 0.05,
  significant = true,
  effectSize,
  effectSizeLabel = 'Effect Size',
  df,
  nullHypothesis,
  altHypothesis,
  decisionRule,
  interpretation,
  assumptions = [],
  extraDetails
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300 transition-all space-y-4">
      {/* Test Title & Question */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold uppercase tracking-wider">
              {testName}
            </span>
            {significant ? (
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Statistically Significant (p &lt; {alpha})
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Not Significant (p &ge; {alpha})
              </span>
            )}
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-2">
            {question}
          </h3>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Test Statistic */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            {statisticLabel}
          </p>
          <p className="text-xl font-extrabold text-slate-900 mt-0.5 tabular-nums">
            {statisticValue}
          </p>
          {df && (
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
              df = {df}
            </p>
          )}
        </div>

        {/* p-value */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            p-Value (2-tailed)
          </p>
          <p className="text-xl font-extrabold text-blue-700 mt-0.5 tabular-nums">
            {pValue < 0.001 ? '< 0.001' : pValue}
          </p>
          <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
            α = {alpha}
          </p>
        </div>

        {/* Effect Size */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            {effectSizeLabel}
          </p>
          <p className="text-base font-bold text-slate-900 mt-1 truncate">
            {effectSize}
          </p>
        </div>

        {/* Statistical Decision */}
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
          <p className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
            Null Decision
          </p>
          <p className="text-base font-extrabold text-emerald-800 mt-1">
            Reject H₀
          </p>
        </div>
      </div>

      {/* Practical Interpretation */}
      {interpretation && (
        <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-slate-700 leading-relaxed">
          <p className="font-semibold text-blue-900 mb-0.5">Analytical Takeaway:</p>
          <p>{interpretation}</p>
        </div>
      )}

      {/* Expandable Hypotheses & Assumptions */}
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full py-2 px-3 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 text-xs font-semibold text-slate-700 flex items-center justify-between transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-slate-500" />
            Formal Hypothesis Formulation & Parametric Assumptions
          </span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 pt-3 border-t border-slate-200 space-y-3 text-xs"
            >
              {/* Hypotheses */}
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <p className="font-mono text-slate-700"><strong>Null (H₀):</strong> {nullHypothesis}</p>
                <p className="font-mono text-slate-700"><strong>Alternative (H₁):</strong> {altHypothesis}</p>
                <p className="text-slate-600 pt-1 border-t border-slate-200 font-medium"><strong>Decision Criterion:</strong> {decisionRule}</p>
              </div>

              {/* Assumptions */}
              {assumptions.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Assumption Testing & Diagnostics
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {assumptions.map((assump, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200/80 text-[11px]">
                        <div className="flex items-center gap-1 text-emerald-800 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          <span>{assump.name}</span>
                        </div>
                        <p className="text-slate-600 mt-1 leading-tight">{assump.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Extra Post-hoc if available */}
              {extraDetails}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

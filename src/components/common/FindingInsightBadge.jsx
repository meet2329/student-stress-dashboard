import React from 'react'
import { Sparkles, HelpCircle, CheckCircle } from 'lucide-react'

export default function FindingInsightBadge({
  finding,
  insight,
  recommendation,
  className = ''
}) {
  return (
    <div className={`p-3.5 rounded-xl bg-slate-50/90 border border-slate-200/90 space-y-2 text-xs ${className}`}>
      {/* Finding */}
      {finding && (
        <div className="flex items-start gap-2">
          <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200 text-[10px] font-extrabold uppercase tracking-wider flex-shrink-0 mt-0.5">
            Finding
          </span>
          <p className="text-slate-800 font-medium leading-relaxed">
            {finding}
          </p>
        </div>
      )}

      {/* Insight */}
      {insight && (
        <div className="flex items-start gap-2 pt-1 border-t border-slate-200/60">
          <span className="px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 border border-teal-200 text-[10px] font-extrabold uppercase tracking-wider flex-shrink-0 mt-0.5">
            Insight
          </span>
          <p className="text-slate-600 font-normal leading-relaxed">
            {insight}
          </p>
        </div>
      )}

      {/* Optional Action / Recommendation */}
      {recommendation && (
        <div className="flex items-start gap-2 pt-1 border-t border-slate-200/60">
          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-extrabold uppercase tracking-wider flex-shrink-0 mt-0.5">
            Action
          </span>
          <p className="text-amber-900 font-medium leading-relaxed">
            {recommendation}
          </p>
        </div>
      )}
    </div>
  )
}

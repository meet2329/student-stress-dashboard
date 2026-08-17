import React from 'react'
import { Clock, ShieldAlert, CheckCircle2, Award } from 'lucide-react'

export default function RecommendationCard({
  title,
  description,
  priority = 'High Priority',
  timeframe = 'Immediate',
  icon: Icon = CheckCircle2,
  category = 'Academic'
}) {
  const priorityColor = {
    'Critical Priority': 'bg-rose-50 text-rose-700 border-rose-200',
    'High Priority': 'bg-amber-50 text-amber-800 border-amber-200',
    'Medium Priority': 'bg-blue-50 text-blue-700 border-blue-200',
    'Immediate': 'bg-purple-50 text-purple-700 border-purple-200',
  }[priority] || 'bg-slate-100 text-slate-700 border-slate-200'

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between space-y-3">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold uppercase tracking-wider">
            {category}
          </span>
          <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${priorityColor}`}>
            {priority}
          </span>
        </div>
        <h4 className="text-sm font-bold text-slate-900 leading-snug">
          {title}
        </h4>
        <p className="text-xs text-slate-600 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          Timeframe: {timeframe}
        </span>
        <span className="text-teal-600 font-semibold">Actionable</span>
      </div>
    </div>
  )
}

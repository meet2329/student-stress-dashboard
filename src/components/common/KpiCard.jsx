import React from 'react'
import { motion } from 'framer-motion'
import CardTilt3D from '../3d/CardTilt3D'

export default function KpiCard({
  title,
  value,
  unit = '',
  subtitle,
  icon: Icon,
  delta,
  deltaType = 'neutral', // 'positive' | 'negative' | 'neutral' | 'alert'
  statusColor = 'blue', // 'blue' | 'teal' | 'amber' | 'red' | 'emerald'
  delay = 0
}) {
  const statusColorMap = {
    blue: 'from-blue-500/10 to-blue-500/5 text-blue-600 border-blue-200/80',
    teal: 'from-teal-500/10 to-teal-500/5 text-teal-600 border-teal-200/80',
    amber: 'from-amber-500/10 to-amber-500/5 text-amber-600 border-amber-200/80',
    red: 'from-rose-500/10 to-rose-500/5 text-rose-600 border-rose-200/80',
    emerald: 'from-emerald-500/10 to-emerald-500/5 text-emerald-600 border-emerald-200/80',
  }

  const badgeColorMap = {
    positive: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    negative: 'bg-rose-50 text-rose-700 border-rose-200',
    alert: 'bg-amber-50 text-amber-800 border-amber-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.16, 1, 0.3, 1] }}
      className="h-full"
    >
      <CardTilt3D maxTilt={5} scaleOnHover={1.02} className="h-full">
        <div className="p-5 rounded-2xl bg-white/95 backdrop-blur-xs border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all group relative overflow-hidden h-full flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {title}
              </p>
              <div className="flex items-baseline gap-1.5 pt-0.5">
                <span className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                  {value}
                </span>
                {unit && (
                  <span className="text-xs font-bold text-slate-500">
                    {unit}
                  </span>
                )}
              </div>
            </div>

            {Icon && (
              <div className={`p-2.5 rounded-xl border bg-gradient-to-br ${statusColorMap[statusColor] || statusColorMap.blue} flex-shrink-0 group-hover:scale-105 transition-transform`}>
                <Icon className="w-5 h-5" />
              </div>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
            {subtitle && (
              <p className="text-slate-500 font-medium truncate">
                {subtitle}
              </p>
            )}
            {delta && (
              <span className={`px-2 py-0.5 rounded-md border text-[11px] font-semibold flex-shrink-0 ${badgeColorMap[deltaType] || badgeColorMap.neutral}`}>
                {delta}
              </span>
            )}
          </div>
        </div>
      </CardTilt3D>
    </motion.div>
  )
}

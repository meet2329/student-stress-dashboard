import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Maximize2, Minimize2, Info, Database, Sparkles, HelpCircle } from 'lucide-react'

export default function ChartCard({
  title,
  subtitle,
  tag,
  columnsUsed, // e.g. "Screen_Time vs. Stress_Score"
  whyDone,     // Short concise English objective
  infoText,
  children,
  headerAction,
  className = '',
  footer
}) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showInfo, setShowInfo] = useState(false)

  const cardContent = (
    <div className={`flex flex-col h-full bg-white/95 backdrop-blur-xs rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300/90 transition-all duration-300 overflow-hidden ${className}`}>
      {/* Card Top Header */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-start justify-between gap-3 bg-slate-50/50">
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight truncate">
              {title}
            </h3>
            {tag && (
              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold uppercase tracking-wider">
                {tag}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 font-medium line-clamp-1">
              {subtitle}
            </p>
          )}
        </div>

        {/* Header Controls */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {headerAction}

          {infoText && (
            <div className="relative">
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Detailed statistical info"
              >
                <Info className="w-4 h-4" />
              </button>
              <AnimatePresence>
                {showInfo && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute right-0 top-8 w-64 p-3 bg-slate-900 text-slate-100 text-xs rounded-xl shadow-xl z-20 border border-slate-700 leading-relaxed"
                  >
                    <p>{infoText}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit fullscreen' : 'Expand chart'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Feature & Purpose Info Banner (Short & Clean English) */}
      {(columnsUsed || whyDone) && (
        <div className="px-5 py-2 bg-blue-50/50 border-b border-blue-100/60 text-xs flex flex-wrap items-center justify-between gap-2">
          {columnsUsed && (
            <div className="flex items-center gap-1.5 min-w-0 max-w-full">
              <span className="px-1.5 py-0.5 rounded bg-blue-100/80 text-blue-800 text-[10px] font-bold uppercase font-mono tracking-wide shrink-0 flex items-center gap-1">
                <Database className="w-3 h-3 text-blue-600" />
                Column:
              </span>
              <span
                className="font-mono font-bold text-slate-800 text-xs truncate max-w-md"
                title={columnsUsed}
              >
                {columnsUsed}
              </span>
            </div>
          )}
          {whyDone && (
            <div className="flex items-center gap-1.5 text-slate-600 min-w-0 flex-1 justify-end">
              <span className="px-1.5 py-0.5 rounded bg-emerald-100/80 text-emerald-800 text-[10px] font-bold uppercase tracking-wide shrink-0 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                Purpose:
              </span>
              <span className="text-[11px] font-medium text-slate-700 truncate" title={whyDone}>
                {whyDone}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Chart Body */}
      <div className="p-4 sm:p-5 flex-1 min-h-0 flex flex-col justify-center">
        {children}
      </div>

      {/* Optional Card Footer */}
      {footer && (
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/70 text-xs text-slate-600">
          {footer}
        </div>
      )}
    </div>
  )

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md p-4 sm:p-8 flex items-center justify-center">
        <div className="w-full h-full max-w-6xl max-h-[92vh]">
          {cardContent}
        </div>
      </div>
    )
  }

  return cardContent
}

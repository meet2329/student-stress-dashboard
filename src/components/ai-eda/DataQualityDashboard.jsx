import React from 'react'
import { motion } from 'framer-motion'
import {
  ShieldCheck, ShieldAlert, ShieldX,
  AlertTriangle, AlertCircle, Info, CheckCircle2,
  Trash2, FileWarning, Type, GitBranch, Eye
} from 'lucide-react'
import { useAIEda } from '../../context/AIEdaContext'

// ─── Quality Score Gauge ───────────────────────────────────────────────────────

function QualityGauge({ score, category }) {
  const color = score >= 90 ? 'emerald' : score >= 75 ? 'blue' : score >= 60 ? 'amber' : score >= 40 ? 'orange' : 'rose'
  const colorMap = {
    emerald: { bg: 'bg-emerald-500', ring: 'ring-emerald-200', text: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    blue: { bg: 'bg-blue-500', ring: 'ring-blue-200', text: 'text-blue-600', badge: 'bg-blue-100 text-blue-800 border-blue-200' },
    amber: { bg: 'bg-amber-500', ring: 'ring-amber-200', text: 'text-amber-600', badge: 'bg-amber-100 text-amber-800 border-amber-200' },
    orange: { bg: 'bg-orange-500', ring: 'ring-orange-200', text: 'text-orange-600', badge: 'bg-orange-100 text-orange-800 border-orange-200' },
    rose: { bg: 'bg-rose-500', ring: 'ring-rose-200', text: 'text-rose-600', badge: 'bg-rose-100 text-rose-800 border-rose-200' },
  }
  const c = colorMap[color]

  return (
    <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
      <div className={`relative w-28 h-28 rounded-full ring-8 ${c.ring} flex items-center justify-center`}>
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div className={`absolute bottom-0 w-full ${c.bg} transition-all duration-1000`} style={{ height: `${score}%` }} />
        </div>
        <span className={`relative text-3xl font-black ${c.text} drop-shadow-sm`}>{score}</span>
      </div>
      <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${c.badge}`}>{category}</span>
      <p className="text-[11px] text-slate-400 text-center">Data Quality Score (0 – 100)</p>
    </div>
  )
}

// ─── Gate Decision Banner ──────────────────────────────────────────────────────

function GateBanner({ gateDecision }) {
  const styles = {
    pass: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: ShieldCheck, iconColor: 'text-emerald-600', label: 'Analysis Ready' },
    warn: { bg: 'bg-amber-50', border: 'border-amber-200', icon: ShieldAlert, iconColor: 'text-amber-600', label: 'Proceed with Caution' },
    block: { bg: 'bg-rose-50', border: 'border-rose-200', icon: ShieldX, iconColor: 'text-rose-600', label: 'Quality Issues Detected' },
  }
  const s = styles[gateDecision.decision] || styles.pass
  const Icon = s.icon

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl ${s.bg} border ${s.border}`}>
      <Icon className={`w-5 h-5 ${s.iconColor} flex-shrink-0 mt-0.5`} />
      <div>
        <p className={`text-sm font-bold ${s.iconColor}`}>{s.label}</p>
        <p className="text-xs text-slate-600 mt-0.5">{gateDecision.message}</p>
      </div>
    </div>
  )
}

// ─── Issue Card ────────────────────────────────────────────────────────────────

function IssueCard({ issue }) {
  const iconMap = {
    missing_excessive: FileWarning,
    missing_high: FileWarning,
    missing_minor: Info,
    duplicates: Trash2,
    category_inconsistency: Type,
    outliers_many: AlertTriangle,
    outliers_few: Eye,
    invalid_negative: AlertCircle,
    invalid_percentage: AlertCircle,
    constant_column: GitBranch,
  }
  const severityColors = {
    critical: 'bg-rose-50 border-rose-200 text-rose-700',
    warning: 'bg-amber-50 border-amber-200 text-amber-700',
    info: 'bg-blue-50 border-blue-200 text-blue-600',
  }
  const badgeColors = {
    critical: 'bg-rose-100 text-rose-800 border-rose-300',
    warning: 'bg-amber-100 text-amber-800 border-amber-300',
    info: 'bg-blue-100 text-blue-800 border-blue-300',
  }

  const Icon = iconMap[issue.type] || AlertCircle
  const sc = severityColors[issue.severity] || severityColors.info
  const bc = badgeColors[issue.severity] || badgeColors.info

  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border ${sc}`}>
      <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium leading-relaxed">{issue.message}</p>
      </div>
      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border flex-shrink-0 uppercase ${bc}`}>
        {issue.severity}
      </span>
    </div>
  )
}

// ─── Preprocessing Report ──────────────────────────────────────────────────────

function PreprocessingReportPanel({ report }) {
  if (!report || report.totalChanges === 0) {
    return (
      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
        <p className="text-xs text-emerald-700 font-semibold">No preprocessing changes needed — data is clean.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-700">Preprocessing Applied</h4>
        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200">
          {report.totalChanges} change(s)
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Original Rows</p>
          <p className="text-sm font-extrabold text-slate-800">{report.originalRows.toLocaleString()}</p>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
          <p className="text-[10px] font-bold text-slate-400 uppercase">After Preprocessing</p>
          <p className="text-sm font-extrabold text-slate-800">{report.analyzedRows.toLocaleString()}</p>
        </div>
      </div>

      <div className="space-y-1.5">
        {report.changes.map((change, idx) => (
          <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-blue-50/60 border border-blue-100/80 text-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
            <span className="text-blue-800 font-medium">{change.message}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function DataQualityDashboard() {
  const { dataQuality, preprocessingReport, datasetProfile } = useAIEda()

  if (!dataQuality) return null

  const { qualityScore, gateDecision, summary, issues } = dataQuality

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      {/* Top: Score + Gate */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <QualityGauge score={qualityScore.score} category={qualityScore.category} />

        <div className="sm:col-span-2 space-y-4">
          <GateBanner gateDecision={gateDecision} />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: 'Total Issues', value: summary.totalIssues, color: 'slate' },
              { label: 'Critical', value: summary.critical, color: summary.critical > 0 ? 'rose' : 'emerald' },
              { label: 'Warnings', value: summary.warnings, color: summary.warnings > 0 ? 'amber' : 'emerald' },
              { label: 'Missing Cells', value: `${summary.overallMissingPct}%`, color: summary.overallMissingPct > 10 ? 'amber' : 'blue' },
            ].map((m, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase">{m.label}</p>
                <p className={`text-lg font-extrabold text-${m.color}-600`}>{m.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Issues List */}
      {issues.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Issues Detected</h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {issues.map((issue, idx) => (
              <IssueCard key={idx} issue={issue} />
            ))}
          </div>
        </div>
      )}

      {/* Preprocessing Report */}
      <PreprocessingReportPanel report={preprocessingReport} />
    </motion.div>
  )
}

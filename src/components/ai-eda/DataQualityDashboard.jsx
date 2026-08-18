import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Trash2,
  FileWarning,
  Type,
  GitBranch,
  Eye,
  Search,
  ArrowUpDown,
  Filter,
  Check,
  Database,
  Sparkles,
  Download,
  X,
  BarChart2,
  TrendingUp,
  Activity,
  Layers,
  HelpCircle,
  Sliders
} from 'lucide-react'
import { useAIEda } from '../../context/AIEdaContext'

// ─── Radial Dimension Health Ring ──────────────────────────────────────────────

function DimensionCard({ label, score, icon: Icon, desc, color = 'emerald' }) {
  const colorMap = {
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-200 ring-emerald-500/20',
    blue: 'text-blue-600 bg-blue-50 border-blue-200 ring-blue-500/20',
    amber: 'text-amber-600 bg-amber-50 border-amber-200 ring-amber-500/20',
    purple: 'text-purple-600 bg-purple-50 border-purple-200 ring-purple-500/20',
  }
  const c = colorMap[color] || colorMap.blue

  return (
    <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center gap-3.5">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border ${c}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{label}</p>
          <span className="font-mono text-xs font-black text-slate-800">{score}%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full ${score >= 90 ? 'bg-emerald-500' : score >= 75 ? 'bg-blue-500' : 'bg-amber-500'}`}
            style={{ width: `${score}%` }}
          />
        </div>
        <p className="text-[11px] text-slate-500 mt-1 truncate">{desc}</p>
      </div>
    </div>
  )
}

// ─── Animated Circular SVG Quality Score Gauge ────────────────────────────────

function QualityGauge({ score = 92, category = 'Good', onExportReport }) {
  const colorMap = {
    emerald: { stroke: '#10B981', badge: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
    blue: { stroke: '#3B82F6', badge: 'bg-blue-50 text-blue-700 border-blue-300' },
    amber: { stroke: '#F59E0B', badge: 'bg-amber-50 text-amber-700 border-amber-300' },
    rose: { stroke: '#EF4444', badge: 'bg-rose-50 text-rose-700 border-rose-300' },
  }

  const c = score >= 90 ? colorMap.emerald : score >= 75 ? colorMap.blue : score >= 60 ? colorMap.amber : colorMap.rose

  return (
    <div className="flex flex-col items-center justify-center gap-3 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-2xs text-center">
      <div className="relative w-32 h-32 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          <path
            className="text-slate-100"
            strokeWidth="3.5"
            stroke="currentColor"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            stroke={c.stroke}
            strokeDasharray={`${score}, 100`}
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-slate-900 font-mono">{score}%</span>
          <span className="text-[10px] uppercase font-bold text-slate-400">Reliability</span>
        </div>
      </div>
      <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${c.badge}`}>{category} Health</span>
      <p className="text-xs text-slate-400 font-medium max-w-[190px]">
        Composite data health rating based on 6 statistical validation checks.
      </p>

      {onExportReport && (
        <button
          onClick={onExportReport}
          className="mt-1 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export Quality Report</span>
        </button>
      )}
    </div>
  )
}

// ─── Gate Decision Assessment Banner ──────────────────────────────────────────

function GateBanner({ gateDecision }) {
  const styles = {
    pass: { bg: 'bg-emerald-50/80', border: 'border-emerald-200', icon: ShieldCheck, iconColor: 'text-emerald-600', label: 'Quality Assessment: Ready for Analysis' },
    warn: { bg: 'bg-amber-50/80', border: 'border-amber-200', icon: ShieldAlert, iconColor: 'text-amber-600', label: 'Quality Assessment: Proceed with Awareness' },
    block: { bg: 'bg-rose-50/80', border: 'border-rose-200', icon: ShieldX, iconColor: 'text-rose-600', label: 'Quality Assessment: Significant Anomalies' },
  }
  const s = styles[gateDecision?.decision] || styles.pass
  const Icon = s.icon

  return (
    <div className={`flex items-start gap-3.5 p-5 rounded-2xl ${s.bg} border ${s.border} shadow-2xs`}>
      <Icon className={`w-6 h-6 ${s.iconColor} flex-shrink-0 mt-0.5`} />
      <div className="space-y-0.5">
        <p className={`text-sm font-bold ${s.iconColor}`}>{s.label}</p>
        <p className="text-xs text-slate-700 leading-relaxed">{gateDecision?.message || 'Data integrity passed all primary baseline checks.'}</p>
      </div>
    </div>
  )
}

// ─── Column Detail Modal / Inspector Drawer ───────────────────────────────────

function ColumnDetailModal({ column, outlierInfo, onClose }) {
  if (!column) return null

  const isNum = column.inferredType === 'numerical'
  const healthScore = Math.max(0, 100 - column.missingPct - (outlierInfo?.pct || 0))

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden space-y-5 p-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-mono">{column.name}</h3>
              <span className="text-[11px] text-slate-500 capitalize">{column.inferredType} Feature • Health: <strong className="text-slate-800">{healthScore}%</strong></span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Statistical Summary Grid */}
        {isNum ? (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <p className="text-[10px] uppercase font-bold text-slate-400">Mean</p>
                <p className="text-sm font-extrabold text-slate-800 font-mono mt-0.5">{column.mean ?? '—'}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <p className="text-[10px] uppercase font-bold text-slate-400">Median</p>
                <p className="text-sm font-extrabold text-slate-800 font-mono mt-0.5">{column.median ?? '—'}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <p className="text-[10px] uppercase font-bold text-slate-400">Std Dev</p>
                <p className="text-sm font-extrabold text-slate-800 font-mono mt-0.5">{column.std ?? '—'}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <p className="text-[10px] uppercase font-bold text-slate-400">Min</p>
                <p className="text-sm font-extrabold text-slate-800 font-mono mt-0.5">{column.min ?? '—'}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <p className="text-[10px] uppercase font-bold text-slate-400">Max</p>
                <p className="text-sm font-extrabold text-slate-800 font-mono mt-0.5">{column.max ?? '—'}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <p className="text-[10px] uppercase font-bold text-slate-400">IQR</p>
                <p className="text-sm font-extrabold text-slate-800 font-mono mt-0.5">{column.iqr ?? '—'}</p>
              </div>
            </div>

            {/* Outlier Bounds info */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1">
              <p className="font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Tukey's IQR Outlier Thresholds
              </p>
              <p className="text-[11px] text-amber-800">
                Lower bound: <strong className="font-mono">[{column.q1 ? (column.q1 - 1.5 * column.iqr).toFixed(2) : '—'}]</strong> | Upper bound: <strong className="font-mono">[{column.q3 ? (column.q3 + 1.5 * column.iqr).toFixed(2) : '—'}]</strong>
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Top Category Frequencies</h4>
            <div className="space-y-2">
              {column.topCategories?.map((cat, idx) => (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between font-medium">
                    <span className="text-slate-800">{cat.value}</span>
                    <span className="font-mono text-slate-500">{cat.count} ({cat.pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${cat.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cleaning Recommendation */}
        <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-blue-950">AI Handling Recommendation</p>
            <p className="text-[11px] text-blue-800 mt-0.5">
              {column.missingPct > 0 
                ? (isNum ? 'Impute missing cells using feature median to preserve central tendency.' : 'Impute missing values using category mode.')
                : isNum 
                  ? 'Column has full completeness. Standard scaling or Z-score normalization recommended prior to model ingestion.'
                  : 'Column is complete and ready for one-hot encoding or categorical grouping.'
              }
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Column Health Explorer (Searchable / Sortable Table) ─────────────────────

export function ColumnHealthExplorer({ columnProfiles = [], outlierDetails = {}, onInspectColumn }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [sortField, setSortField] = useState('name')
  const [sortAsc, setSortAsc] = useState(true)

  const filteredColumns = useMemo(() => {
    return columnProfiles
      .filter(col => {
        const matchesSearch = col.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesType = typeFilter === 'all' || col.inferredType === typeFilter
        return matchesSearch && matchesType
      })
      .sort((a, b) => {
        let valA = a[sortField] ?? ''
        let valB = b[sortField] ?? ''
        if (typeof valA === 'string') {
          return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA)
        }
        return sortAsc ? valA - valB : valB - valA
      })
  }, [columnProfiles, searchTerm, typeFilter, sortField, sortAsc])

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(true)
    }
  }

  const typeColors = {
    numerical: 'bg-blue-100 text-blue-800 border-blue-200',
    categorical: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    boolean: 'bg-purple-100 text-purple-800 border-purple-200',
    date: 'bg-amber-100 text-amber-800 border-amber-200',
    empty: 'bg-slate-100 text-slate-600 border-slate-200',
  }

  return (
    <div className="rounded-3xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden space-y-4 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-extrabold text-slate-900">
            Column Health Explorer
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Click any column row to inspect detailed statistical distributions and outlier thresholds
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search column..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 bg-slate-50 focus:outline-none cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="numerical">Numerical</option>
            <option value="categorical">Categorical</option>
            <option value="boolean">Boolean</option>
            <option value="date">Date</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-slate-100 rounded-2xl">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              <th onClick={() => handleSort('name')} className="text-left px-4 py-3 font-bold text-slate-600 cursor-pointer hover:text-blue-600">
                <div className="flex items-center gap-1">Column <ArrowUpDown className="w-3 h-3 text-slate-400" /></div>
              </th>
              <th onClick={() => handleSort('inferredType')} className="text-left px-4 py-3 font-bold text-slate-600 cursor-pointer hover:text-blue-600">
                <div className="flex items-center gap-1">Data Type <ArrowUpDown className="w-3 h-3 text-slate-400" /></div>
              </th>
              <th onClick={() => handleSort('uniqueCount')} className="text-right px-4 py-3 font-bold text-slate-600 cursor-pointer hover:text-blue-600">
                <div className="flex items-center justify-end gap-1">Unique <ArrowUpDown className="w-3 h-3 text-slate-400" /></div>
              </th>
              <th onClick={() => handleSort('missingPct')} className="text-right px-4 py-3 font-bold text-slate-600 cursor-pointer hover:text-blue-600">
                <div className="flex items-center justify-end gap-1">Missing % <ArrowUpDown className="w-3 h-3 text-slate-400" /></div>
              </th>
              <th className="text-left px-4 py-3 font-bold text-slate-600">Distribution / Values</th>
              <th className="text-right px-4 py-3 font-bold text-slate-600">Health</th>
              <th className="text-right px-4 py-3 font-bold text-slate-600">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredColumns.map((col, idx) => {
              const outlierInfo = outlierDetails[col.name]
              const healthScore = Math.max(0, 100 - col.missingPct - (outlierInfo?.pct || 0))

              return (
                <tr 
                  key={idx} 
                  onClick={() => onInspectColumn(col)}
                  className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                >
                  <td className="px-4 py-3 font-mono font-bold text-slate-900 group-hover:text-blue-600">
                    {col.name}
                    {col.isIdLike && <span className="ml-1.5 px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[9px] font-sans">ID</span>}
                    {col.isConstant && <span className="ml-1.5 px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-sans">Constant</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${typeColors[col.inferredType] || typeColors.empty}`}>
                      {col.inferredType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-600">
                    {col.uniqueCount?.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-mono font-bold ${col.missingPct > 15 ? 'text-rose-600' : col.missingPct > 0 ? 'text-amber-600' : 'text-slate-500'}`}>
                      {col.missingPct}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {col.inferredType === 'numerical' ? (
                      <span className="text-[11px] text-slate-500">
                        Range: <strong className="text-slate-800 font-mono">[{col.min}, {col.max}]</strong>, Mean: <strong className="text-slate-800 font-mono">{col.mean}</strong>
                        {col.skewness !== undefined && <span className="text-slate-400"> (skew: {col.skewness})</span>}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500 truncate max-w-[200px] block" title={col.topCategories?.map(t => t.value).join(', ')}>
                        {col.topCategories ? col.topCategories.slice(0, 3).map(t => `${t.value} (${t.pct}%)`).join(', ') : '—'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${healthScore >= 90 ? 'bg-emerald-500' : healthScore >= 70 ? 'bg-blue-500' : 'bg-amber-500'}`}
                          style={{ width: `${healthScore}%` }}
                        />
                      </div>
                      <span className="font-mono text-[10px] font-bold text-slate-700">{healthScore}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-[11px] font-bold text-blue-600 group-hover:underline">
                      Inspect →
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function DataQualityDashboard() {
  const { dataQuality, preprocessingReport, datasetProfile, fileName } = useAIEda()
  const [inspectingColumn, setInspectingColumn] = useState(null)

  if (!dataQuality) return null

  const { qualityScore, gateDecision, summary, issues, outlierDetails } = dataQuality

  const completenessScore = Math.max(0, 100 - summary.overallMissingPct)
  const uniquenessScore = summary.duplicateCount === 0 ? 100 : Math.max(70, 100 - Math.round((summary.duplicateCount / (datasetProfile?.totalRows || 1)) * 100))
  const validityScore = Math.max(0, 100 - summary.critical * 10)
  const consistencyScore = summary.warnings === 0 ? 100 : Math.max(60, 100 - summary.warnings * 5)

  const handleExportQualityJson = () => {
    const reportData = {
      dataset: fileName || 'dataset.csv',
      timestamp: new Date().toISOString(),
      score: qualityScore.score,
      category: qualityScore.category,
      summary,
      issues,
      dimensions: {
        completeness: completenessScore,
        uniqueness: uniquenessScore,
        validity: validityScore,
        consistency: consistencyScore
      }
    }
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `quality_report_${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-8"
    >
      {/* Top: Score Gauge + Gate Assessment + Key Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <QualityGauge
          score={qualityScore.score}
          category={qualityScore.category}
          onExportReport={handleExportQualityJson}
        />

        <div className="lg:col-span-2 space-y-4 flex flex-col justify-between">
          <GateBanner gateDecision={gateDecision} />

          {/* Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Quality Issues', value: summary.totalIssues, color: summary.totalIssues > 0 ? 'amber' : 'emerald' },
              { label: 'Critical Errors', value: summary.critical, color: summary.critical > 0 ? 'rose' : 'emerald' },
              { label: 'Missing Cells', value: `${summary.overallMissingPct}%`, color: summary.overallMissingPct > 10 ? 'rose' : 'blue' },
              { label: 'Duplicates', value: summary.duplicateCount, color: summary.duplicateCount > 0 ? 'amber' : 'emerald' },
            ].map((m, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs text-center space-y-1">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{m.label}</p>
                <p className={`text-xl font-black text-${m.color}-600 font-mono`}>{m.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dimension Breakdown Cards */}
      <div className="space-y-3">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
          Data Quality Dimensions
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <DimensionCard
            label="Completeness"
            score={completenessScore}
            icon={FileWarning}
            desc="Absence of null / blank cells"
            color="emerald"
          />
          <DimensionCard
            label="Uniqueness"
            score={uniquenessScore}
            icon={Trash2}
            desc="Deduplicated row records"
            color="blue"
          />
          <DimensionCard
            label="Validity & Bounds"
            score={validityScore}
            icon={ShieldCheck}
            desc="Sanity checks & range validation"
            color="purple"
          />
          <DimensionCard
            label="Format Consistency"
            score={consistencyScore}
            icon={Type}
            desc="Standardized type & casing"
            color="amber"
          />
        </div>
      </div>

      {/* Column Health Explorer Table */}
      <ColumnHealthExplorer
        columnProfiles={datasetProfile?.columnProfiles || []}
        outlierDetails={outlierDetails || {}}
        onInspectColumn={(col) => setInspectingColumn(col)}
      />

      {/* Issues List */}
      {issues?.length > 0 && (
        <div className="space-y-3 p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-800">Detected Quality Issues & Notices</h4>
            <span className="text-xs text-slate-500 font-mono">{issues.length} item(s)</span>
          </div>
          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {issues.map((issue, idx) => {
              const sc = issue.severity === 'critical' 
                ? 'bg-rose-50 border-rose-200 text-rose-700' 
                : issue.severity === 'warning' 
                  ? 'bg-amber-50 border-amber-200 text-amber-700' 
                  : 'bg-blue-50 border-blue-200 text-blue-700'
              return (
                <div key={idx} className={`flex items-start gap-3 p-3.5 rounded-xl border ${sc}`}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold leading-relaxed">{issue.message}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold border flex-shrink-0 uppercase bg-white/70">
                    {issue.severity}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Preprocessing Report */}
      {preprocessingReport && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-slate-800">Safe Non-Destructive Preprocessing Applied</h4>
              <p className="text-xs text-slate-500 font-medium">Transformations performed on an in-memory analysis copy</p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
              {preprocessingReport.totalChanges || 0} action(s)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Original Records</p>
              <p className="text-base font-extrabold text-slate-800 font-mono mt-0.5">{preprocessingReport.originalRows?.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Clean Analysis Records</p>
              <p className="text-base font-extrabold text-slate-800 font-mono mt-0.5">{preprocessingReport.analyzedRows?.toLocaleString()}</p>
            </div>
          </div>

          <div className="space-y-2">
            {preprocessingReport.changes?.map((change, idx) => (
              <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50/60 border border-blue-100/80 text-xs">
                <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <span className="text-blue-900 font-medium">{change.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inspecting Column Modal */}
      <AnimatePresence>
        {inspectingColumn && (
          <ColumnDetailModal
            column={inspectingColumn}
            outlierInfo={outlierDetails?.[inspectingColumn.name]}
            onClose={() => setInspectingColumn(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

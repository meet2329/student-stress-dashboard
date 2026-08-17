import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Database, 
  CheckCircle2, 
  Search, 
  FileText, 
  Layers, 
  Sparkles, 
  Download, 
  Copy, 
  ShieldCheck, 
  ArrowRight,
  HelpCircle,
  Table
} from 'lucide-react'
import { useFilter } from '../../context/FilterContext'
import metadata from '../../data/metadata.json'
import dataDictionary from '../../data/dataDictionary.json'

export default function MethodologyModal() {
  const { methodologyOpen, setMethodologyOpen } = useFilter()
  const [activeTab, setActiveTab] = useState('pipeline')
  const [searchTerm, setSearchTerm] = useState('')
  const [copied, setCopied] = useState(false)

  if (!methodologyOpen) return null

  const filteredDictionary = dataDictionary.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(metadata, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setMethodologyOpen(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col z-10"
        >
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-teal-400">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">
                  Data Science Methodology & Dataset Architecture
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  3,000 Records • 19 Variables • Zero Nulls • Complete Statistical Pipeline
                </p>
              </div>
            </div>
            <button
              onClick={() => setMethodologyOpen(false)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 px-6 border-b border-slate-200 bg-slate-50/80 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-all ${
                activeTab === 'pipeline'
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>11-Step Analytics Pipeline</span>
            </button>
            <button
              onClick={() => setActiveTab('quality')}
              className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-all ${
                activeTab === 'quality'
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Data Quality & Integrity</span>
            </button>
            <button
              onClick={() => setActiveTab('dictionary')}
              className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-all ${
                activeTab === 'dictionary'
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Table className="w-4 h-4" />
              <span>19-Variable Dictionary</span>
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {/* Tab 1: Pipeline */}
            {activeTab === 'pipeline' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                      Primary Research Objective
                    </h3>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5">
                      “{metadata.primaryResearchQuestion}”
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  {metadata.pipelineStages.map((stage) => (
                    <div
                      key={stage.step}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all flex items-start gap-3"
                    >
                      <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {stage.step}
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{stage.title}</h4>
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                          {stage.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 2: Data Quality */}
            {activeTab === 'quality' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                    <p className="text-xs font-semibold text-emerald-800">Completeness</p>
                    <p className="text-2xl font-extrabold text-emerald-700 mt-1">
                      {metadata.dataQuality.completeness}%
                    </p>
                    <p className="text-[11px] text-emerald-600 mt-0.5">0 Missing Values</p>
                  </div>
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-center">
                    <p className="text-xs font-semibold text-blue-800">Uniqueness</p>
                    <p className="text-2xl font-extrabold text-blue-700 mt-1">
                      {metadata.dataQuality.uniqueness}%
                    </p>
                    <p className="text-[11px] text-blue-600 mt-0.5">0 Duplicate Rows</p>
                  </div>
                  <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-center">
                    <p className="text-xs font-semibold text-indigo-800">Consistency</p>
                    <p className="text-2xl font-extrabold text-indigo-700 mt-1">
                      {metadata.dataQuality.consistency}%
                    </p>
                    <p className="text-[11px] text-indigo-600 mt-0.5">Type Validated</p>
                  </div>
                  <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-center">
                    <p className="text-xs font-semibold text-teal-800">Validity Score</p>
                    <p className="text-2xl font-extrabold text-teal-700 mt-1">
                      {metadata.dataQuality.validity}%
                    </p>
                    <p className="text-[11px] text-teal-600 mt-0.5">Domain Verified</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Data Preprocessing & Cleaning Protocols
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Outlier Treatment:</strong> Numerical continuous distributions (Study Hours, Screen Time, Sleep Hours) were inspected via Tukey boxplot IQR bounds and Winsorized at the 1st and 99th percentiles to preserve sample size while mitigating extreme measurement noise.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Categorical Standardisation:</strong> Standardized text cases and encoded Nominal features (Gender, University Type, Tuition) and Ordinal factors (Family Income, Stress Severity).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Scale Normalization:</strong> Raw Likert responses (1.0–5.0) and Composite Stress Score (0–100 scale) were verified for parametric assumption compliance.</span>
                    </li>
                  </ul>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 text-white">
                  <div className="text-xs">
                    <p className="font-semibold text-slate-200">Export Raw Metadata Specification</p>
                    <p className="text-slate-400 text-[11px]">Download or copy dataset JSON configuration</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyJson}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-teal-300 flex items-center gap-1.5 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Data Dictionary */}
            {activeTab === 'dictionary' && (
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search 19 variables by name, category, or description..."
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                  />
                </div>

                {/* Table */}
                <div className="border border-slate-200 rounded-xl overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="px-3 py-2.5">Variable Name</th>
                        <th className="px-3 py-2.5">Category</th>
                        <th className="px-3 py-2.5">Data Type</th>
                        <th className="px-3 py-2.5">Scale / Range</th>
                        <th className="px-3 py-2.5">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredDictionary.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-3 py-2.5 font-mono font-bold text-blue-700 whitespace-nowrap">
                            {item.name}
                          </td>
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                              {item.category}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap font-medium">
                            {item.type}
                          </td>
                          <td className="px-3 py-2.5 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                            {item.range}
                          </td>
                          <td className="px-3 py-2.5 text-slate-700 min-w-[200px]">
                            {item.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
            <span className="font-mono">Dataset Scope: 2023–2024 University Cohort</span>
            <button
              onClick={() => setMethodologyOpen(false)}
              className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

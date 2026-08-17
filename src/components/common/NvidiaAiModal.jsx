import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Cpu, 
  X, 
  Key, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  ShieldCheck,
  Zap,
  RefreshCw
} from 'lucide-react'
import { useFilter } from '../../context/FilterContext'
import { AVAILABLE_NVIDIA_MODELS } from '../../services/nvidiaAiService'

export default function NvidiaAiModal() {
  const { 
    nvidiaModalOpen, 
    setNvidiaModalOpen,
    nvidiaApiKey,
    setNvidiaApiKey,
    nvidiaModel,
    setNvidiaModel,
    isAnalyzingAi,
    aiAnalysisResult,
    aiError,
    executeNvidiaAnalysis,
    customDataset
  } = useFilter()

  const [inputKey, setInputKey] = useState(nvidiaApiKey)
  const [saveSuccess, setSaveSuccess] = useState(false)

  if (!nvidiaModalOpen) return null

  const handleSaveAndAnalyze = async () => {
    setNvidiaApiKey(inputKey.trim())
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 2000)
    await executeNvidiaAnalysis(customDataset, inputKey.trim(), nvidiaModel)
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setNvidiaModalOpen(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col z-10"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                  <span>NVIDIA NIM AI Intelligence</span>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full border border-emerald-400/30 font-mono">
                    Llama 3.3 70B
                  </span>
                </h3>
                <p className="text-xs text-slate-300 font-medium">
                  Automated Dataset Reasoning, Statistical Findings & Actions
                </p>
              </div>
            </div>
            <button
              onClick={() => setNvidiaModalOpen(false)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
            {/* Explanatory Banner */}
            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 text-xs text-emerald-950 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-emerald-900">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                How NVIDIA AI Analyzes Your Uploaded CSV:
              </p>
              <p className="leading-relaxed text-emerald-800">
                When you upload a dataset, the NVIDIA model (Llama-3.3-70B) reads all computed univariate, bivariate, and multivariate parameters, and autonomously generates tailored clinical and academic insights, key findings, and intervention actions.
              </p>
            </div>

            {/* Error Message */}
            {aiError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">NVIDIA AI Error:</p>
                  <p>{aiError}</p>
                </div>
              </div>
            )}

            {/* API Key Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>NVIDIA API Key</span>
                <a
                  href="https://build.nvidia.com/meta/llama-3_3-70b-instruct"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1 text-[11px] font-semibold"
                >
                  <span>Get Free Key at build.nvidia.com</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </label>

              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="nvapi-..."
                  className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono font-medium text-slate-800"
                />
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Your API key is securely preserved in your local browser storage and never sent to external servers other than NVIDIA's API endpoint.
              </p>
            </div>

            {/* Model Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select NVIDIA NIM Foundation Model
              </label>
              <select
                value={nvidiaModel}
                onChange={(e) => setNvidiaModel(e.target.value)}
                className="w-full px-3 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold text-slate-800 cursor-pointer"
              >
                {AVAILABLE_NVIDIA_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Analysis Status */}
            {aiAnalysisResult && (
              <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    AI Intelligence Active
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Model: {nvidiaModel.split('/')[1]}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "{aiAnalysisResult.aiExecutiveSummary}"
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <button
              onClick={() => setNvidiaModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/70 transition-colors"
            >
              Close
            </button>
            <button
              disabled={isAnalyzingAi || !inputKey.trim()}
              onClick={handleSaveAndAnalyze}
              className={`
                px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md
                ${isAnalyzingAi || !inputKey.trim()
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/25 cursor-pointer'
                }
              `}
            >
              {isAnalyzingAi ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing Dataset with NVIDIA AI...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-yellow-300" />
                  <span>{aiAnalysisResult ? 'Re-Analyze with NVIDIA AI' : 'Run NVIDIA AI Analysis'}</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

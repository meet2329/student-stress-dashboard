import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Share2, 
  Clock, 
  Copy, 
  Check, 
  QrCode, 
  ExternalLink, 
  Lock, 
  ShieldAlert, 
  Sparkles, 
  Trash2, 
  X, 
  Eye, 
  Layers, 
  FileText,
  AlertCircle,
  RefreshCw,
  Sliders
} from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useFilter } from '../../context/FilterContext'
import { useAIEda } from '../../context/AIEdaContext'
import { useAuth } from '../../context/AuthContext'
import { 
  createShareLink, 
  getUserSharedLinks, 
  revokeShareLink, 
  EXPIRATION_PRESETS,
  formatTimeRemaining,
  encodePayloadToUrl
} from '../../services/shareService'

export default function ShareModal({ isOpen, onClose }) {
  const location = useLocation()
  const { currentUser } = useAuth()
  const { exportSnapshot: exportFilterSnapshot } = useFilter()
  const { exportAIEdaSnapshot, pipelineStage, fileName, datasetProfile, rawDataset } = useAIEda()

  const [activeTab, setActiveTab] = useState('create') // 'create' | 'manage'
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedDuration, setSelectedDuration] = useState('24h')
  const [enablePin, setEnablePin] = useState(false)
  const [pin, setPin] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedResult, setGeneratedResult] = useState(null)
  const [copied, setCopied] = useState(false)
  const [showQrCode, setShowQrCode] = useState(false)
  const [userLinks, setUserLinks] = useState([])
  const [isLoadingLinks, setIsLoadingLinks] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  // Auto-fill default title based on current screen and active dataset
  useEffect(() => {
    if (isOpen) {
      setGeneratedResult(null)
      setCopied(false)
      setShowQrCode(false)
      setErrorMessage(null)

      if (fileName) {
        setTitle(`${fileName} Analytics & Insights`)
        setDescription(`Interactive analysis, statistical hypothesis tests, and AI recommendations for ${fileName} (${datasetProfile?.totalRows?.toLocaleString() || ''} rows).`)
      } else if (datasetProfile?.inferredDomain?.domain) {
        setTitle(`${datasetProfile.inferredDomain.domain} Analytics Dashboard`)
        setDescription(`Interactive ${datasetProfile.inferredDomain.domain.toLowerCase()} exploratory data analysis and AI visualization suite.`)
      } else {
        setTitle('Interactive Data Science & AI Dashboard')
        setDescription('Interactive exploratory data analysis, statistical tests, and AI insights.')
      }

      loadLinks()
    }
  }, [isOpen, location.pathname, fileName, datasetProfile])

  const loadLinks = async () => {
    setIsLoadingLinks(true)
    try {
      const links = await getUserSharedLinks(currentUser?.uid)
      setUserLinks(links)
    } catch (e) {
      console.warn('Error loading links:', e)
    } finally {
      setIsLoadingLinks(false)
    }
  }

  if (!isOpen) return null

  const handleGenerate = async (e) => {
    e.preventDefault()
    setIsGenerating(true)
    setErrorMessage(null)

    try {
      // 1. Capture full active AI EDA dataset, profiling, AI plan, insights & charts
      const aiEdaState = exportAIEdaSnapshot()
      const filterState = exportFilterSnapshot ? exportFilterSnapshot() : {}

      const snapshotState = {
        ...aiEdaState,
        filterState,
        initialPath: location.pathname
      }

      const result = await createShareLink({
        title: title.trim() || (fileName ? `${fileName} Analytics` : 'Shared Dashboard'),
        description,
        type: 'ai_eda',
        durationId: selectedDuration,
        pin: enablePin ? pin : '',
        state: snapshotState,
        user: currentUser
      })

      setGeneratedResult(result)
      // Refresh managed links list
      loadLinks()
    } catch (err) {
      console.error('Share generation error:', err)
      setErrorMessage(err.message || 'Failed to generate temporary share link.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopyLink = (url) => {
    const targetUrl = url || generatedResult?.shareUrl
    if (!targetUrl) return
    navigator.clipboard.writeText(targetUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handleRevoke = async (shareId) => {
    if (window.confirm('Are you sure you want to revoke this link? Anyone with this link will immediately lose access.')) {
      await revokeShareLink(shareId)
      loadLinks()
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl bg-slate-900/95 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden z-10 text-slate-100 backdrop-blur-xl flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-800/80 flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-500 text-white shadow-lg shadow-indigo-500/25">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  Share Temporary Dashboard
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Live Snapshot
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Generate a secure, time-limited link that others can view without logging in.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-800 px-6 pt-2 gap-4 bg-slate-900/50">
            <button
              onClick={() => setActiveTab('create')}
              className={`pb-3 px-2 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'create'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Create Temporary Link
            </button>
            <button
              onClick={() => {
                setActiveTab('manage')
                loadLinks()
              }}
              className={`pb-3 px-2 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'manage'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              My Shared Links ({userLinks.length})
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
            {errorMessage && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {activeTab === 'create' ? (
              <>
                {!generatedResult ? (
                  <form onSubmit={handleGenerate} className="space-y-5">
                    {/* Mode Notice */}
                    <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5 text-slate-300">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Source Workspace:</span>
                        <strong className="text-white truncate max-w-[220px]">
                          {fileName ? `${fileName}` : (datasetProfile?.inferredDomain?.domain ? `${datasetProfile.inferredDomain.domain} Studio` : 'AI-Powered EDA')}
                        </strong>
                      </div>
                      <span className="text-[11px] text-teal-300 font-mono">
                        {pipelineStage === 'ready' ? (datasetProfile ? `✓ ${datasetProfile.totalRows?.toLocaleString()} rows` : '✓ Active') : 'Autonomous Pipeline'}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Snapshot Title
                        </label>
                        <input
                          type="text"
                          required
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="e.g., Q1 Student Stress Report"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-slate-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Notes / Description <span className="text-slate-500 font-normal">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Short message or context for the recipient"
                          className="w-full px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-slate-500"
                        />
                      </div>
                    </div>

                    {/* Expiration Preset Selector */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        Link Expiration Duration
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {EXPIRATION_PRESETS.map((preset) => {
                          const isSelected = selectedDuration === preset.id
                          return (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => setSelectedDuration(preset.id)}
                              className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                                isSelected
                                  ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                                  : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                              }`}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className="text-xs font-bold text-white">{preset.label}</span>
                                {isSelected && (
                                  <span className="w-2 h-2 rounded-full bg-indigo-400 shadow-sm" />
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 mt-1 leading-tight">
                                {preset.description}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* PIN Protection Toggle */}
                    <div className="p-4 rounded-2xl bg-slate-800/30 border border-slate-700/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
                            <Lock className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">Password / PIN Protection</div>
                            <div className="text-[11px] text-slate-400">Require viewers to enter a PIN before opening</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEnablePin(!enablePin)}
                          className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                            enablePin ? 'bg-indigo-600' : 'bg-slate-700'
                          }`}
                        >
                          <motion.div
                            animate={{ x: enablePin ? 20 : 0 }}
                            className="w-5 h-5 rounded-full bg-white shadow-md"
                          />
                        </button>
                      </div>

                      {enablePin && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="pt-2"
                        >
                          <input
                            type="text"
                            maxLength={8}
                            value={pin}
                            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                            placeholder="Enter 4 to 8 digit numerical PIN"
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-600 text-white text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                          <p className="text-[10px] text-slate-400 mt-1">
                            Viewers must enter this exact PIN to access the charts and data.
                          </p>
                        </motion.div>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isGenerating || (enablePin && pin.length < 4)}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Generating Secure Snapshot...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Generate Temporary Link</span>
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  /* Link Generated View */
                  <div className="space-y-6 text-center py-2">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="inline-flex p-3.5 rounded-3xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-lg shadow-emerald-500/10 mb-2"
                    >
                      <Check className="w-8 h-8 text-emerald-400" />
                    </motion.div>

                    <div>
                      <h4 className="text-xl font-extrabold text-white">Your Temporary Link is Ready!</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Anyone with this link can view this interactive dashboard snapshot.
                      </p>
                    </div>

                    {/* Expiration Card */}
                    <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-left flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-white">
                            Validity: {generatedResult.durationLabel}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {generatedResult.expiresAt
                              ? `Expires on ${new Date(generatedResult.expiresAt).toLocaleString()}`
                              : 'Permanent link (No automated expiry)'}
                          </div>
                        </div>
                      </div>
                      {generatedResult?.payload?.hasPin && (
                        <div className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                          <Lock className="w-3 h-3" /> PIN Protected
                        </div>
                      )}
                    </div>

                    {/* Share Link Input Box */}
                    <div className="space-y-2 text-left">
                      <label className="text-xs font-semibold text-slate-300">Shareable URL</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={generatedResult.shareUrl}
                          className="flex-1 px-4 py-3 rounded-2xl bg-slate-950/80 border border-slate-700 text-indigo-300 text-xs font-mono select-all focus:outline-none"
                        />
                        <button
                          onClick={() => handleCopyLink(generatedResult.shareUrl)}
                          className={`px-5 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                            copied
                              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                          }`}
                        >
                          {copied ? (
                            <>
                              <Check className="w-4 h-4" /> Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" /> Copy Link
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-center gap-3 pt-2">
                      <button
                        onClick={() => setShowQrCode(!showQrCode)}
                        className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors cursor-pointer"
                      >
                        <QrCode className="w-4 h-4 text-indigo-400" />
                        {showQrCode ? 'Hide QR Code' : 'Show Mobile QR Code'}
                      </button>

                      <a
                        href={generatedResult.shareUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 text-purple-400" />
                        Open in New Tab
                      </a>

                      <button
                        onClick={() => setGeneratedResult(null)}
                        className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Create Another
                      </button>
                    </div>

                    {/* QR Code Card */}
                    {showQrCode && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-5 rounded-2xl bg-white text-slate-900 max-w-xs mx-auto shadow-2xl flex flex-col items-center space-y-2"
                      >
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                            generatedResult.shareUrl
                          )}`}
                          alt="Share QR Code"
                          className="w-44 h-44 rounded-lg"
                        />
                        <p className="text-[11px] font-bold text-slate-700">Scan with mobile camera to view</p>
                      </motion.div>
                    )}
                  </div>
                )}
              </>
            ) : (
              /* Manage Links Tab */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Your active and past shareable links ({userLinks.length})
                  </span>
                  <button
                    onClick={loadLinks}
                    disabled={isLoadingLinks}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLinks ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>

                {userLinks.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 space-y-2">
                    <Clock className="w-8 h-8 mx-auto text-slate-600" />
                    <p className="text-sm">No temporary links generated yet.</p>
                    <button
                      onClick={() => setActiveTab('create')}
                      className="text-xs font-bold text-indigo-400 hover:underline cursor-pointer"
                    >
                      Generate your first share link
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userLinks.map((item) => {
                      const origin = typeof window !== 'undefined' ? window.location.origin : ''
                      const itemUrl = `${origin}/share/${item.id}`
                      const timeInfo = formatTimeRemaining(item.expiresAt)
                      const isRevoked = Boolean(item.isRevoked)

                      return (
                        <div
                          key={item.id}
                          className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 hover:border-slate-600 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-1 max-w-sm">
                            <div className="flex items-center gap-2">
                              <h5 className="text-sm font-bold text-white truncate">{item.title}</h5>
                              {item.type === 'ai_eda' ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                  AI EDA
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                  Stress Analytics
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                              <span>
                                Created {item.createdAt ? (typeof item.createdAt === 'number' ? new Date(item.createdAt).toLocaleDateString() : (item.createdAt.toDate ? item.createdAt.toDate().toLocaleDateString() : 'Recently')) : 'Recently'}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3 text-slate-400" /> {item.viewCount || 0} views
                              </span>
                            </div>

                            {/* Status Badge */}
                            <div className="pt-1">
                              {isRevoked ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                  Revoked / Inactive
                                </span>
                              ) : timeInfo.isExpired ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-700 text-slate-400 border border-slate-600">
                                  Expired
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                  Active ({timeInfo.text})
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Quick Actions */}
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleCopyLink(itemUrl)}
                              title="Copy Link"
                              className="p-2 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <a
                              href={itemUrl}
                              target="_blank"
                              rel="noreferrer"
                              title="Open"
                              className="p-2 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                            {!isRevoked && (
                              <button
                                onClick={() => handleRevoke(item.id)}
                                title="Revoke Link"
                                className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

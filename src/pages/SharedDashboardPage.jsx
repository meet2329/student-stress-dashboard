import React, { useState, useEffect, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Clock, 
  Lock, 
  AlertTriangle, 
  CheckCircle2, 
  Eye, 
  Share2, 
  Sparkles, 
  ArrowLeft, 
  Copy, 
  Check, 
  ShieldCheck, 
  ExternalLink,
  Layers,
  BarChart3,
  BrainCircuit,
  TrendingUp,
  Cpu,
  RefreshCw,
  Home
} from 'lucide-react'
import { getSharedDashboard, formatTimeRemaining } from '../services/shareService'
import { useFilter } from '../context/FilterContext'
import { useAIEda } from '../context/AIEdaContext'

// Pages for Student Stress Dashboard
import OverviewPage from './OverviewPage'
import StudentProfilePage from './StudentProfilePage'
import AcademicLifestylePage from './AcademicLifestylePage'
import MultivariatePage from './MultivariatePage'
import StatisticalAnalysisPage from './StatisticalAnalysisPage'
import InsightsRecommendationsPage from './InsightsRecommendationsPage'

// Pages for AI EDA Workspace
import AIEdaOverviewPage from './ai-eda/AIEdaOverviewPage'
import DataQualityPage from './ai-eda/DataQualityPage'
import DynamicUnivariatePage from './ai-eda/DynamicUnivariatePage'
import DynamicBivariatePage from './ai-eda/DynamicBivariatePage'
import DynamicMultivariatePage from './ai-eda/DynamicMultivariatePage'
import AIInsightsPage from './ai-eda/AIInsightsPage'
import RecommendationsPage from './ai-eda/RecommendationsPage'

const STRESS_TABS = [
  { id: 'overview', label: 'Executive Overview', icon: BarChart3 },
  { id: 'profile', label: 'Student Profile', icon: Layers },
  { id: 'academic-lifestyle', label: 'Lifestyle Factors', icon: TrendingUp },
  { id: 'multivariate', label: 'Multivariate Analysis', icon: BrainCircuit },
  { id: 'statistical-analysis', label: 'Statistical Tests', icon: Cpu },
  { id: 'insights', label: 'AI Insights & Actions', icon: Sparkles }
]

const AI_EDA_TABS = [
  { id: 'ai-overview', label: 'Dataset Overview', icon: BarChart3 },
  { id: 'quality', label: 'Data Quality', icon: ShieldCheck },
  { id: 'univariate', label: 'Univariate', icon: Layers },
  { id: 'bivariate', label: 'Bivariate', icon: TrendingUp },
  { id: 'multivariate', label: 'Multivariate', icon: BrainCircuit },
  { id: 'insights', label: 'AI Insights', icon: Sparkles },
  { id: 'recommendations', label: 'Recommendations', icon: CheckCircle2 }
]

export default function SharedDashboardPage() {
  const { shareId } = useParams()
  const navigate = useNavigate()
  const { loadSnapshot } = useFilter()
  const { loadAIEdaSnapshot } = useAIEda()

  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState(null)
  const [isExpired, setIsExpired] = useState(false)
  const [isRevoked, setIsRevoked] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  // PIN Protection State
  const [requiresPin, setRequiresPin] = useState(false)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [enteredPin, setEnteredPin] = useState('')
  const [pinError, setPinError] = useState(false)

  // Active Tab State
  const [activeTab, setActiveTab] = useState('overview')
  const [timeRemaining, setTimeRemaining] = useState({ text: '', isExpired: false, isUrgent: false })
  const [copied, setCopied] = useState(false)

  // Fetch Dashboard Record
  useEffect(() => {
    let isMounted = true

    async function fetchRecord() {
      setLoading(true)
      setErrorMessage(null)

      try {
        const result = await getSharedDashboard(shareId)

        if (!isMounted) return

        if (!result.success) {
          if (result.isExpired) {
            setIsExpired(true)
            setDashboardData(result.data)
          } else if (result.isRevoked) {
            setIsRevoked(true)
            setDashboardData(result.data)
          } else {
            setErrorMessage(result.error || 'Failed to load shared dashboard.')
          }
          setLoading(false)
          return
        }

        const data = result.data
        setDashboardData(data)

        if (data.hasPin && data.pin) {
          setRequiresPin(true)
          setIsUnlocked(false)
        } else {
          setIsUnlocked(true)
          hydrateWorkspace(data)
        }
      } catch (err) {
        if (isMounted) {
          setErrorMessage(err.message || 'An error occurred while fetching the shared link.')
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchRecord()

    return () => {
      isMounted = false
    }
  }, [shareId])

  // Hydrate the context state with the snapshot
  const hydrateWorkspace = (data) => {
    if (!data || !data.state) return

    if (data.type === 'ai_eda') {
      loadAIEdaSnapshot(data.state)
      setActiveTab('ai-overview')
    } else {
      loadSnapshot(data.state)
      setActiveTab('overview')
    }
  }

  // Real-time Countdown Timer Interval (Every second)
  useEffect(() => {
    if (!dashboardData || !dashboardData.expiresAt) return

    const updateTimer = () => {
      const info = formatTimeRemaining(dashboardData.expiresAt)
      setTimeRemaining(info)
      if (info.isExpired) {
        setIsExpired(true)
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [dashboardData])

  const handleUnlockPin = (e) => {
    e.preventDefault()
    if (enteredPin === dashboardData.pin) {
      setIsUnlocked(true)
      setPinError(false)
      hydrateWorkspace(dashboardData)
    } else {
      setPinError(true)
      setEnteredPin('')
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  // ─── 1. Loading Screen ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center space-y-4">
          <div className="p-4 rounded-3xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 animate-pulse shadow-xl">
            <RefreshCw className="w-8 h-8 animate-spin" />
          </div>
          <h2 className="text-xl font-bold tracking-wide">Loading Shared Dashboard...</h2>
          <p className="text-xs text-slate-400 font-mono">Validating cryptographic snapshot & expiration token</p>
        </div>
      </div>
    )
  }

  // ─── 2. Expired Screen ──────────────────────────────────────────────────────
  if (isExpired) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 relative">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900/90 border border-rose-500/30 shadow-2xl backdrop-blur-xl text-center space-y-6">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 rounded-3xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/10"
          >
            <Clock className="w-8 h-8 text-rose-400" />
          </motion.div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-extrabold uppercase tracking-wider">
              Access Expired
            </span>
            <h2 className="text-2xl font-black text-white">This Shared Link Has Expired</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              The temporary validity period for this dashboard has concluded.
              {dashboardData?.expiresAt && (
                <span className="block mt-1 text-slate-300 font-mono">
                  Expired on: {new Date(dashboardData.expiresAt).toLocaleString()}
                </span>
              )}
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <Link
              to="/"
              className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Go to Analytics Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ─── 3. Revoked Screen ──────────────────────────────────────────────────────
  if (isRevoked) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 relative">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900/90 border border-amber-500/30 shadow-2xl backdrop-blur-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
            <AlertTriangle className="w-8 h-8 text-amber-400" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-extrabold uppercase tracking-wider">
              Link Revoked
            </span>
            <h2 className="text-2xl font-black text-white">Access Has Been Revoked</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              The owner of this dashboard has deactivated this share link.
            </p>
          </div>

          <Link
            to="/"
            className="w-full py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Go to Analytics Home
          </Link>
        </div>
      </div>
    )
  }

  // ─── 4. Error Screen ────────────────────────────────────────────────────────
  if (errorMessage || !dashboardData) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Link Not Found</h2>
            <p className="text-xs text-slate-400">{errorMessage || 'Invalid share identifier or network error.'}</p>
          </div>
          <Link
            to="/"
            className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" /> Return to Dashboard Home
          </Link>
        </div>
      </div>
    )
  }

  // ─── 5. PIN Protection Challenge Screen ─────────────────────────────────────
  if (requiresPin && !isUnlocked) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-sm w-full p-8 rounded-3xl bg-slate-900/95 border border-indigo-500/30 shadow-2xl backdrop-blur-xl relative z-10 space-y-6 text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/20">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">Passcode Protected</h3>
            <p className="text-xs text-slate-400">
              The author has protected this dashboard with a security PIN.
            </p>
          </div>

          <form onSubmit={handleUnlockPin} className="space-y-4">
            <div className="space-y-1">
              <input
                type="password"
                maxLength={8}
                autoFocus
                value={enteredPin}
                onChange={(e) => {
                  setEnteredPin(e.target.value)
                  setPinError(false)
                }}
                placeholder="Enter PIN"
                className={`w-full text-center py-3.5 rounded-2xl bg-slate-950 border text-xl tracking-widest font-mono text-white focus:outline-none transition-all ${
                  pinError
                    ? 'border-rose-500 focus:ring-2 focus:ring-rose-500'
                    : 'border-slate-700 focus:ring-2 focus:ring-indigo-500'
                }`}
              />
              {pinError && (
                <p className="text-xs text-rose-400 font-semibold pt-1">
                  Incorrect PIN. Please try again.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={enteredPin.length < 4}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              Unlock Dashboard
            </button>
          </form>
        </motion.div>
      </div>
    )
  }

  // ─── 6. Active Interactive Dashboard View ───────────────────────────────────
  const tabs = dashboardData.type === 'ai_eda' ? AI_EDA_TABS : STRESS_TABS

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* 🌟 Top Persistent Expiration & Attribution Bar */}
      <header className="sticky top-0 z-40 bg-white/95 border-b border-slate-200/90 backdrop-blur-md px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Main Dashboard</span>
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-extrabold text-slate-900 truncate max-w-xs sm:max-w-md">
                {dashboardData.title}
              </h1>
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Shared Snapshot
              </span>
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
              <span>Created by <strong className="text-slate-700">{dashboardData.owner?.displayName || 'Analyst'}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-slate-400" /> {dashboardData.viewCount || 1} views
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Realtime Expiration Countdown Pill */}
          <div
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 border shadow-xs ${
              timeRemaining.isUrgent
                ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                : 'bg-indigo-50 text-indigo-700 border-indigo-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <span>{timeRemaining.text || 'Temporary Access Active'}</span>
          </div>

          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy Link'}</span>
          </button>

          <Link
            to="/"
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-sm shadow-blue-500/20 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span className="hidden sm:inline">Launch Full App</span>
          </Link>
        </div>
      </header>

      {/* 🧭 Secondary Navigation Bar (Tabs) */}
      <nav className="bg-white border-b border-slate-200 px-4 sm:px-8 flex overflow-x-auto gap-2 py-2.5 custom-scrollbar shadow-2xs">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </nav>

      {/* 📊 Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {dashboardData.description && (
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-xs text-slate-700 flex items-center gap-3 shadow-2xs">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <strong className="text-blue-950 font-bold">Author's Note:</strong> {dashboardData.description}
            </div>
          </div>
        )}

        {/* Render Tab Content based on Type */}
        <div className="transition-all">
          {dashboardData.type === 'ai_eda' ? (
            <div>
              {activeTab === 'ai-overview' && <AIEdaOverviewPage />}
              {activeTab === 'quality' && <DataQualityPage />}
              {activeTab === 'univariate' && <DynamicUnivariatePage />}
              {activeTab === 'bivariate' && <DynamicBivariatePage />}
              {activeTab === 'multivariate' && <DynamicMultivariatePage />}
              {activeTab === 'insights' && <AIInsightsPage />}
              {activeTab === 'recommendations' && <RecommendationsPage />}
            </div>
          ) : (
            <div>
              {activeTab === 'overview' && <OverviewPage />}
              {activeTab === 'profile' && <StudentProfilePage />}
              {activeTab === 'academic-lifestyle' && <AcademicLifestylePage />}
              {activeTab === 'multivariate' && <MultivariatePage />}
              {activeTab === 'statistical-analysis' && <StatisticalAnalysisPage />}
              {activeTab === 'insights' && <InsightsRecommendationsPage />}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200 bg-white text-center text-xs text-slate-500">
        Student Stress Analytics & AI EDA • Interactive Shared Snapshot Viewer
      </footer>
    </div>
  )
}

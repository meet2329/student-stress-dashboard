import React from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import { 
  Filter, 
  RotateCcw, 
  Database, 
  HelpCircle, 
  Sparkles,
  ChevronRight,
  UploadCloud,
  Cpu,
  Zap,
  LogIn,
  LogOut,
  User,
  Wand2,
  Share2
} from 'lucide-react'
import { useFilter } from '../../context/FilterContext'
import { useAIEda, STAGES } from '../../context/AIEdaContext'
import { useAuth } from '../../context/AuthContext'

const ROUTE_TITLES = {
  '/': {
    title: 'Autonomous EDA Overview',
    subtitle: 'Upload any CSV dataset to synthesize instant statistical diagnostics & visualizations'
  },
  '/ai-eda/quality': {
    title: 'Data Quality & Hygiene Audit',
    subtitle: 'Validate dataset integrity, detect missing values, and review preprocessing transformations'
  },
  '/ai-eda/univariate': {
    title: 'Univariate Feature Distributions',
    subtitle: 'AI-selected single-variable distributions, skewness metrics, and frequency histograms'
  },
  '/ai-eda/bivariate': {
    title: 'Bivariate Correlation & Regression',
    subtitle: 'Pairwise feature relationships, scatter plots, trendlines, and group comparisons'
  },
  '/ai-eda/multivariate': {
    title: 'Multivariate Interaction Suite',
    subtitle: 'Multi-dimensional correlation heatmaps, driver rankings, and cluster radar profiles'
  },
  '/ai-eda/statistical-analysis': {
    title: 'Statistical Hypothesis Testing',
    subtitle: 'Pearson correlations, One-Way ANOVA, and Chi-Square tests computed dynamically from your data'
  },
  '/ai-eda/insights': {
    title: 'AI Findings & Empirical Insights',
    subtitle: 'Evidence-based risk multipliers, protective buffers, and cohort trends'
  },
  '/ai-eda/recommendations': {
    title: 'Actionable Domain Recommendations',
    subtitle: 'Targeted action plans and continuous optimization roadmaps for individuals and institutions'
  }
}

export default function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const { 
    setMethodologyOpen,
    setNvidiaModalOpen,
    setShareModalOpen,
    nvidiaApiKey,
    aiAnalysisResult
  } = useFilter()

  const { fileName, datasetProfile, pipelineStage } = useAIEda()
  const { currentUser, logoutUser } = useAuth()

  // Compute dynamic title & subtitle
  let pageTitle = ROUTE_TITLES[location.pathname]?.title || 'AI-Powered EDA'
  let pageSubtitle = ROUTE_TITLES[location.pathname]?.subtitle || 'Autonomous Exploratory Data Analysis & AI Studio'

  if (location.pathname === '/' || location.pathname === '/ai-eda') {
    if (fileName && datasetProfile) {
      pageTitle = `${fileName.replace(/\.[^/.]+$/, '')} Overview`
      pageSubtitle = `${datasetProfile.totalRows.toLocaleString()} observations • ${datasetProfile.totalCols} variables • Detected Domain: ${datasetProfile.inferredDomain?.domain || 'General'}`
    } else {
      pageTitle = 'Autonomous EDA Overview'
      pageSubtitle = 'Upload any CSV dataset to synthesize instant statistical diagnostics & visualizations'
    }
  }

  // Compute dynamic pipeline badge count
  const pipelineCountText = datasetProfile?.totalRows 
    ? (datasetProfile.totalRows >= 1000 ? `${(datasetProfile.totalRows / 1000).toFixed(1)}k` : `${datasetProfile.totalRows}`)
    : (pipelineStage === STAGES.READY ? 'Ready' : '0')

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-3.5 transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Left: Page Title & Breadcrumb */}
        <div className="pl-10 md:pl-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-0.5">
            <span className="font-medium hover:text-slate-800 transition-colors">Automated EDA</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-blue-600 truncate">{pageTitle}</span>
          </div>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight leading-tight">
            {pageTitle}
          </h1>
          <p className="text-xs text-slate-500 font-medium line-clamp-1">
            {pageSubtitle}
          </p>
        </div>

        {/* Right: Global AI Controls, Pipeline & Auth */}
        <div className="flex flex-wrap items-center gap-2 pt-1 lg:pt-0">

          {/* NVIDIA AI Settings Button */}
          <button
            onClick={() => setNvidiaModalOpen(true)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs transition-all border cursor-pointer
              ${aiAnalysisResult
                ? 'bg-slate-900 text-emerald-400 border-slate-800'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
              }
            `}
            title="Configure NVIDIA AI Reasoning & API Key"
          >
            <Cpu className="w-3.5 h-3.5 text-emerald-500" />
            <span>{aiAnalysisResult ? 'Nemotron AI Active' : 'NVIDIA AI'}</span>
          </button>

          {/* Pipeline Methodology Trigger */}
          <button
            onClick={() => setMethodologyOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all group cursor-pointer"
            title="View Pipeline Architecture"
          >
            <Database className="w-3.5 h-3.5 text-teal-400 group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">Pipeline</span>
            <span className="bg-slate-800 text-teal-300 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">
              {pipelineCountText}
            </span>
          </button>

          {/* Temporary Link Share Trigger */}
          <button
            onClick={() => setShareModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer group"
            title="Generate Temporary Shareable Link"
          >
            <Share2 className="w-3.5 h-3.5 text-indigo-200 group-hover:scale-110 transition-transform" />
            <span>Share</span>
          </button>

          {/* User Auth Profile / Login Button */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-1">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
                <img
                  src={currentUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.email}`}
                  alt={currentUser.displayName}
                  className="w-5 h-5 rounded-full bg-slate-300 object-cover"
                />
                <span className="font-semibold text-slate-800 max-w-[100px] truncate hidden sm:inline">
                  {currentUser.displayName}
                </span>
                <button
                  onClick={logoutUser}
                  className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-teal-400" />
              <span>Sign In / 3D</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

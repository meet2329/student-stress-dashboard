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
import { useAuth } from '../../context/AuthContext'

const ROUTE_TITLES = {
  '/': {
    title: 'Student Stress Overview',
    subtitle: 'A high-level view of stress patterns among university students'
  },
  '/profile': {
    title: 'Student & Stress Profile',
    subtitle: 'Univariate statistical distributions across demographics, academics, and lifestyle'
  },
  '/academic-lifestyle': {
    title: 'Academic & Lifestyle Factors',
    subtitle: 'Bivariate correlation analysis, scatter regressions, and cross-tabulations'
  },
  '/multivariate': {
    title: 'Multivariate Stress Analysis',
    subtitle: 'Exploring complex multi-factor interactions and 12×12 correlation matrices'
  },
  '/statistical-analysis': {
    title: 'Statistical Validation',
    subtitle: 'Hypothesis testing, Pearson correlations, Chi-Square tests, and One-Way ANOVA'
  },
  '/insights': {
    title: 'Insights & Recommendations',
    subtitle: 'Turning analytical findings into actionable institutional & lifestyle conclusions'
  },
  // AI Automated EDA Routes
  '/ai-eda': {
    title: 'AI EDA Overview',
    subtitle: 'AI-powered exploratory data analysis — upload any CSV for instant analytics'
  },
  '/ai-eda/quality': {
    title: 'Data Quality Analysis',
    subtitle: 'Validate dataset integrity, detect issues, and review preprocessing decisions'
  },
  '/ai-eda/univariate': {
    title: 'Dynamic Univariate Analysis',
    subtitle: 'AI-selected single-variable distributions and frequency analysis'
  },
  '/ai-eda/bivariate': {
    title: 'Dynamic Bivariate Analysis',
    subtitle: 'AI-selected two-variable relationships, correlations, and group comparisons'
  },
  '/ai-eda/multivariate': {
    title: 'Dynamic Multivariate Analysis',
    subtitle: 'AI-selected multi-dimensional correlation matrices and interaction patterns'
  },
  '/ai-eda/insights': {
    title: 'AI-Generated Insights',
    subtitle: 'Evidence-based observations and statistical findings from your data'
  },
  '/ai-eda/recommendations': {
    title: 'Recommendations',
    subtitle: 'Actionable recommendations derived from data analysis findings'
  }
}

export default function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const { 
    selectedGender, 
    setSelectedGender, 
    selectedUniversity, 
    setSelectedUniversity, 
    selectedStressLevel, 
    setSelectedStressLevel,
    isFiltered, 
    resetFilters,
    setMethodologyOpen,
    setIngestionStudioOpen,
    setNvidiaModalOpen,
    setShareModalOpen,
    nvidiaApiKey,
    aiAnalysisResult,
    customDataset
  } = useFilter()

  const { currentUser, logoutUser } = useAuth()

  const currentRoute = ROUTE_TITLES[location.pathname] || {
    title: 'Student Stress Analytics',
    subtitle: 'Data Science & AI University Project'
  }

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-3.5 transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Left: Page Title & Breadcrumb */}
        <div className="pl-10 md:pl-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-0.5">
            <span className="font-medium hover:text-slate-800 transition-colors">Analytics</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-blue-600 truncate">{currentRoute.title}</span>
          </div>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight leading-tight">
            {currentRoute.title}
          </h1>
          <p className="text-xs text-slate-500 font-medium line-clamp-1">
            {currentRoute.subtitle}
          </p>
        </div>

        {/* Right: Global AI Controls, Dataset Ingestion & Auth */}
        <div className="flex flex-wrap items-center gap-2 pt-1 lg:pt-0">

          {/* AI Dataset Ingestion Studio Button (Main Flow) */}
          <button
            onClick={() => setIngestionStudioOpen(true)}
            className={`
              flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-md transition-all border cursor-pointer
              ${customDataset 
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-500 shadow-emerald-500/20' 
                : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 hover:opacity-95 text-white border-blue-500 shadow-blue-500/20'
              }
            `}
            title="Upload CSV & Generate Custom AI Dashboard"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
            <span>{customDataset ? `Active: ${customDataset.rowCount} rows` : '✨ Ingest CSV & Generate Dashboard'}</span>
          </button>

          {/* NVIDIA AI Settings Button */}
          <button
            onClick={() => setNvidiaModalOpen(true)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs transition-all border
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

          {/* Methodology Trigger */}
          <button
            onClick={() => setMethodologyOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all group"
          >
            <Database className="w-3.5 h-3.5 text-teal-400 group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">Pipeline</span>
            <span className="bg-slate-800 text-slate-300 text-[10px] px-1.5 py-0.5 rounded font-mono">
              {customDataset ? customDataset.rowCount : '3k'}
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

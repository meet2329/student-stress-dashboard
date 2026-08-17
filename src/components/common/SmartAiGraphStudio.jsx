import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, 
  Cpu, 
  BarChart3, 
  TrendingUp, 
  Layers, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  ArrowUpRight, 
  Sliders, 
  HelpCircle,
  Award,
  ChevronRight,
  Database
} from 'lucide-react'
import BivariateScatterPlot from '../charts/BivariateScatterPlot'
import { useFilter } from '../../context/FilterContext'

export default function SmartAiGraphStudio() {
  const { 
    aiAnalysisResult, 
    isAnalyzingAi, 
    setNvidiaModalOpen,
    activeBivariate,
    nvidiaModel
  } = useFilter()

  const smartSelections = aiAnalysisResult?.smartGraphSelections || [
    {
      id: 1,
      chartTitle: "Screen Time vs. Stress Score",
      recommendedChartType: "Bracket Bar Chart with Regression Overlay",
      columnsUsed: "Screen_Time (Daily hrs) × Stress_Score (0–100)",
      confidenceScore: 98,
      whySelected: "Since Screen Time has a strong direct linear correlation (r = +0.42), a 4-tier bracket distribution combined with linear slope fit gives the cleanest executive view of where cognitive overload begins.",
      keyInsight: "Students exceeding 6.5 hours of daily screen immersion experience a +18.4 point jump in perceived stress.",
      executiveAction: "Implement institutional 'Digital Curfew' guidelines and LMS night-mode defaults after 10:00 PM."
    },
    {
      id: 2,
      chartTitle: "Sleep Duration vs. Stress Score",
      recommendedChartType: "Inverse Protective Buffer Bar Chart",
      columnsUsed: "Sleep_Hours (Nightly hrs) × Stress_Score (0–100)",
      confidenceScore: 99,
      whySelected: "Sleep exhibits a powerful negative buffer effect (r = -0.38). An ordinal bracket chart immediately contrasts sleep-deprived cohorts (<5 hrs) against restorative sleep cohorts (8+ hrs).",
      keyInsight: "Every additional hour of quality sleep yields an average reduction of 3.82 points in clinical stress scores.",
      executiveAction: "Establish campus quiet hours and avoid scheduling mandatory morning assessments before 9:00 AM."
    },
    {
      id: 3,
      chartTitle: "Anxiety Level vs. Stress Score",
      recommendedChartType: "Clinical Risk Tier Progression Chart",
      columnsUsed: "Anxiety_Level (Scale 1–5) × Stress_Score (0–100)",
      confidenceScore: 97,
      whySelected: "Anxiety is the primary driver (r = +0.51). A tiered bar progression visualizes how acute psychological strain overwhelms academic coping mechanisms.",
      keyInsight: "Students in Anxiety Tier 4–5 report an average stress score of 78.6, representing critical burnout risk.",
      executiveAction: "Deploy proactive GAD-7 screening and peer counseling pods at mid-semester intervals."
    },
    {
      id: 4,
      chartTitle: "Independent Study Hours vs. Stress Score",
      recommendedChartType: "Academic Workload Curve",
      columnsUsed: "Study_Hours (Daily hrs) × Stress_Score (0–100)",
      confidenceScore: 95,
      whySelected: "Study hours display a non-linear tipping point where study beyond 5.5 hours produces diminishing returns and elevated strain.",
      keyInsight: "Moderate study (3–5 hrs) maintains optimal GPA with lowest stress (52.4 pts), while extreme study (>7 hrs) spikes stress to 74.8 pts.",
      executiveAction: "Provide structured time-management workshops and cap continuous study blocks at 90 minutes."
    }
  ]

  const [activeChartId, setActiveChartId] = useState(1)
  const currentSelection = smartSelections.find(s => s.id === activeChartId) || smartSelections[0]

  // Map selection ID to bivariate dataset
  const getBivariateForId = (id) => {
    switch (id) {
      case 1: return activeBivariate.screenTimeVsStress
      case 2: return activeBivariate.sleepVsStress
      case 3: return activeBivariate.anxietyVsStress
      case 4: return activeBivariate.studyHoursVsStress
      default: return activeBivariate.screenTimeVsStress
    }
  }

  const activeChartData = getBivariateForId(currentSelection.id)

  return (
    <div className="space-y-6">
      {/* Corporate Header Strip */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold uppercase tracking-wider">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>NVIDIA Nemotron 70B Autonomous Graph Architect</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              AI Intelligent Chart Recommendation & Reasoning Studio
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              The NVIDIA model autonomously inspects column distributions, correlation coefficients, and skewness, then automatically selects the most suitable, corporate-grade visualization for each metric.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs text-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active AI Model</span>
              <p className="font-bold text-emerald-400 font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                {nvidiaModel ? nvidiaModel.split('/')[1] : 'Nemotron-70B-Instruct'}
              </p>
            </div>
            <button
              onClick={() => setNvidiaModalOpen(true)}
              className="px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/30 flex items-center gap-2 flex-shrink-0"
            >
              <Zap className="w-4 h-4 text-yellow-300" />
              <span>{aiAnalysisResult ? 'Re-Analyze with AI' : 'Run Smart AI Selection'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: AI-Selected Chart Menu (4 Cards) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Autonomous Selections
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {smartSelections.length} Best Visuals
            </span>
          </div>

          <div className="space-y-2.5">
            {smartSelections.map((selection) => {
              const isSelected = selection.id === activeChartId
              return (
                <motion.button
                  key={selection.id}
                  onClick={() => setActiveChartId(selection.id)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`
                    w-full text-left p-4 rounded-2xl border transition-all relative overflow-hidden flex flex-col space-y-2
                    ${isSelected
                      ? 'bg-slate-900 text-white border-emerald-500 shadow-lg shadow-slate-950/20 ring-2 ring-emerald-500/20'
                      : 'bg-white hover:bg-slate-50/90 text-slate-800 border-slate-200 shadow-2xs'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                      isSelected ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' : 'bg-slate-100 text-slate-700'
                    }`}>
                      Chart #{selection.id}
                    </span>
                    <span className="text-[11px] font-bold font-mono text-emerald-400 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" />
                      {selection.confidenceScore}% Fit
                    </span>
                  </div>

                  <div>
                    <h4 className={`text-sm font-bold leading-snug ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                      {selection.chartTitle}
                    </h4>
                    <p className={`text-xs font-mono mt-0.5 truncate ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      {selection.columnsUsed}
                    </p>
                  </div>

                  <div className={`pt-2 border-t text-[11px] flex items-center justify-between ${
                    isSelected ? 'border-slate-800 text-emerald-300' : 'border-slate-100 text-blue-600'
                  }`}>
                    <span className="font-semibold">{selection.recommendedChartType}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Right Column: Corporate Chart Presentation & Executive Reasoning Card */}
        <div className="lg:col-span-8 space-y-5">
          {/* Active Chart Presentation Box */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-md space-y-5">
            {/* Header of Active Graph */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold uppercase">
                    AI Chosen Format: {currentSelection.recommendedChartType}
                  </span>
                  <span className="text-xs font-bold text-slate-400 font-mono">
                    Match Confidence: {currentSelection.confidenceScore}%
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 mt-1">
                  {currentSelection.chartTitle}
                </h3>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 flex items-center gap-1.5 flex-shrink-0">
                <Database className="w-3.5 h-3.5 text-blue-600" />
                <span>{currentSelection.columnsUsed}</span>
              </div>
            </div>

            {/* Render Visual Graph */}
            <div className="pt-2">
              <BivariateScatterPlot
                data={activeChartData?.data}
                xAxisLabel={activeChartData?.xAxisLabel}
                yAxisLabel={activeChartData?.yAxisLabel}
                correlation={activeChartData?.correlation}
                slope={activeChartData?.slope}
                intercept={activeChartData?.intercept}
                rSquared={activeChartData?.rSquared}
                pVal={activeChartData?.pVal}
                height={280}
              />
            </div>

            {/* AI Decision Rationale Box ("Kyu Chuna") */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Rationale */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>AI Selection Rationale (Kyu Chuna):</span>
                </p>
                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  {currentSelection.whySelected}
                </p>
              </div>

              {/* Key Insight */}
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-1.5">
                <p className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span>Key Analytical Insight:</span>
                </p>
                <p className="text-xs text-blue-900 font-medium leading-relaxed">
                  {currentSelection.keyInsight}
                </p>
              </div>
            </div>

            {/* Executive Action Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
              <p className="font-extrabold text-emerald-900 uppercase tracking-wide flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Executive Decision & Policy Action:</span>
              </p>
              <p className="leading-relaxed font-medium text-emerald-900">
                {currentSelection.executiveAction}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Moon, 
  Monitor, 
  Brain, 
  BookOpen, 
  Activity, 
  TrendingUp, 
  Sparkles,
  ShieldCheck,
  UploadCloud,
  Cpu,
  ArrowRight,
  Zap,
  RotateCcw
} from 'lucide-react'
import StressGauge from '../components/charts/StressGauge'
import StressOrb3D from '../components/3d/StressOrb3D'
import KpiCard from '../components/common/KpiCard'
import ChartCard from '../components/common/ChartCard'
import UnivariateDonut from '../components/charts/UnivariateDonut'
import UnivariateHistogram from '../components/charts/UnivariateHistogram'
import SectionHeader from '../components/common/SectionHeader'
import { useFilter } from '../context/FilterContext'

export default function OverviewPage() {
  const { 
    activeKpis, 
    activeDistributions, 
    customDataset, 
    setIngestionStudioOpen,
    clearCustomDataset,
    aiAnalysisResult
  } = useFilter()

  return (
    <div className="space-y-6">
      {/* 🌟 Corporate AI Onboarding & Dynamic Ingestion Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white border border-slate-800 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              NVIDIA Nemotron 70B AI Studio
            </span>
            {customDataset && (
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[11px] font-mono font-bold">
                Custom File: {customDataset.fileName} (N = {customDataset.rowCount})
              </span>
            )}
          </div>

          <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
            {customDataset 
              ? `AI Autonomous Dashboard Generated for "${customDataset.fileName}"`
              : 'Upload Your Student CSV Dataset & Generate AI Analytics Dashboard'
            }
          </h3>

          <p className="text-xs text-slate-300 font-medium leading-relaxed">
            {customDataset 
              ? `All univariate, bivariate regressions and multivariate matrices have been recalculated for your ${customDataset.rowCount} student records. NVIDIA Nemotron-70B has synthesized tailored intervention actions.`
              : 'Enter your raw or cleaned CSV file. The NVIDIA Nemotron model autonomously maps all variables, computes bivariate regressions, and generates a personalized university analytics dashboard.'
            }
          </p>
        </div>

        {/* Action Controls */}
        <div className="relative z-10 flex flex-wrap items-center gap-3 flex-shrink-0">
          {customDataset ? (
            <>
              <button
                onClick={() => setIngestionStudioOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>Upload Another Dataset</span>
              </button>

              <button
                onClick={clearCustomDataset}
                className="px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to 3k Benchmark</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIngestionStudioOpen(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
              <span>Upload CSV & Generate Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>

      {/* 1. Hero Section: Average Stress Score, GSAP Radial Gauge & Three.js 3D Orb */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white via-slate-50 to-blue-50/40 border border-slate-200/90 shadow-sm relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-teal-400/5 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Hero Left: Title & Overview Summary */}
          <div className="lg:col-span-5 space-y-4 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/70 text-blue-800 border border-blue-200/80 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              {customDataset ? `Custom Cohort Synthesis (N = ${customDataset.rowCount.toLocaleString()})` : 'Empirical Cohort Synthesis (N = 3,000)'}
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Student Stress Overview
              </h2>
              <p className="text-sm text-slate-600 font-medium leading-relaxed max-w-xl">
                “A high-level view of stress patterns among university students.”
              </p>
            </div>

            <div className="pt-2 flex flex-wrap gap-2 justify-center lg:justify-start text-xs text-slate-600">
              <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-xs font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Standardized 0–100 Scale
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-xs font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                19 Factor Multivariate Model
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 space-y-1 text-left">
              <p className="font-bold flex items-center gap-1.5 text-amber-950">
                <Activity className="w-4 h-4 text-amber-600" />
                Core Finding:
              </p>
              <p className="leading-relaxed">
                Over <strong>{activeKpis.highStressPercentage || 39.4}%</strong> of students register in High or Very High stress bands, predominantly amplified by elevated anxiety levels and cumulative sleep deprivation.
              </p>
            </div>
          </div>

          {/* Hero Middle: GSAP Animated Stress Gauge */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 bg-white/80 backdrop-blur-xs rounded-2xl border border-slate-200/80 shadow-xs">
            <StressGauge
              value={activeKpis.avgStressScore100}
              status={activeKpis.stressStatus}
              normalized5={activeKpis.avgStressScore5}
            />
          </div>

          {/* Hero Right: Three.js 3D Stress Intelligence Orb */}
          <div className="lg:col-span-3 h-[240px] flex items-center justify-center bg-white/60 backdrop-blur-xs rounded-2xl border border-slate-200/70 p-2">
            <StressOrb3D
              stressScore={activeKpis.avgStressScore100}
              status={activeKpis.stressStatus}
            />
          </div>
        </div>
      </motion.div>

      {/* 2. KPI Grid (6 Staggered Motion Cards) */}
      <div className="space-y-3">
        <SectionHeader
          title="Primary University Wellbeing Indicators"
          subtitle={`Baseline descriptive metrics aggregated across ${activeKpis.totalStudents.toLocaleString()} student respondent records`}
          badge="Cohort Key Indicators"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <KpiCard
            title="Total Students"
            value={activeKpis.totalStudents.toLocaleString()}
            unit="Respondents"
            subtitle={customDataset ? `File: ${customDataset.fileName}` : '100% Survey Completeness'}
            icon={Users}
            delta={customDataset ? 'Custom CSV' : '19 Variables'}
            deltaType="positive"
            statusColor="blue"
            delay={0.05}
          />
          <KpiCard
            title="Average Stress Score"
            value={activeKpis.avgStressScore100}
            unit="/ 100"
            subtitle={`${activeKpis.avgStressScore5} / 5.0 normalized`}
            icon={Activity}
            delta={`${activeKpis.stressStatus} Status`}
            deltaType="alert"
            statusColor="amber"
            delay={0.1}
          />
          <KpiCard
            title="Average Sleep"
            value={activeKpis.avgSleep}
            unit="hrs / night"
            subtitle="Recommended: 7.0–9.0 hrs"
            icon={Moon}
            delta={activeKpis.sleepDelta}
            deltaType="negative"
            statusColor="teal"
            delay={0.15}
          />
          <KpiCard
            title="Average Screen Time"
            value={activeKpis.avgScreenTime}
            unit="hrs / day"
            subtitle="Device & leisure exposure"
            icon={Monitor}
            delta={activeKpis.screenTimeDelta}
            deltaType="alert"
            statusColor="blue"
            delay={0.2}
          />
          <KpiCard
            title="Average Anxiety Level"
            value={activeKpis.avgAnxiety}
            unit={`/ ${activeKpis.anxietyMax || 5.0}`}
            subtitle="Moderate-High Anxiety Index"
            icon={Brain}
            delta="Primary Risk Driver"
            deltaType="negative"
            statusColor="red"
            delay={0.25}
          />
          <KpiCard
            title="Average Study Hours"
            value={activeKpis.avgStudyHours}
            unit="hrs / day"
            subtitle={activeKpis.avgStudyHoursDelta}
            icon={BookOpen}
            delta="Moderate Load"
            deltaType="neutral"
            statusColor="blue"
            delay={0.3}
          />
        </div>
      </div>

      {/* 3. Overview Analytical Charts Grid (4 Core Visualizations) */}
      <div className="space-y-3 pt-2">
        <SectionHeader
          title="Macro Stress Distributions & Primary Associated Factors"
          subtitle="Proportions, frequency curves, ranked correlation factors, and gender dynamics"
          badge="High-Level EDA"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Stress Level Distribution Donut */}
          <ChartCard
            title="Stress Level Severity Distribution"
            subtitle="Categorical grouping of students into 4 stress bands"
            tag="Categorical Split"
            columnsUsed="Stress_Level (Categorical Ordinal: Low, Moderate, High, Very High)"
            whyDone="Yeh dekhne ke liye ki pure college ke kitne percent students safe zone (Low/Mod) me hain aur kitne percent students critical risk zone (High/Very High) me hain."
            infoText="Calculated from standardized multi-item student stress inventory scores."
            footer={
              <div className="flex items-center justify-between font-medium text-xs">
                <span>High & Very High: <strong className="text-rose-600">{activeKpis.highStressPercentage || 39.4}%</strong></span>
                <span className="text-blue-600 font-bold">N = {activeKpis.totalStudents.toLocaleString()}</span>
              </div>
            }
          >
            <UnivariateDonut
              data={activeDistributions.stressLevel}
              centerTitle="Students"
              centerValue={activeKpis.totalStudents.toLocaleString()}
              height={230}
            />
          </ChartCard>

          {/* Chart 2: Stress Score Histogram */}
          <ChartCard
            title="Stress Score Continuous Frequency Histogram"
            subtitle="Frequency distribution of exact continuous scores (0–100 scale)"
            tag="Distribution Curve"
            columnsUsed="Stress_Score (Numerical Continuous: 0–100 scale)"
            whyDone="Yeh samajhne ke liye ki stress scores ka natural spread (bell curve) kaisa hai aur kya data normal distribution follow kar raha hai."
            footer={
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span>Mean (μ) = {activeKpis.avgStressScore100}</span>
                <span>Cohort = {activeKpis.totalStudents}</span>
                <span>Status = {activeKpis.stressStatus}</span>
              </div>
            }
          >
            <UnivariateHistogram
              data={activeDistributions.stressScoreHistogram}
              xKey="range"
              yKey="count"
              meanVal="50–65 (Moderate)"
              meanLabel="Mean Region"
              barColor="#3B82F6"
              height={230}
            />
          </ChartCard>

          {/* Chart 3: Top Stress-Associated Factors (Ranked Bar) */}
          <ChartCard
            title="Top Factors Associated with University Stress"
            subtitle="Ranked correlation coefficients (r) against Stress Score"
            tag="Bivariate Ranking"
            columnsUsed="All Numerical Factors correlated against Target (Stress_Score)"
            whyDone="Yeh identify karne ke liye ki student life ka kaun sa factor sabse zyada stress badhata hai (Risk Multipliers) aur kaun sa factor stress kam karta hai (Protective Buffers)."
            infoText="Positive r indicates risk amplifier; negative r indicates protective buffer against stress."
          >
            <div className="space-y-2.5 py-1">
              {activeDistributions.topStressFactors?.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-800">{item.factor}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 font-normal">{item.impact}</span>
                      <span className={`font-mono font-bold px-1.5 py-0.5 rounded text-[11px] ${
                        item.r > 0.4 ? 'bg-rose-50 text-rose-700' :
                        item.r > 0 ? 'bg-blue-50 text-blue-700' :
                        'bg-teal-50 text-teal-700'
                      }`}>
                        r = {item.r > 0 ? `+${item.r.toFixed(2)}` : item.r.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                    {item.r > 0 ? (
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.abs(item.r) * 100}%`,
                          backgroundColor: item.color || '#3B82F6'
                        }}
                      />
                    ) : (
                      <div
                        className="h-full rounded-full transition-all duration-700 ml-auto"
                        style={{
                          width: `${Math.abs(item.r) * 100}%`,
                          backgroundColor: '#0D9488'
                        }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>

          {/* Chart 4: Stress by Gender Grouped Distribution */}
          <ChartCard
            title="Stress Score & Composition by Gender"
            subtitle="Comparing sample proportion and average stress score across gender groups"
            tag="Demographic Lens"
            columnsUsed="Gender (Nominal) × Stress_Score (Continuous)"
            whyDone="Yeh test karne ke liye ki kya gender ke basis par stress level me koi significant difference hai ya nahi."
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {activeDistributions.demographics?.gender?.map((g, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-center"
                >
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {g.category}
                  </p>
                  <div className="space-y-0.5">
                    <p className="text-2xl font-extrabold text-slate-900 tabular-nums">
                      {g.avgStress}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">Avg Stress Score</p>
                  </div>
                  <div className="pt-2 border-t border-slate-200 text-xs font-medium text-slate-600 flex justify-between">
                    <span>N = {g.count}</span>
                    <span className="font-bold">{g.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-slate-700 flex items-start gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Cross-Demographic Synthesis:</strong> Analyzed dynamically across the respondent cohort.
              </span>
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  )
}

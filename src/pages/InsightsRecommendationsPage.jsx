import React from 'react'
import { motion } from 'framer-motion'
import { 
  Sparkles, 
  GraduationCap, 
  Heart, 
  Users, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  BookOpen, 
  TrendingUp, 
  ShieldCheck,
  Compass,
  Cpu,
  Zap
} from 'lucide-react'
import ChartCard from '../components/common/ChartCard'
import SectionHeader from '../components/common/SectionHeader'
import RecommendationCard from '../components/common/RecommendationCard'
import HighStressRadarPlot from '../components/charts/HighStressRadarPlot'
import SmartAiGraphStudio from '../components/common/SmartAiGraphStudio'
import { useFilter } from '../context/FilterContext'

export default function InsightsRecommendationsPage() {
  const { activeInsights, nvidiaApiKey, setNvidiaModalOpen, isAnalyzingAi } = useFilter()
  const { keyFindings, recommendations, highStressProfile, finalDataStory, isAiGenerated, aiExecutiveSummary } = activeInsights

  return (
    <div className="space-y-8">
      {/* 1. NVIDIA Nemotron AI Autonomous Chart & Reasoning Studio */}
      <SmartAiGraphStudio />

      {/* 2. Executive Key Findings (5 Premium Corporate Cards) */}
      <div className="space-y-4 pt-2">
        <SectionHeader
          title="Executive Analytical Findings"
          subtitle="Top data-driven conclusions synthesized across bivariate and multivariate modeling"
          badge={isAiGenerated ? '⚡ NVIDIA AI Generated' : 'Core Findings'}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {keyFindings.map((finding) => (
            <motion.div
              key={finding.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: finding.id * 0.05 }}
              className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-extrabold uppercase tracking-wider">
                    {finding.tag}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    finding.severity === 'Critical' ? 'bg-rose-100 text-rose-800' :
                    finding.severity === 'High' ? 'bg-amber-100 text-amber-900' :
                    finding.severity === 'Positive' ? 'bg-emerald-100 text-emerald-800' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {finding.severity}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  {finding.title}
                </h3>
                <p className="text-xs text-slate-700 font-medium leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                  <strong className="text-blue-700">Finding:</strong> {finding.finding}
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong className="text-teal-700">Insight:</strong> {finding.insight}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 text-xs text-amber-900 bg-amber-50/60 p-2.5 rounded-xl border border-amber-100/80 leading-relaxed">
                <strong>Action:</strong> {finding.recommendation}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 3. Calculated High-Stress Student Profile Persona & Radar Chart */}
      <div className="space-y-4">
        <SectionHeader
          title="Empirical High-Stress Student Persona Profile"
          subtitle="Calculated characteristics and multi-dimensional risk fingerprint of the top quartile (upper 25%) stressed students"
          badge="Risk Persona"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Radar Visualization */}
          <div className="lg:col-span-6">
            <ChartCard
              title="Multidimensional Risk Radar Fingerprint"
              subtitle="Comparing High-Risk Upper Quartile vs Overall 3,000 Student Cohort Baseline"
              tag="Normalized Comparison"
              columnsUsed="All 8 Key Factor Dimensions Normalized (0–100 Scale)"
              whyDone="Top 25% highest stressed students ka multi-dimensional fingerprint draw karne ke liye taaki unke exact risk triggers pinpoint ho sakein."
              infoText="High risk students exhibit severe anxiety, screen exposure, and exam stress, coupled with sharp deficits in sleep, family support, and exercise."
            >
              <HighStressRadarPlot height={300} />
            </ChartCard>
          </div>

          {/* Metrics Table */}
          <div className="lg:col-span-6 space-y-3">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Profile Characteristic
                </span>
                <div className="flex items-center gap-4 text-xs font-bold">
                  <span className="text-rose-600">High Risk</span>
                  <span className="text-slate-400">Cohort Avg</span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                {highStressProfile.metrics?.map((m, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/70">
                    <span className="font-semibold text-slate-700">{m.label}</span>
                    <div className="flex items-center gap-4 font-mono">
                      <span className="font-extrabold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        {m.highRisk} {m.unit}
                      </span>
                      <span className="text-slate-500 font-medium">
                        {m.overallAvg} {m.unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-slate-600 italic pt-1 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <strong>Persona Summary:</strong> {highStressProfile.summary}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Actionable Institutional & Lifestyle Recommendations Grid */}
      <div className="space-y-4">
        <SectionHeader
          title="Evidence-Based Domain Interventions"
          subtitle="Strategic institutional policies, wellness architecture, and student support programs"
          badge="Action Framework"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Academic Recommendations */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <span>Academic Policy & Scheduling</span>
            </div>
            <div className="space-y-3">
              {recommendations.academic?.map((rec, i) => (
                <RecommendationCard
                  key={i}
                  title={rec.title}
                  description={rec.description}
                  priority={rec.priority}
                  timeframe={rec.timeframe}
                  category="Academic"
                />
              ))}
            </div>
          </div>

          {/* Lifestyle Recommendations */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Heart className="w-4 h-4 text-teal-600" />
              <span>Circadian & Digital Wellness</span>
            </div>
            <div className="space-y-3">
              {recommendations.lifestyle?.map((rec, i) => (
                <RecommendationCard
                  key={i}
                  title={rec.title}
                  description={rec.description}
                  priority={rec.priority}
                  timeframe={rec.timeframe}
                  category="Lifestyle"
                />
              ))}
            </div>
          </div>

          {/* Support Recommendations */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Users className="w-4 h-4 text-purple-600" />
              <span>Social & Mental Health Infrastructure</span>
            </div>
            <div className="space-y-3">
              {recommendations.support?.map((rec, i) => (
                <RecommendationCard
                  key={i}
                  title={rec.title}
                  description={rec.description}
                  priority={rec.priority}
                  timeframe={rec.timeframe}
                  category="Social Support"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Final Corporate Data Story Card ("What the Data Tells Us") */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl space-y-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 text-xs font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5 text-teal-400" />
            {isAiGenerated ? 'NVIDIA Nemotron AI Comprehensive Synthesis' : 'Comprehensive Analytical Synthesis'}
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            {finalDataStory.headline}
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed max-w-4xl font-medium">
            {finalDataStory.leadTakeaway}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {finalDataStory.keyTakeaways?.map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs space-y-1">
                <span className="text-xs font-bold text-teal-300 uppercase tracking-wider">
                  {item.label}
                </span>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {item.text}
                </p>
              </div>
            ))}
          </div>

          {/* Ethical / Medical Disclaimer */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/20 text-xs text-amber-200 flex items-start gap-3">
            <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed font-medium">
              <strong>Institutional Disclaimer:</strong> {finalDataStory.disclaimer}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Grid, 
  Layers, 
  Activity, 
  Brain, 
  ShieldCheck, 
  HelpCircle,
  TrendingUp,
  Sparkles,
  Heart,
  BookOpen,
  Monitor
} from 'lucide-react'
import ChartCard from '../components/common/ChartCard'
import SectionHeader from '../components/common/SectionHeader'
import CorrelationHeatmap from '../components/charts/CorrelationHeatmap'
import MultivariateBubblePlot from '../components/charts/MultivariateBubblePlot'
import multivariateData from '../data/multivariate.json'

export default function MultivariatePage() {
  const anxietyBufferData = multivariateData.anxietyFamilyStressInteraction || []
  const academicTriadData = multivariateData.academicPressureTriad || []
  const digitalHabitsData = multivariateData.digitalHabitsMatrix || []

  return (
    <div className="space-y-8">
      {/* 1. Full 12×12 Pearson Correlation Matrix Heatmap */}
      <div className="space-y-3">
        <SectionHeader
          title="Interactive 12×12 Pearson Correlation Matrix"
          subtitle="Pairwise Pearson correlation coefficients (r) across all primary dataset variables"
          badge="Multivariate Matrix"
        />

        <ChartCard
          title="Global Correlation Matrix Heatmap"
          subtitle="Explore inter-variable relationships, collinearity, and stress drivers"
          tag="12×12 Matrix"
          columnsUsed="All 12 Core Numerical & Ordinal Dataset Columns"
          whyDone="Ek saath sabhi variables ke aapas ke correlation (multicollinearity, drivers, buffers) ko pairwise compare karne ke liye."
          infoText="Colors range from dark teal (-0.38 protective buffer) to white (0.00 orthogonal) to vibrant crimson (+0.51 risk amplifier)."
        >
          <CorrelationHeatmap />
        </ChartCard>
      </div>

      {/* 2. 4D Multivariate Bubble Chart */}
      <div className="space-y-3">
        <SectionHeader
          title="4D Multivariate Relationship Surface"
          subtitle="Mapping Screen Time (X) × Stress Score (Y) × Sleep Hours (Size) × Stress Category (Color)"
          badge="4D Multidimensional Plot"
        />

        <ChartCard
          title="4D Interaction: Screen Time × Stress Score × Sleep Duration"
          subtitle="Bubble size represents nightly sleep duration; Color maps to categorical stress severity tier"
          tag="4-Factor Synthesis"
          columnsUsed="Screen_Time (X) × Stress_Score (Y) × Sleep_Hours (Size) × Stress_Level (Color)"
          whyDone="3 se 4 variables ke complex interaction ko ek single visual space me dekhne ke liye — jisse pata chalta hai ki low sleep aur high screen time ek saath aane par stress exponentially badhta hai."
        >
          <MultivariateBubblePlot height={340} />
        </ChartCard>
      </div>

      {/* 3. Multi-Factor Interaction Models Grid */}
      <div className="space-y-3">
        <SectionHeader
          title="Multi-Factor Buffering & Compounding Interaction Models"
          subtitle="Examining how social support cushions psychological strain, and how academic factors compound"
          badge="Interaction Models"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Interaction 1: Anxiety × Family Support Buffer */}
          <ChartCard
            title="Anxiety × Family Support Buffering Surface"
            subtitle="Stress Score across Anxiety Tiers split by Family Support Level"
            tag="Protective Buffering"
            columnsUsed="Anxiety_Level × Family_Support × Stress_Score"
            whyDone="Yeh dekhne ke liye ki kya strong family support severe anxiety ke negative stress impact ko kam (cushion) kar sakti hai."
          >
            <div className="space-y-3 py-1">
              <div className="grid grid-cols-3 text-[11px] font-bold px-2 text-slate-500 border-b border-slate-100 pb-1.5">
                <span>Anxiety Tier</span>
                <span className="text-center text-emerald-700">High Family Support</span>
                <span className="text-right text-rose-700">Low Family Support</span>
              </div>
              <div className="space-y-2">
                {anxietyBufferData.map((row, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 grid grid-cols-3 items-center text-xs">
                    <span className="font-bold text-slate-800 text-[11px] truncate">{row.anxietyLevel}</span>
                    <div className="text-center">
                      <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-xs">
                        {row.highFamilySupport} pts
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 text-xs">
                        {row.lowFamilySupport} pts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-900 leading-relaxed flex items-start gap-2">
                <Heart className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Buffer Effect:</strong> High family support reduces perceived stress by an average of <strong>13.8 to 15.8 points</strong> even under severe anxiety.
                </span>
              </div>
            </div>
          </ChartCard>

          {/* Interaction 2: Academic Workload Triad */}
          <ChartCard
            title="Academic Workload Compounding Triad"
            subtitle="Study Hours × Exam Load Stress Interaction"
            tag="Compounding Friction"
            columnsUsed="Study_Hours × Exam_Frequency × Stress_Score"
            whyDone="Yeh dekhne ke liye ki heavy exams aur long study hours ek saath hone par stress compounding effect kitna hota hai."
          >
            <div className="space-y-3 py-1">
              <div className="grid grid-cols-3 text-[11px] font-bold px-2 text-slate-500 border-b border-slate-100 pb-1.5">
                <span>Study Volume</span>
                <span className="text-center text-blue-700">Low Exams (1–3)</span>
                <span className="text-right text-rose-700">Heavy Exams (6+)</span>
              </div>
              <div className="space-y-2">
                {academicTriadData.map((row, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 grid grid-cols-3 items-center text-xs">
                    <span className="font-bold text-slate-800 text-[11px] truncate">{row.studyCluster}</span>
                    <div className="text-center">
                      <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-xs">
                        {row.lowExams} pts
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 text-xs">
                        {row.highExams} pts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 leading-relaxed flex items-start gap-2">
                <BookOpen className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Compounding Friction:</strong> High study load combined with frequent examinations drives average stress above <strong>83.5 / 100</strong>.
                </span>
              </div>
            </div>
          </ChartCard>

          {/* Interaction 3: Digital Habits Matrix (Screen Time × Social Media) */}
          <div className="lg:col-span-2">
            <ChartCard
              title="Digital Habits Interaction: Screen Time × Social Media Usage"
              subtitle="Examining compounding digital fatigue across screen exposure tiers and social media intensity"
              tag="Digital Matrix"
              columnsUsed="Screen_Time × Social_Media_Use × Stress_Score"
              whyDone="Yeh analyze karne ke liye ki screen time aur social media ek saath badhne par student mental fatigue kitna escalate hota hai."
            >
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 py-2">
                {digitalHabitsData.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{item.screenRange}</span>
                      <Monitor className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between text-emerald-800">
                        <span>Low Social Media:</span>
                        <span className="font-mono font-bold">{item.lowSocial} pts</span>
                      </div>
                      <div className="flex justify-between text-blue-800">
                        <span>Mod Social Media:</span>
                        <span className="font-mono font-bold">{item.modSocial} pts</span>
                      </div>
                      <div className="flex justify-between text-rose-800 font-bold">
                        <span>High Social Media:</span>
                        <span className="font-mono font-extrabold">{item.highSocial} pts</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>
        </div>
      </div>
    </div>
  )
}

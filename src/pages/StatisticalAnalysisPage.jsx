import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Activity, 
  CheckCircle2, 
  BookOpen, 
  ShieldCheck, 
  Sparkles, 
  Sliders, 
  ArrowRight,
  TrendingUp,
  FileCheck
} from 'lucide-react'
import StatisticalTestCard from '../components/common/StatisticalTestCard'
import SectionHeader from '../components/common/SectionHeader'
import statisticalData from '../data/statisticalTests.json'

const PLAYGROUND_VARIABLES = [
  { id: 'screen', name: 'Screen Time', r: 0.42, p: 0.001, t: 25.41, r2: 0.176, effect: 'Moderate-Large' },
  { id: 'sleep', name: 'Sleep Hours', r: -0.38, p: 0.001, t: -22.56, r2: 0.144, effect: 'Moderate Protective' },
  { id: 'anxiety', name: 'Anxiety Level', r: 0.51, p: 0.001, t: 32.84, r2: 0.260, effect: 'Large Predictor' },
  { id: 'study', name: 'Study Hours', r: 0.28, p: 0.001, t: 15.92, r2: 0.078, effect: 'Small-Moderate' },
  { id: 'exams', name: 'Exam Frequency', r: 0.36, p: 0.001, t: 21.14, r2: 0.130, effect: 'Moderate' },
  { id: 'family', name: 'Family Support', r: -0.31, p: 0.001, t: -17.85, r2: 0.096, effect: 'Moderate Buffer' },
]

export default function StatisticalAnalysisPage() {
  const [selectedVar, setSelectedVar] = useState(PLAYGROUND_VARIABLES[0])

  return (
    <div className="space-y-6">
      {/* 1. Formal Hypothesis Testing Framework Intro Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white border border-slate-700 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              Inferential Statistics Protocol (α = 0.05)
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Statistical Significance & Hypothesis Testing
            </h2>
            <p className="text-xs text-slate-300 font-medium">
              Confirming whether observed relationships represent genuine population dynamics or sampling artifacts.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-xs space-y-1 text-slate-200">
            <p className="font-mono"><strong>Decision Criterion:</strong></p>
            <p className="font-mono text-emerald-300">p &lt; 0.05 → Reject H₀ (Significant)</p>
            <p className="font-mono text-slate-300">p ≥ 0.05 → Fail to Reject H₀</p>
          </div>
        </div>
      </div>

      {/* 2. Three Master Statistical Cards */}
      <div className="space-y-4">
        <SectionHeader
          title="Formal Hypothesis Test Results (3 Master Tests)"
          subtitle="Parametric and non-parametric hypothesis validation with complete mathematical diagnostics"
          badge="Inference Tests"
        />

        <div className="grid grid-cols-1 gap-6">
          {/* 1. Pearson Correlation Card */}
          <StatisticalTestCard
            testName={statisticalData.pearson.testName}
            question={statisticalData.pearson.question}
            statisticLabel="Pearson r"
            statisticValue={`r = +${statisticalData.pearson.r.toFixed(3)}`}
            pValue={statisticalData.pearson.pValue}
            alpha={statisticalData.pearson.alpha}
            significant={statisticalData.pearson.significant}
            effectSize={statisticalData.pearson.effectSize}
            effectSizeLabel="R² Variance Explained"
            df={statisticalData.pearson.df}
            nullHypothesis={statisticalData.pearson.nullHypothesis}
            altHypothesis={statisticalData.pearson.altHypothesis}
            decisionRule={statisticalData.pearson.decisionRule}
            interpretation={statisticalData.pearson.interpretation}
            assumptions={statisticalData.pearson.assumptions}
          />

          {/* 2. Chi-Square Test Card */}
          <StatisticalTestCard
            testName={statisticalData.chiSquare.testName}
            question={statisticalData.chiSquare.question}
            statisticLabel="Chi-Square (χ²)"
            statisticValue={`χ² = ${statisticalData.chiSquare.chiSquareStatistic.toFixed(3)}`}
            pValue={statisticalData.chiSquare.pValue}
            alpha={statisticalData.chiSquare.alpha}
            significant={statisticalData.chiSquare.significant}
            effectSize={statisticalData.chiSquare.effectSize}
            effectSizeLabel="Cramér's V Association"
            df={statisticalData.chiSquare.df}
            nullHypothesis={statisticalData.chiSquare.nullHypothesis}
            altHypothesis={statisticalData.chiSquare.altHypothesis}
            decisionRule={statisticalData.chiSquare.decisionRule}
            interpretation={statisticalData.chiSquare.interpretation}
            assumptions={statisticalData.chiSquare.assumptions}
          />

          {/* 3. One-Way ANOVA Card */}
          <StatisticalTestCard
            testName={statisticalData.anova.testName}
            question={statisticalData.anova.question}
            statisticLabel="F-Ratio"
            statisticValue={`F = ${statisticalData.anova.fStatistic.toFixed(3)}`}
            pValue={statisticalData.anova.pValue}
            alpha={statisticalData.anova.alpha}
            significant={statisticalData.anova.significant}
            effectSize={statisticalData.anova.effectSize}
            effectSizeLabel="Eta-Squared (η²)"
            df={`${statisticalData.anova.dfBetween}, ${statisticalData.anova.dfWithin}`}
            nullHypothesis={statisticalData.anova.nullHypothesis}
            altHypothesis={statisticalData.anova.altHypothesis}
            decisionRule={statisticalData.anova.decisionRule}
            interpretation={statisticalData.anova.interpretation}
            assumptions={statisticalData.anova.assumptions}
            extraDetails={
              <div className="p-3 rounded-xl bg-slate-100/90 border border-slate-200 text-xs space-y-2">
                <p className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  Post-Hoc Tukey HSD Pairwise Comparisons:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {statisticalData.anova.postHocTukey.map((tuk, i) => (
                    <div key={i} className="p-2 bg-white rounded-lg border border-slate-200 text-[11px]">
                      <p className="font-semibold text-slate-900">{tuk.comparison}</p>
                      <p className="text-slate-600 font-mono">Diff: {tuk.meanDiff}</p>
                      <p className={`font-mono font-bold ${tuk.significant ? 'text-emerald-700' : 'text-slate-500'}`}>
                        p = {tuk.pVal} ({tuk.significant ? 'Significant' : 'n.s.'})
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            }
          />
        </div>
      </div>

      {/* 3. Interactive Hypothesis Playground */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
        <SectionHeader
          title="Interactive Hypothesis Testing Playground"
          subtitle="Select any factor to inspect its real-time bivariate correlation, t-statistic, and statistical decision"
          badge="Live Calculator"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Factor Selector */}
          <div className="lg:col-span-5 space-y-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Select Factor to Test vs. Stress Score (Y):
            </p>
            <div className="grid grid-cols-2 gap-2">
              {PLAYGROUND_VARIABLES.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVar(v)}
                  className={`
                    p-3 rounded-xl text-left text-xs font-bold border transition-all
                    ${selectedVar.id === v.id 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }
                  `}
                >
                  <p>{v.name}</p>
                  <p className={`text-[10px] mt-0.5 font-mono ${selectedVar.id === v.id ? 'text-blue-100' : 'text-slate-400'}`}>
                    r = {v.r > 0 ? `+${v.r}` : v.r}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Calculator Output */}
          <div className="lg:col-span-7 p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                Hypothesis Test: {selectedVar.name} × Stress Score
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                p &lt; 0.001 (Reject H₀)
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Pearson r</p>
                <p className="text-lg font-extrabold text-slate-900 mt-0.5">
                  {selectedVar.r > 0 ? `+${selectedVar.r.toFixed(2)}` : selectedVar.r.toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <p className="text-[10px] text-slate-400 font-bold uppercase">t-Statistic (N=3k)</p>
                <p className="text-lg font-extrabold text-blue-700 mt-0.5">
                  t = {selectedVar.t}
                </p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Variance R²</p>
                <p className="text-lg font-extrabold text-teal-700 mt-0.5">
                  {(selectedVar.r2 * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 space-y-1">
              <p className="font-semibold text-slate-900">
                Classification: <strong>{selectedVar.effect}</strong>
              </p>
              <p className="leading-relaxed">
                With a sample size of N = 3,000, the relationship between <strong>{selectedVar.name}</strong> and student stress is statistically robust beyond the 99.9% confidence interval.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

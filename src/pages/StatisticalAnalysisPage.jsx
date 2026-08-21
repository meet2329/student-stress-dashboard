import React, { useState, useMemo, useEffect } from 'react'
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
  FileCheck,
  Database
} from 'lucide-react'
import StatisticalTestCard from '../components/common/StatisticalTestCard'
import SectionHeader from '../components/common/SectionHeader'
import { useAIEda, STAGES } from '../context/AIEdaContext'
import { useNavigate } from 'react-router-dom'
import {
  computeDynamicPearsonTest,
  computeDynamicAnovaTest,
  computeDynamicChiSquareTest,
  generatePlaygroundVariables
} from '../utils/statisticalAnalysisEngine'

export default function StatisticalAnalysisPage() {
  const { pipelineStage, analysisData, datasetProfile, fileName } = useAIEda()
  const navigate = useNavigate()

  // Find optimal candidate columns for hypothesis testing
  const { targetCol, predictorCol, groupCol, cat1Col, cat2Col } = useMemo(() => {
    if (!datasetProfile || !analysisData) {
      return { targetCol: null, predictorCol: null, groupCol: null, cat1Col: null, cat2Col: null }
    }

    const numCols = datasetProfile.numericalColumns || []
    const catCols = datasetProfile.categoricalColumns || []

    // Look for target (e.g. stress, score, target, or first num col)
    const target = datasetProfile.potentialTargets?.[0]?.column ||
      numCols.find(c => /stress|score|target|gpa|anxiety|performance/i.test(c)) ||
      numCols[numCols.length - 1] ||
      numCols[0]

    // Look for primary predictor (numerical)
    const predictor = numCols.find(c => c !== target && /screen|sleep|anxiety|study|hour|exam|load/i.test(c)) ||
      numCols.find(c => c !== target) ||
      numCols[0]

    // Categorical column for ANOVA
    const group = catCols.find(c => /univ|institution|college|gender|grade|dept|tier|level/i.test(c)) ||
      catCols[0] ||
      'Cohort_Group'

    // 2 Categorical columns for Chi-Square
    const c1 = catCols.find(c => /stress_level|level|category|grade|status/i.test(c)) || catCols[0] || 'Category_1'
    const c2 = catCols.find(c => c !== c1) || catCols[1] || 'Category_2'

    return {
      targetCol: target,
      predictorCol: predictor,
      groupCol: group,
      cat1Col: c1,
      cat2Col: c2
    }
  }, [datasetProfile, analysisData])

  // Compute the 3 Master Tests
  const masterTests = useMemo(() => {
    if (!analysisData || !analysisData.rows || !targetCol) return null

    const rows = analysisData.rows

    const pearson = computeDynamicPearsonTest(rows, predictorCol, targetCol)
    const anova = computeDynamicAnovaTest(rows, groupCol, targetCol)
    const chiSquare = computeDynamicChiSquareTest(rows, cat1Col, cat2Col)

    return { pearson, anova, chiSquare }
  }, [analysisData, targetCol, predictorCol, groupCol, cat1Col, cat2Col])

  // Compute Playground Variables
  const playgroundVars = useMemo(() => {
    if (!analysisData || !analysisData.rows || !datasetProfile || !targetCol) return []
    return generatePlaygroundVariables(analysisData.rows, datasetProfile, targetCol)
  }, [analysisData, datasetProfile, targetCol])

  const [selectedVar, setSelectedVar] = useState(null)

  useEffect(() => {
    if (playgroundVars.length > 0 && (!selectedVar || !playgroundVars.some(v => v.id === selectedVar.id))) {
      setSelectedVar(playgroundVars[0])
    }
  }, [playgroundVars, selectedVar])

  // 1. Empty State
  if (pipelineStage === STAGES.EMPTY) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
          <Database className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-800">No Dataset Active</h3>
          <p className="text-xs text-slate-500 font-medium max-w-sm">
            Upload a CSV dataset on the overview page to run formal hypothesis validation and parametric inference tests.
          </p>
        </div>
        <button
          onClick={() => navigate('/ai-eda')}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-all shadow-sm cursor-pointer"
        >
          <span>Go to Overview & Upload</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    )
  }

  // 2. Processing State
  if (pipelineStage !== STAGES.READY || !masterTests) {
    return (
      <div className="py-24 text-center space-y-2">
        <p className="text-sm text-slate-600 font-semibold">Computing statistical significance & hypothesis tests...</p>
        <p className="text-xs text-slate-400">Evaluating Pearson correlation, One-Way ANOVA, and Chi-Square cross-tabs.</p>
      </div>
    )
  }

  const { pearson, anova, chiSquare } = masterTests

  return (
    <div className="space-y-6 pb-12">
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
              Mathematical validation of population effects across N = {analysisData?.rows?.length?.toLocaleString() || 0} observations from {fileName || 'dataset.csv'}.
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
            testName={pearson.testName}
            question={pearson.question}
            statisticLabel="Pearson r"
            statisticValue={`r = ${pearson.r > 0 ? '+' : ''}${pearson.r.toFixed(3)}`}
            pValue={pearson.pValue}
            alpha={pearson.alpha}
            significant={pearson.significant}
            effectSize={pearson.effectSize}
            effectSizeLabel="R² Variance Explained"
            df={pearson.df}
            nullHypothesis={pearson.nullHypothesis}
            altHypothesis={pearson.altHypothesis}
            decisionRule={pearson.decisionRule}
            interpretation={pearson.interpretation}
            assumptions={pearson.assumptions}
          />

          {/* 2. Chi-Square Test Card */}
          <StatisticalTestCard
            testName={chiSquare.testName}
            question={chiSquare.question}
            statisticLabel="Chi-Square (χ²)"
            statisticValue={`χ² = ${chiSquare.chiSquareStatistic.toFixed(3)}`}
            pValue={chiSquare.pValue}
            alpha={chiSquare.alpha}
            significant={chiSquare.significant}
            effectSize={chiSquare.effectSize}
            effectSizeLabel="Cramér's V Association"
            df={chiSquare.df}
            nullHypothesis={chiSquare.nullHypothesis}
            altHypothesis={chiSquare.altHypothesis}
            decisionRule={chiSquare.decisionRule}
            interpretation={chiSquare.interpretation}
            assumptions={chiSquare.assumptions}
          />

          {/* 3. One-Way ANOVA Card */}
          <StatisticalTestCard
            testName={anova.testName}
            question={anova.question}
            statisticLabel="F-Ratio"
            statisticValue={`F = ${anova.fStatistic.toFixed(3)}`}
            pValue={anova.pValue}
            alpha={anova.alpha}
            significant={anova.significant}
            effectSize={anova.effectSize}
            effectSizeLabel="Eta-Squared (η²)"
            df={`${anova.dfBetween}, ${anova.dfWithin}`}
            nullHypothesis={anova.nullHypothesis}
            altHypothesis={anova.altHypothesis}
            decisionRule={anova.decisionRule}
            interpretation={anova.interpretation}
            assumptions={anova.assumptions}
            extraDetails={
              anova.postHocTukey && anova.postHocTukey.length > 0 ? (
                <div className="p-3 rounded-xl bg-slate-100/90 border border-slate-200 text-xs space-y-2">
                  <p className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    Subgroup Pairwise Mean Comparison:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {anova.postHocTukey.map((tuk, i) => (
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
              ) : null
            }
          />
        </div>
      </div>

      {/* 3. Interactive Hypothesis Playground */}
      {playgroundVars.length > 0 && selectedVar && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
          <SectionHeader
            title="Interactive Hypothesis Testing Playground"
            subtitle={`Select any factor in your dataset to inspect real-time bivariate correlation vs ${targetCol}`}
            badge="Live Calculator"
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Factor Selector */}
            <div className="lg:col-span-5 space-y-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Select Factor to Test vs. {targetCol}:
              </p>
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                {playgroundVars.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVar(v)}
                    className={`
                      p-3 rounded-xl text-left text-xs font-bold border transition-all cursor-pointer
                      ${selectedVar.id === v.id 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }
                    `}
                  >
                    <p className="truncate">{v.name}</p>
                    <p className={`text-[10px] mt-0.5 font-mono ${selectedVar.id === v.id ? 'text-blue-100' : 'text-slate-400'}`}>
                      r = {v.r > 0 ? `+${v.r.toFixed(2)}` : v.r.toFixed(2)}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Calculator Output */}
            <div className="lg:col-span-7 p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider truncate mr-2">
                  Hypothesis Test: {selectedVar.name} × {targetCol}
                </span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex-shrink-0 ${
                  selectedVar.p < 0.05 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                }`}>
                  p = {selectedVar.p < 0.001 ? '< 0.001' : selectedVar.p.toFixed(3)} ({selectedVar.p < 0.05 ? 'Reject H₀' : 'Fail to Reject'})
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
                  <p className="text-[10px] text-slate-400 font-bold uppercase">t-Statistic</p>
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
                  With a sample size of N = {analysisData?.rows?.length?.toLocaleString() || 0}, the association between <strong>{selectedVar.name}</strong> and <strong>{targetCol}</strong> {selectedVar.p < 0.05 ? 'is statistically significant and explains ' + (selectedVar.r2 * 100).toFixed(1) + '% of variance.' : 'does not reach statistical significance.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

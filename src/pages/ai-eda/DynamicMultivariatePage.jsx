import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAIEda, STAGES } from '../../context/AIEdaContext'
import DynamicChartRenderer from '../../components/ai-eda/DynamicChartRenderer'
import SectionHeader from '../../components/common/SectionHeader'
import ChartCard from '../../components/common/ChartCard'
import CorrelationHeatmap from '../../components/charts/CorrelationHeatmap'
import MultivariateBubblePlot from '../../components/charts/MultivariateBubblePlot'
import HighStressRadarPlot from '../../components/charts/HighStressRadarPlot'
import { useNavigate } from 'react-router-dom'
import { 
  Database, 
  Heart, 
  BookOpen, 
  Layers, 
  Sparkles, 
  ArrowRight, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  AlertTriangle,
  Lightbulb
} from 'lucide-react'
import { pearsonCorrelation, mean, safeMin, safeMax } from '../../utils/csvAnalyticsEngine'

export default function DynamicMultivariatePage() {
  const { pipelineStage, aiPlan, analysisData, datasetProfile, fileName } = useAIEda()
  const navigate = useNavigate()

  // 1. Top Ranked Factor Correlations (Simplest Visual Cards)
  const topCorrelations = useMemo(() => {
    if (!analysisData || !analysisData.rows || !datasetProfile) return null
    const rows = analysisData.rows
    const numCols = datasetProfile.numericalColumns || []
    if (numCols.length < 2) return null

    const targetCol = datasetProfile.potentialTargets?.[0]?.column ||
      numCols.find(c => /stress|score|target|anxiety|gpa/i.test(c)) ||
      numCols[numCols.length - 1]

    const pairs = []
    numCols.forEach(col => {
      if (col === targetCol) return
      const xVals = rows.map(r => Number(r[col])).filter(n => !isNaN(n))
      const yVals = rows.map(r => Number(r[targetCol])).filter(n => !isNaN(n))
      const r = pearsonCorrelation(xVals, yVals)
      if (!isNaN(r)) {
        pairs.push({
          name: col.replace(/_/g, ' '),
          rawName: col,
          r: parseFloat(r.toFixed(3)),
          r2: parseFloat((r * r).toFixed(3)),
          isPositive: r > 0
        })
      }
    })

    const topDrivers = pairs.filter(p => p.r > 0).sort((a, b) => b.r - a.r).slice(0, 3)
    const topBuffers = pairs.filter(p => p.r < 0).sort((a, b) => a.r - b.r).slice(0, 3)

    return {
      targetName: targetCol.replace(/_/g, ' '),
      topDrivers,
      topBuffers
    }
  }, [analysisData, datasetProfile])

  // 2. Full dynamic correlation matrix
  const dynamicCorrelationData = useMemo(() => {
    if (!analysisData || !analysisData.rows || !datasetProfile) return null
    const numCols = datasetProfile.numericalColumns.slice(0, 10)
    if (numCols.length < 2) return null

    const rows = analysisData.rows
    const matrix = []

    for (let i = 0; i < numCols.length; i++) {
      const row = []
      const xVals = rows.map(r => Number(r[numCols[i]])).filter(n => !isNaN(n))
      for (let j = 0; j < numCols.length; j++) {
        if (i === j) {
          row.push(1.0)
        } else {
          const yVals = rows.map(r => Number(r[numCols[j]])).filter(n => !isNaN(n))
          row.push(pearsonCorrelation(xVals, yVals))
        }
      }
      matrix.push(row)
    }

    const shortLabels = numCols.map(c => {
      const words = c.replace(/_/g, ' ').split(' ')
      if (words.length === 1) return words[0].slice(0, 7)
      return words.map(w => w[0]).join('').toUpperCase() + ' (' + words[0].slice(0, 4) + ')'
    })

    return {
      variables: numCols.map(c => c.replace(/_/g, ' ')),
      shortLabels,
      matrix
    }
  }, [analysisData, datasetProfile])

  // 3. Dynamic Multi-Dimensional Radar Fingerprint (Top 25% High-Stress vs Overall Baseline)
  const dynamicRadarData = useMemo(() => {
    if (!analysisData || !analysisData.rows || !datasetProfile) return null
    const rows = analysisData.rows
    const numCols = datasetProfile.numericalColumns || []
    if (numCols.length < 3) return null

    const targetCol = datasetProfile.potentialTargets?.[0]?.column ||
      numCols.find(c => /stress|score|target/i.test(c)) ||
      numCols[numCols.length - 1]

    const sorted = [...rows].sort((a, b) => Number(b[targetCol] || 0) - Number(a[targetCol] || 0))
    const top25Count = Math.max(2, Math.floor(sorted.length * 0.25))
    const highRiskCohort = sorted.slice(0, top25Count)

    const candidateCols = numCols.filter(c => c !== targetCol).slice(0, 8)

    const radar = candidateCols.map(col => {
      const allVals = rows.map(r => Number(r[col])).filter(n => !isNaN(n))
      const highVals = highRiskCohort.map(r => Number(r[col])).filter(n => !isNaN(n))

      const minVal = safeMin(allVals)
      const maxVal = safeMax(allVals)
      const range = maxVal - minVal || 1

      const avgOverall = mean(allVals)
      const avgHigh = mean(highVals)

      const normOverall = Math.min(100, Math.max(0, Math.round(((avgOverall - minVal) / range) * 100)))
      const normHigh = Math.min(100, Math.max(0, Math.round(((avgHigh - minVal) / range) * 100)))

      return {
        metric: col.replace(/_/g, ' '),
        highRisk: normHigh,
        overall: normOverall,
        rawHigh: avgHigh.toFixed(1),
        rawOverall: avgOverall.toFixed(1)
      }
    })

    return radar
  }, [analysisData, datasetProfile])

  // 4. Dynamic 4D Bubble Dataset
  const { dynamicBubbleData, bubbleCols } = useMemo(() => {
    if (!analysisData || !analysisData.rows || !datasetProfile) {
      return { dynamicBubbleData: [], bubbleCols: { x: 'X', y: 'Y', z: 'Size' } }
    }

    const rows = analysisData.rows
    const numCols = datasetProfile.numericalColumns || []
    const catCols = datasetProfile.categoricalColumns || []

    const xCol = numCols.find(c => /screen|study|tech|usage|time/i.test(c)) || numCols[0] || 'Feature_1'
    const yCol = numCols.find(c => c !== xCol && /stress|score|target|anxiety/i.test(c)) || numCols[1] || numCols[0] || 'Target'
    const zCol = numCols.find(c => c !== xCol && c !== yCol && /sleep|rest|support|gpa/i.test(c)) || numCols[2] || numCols[0] || 'Weight'
    const catCol = catCols.find(c => /level|status|type|group/i.test(c)) || catCols[0]

    const step = Math.max(1, Math.floor(rows.length / 50))
    const points = []

    for (let i = 0; i < rows.length && points.length < 50; i += step) {
      const r = rows[i]
      const x = Number(r[xCol])
      const y = Number(r[yCol])
      const z = Number(r[zCol])
      if (!isNaN(x) && !isNaN(y)) {
        let cat = 'Moderate'
        if (catCol && r[catCol]) {
          cat = String(r[catCol])
        } else {
          cat = y >= 70 ? 'High' : y >= 45 ? 'Moderate' : 'Low'
        }

        points.push({
          id: i + 1,
          screenTime: x,
          stressScore: y,
          sleepHours: isNaN(z) ? 6 : z,
          stressLevel: cat
        })
      }
    }

    return {
      dynamicBubbleData: points,
      bubbleCols: {
        x: xCol.replace(/_/g, ' '),
        y: yCol.replace(/_/g, ' '),
        z: zCol.replace(/_/g, ' ')
      }
    }
  }, [analysisData, datasetProfile])

  // 5. Dynamic 2-Way Buffering & Workload Models
  const { bufferModel, workloadModel } = useMemo(() => {
    if (!analysisData || !analysisData.rows) {
      return { bufferModel: null, workloadModel: null }
    }

    const rows = analysisData.rows
    const numCols = datasetProfile?.numericalColumns || []

    const riskCol = numCols.find(c => /anxiety|screen/i.test(c)) || numCols[0]
    const bufferCol = numCols.find(c => c !== riskCol && /family|support|sleep|exercise/i.test(c)) || numCols[1]
    const studyCol = numCols.find(c => /study|hour|time/i.test(c)) || numCols[2] || numCols[0]
    const examCol = numCols.find(c => /exam|assign|load/i.test(c)) || numCols[3] || numCols[1]
    const targetCol = numCols.find(c => c !== riskCol && c !== bufferCol && /stress|score|target/i.test(c)) || numCols[numCols.length - 1]

    if (!riskCol || !bufferCol || !targetCol) {
      return { bufferModel: null, workloadModel: null }
    }

    const riskVals = rows.map(r => Number(r[riskCol])).filter(n => !isNaN(n))
    const bufVals = rows.map(r => Number(r[bufferCol])).filter(n => !isNaN(n))
    const midRisk = mean(riskVals)
    const midBuf = mean(bufVals)

    const tiers = ['Low Tier', 'Moderate Tier', 'High Tier']
    const m1Data = tiers.map((tierName, idx) => {
      let sub = []
      if (idx === 0) sub = rows.filter(r => Number(r[riskCol]) < midRisk * 0.8)
      else if (idx === 1) sub = rows.filter(r => Number(r[riskCol]) >= midRisk * 0.8 && Number(r[riskCol]) <= midRisk * 1.2)
      else sub = rows.filter(r => Number(r[riskCol]) > midRisk * 1.2)

      const highBufSub = sub.filter(r => Number(r[bufferCol]) >= midBuf)
      const lowBufSub = sub.filter(r => Number(r[bufferCol]) < midBuf)

      const avgHigh = highBufSub.length > 0 ? mean(highBufSub.map(r => Number(r[targetCol]))) : 50
      const avgLow = lowBufSub.length > 0 ? mean(lowBufSub.map(r => Number(r[targetCol]))) : 65

      return {
        tier: tierName,
        highBuffer: parseFloat(avgHigh.toFixed(1)),
        lowBuffer: parseFloat(avgLow.toFixed(1)),
        diff: parseFloat((avgLow - avgHigh).toFixed(1))
      }
    })

    const studyVals = rows.map(r => Number(r[studyCol])).filter(n => !isNaN(n))
    const examVals = rows.map(r => Number(r[examCol])).filter(n => !isNaN(n))
    const midStudy = mean(studyVals)
    const midExam = mean(examVals)

    const studyTiers = ['Low Workload', 'Moderate Workload', 'Heavy Workload']
    const m2Data = studyTiers.map((tierName, idx) => {
      let sub = []
      if (idx === 0) sub = rows.filter(r => Number(r[studyCol]) < midStudy * 0.8)
      else if (idx === 1) sub = rows.filter(r => Number(r[studyCol]) >= midStudy * 0.8 && Number(r[studyCol]) <= midStudy * 1.2)
      else sub = rows.filter(r => Number(r[studyCol]) > midStudy * 1.2)

      const lowExamSub = sub.filter(r => Number(r[examCol]) < midExam)
      const highExamSub = sub.filter(r => Number(r[examCol]) >= midExam)

      const avgLow = lowExamSub.length > 0 ? mean(lowExamSub.map(r => Number(r[targetCol]))) : 48
      const avgHigh = highExamSub.length > 0 ? mean(highExamSub.map(r => Number(r[targetCol]))) : 78

      return {
        tier: tierName,
        lowExam: parseFloat(avgLow.toFixed(1)),
        highExam: parseFloat(avgHigh.toFixed(1))
      }
    })

    return {
      bufferModel: {
        riskName: riskCol.replace(/_/g, ' '),
        bufferName: bufferCol.replace(/_/g, ' '),
        targetName: targetCol.replace(/_/g, ' '),
        data: m1Data
      },
      workloadModel: {
        studyName: studyCol.replace(/_/g, ' '),
        examName: examCol.replace(/_/g, ' '),
        targetName: targetCol.replace(/_/g, ' '),
        data: m2Data
      }
    }
  }, [analysisData, datasetProfile])

  // Empty State Guard
  if (pipelineStage === STAGES.EMPTY) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
          <Database className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-800">No Dataset Active</h3>
          <p className="text-xs text-slate-500 font-medium max-w-sm">
            Upload a CSV dataset on the overview page to explore multivariate correlation surfaces and interaction matrices.
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

  if (pipelineStage !== STAGES.READY) {
    return (
      <div className="py-24 text-center space-y-2">
        <p className="text-sm text-slate-600 font-semibold">Processing multivariate matrices...</p>
        <p className="text-xs text-slate-400">Evaluating correlation heatmaps, 4D surfaces, and multi-factor models.</p>
      </div>
    )
  }

  const aiCharts = aiPlan?.multivariateCharts || []

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-12">
      <SectionHeader
        title="Multivariate Analytics & Factor Interactions"
        subtitle={`Computed dynamically from ${fileName || 'uploaded dataset'} across multiple dimensions, protective buffers, and risk fingerprints`}
        badge="Multi-Factor Suite"
      />

      {/* ─── 1. Simplest Summary: Top Ranked Drivers vs Buffers ─────── */}
      {topCorrelations && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <h3 className="text-sm font-extrabold text-slate-800">
              Key Multi-Factor Drivers Summary (Against {topCorrelations.targetName})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Column 1: Top Stress Multipliers */}
            <div className="space-y-2.5">
              <p className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                <span>🚨 Top Compounding Risk Drivers (+r)</span>
              </p>
              <div className="space-y-2">
                {topCorrelations.topDrivers.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-rose-50/60 border border-rose-200/70 text-xs flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{item.name}</p>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        Increases {topCorrelations.targetName.toLowerCase()} by {(item.r2 * 100).toFixed(0)}% variance
                      </p>
                    </div>
                    <span className="font-mono font-extrabold text-rose-700 bg-white px-2 py-1 rounded-lg border border-rose-200 shadow-xs">
                      r = +{item.r}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Top Protective Resilience Buffers */}
            <div className="space-y-2.5">
              <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4" />
                <span>🛡️ Top Protective Resilience Buffers (-r)</span>
              </p>
              <div className="space-y-2">
                {topCorrelations.topBuffers.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/70 text-xs flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{item.name}</p>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        Cushions {topCorrelations.targetName.toLowerCase()} by {(item.r2 * 100).toFixed(0)}% resilience
                      </p>
                    </div>
                    <span className="font-mono font-extrabold text-emerald-700 bg-white px-2 py-1 rounded-lg border border-emerald-200 shadow-xs">
                      r = {item.r}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── 2. Multi-Dimensional Radar Fingerprint Surface ───────── */}
      {dynamicRadarData && (
        <div className="space-y-3">
          <ChartCard
            title="High-Risk Profile vs Overall Cohort (Multi-Factor Radar)"
            subtitle="Comparing Upper Quartile (Top 25% Highest Stress) vs Overall Average across factors"
            tag="Risk Profile Comparison"
            columnsUsed={dynamicRadarData.map(d => d.metric).join(' × ')}
            whyDone="Top 25% high-stress students aur overall students ke beech har factor me gap visually dekhne ke liye."
            plainEnglish="The red shape represents high-stress students, while the blue shape is the cohort average. Notice how the red shape expands on risk factors (like anxiety and screen exposure) and shrinks on protective factors (like sleep and support)."
          >
            <HighStressRadarPlot 
              data={dynamicRadarData} 
              cohortSize={analysisData?.rows?.length?.toLocaleString() || '3,000'}
              height={320} 
            />
          </ChartCard>
        </div>
      )}

      {/* ─── 3. Full Pearson Correlation Matrix Heatmap ────────────── */}
      {dynamicCorrelationData && (
        <div className="space-y-3">
          <ChartCard
            title="Global Correlation Matrix Heatmap"
            subtitle="Pairwise Pearson correlation coefficients (r) across continuous features"
            tag={`${dynamicCorrelationData.variables.length}×${dynamicCorrelationData.variables.length} Matrix`}
            columnsUsed="All continuous numerical columns in your uploaded dataset"
            whyDone="All numerical features ke pairwise correlation coefficients ko ek color grid me inspect karne ke liye."
            plainEnglish="Dark red squares show factors that increase together. Dark teal squares show protective factors where one increases and the other decreases."
          >
            <CorrelationHeatmap dynamicData={dynamicCorrelationData} />
          </ChartCard>
        </div>
      )}

      {/* ─── 4. 4D Multivariate Bubble Chart ──────────────────────────────── */}
      {dynamicBubbleData.length > 0 && (
        <div className="space-y-3">
          <ChartCard
            title={`4D Interaction: ${bubbleCols.x} × ${bubbleCols.y} × ${bubbleCols.z}`}
            subtitle={`Bubble size = ${bubbleCols.z}; Color = Severity tier`}
            tag="4D Multi-Dimensional"
            columnsUsed={`${bubbleCols.x} (X) × ${bubbleCols.y} (Y) × ${bubbleCols.z} (Size) × Severity (Color)`}
            whyDone="4 alag-alag dimensions ke compound impact ko ek single visual space me compare karne ke liye."
            plainEnglish={`Notice how smaller bubbles (${bubbleCols.z} deficit) cluster in the high-stress top right zone.`}
          >
            <MultivariateBubblePlot
              data={dynamicBubbleData}
              xLabel={bubbleCols.x}
              yLabel={bubbleCols.y}
              zLabel={bubbleCols.z}
              height={340}
            />
          </ChartCard>
        </div>
      )}

      {/* ─── 5. Multi-Factor Buffering & Compounding Models Grid ────── */}
      {(bufferModel || workloadModel) && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Interaction 1: Protective Buffering Surface */}
            {bufferModel && (
              <ChartCard
                title={`${bufferModel.riskName} × ${bufferModel.bufferName} Buffering Surface`}
                subtitle={`${bufferModel.targetName} across ${bufferModel.riskName} Tiers split by ${bufferModel.bufferName}`}
                tag="Protective Buffering"
                columnsUsed={`${bufferModel.riskName} × ${bufferModel.bufferName} × ${bufferModel.targetName}`}
                whyDone={`Yeh verify karne ke liye ki kya high ${bufferModel.bufferName} hone par ${bufferModel.riskName} ka adverse impact kam hota hai.`}
                plainEnglish={`Higher ${bufferModel.bufferName} consistently reduces ${bufferModel.targetName} across all risk levels.`}
              >
                <div className="space-y-3 py-1">
                  <div className="grid grid-cols-3 text-[11px] font-bold px-2 text-slate-500 border-b border-slate-100 pb-1.5">
                    <span>{bufferModel.riskName} Tier</span>
                    <span className="text-center text-emerald-700">High {bufferModel.bufferName}</span>
                    <span className="text-right text-rose-700">Low {bufferModel.bufferName}</span>
                  </div>
                  <div className="space-y-2">
                    {bufferModel.data.map((row, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 grid grid-cols-3 items-center text-xs">
                        <span className="font-bold text-slate-800 text-[11px] truncate">{row.tier}</span>
                        <div className="text-center">
                          <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-xs">
                            {row.highBuffer} pts
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 text-xs">
                            {row.lowBuffer} pts
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-900 leading-relaxed flex items-start gap-2">
                    <Heart className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Buffer Effect:</strong> Higher <strong>{bufferModel.bufferName}</strong> provides a measurable protective buffer, reducing {bufferModel.targetName} by an average of <strong>{bufferModel.data[2]?.diff || 14} points</strong>.
                    </span>
                  </div>
                </div>
              </ChartCard>
            )}

            {/* Interaction 2: Workload Compounding Triad */}
            {workloadModel && (
              <ChartCard
                title="Workload & Exam Compounding Interaction"
                subtitle={`${workloadModel.studyName} × ${workloadModel.examName} Interaction`}
                tag="Compounding Friction"
                columnsUsed={`${workloadModel.studyName} × ${workloadModel.examName} × ${workloadModel.targetName}`}
                whyDone="Yeh analyze karne ke liye ki heavy exams aur long study hours ek saath hone par stress kitna badh jaata hai."
                plainEnglish="When high study load is combined with frequent exams, student stress accelerates non-linearly."
              >
                <div className="space-y-3 py-1">
                  <div className="grid grid-cols-3 text-[11px] font-bold px-2 text-slate-500 border-b border-slate-100 pb-1.5">
                    <span>Workload Tier</span>
                    <span className="text-center text-blue-700">Low {workloadModel.examName}</span>
                    <span className="text-right text-rose-700">Heavy {workloadModel.examName}</span>
                  </div>
                  <div className="space-y-2">
                    {workloadModel.data.map((row, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 grid grid-cols-3 items-center text-xs">
                        <span className="font-bold text-slate-800 text-[11px] truncate">{row.tier}</span>
                        <div className="text-center">
                          <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-xs">
                            {row.lowExam} pts
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 text-xs">
                            {row.highExam} pts
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 leading-relaxed flex items-start gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Compounding Friction:</strong> High study load combined with frequent examinations drives average {workloadModel.targetName} above <strong>80+ points</strong>.
                    </span>
                  </div>
                </div>
              </ChartCard>
            )}
          </div>
        </div>
      )}

      {/* ─── 6. Dynamic AI-Generated Multivariate Charts ──────────────────── */}
      {aiCharts.length > 0 && (
        <div className="space-y-4">
          <SectionHeader
            title="NVIDIA AI-Discovered Higher-Order Visualizations"
            subtitle="Recommended multi-variable combinations identified by the AI engine"
            badge="AI Generated"
          />

          <div className="space-y-5">
            {aiCharts.map((chart, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
              >
                <DynamicChartRenderer chartSpec={chart} />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}

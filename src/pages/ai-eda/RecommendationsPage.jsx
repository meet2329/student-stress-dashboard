import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  Lightbulb, 
  AlertTriangle, 
  ArrowRight, 
  CheckCircle2, 
  GraduationCap, 
  Building2, 
  Zap, 
  Target, 
  Clock, 
  Database,
  ShieldCheck,
  Activity,
  Heart,
  Briefcase,
  Users,
  Check
} from 'lucide-react'
import { useAIEda, STAGES } from '../../context/AIEdaContext'
import SectionHeader from '../../components/common/SectionHeader'
import { useNavigate } from 'react-router-dom'

function getDomainAudienceConfig(domain) {
  const d = String(domain || '').toLowerCase()
  if (d.includes('health') || d.includes('medic') || d.includes('patient') || d.includes('clinic')) {
    return {
      domainLabel: 'Healthcare & Clinical Practice',
      indKey: 'Patient',
      indLabel: '🩺 For Patients & Health Habits',
      indShort: 'For Patients',
      orgKey: 'Healthcare Organization',
      orgLabel: '🏥 For Clinics & Care Providers',
      orgShort: 'For Clinics',
      indIcon: Heart,
      orgIcon: Activity,
      roadmapTitle: 'Clinical Wellness & Preventive Care Roadmap'
    }
  }
  if (d.includes('human') || d.includes('hr') || d.includes('employee') || d.includes('workforce')) {
    return {
      domainLabel: 'Human Resources & Workforce',
      indKey: 'Employee',
      indLabel: '👤 For Employees & Workplace Wellbeing',
      indShort: 'For Employees',
      orgKey: 'HR & Leadership',
      orgLabel: '🏢 For HR & Management Policy',
      orgShort: 'For HR / Management',
      indIcon: Users,
      orgIcon: Briefcase,
      roadmapTitle: 'Workforce Wellness & Retention Roadmap'
    }
  }
  if (d.includes('sale') || d.includes('retail') || d.includes('market') || d.includes('customer')) {
    return {
      domainLabel: 'Sales, Retail & Commerce',
      indKey: 'Customer',
      indLabel: '💼 For Customers & Account Holders',
      indShort: 'For Customers',
      orgKey: 'Business Operations',
      orgLabel: '📊 For Business Operations & Strategy',
      orgShort: 'For Business Strategy',
      indIcon: Users,
      orgIcon: Building2,
      roadmapTitle: 'Customer Success & Retention Roadmap'
    }
  }
  if (d.includes('financ') || d.includes('bank') || d.includes('invest') || d.includes('loan')) {
    return {
      domainLabel: 'Finance & Banking',
      indKey: 'Account Holder',
      indLabel: '💳 For Account Holders & Investors',
      indShort: 'For Investors',
      orgKey: 'Financial Institution',
      orgLabel: '🏛️ For Financial Risk & Operations',
      orgShort: 'For Financial Institutions',
      indIcon: Users,
      orgIcon: Building2,
      roadmapTitle: 'Financial Resilience & Risk Management Roadmap'
    }
  }
  if (d.includes('educat') || d.includes('student') || d.includes('school') || d.includes('acad')) {
    return {
      domainLabel: 'Education & Academic Wellbeing',
      indKey: 'Student',
      indLabel: '🎓 For Students & Daily Life',
      indShort: 'For Students',
      orgKey: 'University',
      orgLabel: '🏫 For Universities & Faculty',
      orgShort: 'For Universities',
      indIcon: GraduationCap,
      orgIcon: Building2,
      roadmapTitle: 'Continuous Academic Wellbeing Roadmap'
    }
  }
  return {
    domainLabel: 'General Analytics',
    indKey: 'Individual',
    indLabel: '👤 For Individuals & Users',
    indShort: 'For Individuals',
    orgKey: 'Organization',
    orgLabel: '🏢 For Organizations & Leaders',
    orgShort: 'For Organizations',
    indIcon: Users,
    orgIcon: Building2,
    roadmapTitle: 'Organizational Continuous Improvement Roadmap'
  }
}

function RecommendationCard({ rec, index, audienceConfig }) {
  const isIndividual = rec.targetAudience === audienceConfig.indKey || !rec.targetAudience || rec.targetAudience === 'Student' || rec.targetAudience === 'Individual' || rec.targetAudience === 'Patient' || rec.targetAudience === 'Employee'
  
  const priorityBadge = {
    High: 'bg-rose-100 text-rose-800 border-rose-300',
    Medium: 'bg-amber-100 text-amber-800 border-amber-300',
    Low: 'bg-blue-100 text-blue-700 border-blue-300',
  }

  const IconInd = audienceConfig.indIcon
  const IconOrg = audienceConfig.orgIcon

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-4"
    >
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
            isIndividual ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-purple-50 text-purple-700 border border-purple-200'
          }`}>
            {isIndividual ? <IconInd className="w-3.5 h-3.5" /> : <IconOrg className="w-3.5 h-3.5" />}
            <span>{isIndividual ? audienceConfig.indLabel : audienceConfig.orgLabel}</span>
          </span>
          {rec.badge && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
              {rec.badge}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${priorityBadge[rec.priority] || priorityBadge.Low}`}>
            {rec.priority || 'Medium'} Priority
          </span>
        </div>
      </div>

      {/* Title & Description */}
      <div className="space-y-1.5">
        <h4 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-1" />
          <span>{rec.title}</span>
        </h4>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
          {rec.description}
        </p>
      </div>

      {/* Action Steps Checklist */}
      {rec.actionSteps && rec.actionSteps.length > 0 && (
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Step-by-Step Implementation:
          </p>
          <ul className="space-y-1.5">
            {rec.actionSteps.map((step, sIdx) => (
              <li key={sIdx} className="flex items-start gap-2 text-xs text-slate-700">
                <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5">
                  {sIdx + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Meta Bar: Impact & Evidence */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
        {rec.impact && (
          <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-emerald-900 flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span className="font-medium text-[11px]">
              <strong>Expected Impact:</strong> {rec.impact}
            </span>
          </div>
        )}

        {rec.evidence && (
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
            <span className="text-[11px] truncate" title={rec.evidence}>
              <strong>Data Backing:</strong> {rec.evidence}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function RecommendationsPage() {
  const { pipelineStage, aiPlan, fileName, datasetProfile } = useAIEda()
  const navigate = useNavigate()
  const [audienceFilter, setAudienceFilter] = useState('all') // 'all' | 'individual' | 'institutional'

  const audienceConfig = useMemo(() => {
    return getDomainAudienceConfig(datasetProfile?.inferredDomain?.domain || datasetProfile?.domain)
  }, [datasetProfile])

  const recs = aiPlan?.recommendations || []

  const filteredRecs = useMemo(() => {
    if (audienceFilter === 'all') return recs
    if (audienceFilter === 'individual') {
      return recs.filter(r => 
        r.targetAudience === audienceConfig.indKey || 
        r.targetAudience === 'Student' || 
        r.targetAudience === 'Patient' || 
        r.targetAudience === 'Employee' || 
        r.targetAudience === 'Customer' || 
        r.targetAudience === 'Individual' ||
        !r.targetAudience
      )
    }
    if (audienceFilter === 'institutional') {
      return recs.filter(r => 
        r.targetAudience === audienceConfig.orgKey || 
        r.targetAudience === 'University' || 
        r.targetAudience === 'Healthcare Organization' || 
        r.targetAudience === 'HR & Leadership' || 
        r.targetAudience === 'Business Operations' || 
        r.targetAudience === 'Financial Institution' || 
        r.targetAudience === 'Organization'
      )
    }
    return recs
  }, [recs, audienceFilter, audienceConfig])

  if (pipelineStage === STAGES.EMPTY) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
          <Database className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-800">No Dataset Active</h3>
          <p className="text-xs text-slate-500 font-medium max-w-sm">
            Upload a CSV dataset on the overview page to synthesize tailored domain recommendations.
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
        <p className="text-sm text-slate-600 font-semibold">Formulating evidence-based recommendations...</p>
        <p className="text-xs text-slate-400">Structuring tailored {audienceConfig.domainLabel} action strategies.</p>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SectionHeader
          title="Evidence-Based Recommendations"
          subtitle={`Practical action framework synthesized from ${fileName || 'your uploaded data'} for ${audienceConfig.domainLabel}`}
          badge="Action Framework"
        />

        {/* Filter Pills */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs flex-shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setAudienceFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              audienceFilter === 'all' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Actions ({recs.length})
          </button>
          <button
            onClick={() => setAudienceFilter('individual')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              audienceFilter === 'individual' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {audienceConfig.indShort}
          </button>
          <button
            onClick={() => setAudienceFilter('institutional')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              audienceFilter === 'institutional' ? 'bg-white text-purple-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {audienceConfig.orgShort}
          </button>
        </div>
      </div>

      {/* Cards List */}
      {filteredRecs.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-2">
          <p className="text-sm font-bold text-slate-700">No recommendations in this filter category.</p>
          <p className="text-xs text-slate-400">Select 'All Actions' to view the full recommendation suite.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecs.map((rec, idx) => (
            <RecommendationCard 
              key={rec.id || idx} 
              rec={rec} 
              index={idx} 
              audienceConfig={audienceConfig} 
            />
          ))}
        </div>
      )}

      {/* Domain Continuous Roadmap */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-400/30 flex items-center justify-center">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">
              {audienceConfig.roadmapTitle}
            </h4>
            <p className="text-xs text-slate-400">
              Structured best practices for operationalizing empirical findings into sustained positive outcomes
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
          {[
            { title: '1. Phase 1 (Baseline & Awareness)', desc: 'Share baseline risk metric guidelines and protective habits with target cohort.' },
            { title: '2. Phase 2 (Mid-Cycle Audit)', desc: 'Audit concurrent workload/stress peaks to prevent compounding risk clustering.' },
            { title: '3. Phase 3 (Early Interventions)', desc: 'Provide walk-in support and active buffer resources before critical deadline windows.' },
            { title: '4. Phase 4 (Evaluation & Retrospective)', desc: 'Re-survey metrics at cycle end to empirically measure intervention effectiveness.' },
          ].map((step, i) => (
            <div key={i} className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="font-bold text-teal-300">{step.title}</span>
              <p className="text-slate-300 leading-relaxed text-[11px]">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

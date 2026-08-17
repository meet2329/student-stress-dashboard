import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  GraduationCap, 
  Heart, 
  Brain, 
  Activity, 
  BarChart3, 
  Layers,
  Sparkles,
  PieChart as PieIcon
} from 'lucide-react'
import ChartCard from '../components/common/ChartCard'
import SectionHeader from '../components/common/SectionHeader'
import UnivariateHistogram from '../components/charts/UnivariateHistogram'
import UnivariateDonut from '../components/charts/UnivariateDonut'
import distributions from '../data/distributions.json'

const CATEGORIES = [
  { id: 'demographics', label: 'Demographics', icon: Users, desc: 'Age, Gender, University Type, Family Income' },
  { id: 'academic', label: 'Academic Profile', icon: GraduationCap, desc: 'Study Hours, Attendance, Exams, Assignments, Tuition' },
  { id: 'lifestyle', label: 'Lifestyle & Habits', icon: Heart, desc: 'Sleep, Screen Time, Social Media, Physical Activity' },
  { id: 'psychological', label: 'Social & Psychological', icon: Brain, desc: 'Anxiety Level, Family Support, Peer Pressure' },
  { id: 'stress', label: 'Stress Severity', icon: Activity, desc: 'Score Distribution, Severity Breakdown, Summary Statistics' },
]

export default function StudentProfilePage() {
  const [activeTab, setActiveTab] = useState('demographics')

  return (
    <div className="space-y-6">
      {/* Category Tab Selector Bar */}
      <div className="p-2 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon
            const isActive = activeTab === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`
                  flex flex-col items-start p-3 rounded-xl text-left transition-all relative
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                    : 'bg-slate-50/70 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200/60'
                  }
                `}
              >
                <div className="flex items-center gap-2 w-full">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-blue-600'}`} />
                  <span className="text-xs font-bold truncate">{cat.label}</span>
                </div>
                <span className={`text-[10px] mt-1 line-clamp-1 ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                  {cat.desc}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Contents with Framer Motion transitions */}
      <AnimatePresence mode="wait">
        {/* 1. Demographics */}
        {activeTab === 'demographics' && (
          <motion.div
            key="demographics"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <SectionHeader
              title="Student Demographics & Institutional Background"
              subtitle="Univariate distributions across 3,000 respondents"
              badge="Cohort Demographics"
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Age Distribution */}
              <ChartCard
                title="Age Distribution (18–26 Years)"
                subtitle="Concentrated between undergraduate ages 19–21"
                tag="Histogram"
                columnsUsed="Age (Numerical Discrete: 18 to 26 years)"
                whyDone="Yeh dekhne ke liye ki sample me student population ka age group kya hai aur kis umar ke students me stress distribution kaisa hai."
                footer={<div className="font-mono text-[11px]">Mean Age = 20.4 yrs | Median = 20.0 yrs</div>}
              >
                <UnivariateHistogram
                  data={distributions.demographics.age}
                  xKey="age"
                  yKey="count"
                  barColor="#3B82F6"
                  height={220}
                />
              </ChartCard>

              {/* Gender Breakdown */}
              <ChartCard
                title="Gender Identity Distribution"
                subtitle="50.7% Female, 46.0% Male, 3.3% Non-Binary/Other"
                tag="Proportions"
                columnsUsed="Gender (Categorical Nominal: Female, Male, Non-Binary)"
                whyDone="Yeh verify karne ke liye ki survey sample me gender representation balanced hai ya nahi."
              >
                <UnivariateDonut
                  data={distributions.demographics.gender}
                  centerTitle="Gender"
                  centerValue="3k Total"
                  height={220}
                />
              </ChartCard>

              {/* University Type Breakdown */}
              <ChartCard
                title="University Institutional Type"
                subtitle="Public Universities represent 48.3% of respondent cohort"
                tag="Institution"
                columnsUsed="University_Type (Categorical Nominal: Public, Private, Research)"
                whyDone="Yeh analyze karne ke liye ki government, private ya research university me padhne ka student environment par kya distribution hai."
              >
                <UnivariateDonut
                  data={distributions.demographics.universityType.map(u => ({
                    ...u,
                    category: u.type,
                    color: u.type.includes('Public') ? '#3B82F6' : u.type.includes('Private') ? '#F59E0B' : '#0D9488'
                  }))}
                  centerTitle="Institutions"
                  centerValue="3 Types"
                  height={220}
                />
              </ChartCard>

              {/* Family Income Brackets */}
              <ChartCard
                title="Family Annual Household Income"
                subtitle="Socioeconomic categorization across four household brackets"
                tag="Socioeconomic"
                columnsUsed="Family_Income_Level (Categorical Ordinal: Low, Lower-Middle, Upper-Middle, High)"
                whyDone="Yeh samajhne ke liye ki financial background aur household income ka sample spread kaisa hai."
              >
                <UnivariateHistogram
                  data={distributions.demographics.familyIncome}
                  xKey="income"
                  yKey="count"
                  barColor="#6366F1"
                  height={220}
                />
              </ChartCard>
            </div>
          </motion.div>
        )}

        {/* 2. Academic Profile */}
        {activeTab === 'academic' && (
          <motion.div
            key="academic"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <SectionHeader
              title="Academic Workload & Educational Attributes"
              subtitle="Study patterns, class attendance, examination frequency, and assignment density"
              badge="Academic Dimension"
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily Study Hours */}
              <ChartCard
                title="Independent Daily Study Hours"
                subtitle="Hours dedicated to study outside of scheduled lecture time"
                tag="Hours / Day"
                columnsUsed="Study_Hours (Continuous: 0.5 to 10.0 hrs/day)"
                whyDone="Yeh calculate karne ke liye ki ek student average kitne ghante self-study me lagata hai aur academic burden kaisa hai."
                footer={<div className="font-mono text-[11px]">Mean = 4.5 hrs | Median = 4.2 hrs | IQR = 2.4 hrs</div>}
              >
                <UnivariateHistogram
                  data={distributions.academic.studyHours}
                  xKey="range"
                  yKey="count"
                  barColor="#0EA5E9"
                  height={220}
                />
              </ChartCard>

              {/* Class Attendance Rate */}
              <ChartCard
                title="Semester Class Attendance Rate"
                subtitle="Percentage of recorded attendance in required coursework"
                tag="Attendance %"
                columnsUsed="Class_Attendance (Continuous Percentage: 40% to 100%)"
                whyDone="Yeh dekhne ke liye ki regularity aur lecture attendance ka baseline spread kaisa hai."
                footer={<div className="font-mono text-[11px]">Mean Attendance = 78.4% | Median = 82.0%</div>}
              >
                <UnivariateHistogram
                  data={distributions.academic.attendance}
                  xKey="range"
                  yKey="count"
                  barColor="#10B981"
                  height={220}
                />
              </ChartCard>

              {/* Exam Frequency */}
              <ChartCard
                title="Examination Frequency (Exams / Semester)"
                subtitle="Number of graded summative exams scheduled per semester"
                tag="Exam Density"
                columnsUsed="Exam_Frequency (Discrete Count: 1 to 8 exams per term)"
                whyDone="Yeh evaluate karne ke liye ki har semester kitne test/exams conduct kiye jaate hain aur assessment pressure kaisa hai."
              >
                <UnivariateHistogram
                  data={distributions.academic.examFrequency}
                  xKey="frequency"
                  yKey="count"
                  barColor="#F59E0B"
                  height={220}
                />
              </ChartCard>

              {/* Weekly Assignment Load */}
              <ChartCard
                title="Weekly Assignment Submission Load"
                subtitle="Number of graded assignments, problem sets, and lab write-ups per week"
                tag="Assignment Load"
                columnsUsed="Assignment_Load (Discrete Count: 1 to 9 assignments/week)"
                whyDone="Weekly submissions ki frequency check karne ke liye taaki academic workload overload identify ho sake."
              >
                <UnivariateHistogram
                  data={distributions.academic.assignmentLoad}
                  xKey="load"
                  yKey="count"
                  barColor="#EC4899"
                  height={220}
                />
              </ChartCard>

              {/* Tuition Funding Mechanism */}
              <div className="lg:col-span-2">
                <ChartCard
                  title="Tuition Funding Structure"
                  subtitle="How students finance their university tuition and academic fees"
                  tag="Funding Structure"
                  columnsUsed="Tuition_Funding (Categorical: Self-Funded/Loans, Family Supported, Scholarship)"
                  whyDone="Yeh analyze karne ke liye ki fees funding type se student par financial burden aur stress ka kya relation banta hai."
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-2">
                    {distributions.academic.tuition.map((t, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
                        <p className="text-xs font-bold text-slate-600">{t.category}</p>
                        <p className="text-2xl font-extrabold text-slate-900">{t.count}</p>
                        <p className="text-xs font-semibold text-amber-700">Avg Stress: {t.avgStress}/100</p>
                      </div>
                    ))}
                  </div>
                </ChartCard>
              </div>
            </div>
          </motion.div>
        )}

        {/* 3. Lifestyle Profile */}
        {activeTab === 'lifestyle' && (
          <motion.div
            key="lifestyle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <SectionHeader
              title="Lifestyle, Circadian Sleep & Digital Behaviors"
              subtitle="Daily screen time, nocturnal sleep, social media duration, and physical exercise"
              badge="Lifestyle Dimension"
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sleep Hours */}
              <ChartCard
                title="Nightly Sleep Duration"
                subtitle="Hours of sleep per night across student cohort"
                tag="Sleep Architecture"
                columnsUsed="Sleep_Hours (Continuous: 3.5 to 10.0 hrs/night)"
                whyDone="Circadian sleep health measure karne ke liye — yeh determine karne ke liye ki kitne percent students sleep deprivation (<6 hrs) me hain."
                footer={<div className="font-mono text-[11px] text-rose-600 font-bold">43.7% sleep under 6 hours/night</div>}
              >
                <UnivariateHistogram
                  data={distributions.lifestyle.sleepHours}
                  xKey="range"
                  yKey="count"
                  barColor="#0D9488"
                  height={220}
                />
              </ChartCard>

              {/* Screen Time */}
              <ChartCard
                title="Total Daily Screen Exposure"
                subtitle="Combined daily hours on smartphones, laptops, and tablets"
                tag="Digital Immersion"
                columnsUsed="Screen_Time (Continuous: 1.5 to 12.0 hrs/day)"
                whyDone="Digital devices par daily screen time analyze karne ke liye aur digital fatigue ka spread dekhne ke liye."
                footer={<div className="font-mono text-[11px]">Mean = 5.8 hrs/day | 60.0% exceed 5 hrs</div>}
              >
                <UnivariateHistogram
                  data={distributions.lifestyle.screenTime}
                  xKey="range"
                  yKey="count"
                  barColor="#3B82F6"
                  height={220}
                />
              </ChartCard>

              {/* Social Media Usage */}
              <ChartCard
                title="Daily Social Media Usage"
                subtitle="Dedicated time spent on social media networking apps"
                tag="Social Apps"
                columnsUsed="Social_Media_Use (Continuous: 0.5 to 7.0 hrs/day)"
                whyDone="Social networking apps (Instagram, TikTok, etc.) par spend hone wale time ka distribution track karne ke liye."
              >
                <UnivariateHistogram
                  data={distributions.lifestyle.socialMedia}
                  xKey="range"
                  yKey="count"
                  barColor="#8B5CF6"
                  height={220}
                />
              </ChartCard>

              {/* Physical Exercise */}
              <ChartCard
                title="Weekly Physical Activity Frequency"
                subtitle="Days per week engaging in ≥30 minutes of moderate exercise"
                tag="Physical Activity"
                columnsUsed="Physical_Exercise (Discrete: 0 to 7 days/week)"
                whyDone="Physical fitness aur health activity levels examine karne ke liye jo stress ka buffer ban sakti hai."
              >
                <UnivariateHistogram
                  data={distributions.lifestyle.physicalExercise}
                  xKey="frequency"
                  yKey="count"
                  barColor="#10B981"
                  height={220}
                />
              </ChartCard>
            </div>
          </motion.div>
        )}

        {/* 4. Psychological Profile */}
        {activeTab === 'psychological' && (
          <motion.div
            key="psychological"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <SectionHeader
              title="Psychological State & Social Buffers"
              subtitle="Generalized anxiety index, family emotional support, and peer academic pressure"
              badge="Psychological Dimension"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Anxiety Level */}
              <ChartCard
                title="Anxiety Level Severity (GAD-7)"
                subtitle="Standardized psychological anxiety score (1.0–5.0 scale)"
                tag="Anxiety Index"
                columnsUsed="Anxiety_Level (Scale: 1.0 to 5.0 GAD-7 adapted)"
                whyDone="General anxiety severity check karne ke liye — yeh student stress ka sabse bada psychological driver hai."
              >
                <UnivariateHistogram
                  data={distributions.psychological.anxiety}
                  xKey="level"
                  yKey="count"
                  barColor="#EF4444"
                  height={220}
                />
              </ChartCard>

              {/* Family Support */}
              <ChartCard
                title="Family Emotional Support Score"
                subtitle="Perceived familial validating and logistical support"
                tag="Protective Buffer"
                columnsUsed="Family_Support (Likert Scale: 1.0 to 5.0)"
                whyDone="Family emotional safety net aur support ka spread dekhne ke liye."
              >
                <UnivariateHistogram
                  data={distributions.psychological.familySupport}
                  xKey="level"
                  yKey="count"
                  barColor="#10B981"
                  height={220}
                />
              </ChartCard>

              {/* Peer Pressure */}
              <ChartCard
                title="Peer Academic Pressure Index"
                subtitle="Perceived benchmarking and competition among peers"
                tag="Peer Dynamics"
                columnsUsed="Peer_Pressure (Likert Scale: 1.0 to 5.0)"
                whyDone="Peer competition aur comparison pressure ka index check karne ke liye."
              >
                <UnivariateHistogram
                  data={distributions.psychological.peerPressure}
                  xKey="level"
                  yKey="count"
                  barColor="#F59E0B"
                  height={220}
                />
              </ChartCard>
            </div>
          </motion.div>
        )}

        {/* 5. Stress Profile */}
        {activeTab === 'stress' && (
          <motion.div
            key="stress"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <SectionHeader
              title="Target Metric: Student Stress Distribution & Summary Statistics"
              subtitle="Complete univariate summary statistics and parametric descriptors of the target outcome"
              badge="Target Variable"
            />

            {/* Descriptive Summary Stat Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              <div className="p-3 rounded-xl bg-white border border-slate-200 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Mean (μ)</p>
                <p className="text-xl font-extrabold text-slate-900 mt-0.5">{distributions.stressSummary.mean}</p>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Median (M)</p>
                <p className="text-xl font-extrabold text-slate-900 mt-0.5">{distributions.stressSummary.median}</p>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Std Dev (σ)</p>
                <p className="text-xl font-extrabold text-slate-900 mt-0.5">{distributions.stressSummary.stdDev}</p>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Min Value</p>
                <p className="text-xl font-extrabold text-emerald-700 mt-0.5">{distributions.stressSummary.min}</p>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Max Value</p>
                <p className="text-xl font-extrabold text-rose-700 mt-0.5">{distributions.stressSummary.max}</p>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase">IQR</p>
                <p className="text-xl font-extrabold text-slate-900 mt-0.5">{distributions.stressSummary.iqr}</p>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Skewness</p>
                <p className="text-xl font-extrabold text-blue-700 mt-0.5">+{distributions.stressSummary.skewness}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard
                title="Stress Severity Category Proportions"
                subtitle="Categorical classification into 4 clinical-adapted stress severity tiers"
                tag="Categories"
                columnsUsed="Stress_Level (Low, Moderate, High, Very High)"
                whyDone="Target variable ko 4 standard psychological severity buckets me categorize karke cohort health check karna."
              >
                <UnivariateDonut
                  data={distributions.stressLevel}
                  centerTitle="Categories"
                  centerValue="4 Tiers"
                  height={230}
                />
              </ChartCard>

              <ChartCard
                title="Continuous Stress Score Frequency Histogram"
                subtitle="Standardized score frequency across 3,000 university students"
                tag="Continuous Scale"
                columnsUsed="Stress_Score (Continuous metric: 0 to 100)"
                whyDone="Target outcome ka continuous bell curve aur spread analyze karne ke liye."
              >
                <UnivariateHistogram
                  data={distributions.stressScoreHistogram}
                  xKey="range"
                  yKey="count"
                  barColor="#3B82F6"
                  height={230}
                />
              </ChartCard>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

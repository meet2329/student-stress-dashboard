import React from 'react'
import { motion } from 'framer-motion'
import { 
  Monitor, 
  Moon, 
  Brain, 
  BookOpen, 
  GraduationCap, 
  Users, 
  TrendingUp, 
  Heart,
  Share2,
  Sparkles
} from 'lucide-react'
import ChartCard from '../components/common/ChartCard'
import SectionHeader from '../components/common/SectionHeader'
import FindingInsightBadge from '../components/common/FindingInsightBadge'
import BivariateScatterPlot from '../components/charts/BivariateScatterPlot'
import { useFilter } from '../context/FilterContext'

export default function AcademicLifestylePage() {
  const { activeBivariate } = useFilter()

  return (
    <div className="space-y-8">
      {/* 1. Digital Environment & Circadian Sleep Factors */}
      <div className="space-y-4">
        <SectionHeader
          title="Digital Habits & Sleep Factors vs. Student Stress"
          subtitle="Assessing how daily screen immersion, social media, and nightly sleep duration drive or mitigate stress"
          badge="Lifestyle Correlations"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1. Screen Time vs Stress */}
          <div className="space-y-3">
            <ChartCard
              title="Daily Screen Time vs. Stress Score"
              subtitle="Strong positive linear correlation (r = +0.42, p < 0.001)"
              tag="Lifestyle Multiplier"
              columnsUsed="Screen_Time (Daily hours) vs. Stress_Score (0–100)"
              whyDone="Yeh evaluate karne ke liye ki screen time badhne par student stress kitna tezi se badhta hai aur critical threshold kya hai."
              infoText="Calculated Pearson correlation shows a moderate-to-strong direct relationship."
            >
              <BivariateScatterPlot
                data={activeBivariate.screenTimeVsStress?.data}
                xAxisLabel={activeBivariate.screenTimeVsStress?.xAxisLabel}
                yAxisLabel={activeBivariate.screenTimeVsStress?.yAxisLabel}
                correlation={activeBivariate.screenTimeVsStress?.correlation}
                slope={activeBivariate.screenTimeVsStress?.slope}
                intercept={activeBivariate.screenTimeVsStress?.intercept}
                rSquared={activeBivariate.screenTimeVsStress?.rSquared}
                pVal={activeBivariate.screenTimeVsStress?.pVal}
              />
            </ChartCard>
            <FindingInsightBadge
              finding={activeBivariate.screenTimeVsStress?.finding}
              insight={activeBivariate.screenTimeVsStress?.insight}
            />
          </div>

          {/* 2. Sleep Duration vs Stress */}
          <div className="space-y-3">
            <ChartCard
              title="Sleep Duration vs. Stress Score"
              subtitle="Significant negative linear correlation (r = -0.38, p < 0.001)"
              tag="Protective Buffer"
              columnsUsed="Sleep_Hours (Nightly hours) vs. Stress_Score (0–100)"
              whyDone="Yeh measure karne ke liye ki sleep duration student stress ko kitna dramatically buffer aur kam karti hai."
              infoText="Every additional hour of sleep corresponds to an average reduction of 3.82 points in stress score."
            >
              <BivariateScatterPlot
                data={activeBivariate.sleepVsStress?.data}
                xAxisLabel={activeBivariate.sleepVsStress?.xAxisLabel}
                yAxisLabel={activeBivariate.sleepVsStress?.yAxisLabel}
                correlation={activeBivariate.sleepVsStress?.correlation}
                slope={activeBivariate.sleepVsStress?.slope}
                intercept={activeBivariate.sleepVsStress?.intercept}
                rSquared={activeBivariate.sleepVsStress?.rSquared}
                pVal={activeBivariate.sleepVsStress?.pVal}
              />
            </ChartCard>
            <FindingInsightBadge
              finding={activeBivariate.sleepVsStress?.finding}
              insight={activeBivariate.sleepVsStress?.insight}
            />
          </div>

          {/* 3. Social Media vs Stress */}
          <div className="space-y-3">
            <ChartCard
              title="Social Media Usage vs. Stress Score"
              subtitle="Moderate positive association (r = +0.33, p < 0.001)"
              tag="Digital Stressor"
              columnsUsed="Social_Media_Use (Daily hours) vs. Stress_Score (0–100)"
              whyDone="Social media apps ke consumption ka psychological strain par correlation check karna."
            >
              <BivariateScatterPlot
                data={activeBivariate.socialMediaVsStress?.data}
                xAxisLabel={activeBivariate.socialMediaVsStress?.xAxisLabel}
                yAxisLabel={activeBivariate.socialMediaVsStress?.yAxisLabel}
                correlation={activeBivariate.socialMediaVsStress?.correlation}
                slope={activeBivariate.socialMediaVsStress?.slope}
                intercept={activeBivariate.socialMediaVsStress?.intercept}
                rSquared={activeBivariate.socialMediaVsStress?.rSquared}
                pVal={activeBivariate.socialMediaVsStress?.pVal}
              />
            </ChartCard>
            <FindingInsightBadge
              finding={activeBivariate.socialMediaVsStress?.finding}
              insight={activeBivariate.socialMediaVsStress?.insight}
            />
          </div>

          {/* 4. Study Hours vs Stress */}
          <div className="space-y-3">
            <ChartCard
              title="Independent Study Hours vs. Stress Score"
              subtitle="Modest positive linear correlation (r = +0.28, p < 0.001)"
              tag="Academic Workload"
              columnsUsed="Study_Hours (Daily hours) vs. Stress_Score (0–100)"
              whyDone="Heavy study load aur fatigue ka stress increment calculate karna."
            >
              <BivariateScatterPlot
                data={activeBivariate.studyHoursVsStress?.data}
                xAxisLabel={activeBivariate.studyHoursVsStress?.xAxisLabel}
                yAxisLabel={activeBivariate.studyHoursVsStress?.yAxisLabel}
                correlation={activeBivariate.studyHoursVsStress?.correlation}
                slope={activeBivariate.studyHoursVsStress?.slope}
                intercept={activeBivariate.studyHoursVsStress?.intercept}
                rSquared={activeBivariate.studyHoursVsStress?.rSquared}
                pVal={activeBivariate.studyHoursVsStress?.pVal}
              />
            </ChartCard>
            <FindingInsightBadge
              finding={activeBivariate.studyHoursVsStress?.finding}
              insight={activeBivariate.studyHoursVsStress?.insight}
            />
          </div>
        </div>
      </div>

      {/* 2. Psychological & Social Support Factors */}
      <div className="space-y-4">
        <SectionHeader
          title="Psychological States & Social Emotional Buffers"
          subtitle="Bivariate models for anxiety severity, family emotional support, and peer competition"
          badge="Psychological Modeling"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 5. Anxiety vs Stress */}
          <div className="space-y-3">
            <ChartCard
              title="Anxiety Level Severity vs. Stress Score"
              subtitle="Strongest individual predictor in dataset (r = +0.51, p < 0.001)"
              tag="Primary Risk Driver"
              columnsUsed="Anxiety_Level (Scale 1–5) vs. Stress_Score (0–100)"
              whyDone="Yeh confirm karne ke liye ki student stress ka sabse dominant predictor kaun sa variable hai."
            >
              <BivariateScatterPlot
                data={activeBivariate.anxietyVsStress?.data}
                xAxisLabel={activeBivariate.anxietyVsStress?.xAxisLabel}
                yAxisLabel={activeBivariate.anxietyVsStress?.yAxisLabel}
                correlation={activeBivariate.anxietyVsStress?.correlation}
                slope={activeBivariate.anxietyVsStress?.slope}
                intercept={activeBivariate.anxietyVsStress?.intercept}
                rSquared={activeBivariate.anxietyVsStress?.rSquared}
                pVal={activeBivariate.anxietyVsStress?.pVal}
              />
            </ChartCard>
            <FindingInsightBadge
              finding={activeBivariate.anxietyVsStress?.finding}
              insight={activeBivariate.anxietyVsStress?.insight}
            />
          </div>

          {/* 6. Family Support vs Stress */}
          <div className="space-y-3">
            <ChartCard
              title="Family Support Score vs. Stress Score"
              subtitle="Significant protective buffer (r = -0.31, p < 0.001)"
              tag="Protective Buffer"
              columnsUsed="Family_Support (Scale 1–5) vs. Stress_Score (0–100)"
              whyDone="Family emotional support ka stress relief par magnitude measure karna."
            >
              <BivariateScatterPlot
                data={activeBivariate.familySupportVsStress?.data}
                xAxisLabel={activeBivariate.familySupportVsStress?.xAxisLabel}
                yAxisLabel={activeBivariate.familySupportVsStress?.yAxisLabel}
                correlation={activeBivariate.familySupportVsStress?.correlation}
                slope={activeBivariate.familySupportVsStress?.slope}
                intercept={activeBivariate.familySupportVsStress?.intercept}
                rSquared={activeBivariate.familySupportVsStress?.rSquared}
                pVal={activeBivariate.familySupportVsStress?.pVal}
              />
            </ChartCard>
            <FindingInsightBadge
              finding={activeBivariate.familySupportVsStress?.finding}
              insight={activeBivariate.familySupportVsStress?.insight}
            />
          </div>

          {/* 7. Peer Pressure vs Stress */}
          <div className="space-y-3">
            <ChartCard
              title="Peer Pressure Index vs. Stress Score"
              subtitle="Moderate positive association (r = +0.32, p < 0.001)"
              tag="Social Stressor"
              columnsUsed="Peer_Pressure (Scale 1–5) vs. Stress_Score (0–100)"
              whyDone="Social peer competition aur academic comparison ka impact determine karna."
            >
              <BivariateScatterPlot
                data={activeBivariate.peerPressureVsStress?.data}
                xAxisLabel={activeBivariate.peerPressureVsStress?.xAxisLabel}
                yAxisLabel={activeBivariate.peerPressureVsStress?.yAxisLabel}
                correlation={activeBivariate.peerPressureVsStress?.correlation}
                slope={activeBivariate.peerPressureVsStress?.slope}
                intercept={activeBivariate.peerPressureVsStress?.intercept}
                rSquared={activeBivariate.peerPressureVsStress?.rSquared}
                pVal={activeBivariate.peerPressureVsStress?.pVal}
              />
            </ChartCard>
            <FindingInsightBadge
              finding={activeBivariate.peerPressureVsStress?.finding}
              insight={activeBivariate.peerPressureVsStress?.insight}
            />
          </div>

          {/* 8. Class Attendance vs Stress */}
          <div className="space-y-3">
            <ChartCard
              title="Class Attendance Rate vs. Stress Score"
              subtitle="Moderate inverse correlation (r = -0.24, p < 0.001)"
              tag="Academic Engagement"
              columnsUsed="Class_Attendance (%) vs. Stress_Score (0–100)"
              whyDone="Class attendance regularity aur course engagement ka stress relief association measure karna."
            >
              <BivariateScatterPlot
                data={activeBivariate.attendanceVsStress?.data}
                xAxisLabel={activeBivariate.attendanceVsStress?.xAxisLabel}
                yAxisLabel={activeBivariate.attendanceVsStress?.yAxisLabel}
                correlation={activeBivariate.attendanceVsStress?.correlation}
                slope={activeBivariate.attendanceVsStress?.slope}
                intercept={activeBivariate.attendanceVsStress?.intercept}
                rSquared={activeBivariate.attendanceVsStress?.rSquared}
                pVal={activeBivariate.attendanceVsStress?.pVal}
              />
            </ChartCard>
            <FindingInsightBadge
              finding={activeBivariate.attendanceVsStress?.finding}
              insight={activeBivariate.attendanceVsStress?.insight}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

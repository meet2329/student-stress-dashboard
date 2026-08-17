import React from 'react'
import { motion } from 'framer-motion'
import { Activity, TrendingUp, Database, Tag, Globe, BarChart3, Users, Hash } from 'lucide-react'
import KpiCard from '../common/KpiCard'
import { useAIEda } from '../../context/AIEdaContext'

const ICON_MAP = {
  Database: Database,
  TrendingUp: TrendingUp,
  Activity: Activity,
  Tag: Tag,
  Globe: Globe,
  BarChart3: BarChart3,
  Users: Users,
  Hash: Hash,
}

export default function DynamicKpiGrid() {
  const { aiPlan } = useAIEda()

  if (!aiPlan || !aiPlan.kpis || aiPlan.kpis.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {aiPlan.kpis.map((kpi, idx) => (
          <KpiCard
            key={idx}
            title={kpi.title}
            value={kpi.value}
            unit={kpi.unit || ''}
            subtitle={kpi.subtitle}
            icon={ICON_MAP[kpi.iconName] || Activity}
            delta={kpi.delta}
            deltaType={kpi.deltaType || 'neutral'}
            statusColor={kpi.statusColor || 'blue'}
            delay={idx * 0.06}
          />
        ))}
      </div>
    </motion.div>
  )
}

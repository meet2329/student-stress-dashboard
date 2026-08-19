import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './Sidebar'
import Header from './Header'
import MethodologyModal from './MethodologyModal'
import DatasetUploadModal from '../common/DatasetUploadModal'
import NvidiaAiModal from '../common/NvidiaAiModal'
import ShareModal from '../common/ShareModal'
import AiDatasetIngestionStudio from '../onboarding/AiDatasetIngestionStudio'
import { useFilter } from '../../context/FilterContext'

export default function DashboardLayout() {
  const location = useLocation()
  const { 
    ingestionStudioOpen, 
    setIngestionStudioOpen,
    shareModalOpen,
    setShareModalOpen 
  } = useFilter()

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {/* Fixed / Collapsible Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 h-screen overflow-y-auto">
        <Header />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Data & Methodology Modal */}
      <MethodologyModal />

      {/* Dataset Upload Modal */}
      <DatasetUploadModal />

      {/* NVIDIA AI Configuration Modal */}
      <NvidiaAiModal />

      {/* AI Dataset Ingestion Studio */}
      <AiDatasetIngestionStudio 
        isOpen={ingestionStudioOpen}
        onClose={() => setIngestionStudioOpen(false)}
      />

      {/* Temporary Link Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />
    </div>
  )
}

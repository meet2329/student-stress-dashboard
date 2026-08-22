import React, { useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './Sidebar'
import Header from './Header'
import MethodologyModal from './MethodologyModal'
import DatasetUploadModal from '../common/DatasetUploadModal'
import NvidiaAiModal from '../common/NvidiaAiModal'
import ShareModal from '../common/ShareModal'
import AiDatasetIngestionStudio from '../onboarding/AiDatasetIngestionStudio'
import SmoothScrollProvider from '../common/SmoothScrollProvider'
import DataUniverseBackground from '../3d/DataUniverseBackground'
import { useFilter } from '../../context/FilterContext'

export default function DashboardLayout() {
  const location = useLocation()
  const mainScrollRef = useRef(null)
  const { 
    ingestionStudioOpen, 
    setIngestionStudioOpen,
    shareModalOpen,
    setShareModalOpen 
  } = useFilter()

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden relative">
      {/* Fixed / Collapsible Sidebar */}
      <Sidebar />

      {/* Main Content Area with Smooth Scroll */}
      <SmoothScrollProvider containerRef={mainScrollRef}>
        <div 
          ref={mainScrollRef} 
          className="flex flex-col flex-1 min-w-0 h-screen overflow-y-auto relative custom-scrollbar scroll-smooth"
        >
          {/* Ambient 3D Data Universe Canvas Backdrop */}
          <DataUniverseBackground variant="light" particleMultiplier={0.8} className="opacity-35 pointer-events-none fixed" />

          <Header />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6 relative z-10">
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
      </SmoothScrollProvider>

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

import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { FilterProvider } from './context/FilterContext'
import { AIEdaProvider } from './context/AIEdaContext'
import DashboardLayout from './components/layout/DashboardLayout'
import OverviewPage from './pages/OverviewPage'
import StudentProfilePage from './pages/StudentProfilePage'
import AcademicLifestylePage from './pages/AcademicLifestylePage'
import MultivariatePage from './pages/MultivariatePage'
import StatisticalAnalysisPage from './pages/StatisticalAnalysisPage'
import InsightsRecommendationsPage from './pages/InsightsRecommendationsPage'
import AuthPage from './pages/AuthPage'

// AI Automated EDA Pages
import AIEdaOverviewPage from './pages/ai-eda/AIEdaOverviewPage'
import DataQualityPage from './pages/ai-eda/DataQualityPage'
import DynamicUnivariatePage from './pages/ai-eda/DynamicUnivariatePage'
import DynamicBivariatePage from './pages/ai-eda/DynamicBivariatePage'
import DynamicMultivariatePage from './pages/ai-eda/DynamicMultivariatePage'
import AIInsightsPage from './pages/ai-eda/AIInsightsPage'
import RecommendationsPage from './pages/ai-eda/RecommendationsPage'

export default function App() {
  return (
    <AuthProvider>
      <FilterProvider>
        <AIEdaProvider>
          <BrowserRouter>
            <Routes>
              {/* 3D Animated Authentication Route */}
              <Route path="/login" element={<AuthPage />} />
              <Route path="/register" element={<AuthPage />} />

              {/* Dashboard Master Layout */}
              <Route path="/" element={<DashboardLayout />}>
                {/* Existing Student Stress Routes (unchanged) */}
                <Route index element={<OverviewPage />} />
                <Route path="profile" element={<StudentProfilePage />} />
                <Route path="academic-lifestyle" element={<AcademicLifestylePage />} />
                <Route path="multivariate" element={<MultivariatePage />} />
                <Route path="statistical-analysis" element={<StatisticalAnalysisPage />} />
                <Route path="insights" element={<InsightsRecommendationsPage />} />

                {/* AI Automated EDA Routes (new) */}
                <Route path="ai-eda" element={<AIEdaOverviewPage />} />
                <Route path="ai-eda/quality" element={<DataQualityPage />} />
                <Route path="ai-eda/univariate" element={<DynamicUnivariatePage />} />
                <Route path="ai-eda/bivariate" element={<DynamicBivariatePage />} />
                <Route path="ai-eda/multivariate" element={<DynamicMultivariatePage />} />
                <Route path="ai-eda/insights" element={<AIInsightsPage />} />
                <Route path="ai-eda/recommendations" element={<RecommendationsPage />} />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AIEdaProvider>
      </FilterProvider>
    </AuthProvider>
  )
}

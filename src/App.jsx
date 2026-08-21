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
import SharedDashboardPage from './pages/SharedDashboardPage'

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

              {/* Public Temporary Shareable Snapshot Route */}
              <Route path="/share/:shareId" element={<SharedDashboardPage />} />

              {/* Dashboard Master Layout */}
              <Route path="/" element={<DashboardLayout />}>
                {/* AI Automated EDA Master Routes */}
                <Route index element={<AIEdaOverviewPage />} />
                <Route path="ai-eda" element={<Navigate to="/" replace />} />
                <Route path="ai-eda/quality" element={<DataQualityPage />} />
                <Route path="ai-eda/univariate" element={<DynamicUnivariatePage />} />
                <Route path="ai-eda/bivariate" element={<DynamicBivariatePage />} />
                <Route path="ai-eda/multivariate" element={<DynamicMultivariatePage />} />
                <Route path="ai-eda/statistical-analysis" element={<StatisticalAnalysisPage />} />
                <Route path="ai-eda/insights" element={<AIInsightsPage />} />
                <Route path="ai-eda/recommendations" element={<RecommendationsPage />} />

                {/* Legacy Route Redirects */}
                <Route path="profile" element={<Navigate to="/ai-eda/univariate" replace />} />
                <Route path="academic-lifestyle" element={<Navigate to="/ai-eda/bivariate" replace />} />
                <Route path="multivariate" element={<Navigate to="/ai-eda/multivariate" replace />} />
                <Route path="statistical-analysis" element={<Navigate to="/ai-eda/statistical-analysis" replace />} />
                <Route path="insights" element={<Navigate to="/ai-eda/insights" replace />} />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AIEdaProvider>
      </FilterProvider>
    </AuthProvider>
  )
}

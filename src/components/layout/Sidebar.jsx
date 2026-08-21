import React, { useState } from 'react'
import { NavLink, useLocation, Link } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Layers, 
  Activity, 
  Sparkles, 
  Database, 
  ChevronLeft, 
  ChevronRight,
  Menu,
  X,
  GraduationCap,
  ShieldCheck,
  LogIn,
  LogOut,
  User,
  Cpu,
  ShieldAlert,
  BarChart3,
  GitBranch,
  BrainCircuit,
  Lightbulb,
  Target
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFilter } from '../../context/FilterContext'
import { useAuth } from '../../context/AuthContext'

const NAV_ITEMS = [
  { path: '/', label: 'EDA Overview', icon: Cpu, exact: true, tag: 'Dashboard' },
  { path: '/ai-eda/quality', label: 'Data Quality', icon: ShieldAlert, tag: 'Validation' },
  { path: '/ai-eda/univariate', label: 'Univariate', icon: BarChart3, tag: '1-Variable' },
  { path: '/ai-eda/bivariate', label: 'Bivariate', icon: GitBranch, tag: '2-Variable' },
  { path: '/ai-eda/multivariate', label: 'Multivariate', icon: BrainCircuit, tag: 'N-Variable' },
  { path: '/ai-eda/statistical-analysis', label: 'Statistical Analysis', icon: Activity, tag: 'Hypotheses' },
  { path: '/ai-eda/insights', label: 'AI Insights', icon: Lightbulb, tag: 'Findings' },
  { path: '/ai-eda/recommendations', label: 'Recommendations', icon: Target, tag: 'Actions' },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { setMethodologyOpen } = useFilter()
  const { currentUser, logoutUser } = useAuth()
  const location = useLocation()

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20 flex-shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="min-w-0"
            >
              <h1 className="text-sm font-extrabold text-white tracking-tight leading-none truncate">
                AI-Powered EDA
              </h1>
              <p className="text-xs text-blue-400 font-medium tracking-wide mt-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
                Data Science & AI Studio
              </p>
            </motion.div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-2 pb-2">
          {!collapsed && (
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-teal-400">
              Autonomous Analysis Suite
            </p>
          )}
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = item.exact 
            ? location.pathname === item.path 
            : location.pathname.startsWith(item.path)

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive: routerActive }) => `
                relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group
                ${routerActive 
                  ? 'bg-teal-600/15 text-teal-400 font-semibold border border-teal-500/30' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }
              `}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNavIndicator"
                  className="absolute left-0 top-2 bottom-2 w-1 bg-teal-500 rounded-r-full"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-teal-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
              {!collapsed && (
                <div className="flex items-center justify-between flex-1 min-w-0">
                  <span className="truncate">{item.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                    isActive ? 'bg-teal-500/20 text-teal-300' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'
                  }`}>
                    {item.tag}
                  </span>
                </div>
              )}
            </NavLink>
          )
        })}
      </div>

      {/* Methodology & User Auth Section */}
      <div className="p-3 border-t border-slate-800/80 space-y-2">
        {/* User Status / 3D Login */}
        {currentUser ? (
          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={currentUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.email}`}
                alt={currentUser.displayName}
                className="w-7 h-7 rounded-full bg-slate-700 object-cover flex-shrink-0"
              />
              {!collapsed && (
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{currentUser.displayName}</p>
                  <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
                </div>
              )}
            </div>
            {!collapsed && (
              <button
                onClick={logoutUser}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700/60 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            onClick={() => setMobileOpen(false)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all justify-center"
          >
            <LogIn className="w-4 h-4" />
            {!collapsed && <span>Sign In (3D Auth)</span>}
          </Link>
        )}

        {/* Methodology Button */}
        <button
          onClick={() => {
            setMethodologyOpen(true)
            setMobileOpen(false)
          }}
          className={`
            w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all
            bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-teal-300 border border-slate-700/60 group
          `}
        >
          <Database className="w-4 h-4 text-teal-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
          {!collapsed && (
            <div className="text-left flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 group-hover:text-teal-300 truncate">
                Data & Methodology
              </p>
            </div>
          )}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="md:hidden fixed top-3 left-3 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl bg-slate-900 text-white shadow-lg border border-slate-700 hover:bg-slate-800"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="md:hidden fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40"
          >
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="w-72 h-full"
            >
              {sidebarContent}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Persistent Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 76 : 260 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="hidden md:block h-screen sticky top-0 flex-shrink-0 z-30"
      >
        {sidebarContent}
      </motion.aside>
    </>
  )
}

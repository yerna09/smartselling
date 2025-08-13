import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Box } from '@mui/material'
import { Toaster } from 'react-hot-toast'

// Componentes
import Login from './components/auth/Login'
import Dashboard from './components/dashboard/Dashboard'
import MainDashboard from './components/dashboard/MainDashboard'
import AccountManager from './components/accounts/AccountManager'
import AnalyticsPage from './components/analytics/AnalyticsPage'
import SettingsPage from './components/settings/SettingsPage'
import MetricsView from './components/metrics/MetricsView'
import Layout from './components/layout/Layout'

// Hooks
import { useAuth } from './hooks/useAuth'

// Contexto de autenticación
import { AuthProvider } from './contexts/AuthContext'

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <AppRoutes />
    </AuthProvider>
  )
}

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
      >
        <div>Cargando...</div>
      </Box>
    )
  }

  if (!isAuthenticated) {
    return <Login />
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<MainDashboard />} />
        <Route path="/dashboard" element={<MainDashboard />} />
        <Route path="/accounts" element={<AccountManager />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/metrics" element={<MetricsView />} />
        <Route path="/metrics/:accountId" element={<MetricsView />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  )
}

export default App

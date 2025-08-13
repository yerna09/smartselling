import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Box } from '@mui/material'

// Componentes
import Login from './components/auth/Login'
import Loading from './components/auth/Loading'
import Dashboard from './components/dashboard/Dashboard'
import AccountManager from './components/accounts/AccountManager'
import MetricsView from './components/metrics/MetricsView'
import AnalyticsPage from './components/analytics/AnalyticsPage'
import SettingsPage from './components/settings/SettingsPage'
import Layout from './components/layout/Layout'

// Hooks
import { useAuth } from './hooks/useAuth'

// Build timestamp: 1734148293

// Contexto de autenticación
import { AuthProvider } from './contexts/AuthContext'

function App() {
  return (
    <AuthProvider>
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

  // Ruta especial para el callback de ML (no requiere autenticación)
  if (window.location.pathname === '/loading') {
    return <Loading />
  }

  if (!isAuthenticated) {
    return <Login />
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/accounts" element={<AccountManager />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/metrics" element={<MetricsView />} />
        <Route path="/metrics/:accountId" element={<MetricsView />} />
        <Route path="/loading" element={<Loading />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  )
}

export default App

import React, { useState, useMemo } from 'react'
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper
} from '@mui/material'
import {
  AccountBalance,
  TrendingUp,
  ShoppingCart,
  Visibility,
  Refresh,
  Add,
  FilterList
} from '@mui/icons-material'
import { useAuth } from '../../hooks/useAuth'
import AccountMetricsCard from './AccountMetricsCard'
import CombinedMetricsChart from './CombinedMetricsChart'
import QuickActions from './QuickActions'

function Dashboard() {
  const { user, mlAccounts, refreshAccountMetrics } = useAuth()
  const [selectedAccounts, setSelectedAccounts] = useState('all')
  const [refreshing, setRefreshing] = useState(false)

  // Calcular métricas combinadas
  const combinedMetrics = useMemo(() => {
    const activeAccounts = (accounts || []).filter(account => account.is_active)
    
    const filteredAccounts = selectedAccounts === 'all' 
      ? activeAccounts 
      : activeAccounts.filter(account => account.id === selectedAccounts)

    return filteredAccounts.reduce((total, account) => ({
      totalSales: total.totalSales + (account.total_sales || 0),
      totalOrders: total.totalOrders + (account.total_orders || 0),
      activeListings: total.activeListings + (account.active_listings || 0),
      accountsCount: filteredAccounts.length
    }), {
      totalSales: 0,
      totalOrders: 0,
      activeListings: 0,
      accountsCount: 0
    })
  }, [mlAccounts, selectedAccounts])

  const handleRefreshAll = async () => {
    setRefreshing(true)
    try {
      await refreshAccountMetrics()
    } finally {
      setRefreshing(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount)
  }

  return (
    <Box>
      {/* Header */}
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Dashboard SmartSelling
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Bienvenido, {user?.username}
          </Typography>
        </Box>
        
        <Box display="flex" gap={2}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Filtrar cuentas</InputLabel>
            <Select
              value={selectedAccounts}
              label="Filtrar cuentas"
              onChange={(e) => setSelectedAccounts(e.target.value)}
              startAdornment={<FilterList />}
            >
              <MenuItem value="all">Todas las cuentas</MenuItem>
              {mlAccounts.map(account => (
                <MenuItem key={account.id} value={account.id}>
                  {account.account_alias || account.ml_nickname}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefreshAll}
            disabled={refreshing}
          >
            {refreshing ? 'Actualizando...' : 'Actualizar'}
          </Button>
        </Box>
      </Box>

      {/* Métricas principales */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" component="div" color="primary">
                    {formatCurrency(combinedMetrics.totalSales)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ventas totales
                  </Typography>
                </Box>
                <AccountBalance color="primary" fontSize="large" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" component="div" color="success.main">
                    {combinedMetrics.totalOrders.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Órdenes totales
                  </Typography>
                </Box>
                <ShoppingCart color="success" fontSize="large" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" component="div" color="info.main">
                    {combinedMetrics.activeListings}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Publicaciones activas
                  </Typography>
                </Box>
                <Visibility color="info" fontSize="large" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" component="div" color="secondary.main">
                    {combinedMetrics.accountsCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cuentas activas
                  </Typography>
                </Box>
                <TrendingUp color="secondary" fontSize="large" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gráficos y métricas */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} lg={8}>
          <CombinedMetricsChart 
            accounts={mlAccounts}
            selectedAccounts={selectedAccounts}
          />
        </Grid>
        
        <Grid item xs={12} lg={4}>
          <QuickActions />
        </Grid>
      </Grid>

      {/* Cuentas individuales */}
      <Box mb={3}>
        <Typography variant="h5" component="h2" gutterBottom>
          Cuentas de Mercado Libre
        </Typography>
      </Box>

      {mlAccounts.length === 0 ? (
        <Card>
          <CardContent>
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No tienes cuentas de Mercado Libre vinculadas
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Conecta tu primera cuenta para comenzar a ver métricas
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                size="large"
                onClick={() => {/* Implementar addMLAccount */}}
              >
                Conectar cuenta de ML
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {mlAccounts.map(account => (
            <Grid item xs={12} md={6} key={account.id}>
              <AccountMetricsCard account={account} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  )
}

export default Dashboard

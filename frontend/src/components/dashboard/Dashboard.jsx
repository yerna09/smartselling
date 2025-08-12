import React, { useState, useMemo, useEffect } from 'react'
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
  Paper,
  CircularProgress
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
import toast from 'react-hot-toast'

const API_URL = 'https://api-test.smartselling.com.ar'

function Dashboard() {
  const { user } = useAuth()
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAccounts, setSelectedAccounts] = useState('all')
  const [refreshing, setRefreshing] = useState(false)

  // Cargar cuentas al montar el componente
  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      const response = await fetch(`${API_URL}/ml-accounts`, {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setAccounts(data.accounts || [])
      } else {
        toast.error('Error al cargar las cuentas')
      }
    } catch (error) {
      console.error('Error fetching accounts:', error)
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

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
  }, [accounts, selectedAccounts])

  const handleRefreshAll = async () => {
    setRefreshing(true)
    try {
      const response = await fetch(`${API_URL}/ml-accounts/refresh-all-metrics`, {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        toast.success('Métricas actualizadas')
        await fetchAccounts()
      } else {
        toast.error('Error al actualizar métricas')
      }
    } catch (error) {
      console.error('Error refreshing metrics:', error)
      toast.error('Error de conexión')
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          <AccountBalance sx={{ mr: 1, verticalAlign: 'middle' }} />
          Dashboard Multicuenta
        </Typography>
        <Box>
          <Button
            variant="outlined"
            onClick={handleRefreshAll}
            disabled={refreshing}
            startIcon={refreshing ? <CircularProgress size={20} /> : <Refresh />}
            sx={{ mr: 1 }}
          >
            {refreshing ? 'Actualizando...' : 'Actualizar Todo'}
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            href="/accounts"
          >
            Agregar Cuenta
          </Button>
        </Box>
      </Box>

      {/* Filtros */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <FilterList />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Cuentas</InputLabel>
            <Select
              value={selectedAccounts}
              label="Cuentas"
              onChange={(e) => setSelectedAccounts(e.target.value)}
            >
              <MenuItem value="all">Todas las cuentas activas</MenuItem>
              {accounts.filter(acc => acc.is_active).map((account) => (
                <MenuItem key={account.id} value={account.id}>
                  {account.account_alias || account.ml_nickname}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="body2" color="text.secondary">
            {combinedMetrics.accountsCount} cuenta(s) seleccionada(s)
          </Typography>
        </Box>
      </Paper>

      {/* Métricas principales */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TrendingUp color="primary" />
                <Typography variant="h6" ml={1}>
                  Ventas Totales
                </Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {formatCurrency(combinedMetrics.totalSales)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ingresos combinados
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <ShoppingCart color="success" />
                <Typography variant="h6" ml={1}>
                  Órdenes Totales
                </Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {combinedMetrics.totalOrders.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pedidos procesados
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Visibility color="warning" />
                <Typography variant="h6" ml={1}>
                  Publicaciones
                </Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {combinedMetrics.activeListings.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Productos activos
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AccountBalance color="info" />
                <Typography variant="h6" ml={1}>
                  Cuentas Activas
                </Typography>
              </Box>
              <Typography variant="h4" color="info.main">
                {combinedMetrics.accountsCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cuentas conectadas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gráfico de métricas */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <CombinedMetricsChart accounts={accounts} />
        </Grid>
        <Grid item xs={12} lg={4}>
          <QuickActions accounts={accounts} onRefresh={fetchAccounts} />
        </Grid>
      </Grid>

      {/* Lista de cuentas */}
      <Box mt={3}>
        <Typography variant="h6" gutterBottom>
          Cuentas Vinculadas
        </Typography>
        <Grid container spacing={2}>
          {accounts.map((account) => (
            <Grid item xs={12} sm={6} md={4} key={account.id}>
              <AccountMetricsCard account={account} onRefresh={fetchAccounts} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  )
}

export default Dashboard

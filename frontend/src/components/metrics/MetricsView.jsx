import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material'
import {
  TrendingUp,
  ShoppingCart,
  Inventory,
  Refresh,
  Assessment,
  AccountBalance,
  Timeline
} from '@mui/icons-material'
import toast from 'react-hot-toast'
import { API_URL, apiRequest } from '../../config/api'

function MetricsView() {
  const { accountId } = useParams()
  const [accounts, setAccounts] = useState([])
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Cargar cuentas al montar el componente
  useEffect(() => {
    fetchAccounts()
  }, [])

  // Seleccionar cuenta específica si viene por URL
  useEffect(() => {
    if (accountId && accounts.length > 0) {
      const account = accounts.find(acc => acc.id === parseInt(accountId))
      if (account) {
        setSelectedAccount(account)
        fetchAccountMetrics(account.id)
      }
    } else if (accounts.length > 0 && !selectedAccount) {
      // Seleccionar la primera cuenta por defecto
      setSelectedAccount(accounts[0])
      fetchAccountMetrics(accounts[0].id)
    }
  }, [accountId, accounts])

  const fetchAccounts = async () => {
    try {
      const data = await apiRequest('/ml-accounts')
      setAccounts(data.accounts)
    } catch (error) {
      console.error('Error fetching accounts:', error)
      toast.error('Error al cargar las cuentas')
    } finally {
      setLoading(false)
    }
  }

  const fetchAccountMetrics = async (accountId) => {
    try {
      setRefreshing(true)
      const data = await apiRequest(`/ml-accounts/${accountId}/metrics`)
      setMetrics(data.metrics)
    } catch (error) {
      console.error('Error fetching metrics:', error)
      toast.error('Error al cargar las métricas')
    } finally {
      setRefreshing(false)
    }
  }

  const refreshMetrics = async () => {
    if (!selectedAccount) return

    try {
      setRefreshing(true)
      await apiRequest(`/ml-accounts/${selectedAccount.id}/refresh-metrics`, {
        method: 'POST'
      })
      
      toast.success('Métricas actualizadas')
      await fetchAccountMetrics(selectedAccount.id)
      await fetchAccounts() // Actualizar también la lista de cuentas
    } catch (error) {
      console.error('Error refreshing metrics:', error)
      toast.error('Error al actualizar métricas')
    }
  }

  const refreshAllMetrics = async () => {
    try {
      setRefreshing(true)
      const data = await apiRequest('/ml-accounts/refresh-all-metrics', {
        method: 'POST'
      })
      
      toast.success(`Actualizadas ${data.updated_count} cuentas`)
      await fetchAccounts()
      if (selectedAccount) {
        await fetchAccountMetrics(selectedAccount.id)
      }
    } catch (error) {
      console.error('Error refreshing all metrics:', error)
      toast.error('Error al actualizar todas las métricas')
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('es-AR')
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  if (accounts.length === 0) {
    return (
      <Box p={3}>
        <Alert severity="info">
          No tienes cuentas de Mercado Libre vinculadas. Ve a la sección de Cuentas para agregar una.
        </Alert>
      </Box>
    )
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          <Assessment sx={{ mr: 1, verticalAlign: 'middle' }} />
          Métricas de Ventas
        </Typography>
        <Box>
          <Button
            variant="outlined"
            onClick={refreshAllMetrics}
            disabled={refreshing}
            sx={{ mr: 1 }}
          >
            Actualizar Todas
          </Button>
          <Button
            variant="contained"
            onClick={refreshMetrics}
            disabled={refreshing || !selectedAccount}
            startIcon={refreshing ? <CircularProgress size={20} /> : <Refresh />}
          >
            {refreshing ? 'Actualizando...' : 'Actualizar'}
          </Button>
        </Box>
      </Box>

      {/* Selector de cuenta */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          <AccountBalance sx={{ mr: 1, verticalAlign: 'middle' }} />
          Seleccionar Cuenta
        </Typography>
        <Grid container spacing={2}>
          {accounts.map((account) => (
            <Grid item xs={12} sm={6} md={4} key={account.id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  border: selectedAccount?.id === account.id ? 2 : 1,
                  borderColor: selectedAccount?.id === account.id ? 'primary.main' : 'grey.300',
                  '&:hover': { borderColor: 'primary.main' }
                }}
                onClick={() => {
                  setSelectedAccount(account)
                  fetchAccountMetrics(account.id)
                }}
              >
                <CardContent>
                  <Typography variant="h6" noWrap>
                    {account.account_alias || account.ml_nickname}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {account.ml_nickname} ({account.ml_user_id})
                  </Typography>
                  <Box mt={1}>
                    <Chip
                      size="small"
                      label={account.is_active ? 'Activa' : 'Inactiva'}
                      color={account.is_active ? 'success' : 'default'}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Métricas de la cuenta seleccionada */}
      {selectedAccount && (
        <Box>
          <Typography variant="h5" gutterBottom>
            <Timeline sx={{ mr: 1, verticalAlign: 'middle' }} />
            Métricas: {selectedAccount.account_alias || selectedAccount.ml_nickname}
          </Typography>

          {/* Información de la cuenta */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Información de la Cuenta
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Usuario ML: {selectedAccount.ml_nickname}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ID: {selectedAccount.ml_user_id}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    País: {selectedAccount.ml_country_id}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Última actualización: {formatDate(selectedAccount.last_metrics_update)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cuenta creada: {formatDate(selectedAccount.created_at)}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Métricas principales */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <TrendingUp color="primary" />
                    <Typography variant="h6" ml={1}>
                      Ventas Totales
                    </Typography>
                  </Box>
                  <Typography variant="h4" color="primary">
                    {formatCurrency(selectedAccount.total_sales)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ingresos acumulados
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <ShoppingCart color="success" />
                    <Typography variant="h6" ml={1}>
                      Órdenes Totales
                    </Typography>
                  </Box>
                  <Typography variant="h4" color="success.main">
                    {selectedAccount.total_orders.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pedidos procesados
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Inventory color="warning" />
                    <Typography variant="h6" ml={1}>
                      Publicaciones Activas
                    </Typography>
                  </Box>
                  <Typography variant="h4" color="warning.main">
                    {selectedAccount.active_listings.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Productos en venta
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Métricas adicionales si están disponibles */}
          {metrics && (
            <Box mt={3}>
              <Typography variant="h6" gutterBottom>
                Métricas Detalladas (Tiempo Real)
              </Typography>
              <Card>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="text.secondary">
                        Ventas RT:
                      </Typography>
                      <Typography variant="h6">
                        {formatCurrency(metrics.total_sales || 0)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="text.secondary">
                        Órdenes RT:
                      </Typography>
                      <Typography variant="h6">
                        {(metrics.total_orders || 0).toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="text.secondary">
                        Publicaciones RT:
                      </Typography>
                      <Typography variant="h6">
                        {(metrics.active_listings || 0).toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="text.secondary">
                        Promedio por orden:
                      </Typography>
                      <Typography variant="h6">
                        {formatCurrency(
                          metrics.total_orders > 0 
                            ? metrics.total_sales / metrics.total_orders 
                            : 0
                        )}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          )}

          {refreshing && (
            <Box display="flex" justifyContent="center" mt={3}>
              <CircularProgress />
            </Box>
          )}
        </Box>
      )}
    </Box>
  )
}

export default MetricsView

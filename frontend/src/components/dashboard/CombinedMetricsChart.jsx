import React from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Chip
} from '@mui/material'
import {
  TrendingUp,
  ShoppingCart,
  Inventory,
  AccountBalance
} from '@mui/icons-material'

function CombinedMetricsChart({ accounts = [] }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount || 0)
  }

  // Calcular totales combinados
  const totalSales = accounts.reduce((sum, account) => sum + (account.total_sales || 0), 0)
  const totalOrders = accounts.reduce((sum, account) => sum + (account.total_orders || 0), 0)
  const totalListings = accounts.reduce((sum, account) => sum + (account.active_listings || 0), 0)
  const activeAccounts = accounts.filter(account => account.is_active).length

  // Encontrar la cuenta con mejores métricas para comparación
  const topAccount = accounts.reduce((top, current) => {
    return (current.total_sales || 0) > (top.total_sales || 0) ? current : top
  }, accounts[0] || {})

  // Calcular progreso relativo (mock data para demo)
  const salesProgress = Math.min((totalSales / 1000000) * 100, 100) // Meta: $1M
  const ordersProgress = Math.min((totalOrders / 1000) * 100, 100) // Meta: 1000 órdenes
  const listingsProgress = Math.min((totalListings / 100) * 100, 100) // Meta: 100 publicaciones

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          <AccountBalance sx={{ mr: 1, verticalAlign: 'middle' }} />
          Resumen Consolidado
        </Typography>

        {accounts.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No hay cuentas vinculadas para mostrar métricas.
          </Typography>
        ) : (
          <>
            {/* Métricas principales */}
            <Grid container spacing={3} mb={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center" p={2}>
                  <TrendingUp color="primary" fontSize="large" />
                  <Typography variant="h4" color="primary" gutterBottom>
                    {formatCurrency(totalSales)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ventas Totales
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={salesProgress} 
                    color="primary"
                    sx={{ mt: 1 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {salesProgress.toFixed(1)}% de la meta
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center" p={2}>
                  <ShoppingCart color="success" fontSize="large" />
                  <Typography variant="h4" color="success.main" gutterBottom>
                    {totalOrders.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Órdenes Totales
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={ordersProgress} 
                    color="success"
                    sx={{ mt: 1 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {ordersProgress.toFixed(1)}% de la meta
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center" p={2}>
                  <Inventory color="warning" fontSize="large" />
                  <Typography variant="h4" color="warning.main" gutterBottom>
                    {totalListings.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Publicaciones Activas
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={listingsProgress} 
                    color="warning"
                    sx={{ mt: 1 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {listingsProgress.toFixed(1)}% de la meta
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center" p={2}>
                  <AccountBalance color="info" fontSize="large" />
                  <Typography variant="h4" color="info.main" gutterBottom>
                    {activeAccounts}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cuentas Activas
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                    de {accounts.length} total(es)
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Información adicional */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Análisis Rápido
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Cuenta con mejor rendimiento:
                  </Typography>
                  {topAccount.ml_nickname && (
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Chip 
                        label={topAccount.account_alias || topAccount.ml_nickname}
                        color="primary"
                        size="small"
                      />
                      <Typography variant="body2">
                        {formatCurrency(topAccount.total_sales)}
                      </Typography>
                    </Box>
                  )}
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Promedio por cuenta:
                  </Typography>
                  <Typography variant="body2">
                    Ventas: {formatCurrency(totalSales / (accounts.length || 1))}
                  </Typography>
                  <Typography variant="body2">
                    Órdenes: {Math.round(totalOrders / (accounts.length || 1))}
                  </Typography>
                  <Typography variant="body2">
                    Publicaciones: {Math.round(totalListings / (accounts.length || 1))}
                  </Typography>
                </Grid>
              </Grid>

              {/* Estado de las cuentas */}
              <Box mt={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Estado de cuentas:
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {accounts.map((account) => (
                    <Chip
                      key={account.id}
                      label={account.account_alias || account.ml_nickname}
                      color={account.is_active ? 'success' : 'default'}
                      size="small"
                      variant={account.is_active ? 'filled' : 'outlined'}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default CombinedMetricsChart

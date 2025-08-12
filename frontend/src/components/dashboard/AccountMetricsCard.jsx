import React from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material'
import {
  TrendingUp,
  ShoppingCart,
  Inventory,
  Refresh,
  Visibility
} from '@mui/icons-material'

function AccountMetricsCard({ account, onRefresh, onViewDetails, refreshing = false }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount || 0)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('es-AR')
  }

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          boxShadow: 4,
          transform: 'translateY(-2px)'
        },
        transition: 'all 0.2s ease-in-out'
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        {/* Header con nombre de cuenta y estado */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="div" noWrap>
            {account.account_alias || account.ml_nickname}
          </Typography>
          <Chip
            size="small"
            label={account.is_active ? 'Activa' : 'Inactiva'}
            color={account.is_active ? 'success' : 'default'}
          />
        </Box>

        {/* Información básica */}
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {account.ml_nickname} • {account.ml_country_id}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
          ID: {account.ml_user_id}
        </Typography>

        {/* Métricas principales */}
        <Box mt={2}>
          <Box display="flex" alignItems="center" mb={1}>
            <TrendingUp fontSize="small" color="primary" />
            <Typography variant="body2" sx={{ ml: 1, flexGrow: 1 }}>
              Ventas Totales
            </Typography>
          </Box>
          <Typography variant="h6" color="primary" gutterBottom>
            {formatCurrency(account.total_sales)}
          </Typography>

          <Box display="flex" alignItems="center" mb={1}>
            <ShoppingCart fontSize="small" color="success" />
            <Typography variant="body2" sx={{ ml: 1, flexGrow: 1 }}>
              Órdenes
            </Typography>
          </Box>
          <Typography variant="h6" color="success.main" gutterBottom>
            {account.total_orders?.toLocaleString() || '0'}
          </Typography>

          <Box display="flex" alignItems="center" mb={1}>
            <Inventory fontSize="small" color="warning" />
            <Typography variant="body2" sx={{ ml: 1, flexGrow: 1 }}>
              Publicaciones Activas
            </Typography>
          </Box>
          <Typography variant="h6" color="warning.main" gutterBottom>
            {account.active_listings?.toLocaleString() || '0'}
          </Typography>
        </Box>

        {/* Última actualización */}
        <Typography variant="caption" color="text.secondary" display="block" mt={2}>
          Última actualización: {formatDate(account.last_metrics_update)}
        </Typography>
      </CardContent>

      {/* Acciones */}
      <Box p={2} pt={0} display="flex" justifyContent="space-between">
        <Tooltip title="Ver detalles">
          <IconButton 
            size="small" 
            onClick={() => onViewDetails && onViewDetails(account)}
            color="primary"
          >
            <Visibility />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Actualizar métricas">
          <IconButton 
            size="small" 
            onClick={() => onRefresh && onRefresh(account.id)}
            disabled={refreshing}
            color="primary"
          >
            <Refresh className={refreshing ? 'spin' : ''} />
          </IconButton>
        </Tooltip>
      </Box>
    </Card>
  )
}

export default AccountMetricsCard

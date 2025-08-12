import React from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  IconButton,
  Tooltip
} from '@mui/material'
import {
  Add,
  Refresh,
  Assessment,
  AccountCircle,
  Link,
  Settings,
  Download,
  Upload
} from '@mui/icons-material'

function QuickActions({ onAddAccount, onRefreshAll, onViewMetrics, onManageAccounts }) {
  const actions = [
    {
      title: 'Agregar Cuenta ML',
      description: 'Vincular nueva cuenta de Mercado Libre',
      icon: <Add />,
      color: 'primary',
      onClick: onAddAccount
    },
    {
      title: 'Ver Métricas',
      description: 'Analizar rendimiento de cuentas',
      icon: <Assessment />,
      color: 'secondary',
      onClick: onViewMetrics
    },
    {
      title: 'Gestionar Cuentas',
      description: 'Administrar cuentas vinculadas',
      icon: <AccountCircle />,
      color: 'info',
      onClick: onManageAccounts
    },
    {
      title: 'Actualizar Todo',
      description: 'Refrescar todas las métricas',
      icon: <Refresh />,
      color: 'success',
      onClick: onRefreshAll
    }
  ]

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Acciones Rápidas
        </Typography>
        <Grid container spacing={2}>
          {actions.map((action, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Box
                sx={{
                  p: 2,
                  border: 1,
                  borderColor: 'grey.300',
                  borderRadius: 1,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    borderColor: `${action.color}.main`,
                    bgcolor: `${action.color}.50`,
                    transform: 'translateY(-2px)',
                    boxShadow: 2
                  }
                }}
                onClick={action.onClick}
              >
                <IconButton
                  color={action.color}
                  sx={{ mb: 1 }}
                  size="large"
                >
                  {action.icon}
                </IconButton>
                <Typography variant="subtitle2" gutterBottom>
                  {action.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {action.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Acciones adicionales */}
        <Box mt={3} pt={2} borderTop={1} borderColor="grey.200">
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Otras acciones:
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            <Tooltip title="Exportar datos">
              <IconButton size="small" color="primary">
                <Download />
              </IconButton>
            </Tooltip>
            <Tooltip title="Importar configuración">
              <IconButton size="small" color="primary">
                <Upload />
              </IconButton>
            </Tooltip>
            <Tooltip title="Configuración">
              <IconButton size="small" color="primary">
                <Settings />
              </IconButton>
            </Tooltip>
            <Tooltip title="Vincular más servicios">
              <IconButton size="small" color="primary">
                <Link />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default QuickActions

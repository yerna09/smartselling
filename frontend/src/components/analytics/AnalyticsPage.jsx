import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    TrendingUp as TrendingUpIcon,
    MonetizationOn as MoneyIcon,
    ShoppingCart as OrdersIcon,
    Assessment as ReportIcon
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { apiRequest } from '../../config/api';
import toast from 'react-hot-toast';

const AnalyticsPage = () => {
    const { isAuthenticated } = useAuth();
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [analytics, setAnalytics] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        topAccount: null
    });

    useEffect(() => {
        if (isAuthenticated) {
            loadAnalyticsData();
        }
    }, [isAuthenticated]);

    const loadAnalyticsData = async () => {
        setLoading(true);
        try {
            const data = await apiRequest('/ml-accounts');
            const accountsData = data.accounts || [];
            setAccounts(accountsData);

            // Calcular analytics
            const totalRevenue = accountsData.reduce((sum, acc) => sum + (acc.total_sales || 0), 0);
            const totalOrders = accountsData.reduce((sum, acc) => sum + (acc.total_orders || 0), 0);
            const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
            const topAccount = accountsData.reduce((top, acc) => 
                (acc.total_sales || 0) > (top?.total_sales || 0) ? acc : top, null
            );

            setAnalytics({
                totalRevenue,
                totalOrders,
                averageOrderValue,
                topAccount
            });
        } catch (error) {
            console.error('Error loading analytics:', error);
            toast.error('Error cargando analytics');
        } finally {
            setLoading(false);
        }
    };

    const MetricCard = ({ title, value, icon: Icon, color = 'primary' }) => (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                        <Typography color="textSecondary" gutterBottom variant="h6">
                            {title}
                        </Typography>
                        <Typography variant="h4" component="div" color={`${color}.main`} fontWeight="bold">
                            {value}
                        </Typography>
                    </Box>
                    <Icon sx={{ fontSize: 40, color: `${color}.light` }} />
                </Box>
            </CardContent>
        </Card>
    );

    if (!isAuthenticated) {
        return (
            <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h5" gutterBottom>
                    Acceso no autorizado
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Por favor inicia sesión para acceder a analytics
                </Typography>
            </Box>
        );
    }

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ flexGrow: 1 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                    📊 Analytics
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Análisis detallado de rendimiento de cuentas
                </Typography>
            </Box>

            {/* Métricas principales */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricCard
                        title="Ingresos Totales"
                        value={`$${analytics.totalRevenue.toLocaleString()}`}
                        icon={MoneyIcon}
                        color="success"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricCard
                        title="Órdenes Totales"
                        value={analytics.totalOrders.toLocaleString()}
                        icon={OrdersIcon}
                        color="primary"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricCard
                        title="Valor Promedio"
                        value={`$${analytics.averageOrderValue.toFixed(2)}`}
                        icon={TrendingUpIcon}
                        color="warning"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricCard
                        title="Cuentas Activas"
                        value={accounts.filter(acc => acc.is_active).length}
                        icon={ReportIcon}
                        color="info"
                    />
                </Grid>
            </Grid>

            {/* Cuenta destacada */}
            {analytics.topAccount && (
                <Card sx={{ mb: 4 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            🏆 Cuenta con Mejor Rendimiento
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="body1">
                                    <strong>Vendedor:</strong> {analytics.topAccount.ml_first_name} {analytics.topAccount.ml_last_name}
                                </Typography>
                                <Typography variant="body1">
                                    <strong>Usuario:</strong> @{analytics.topAccount.ml_nickname}
                                </Typography>
                                <Typography variant="body1">
                                    <strong>Ventas:</strong> ${(analytics.topAccount.total_sales || 0).toLocaleString()}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="body1">
                                    <strong>Órdenes:</strong> {analytics.topAccount.total_orders || 0}
                                </Typography>
                                <Typography variant="body1">
                                    <strong>País:</strong> {analytics.topAccount.ml_country_id || 'N/A'}
                                </Typography>
                                <Chip
                                    label={analytics.topAccount.is_active ? 'Activa' : 'Inactiva'}
                                    color={analytics.topAccount.is_active ? 'success' : 'default'}
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            )}

            {/* Tabla detallada */}
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        📋 Detalle por Cuenta
                    </Typography>
                    {accounts.length > 0 ? (
                        <TableContainer component={Paper} sx={{ mt: 2 }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell><strong>Vendedor</strong></TableCell>
                                        <TableCell><strong>Usuario</strong></TableCell>
                                        <TableCell align="right"><strong>Ventas</strong></TableCell>
                                        <TableCell align="right"><strong>Órdenes</strong></TableCell>
                                        <TableCell align="center"><strong>Estado</strong></TableCell>
                                        <TableCell><strong>País</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {accounts.map((account) => (
                                        <TableRow key={account.id} hover>
                                            <TableCell>
                                                {account.ml_first_name} {account.ml_last_name}
                                            </TableCell>
                                            <TableCell>@{account.ml_nickname}</TableCell>
                                            <TableCell align="right">
                                                ${(account.total_sales || 0).toLocaleString()}
                                            </TableCell>
                                            <TableCell align="right">
                                                {account.total_orders || 0}
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    label={account.is_active ? 'Activa' : 'Inactiva'}
                                                    color={account.is_active ? 'success' : 'default'}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>{account.ml_country_id || 'N/A'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Alert severity="info" sx={{ mt: 2 }}>
                            No hay datos de cuentas disponibles para mostrar analytics
                        </Alert>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

export default AnalyticsPage;

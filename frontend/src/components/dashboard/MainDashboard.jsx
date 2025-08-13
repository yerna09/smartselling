import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    Alert,
    Avatar,
    Paper,
    Chip
} from '@mui/material';
import {
    AccountBox as AccountIcon,
    TrendingUp as TrendingUpIcon,
    Store as StoreIcon,
    Analytics as AnalyticsIcon,
    Add as AddIcon
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { API_URL, apiRequest } from '../../config/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const MainDashboard = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        totalAccounts: 0,
        activeAccounts: 0,
        totalSales: 0,
        totalOrders: 0
    });

    useEffect(() => {
        if (isAuthenticated) {
            loadDashboardData();
        }
    }, [isAuthenticated]);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const data = await apiRequest('/ml-accounts');
            setAccounts(data.accounts || []);
            
            // Calcular estadísticas
            const totalAccounts = data.accounts?.length || 0;
            const activeAccounts = data.accounts?.filter(acc => acc.is_active).length || 0;
            const totalSales = data.accounts?.reduce((sum, acc) => sum + (acc.total_sales || 0), 0) || 0;
            const totalOrders = data.accounts?.reduce((sum, acc) => sum + (acc.total_orders || 0), 0) || 0;
            
            setStats({
                totalAccounts,
                activeAccounts,
                totalSales,
                totalOrders
            });
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            toast.error('Error cargando datos del dashboard');
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, icon: Icon, color = 'primary', onClick }) => (
        <Card 
            sx={{ 
                height: '100%', 
                cursor: onClick ? 'pointer' : 'default',
                '&:hover': onClick ? { transform: 'translateY(-2px)', boxShadow: 3 } : {},
                transition: 'all 0.2s ease-in-out'
            }}
            onClick={onClick}
        >
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
                    <Avatar sx={{ bgcolor: `${color}.light`, width: 56, height: 56 }}>
                        <Icon sx={{ fontSize: 28 }} />
                    </Avatar>
                </Box>
            </CardContent>
        </Card>
    );

    const QuickActionCard = ({ title, description, icon: Icon, color, onClick }) => (
        <Card 
            sx={{ 
                height: '100%', 
                cursor: 'pointer',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 },
                transition: 'all 0.2s ease-in-out'
            }}
            onClick={onClick}
        >
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Avatar sx={{ bgcolor: `${color}.light`, width: 64, height: 64, mx: 'auto', mb: 2 }}>
                    <Icon sx={{ fontSize: 32 }} />
                </Avatar>
                <Typography variant="h6" component="div" gutterBottom>
                    {title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {description}
                </Typography>
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
                    Por favor inicia sesión para acceder al dashboard
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ flexGrow: 1 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                    🚀 Dashboard SmartSelling
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Gestión multicuenta de MercadoLibre - Resumen general
                </Typography>
            </Box>

            {/* Estadísticas principales */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Cuentas Totales"
                        value={stats.totalAccounts}
                        icon={AccountIcon}
                        color="primary"
                        onClick={() => navigate('/accounts')}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Cuentas Activas"
                        value={stats.activeAccounts}
                        icon={TrendingUpIcon}
                        color="success"
                        onClick={() => navigate('/accounts')}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Ventas Totales"
                        value={`$${stats.totalSales.toLocaleString()}`}
                        icon={StoreIcon}
                        color="warning"
                        onClick={() => navigate('/analytics')}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Órdenes Totales"
                        value={stats.totalOrders.toLocaleString()}
                        icon={AnalyticsIcon}
                        color="info"
                        onClick={() => navigate('/analytics')}
                    />
                </Grid>
            </Grid>

            {/* Acciones rápidas */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
                    Acciones Rápidas
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={4}>
                        <QuickActionCard
                            title="Vincular Cuenta ML"
                            description="Conecta una nueva cuenta de MercadoLibre"
                            icon={AddIcon}
                            color="primary"
                            onClick={() => navigate('/accounts')}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <QuickActionCard
                            title="Ver Cuentas"
                            description="Administra tus cuentas vinculadas"
                            icon={AccountIcon}
                            color="info"
                            onClick={() => navigate('/accounts')}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <QuickActionCard
                            title="Analytics"
                            description="Revisa métricas y estadísticas"
                            icon={AnalyticsIcon}
                            color="success"
                            onClick={() => navigate('/analytics')}
                        />
                    </Grid>
                </Grid>
            </Box>

            {/* Resumen de cuentas */}
            {accounts.length > 0 && (
                <Box>
                    <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
                        Cuentas Recientes
                    </Typography>
                    <Grid container spacing={2}>
                        {accounts.slice(0, 3).map((account) => (
                            <Grid item xs={12} md={4} key={account.id}>
                                <Card>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                            <Avatar>
                                                <AccountIcon />
                                            </Avatar>
                                            <Box>
                                                <Typography variant="h6">
                                                    {account.ml_first_name} {account.ml_last_name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    @{account.ml_nickname}
                                                </Typography>
                                            </Box>
                                            <Chip
                                                label={account.is_active ? 'Activa' : 'Inactiva'}
                                                color={account.is_active ? 'success' : 'default'}
                                                size="small"
                                            />
                                        </Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Ventas: ${(account.total_sales || 0).toLocaleString()}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Órdenes: {account.total_orders || 0}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}

            {/* Estado sin cuentas */}
            {accounts.length === 0 && !loading && (
                <Alert severity="info" sx={{ mt: 4 }}>
                    <Typography variant="h6" gutterBottom>
                        ¡Bienvenido a SmartSelling!
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        No tienes cuentas de MercadoLibre vinculadas. Comienza vinculando tu primera cuenta.
                    </Typography>
                    <Button 
                        variant="contained" 
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/accounts')}
                    >
                        Vincular Primera Cuenta
                    </Button>
                </Alert>
            )}
        </Box>
    );
};

export default MainDashboard;

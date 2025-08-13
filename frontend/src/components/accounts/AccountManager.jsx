import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Grid,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Switch,
    FormControlLabel,
    Alert,
    Tabs,
    Tab,
    Paper,
    Divider,
    List,
    ListItem,
    ListItemText,
    LinearProgress,
    Avatar
} from '@mui/material';
import {
    Add as AddIcon,
    Refresh as RefreshIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    AccountBox as AccountIcon,
    Person as PersonIcon,
    Business as BusinessIcon,
    Star as StarIcon,
    Security as SecurityIcon,
    Link as LinkIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    LocationOn as LocationIcon,
    CreditCard as CreditCardIcon,
    TrendingUp as TrendingUpIcon,
    CheckCircle as CheckIcon,
    Cancel as CancelIcon
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { API_URL, apiRequest } from '../../config/api';
import toast from 'react-hot-toast';

const AccountManager = () => {
    const { user, isAuthenticated } = useAuth();
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editDialog, setEditDialog] = useState({ open: false, account: null });
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [activeTab, setActiveTab] = useState(0);
    const [detailDialog, setDetailDialog] = useState({ open: false, account: null });

    useEffect(() => {
        if (isAuthenticated) {
            loadAccounts();
        }
    }, [isAuthenticated]);

    const loadAccounts = async () => {
        setLoading(true);
        try {
            const data = await apiRequest('/ml-accounts');
            setAccounts(data.accounts || []);
        } catch (error) {
            console.error('Error loading accounts:', error);
            toast.error('Error cargando cuentas');
        } finally {
            setLoading(false);
        }
    };

    const handleAddAccount = () => {
        // Redirigir a la autorización de ML usando la URL correcta
        window.location.href = `${API_URL}/mercadolibre/auth`;
    };

    const handleEditAccount = (account) => {
        setEditDialog({ open: true, account: { ...account } });
    };

    const handleSaveAccount = async () => {
        try {
            await apiRequest(`/ml-accounts/${editDialog.account.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    account_alias: editDialog.account.account_alias,
                    is_active: editDialog.account.is_active
                })
            });

            toast.success('Cuenta actualizada exitosamente');
            setEditDialog({ open: false, account: null });
            loadAccounts();
        } catch (error) {
            console.error('Error saving account:', error);
            toast.error('Error guardando cuenta');
        }
    };

    const handleDeleteAccount = async (accountId) => {
        if (!confirm('¿Estás seguro de que deseas eliminar esta cuenta?')) {
            return;
        }

        try {
            await apiRequest(`/ml-accounts/${accountId}`, {
                method: 'DELETE'
            });

            toast.success('Cuenta eliminada exitosamente');
            loadAccounts();
        } catch (error) {
            console.error('Error deleting account:', error);
            toast.error('Error eliminando cuenta');
        }
    };

    const handleRefreshMetrics = async (accountId) => {
        try {
            await apiRequest(`/ml-accounts/${accountId}/refresh-metrics`, {
                method: 'POST'
            });

            toast.success('Métricas actualizadas');
            loadAccounts();
        } catch (error) {
            console.error('Error refreshing metrics:', error);
            toast.error('Error actualizando métricas');
        }
    };

    const handleViewDetails = (account) => {
        setDetailDialog({ open: true, account });
    };

    // Componente para mostrar badges de estado
    const StatusBadge = ({ status, label }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Box
                sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: status ? 'success.main' : 'error.main'
                }}
            />
            <Typography variant="body2" color="text.secondary">
                {label}
            </Typography>
            <Chip
                size="small"
                label={status ? 'Activo' : 'Inactivo'}
                color={status ? 'success' : 'error'}
                variant="outlined"
            />
        </Box>
    );

    // Componente para tarjetas de información
    const InfoCard = ({ icon: Icon, title, children, color = 'primary' }) => (
        <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Avatar sx={{ bgcolor: `${color}.light`, width: 32, height: 32 }}>
                    <Icon sx={{ fontSize: 18 }} />
                </Avatar>
                <Typography variant="h6" component="h3">
                    {title}
                </Typography>
            </Box>
            {children}
        </Paper>
    );

    // Componente para mostrar métricas
    const StatCard = ({ label, value, color = 'primary', trend }) => (
        <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
                {label}
            </Typography>
            <Typography variant="h4" color={`${color}.main`} fontWeight="bold">
                {value}
            </Typography>
            {trend && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                    <TrendingUpIcon sx={{ fontSize: 16, mr: 0.5 }} />
                    <Typography variant="caption" color={trend > 0 ? 'success.main' : 'error.main'}>
                        {trend}%
                    </Typography>
                </Box>
            )}
        </Paper>
    );

    // Si el usuario no está autenticado, mostrar mensaje de login
    if (!isAuthenticated) {
        return (
            <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                minHeight: '100vh',
                p: 3,
                textAlign: 'center'
            }}>
                <PersonIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Acceso Requerido
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
                    Necesitas iniciar sesión para acceder a la gestión de cuentas de MercadoLibre
                </Typography>
                <Button 
                    variant="contained" 
                    size="large"
                    onClick={() => window.location.href = '/'}
                    sx={{ borderRadius: 2, px: 4 }}
                >
                    Ir al Login
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3, minHeight: '100vh', bgcolor: 'grey.50' }}>
            {/* Header Principal */}
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box>
                        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                            🚀 SmartSelling - Gestión de Cuentas ML
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Administra tus cuentas de Mercado Libre vinculadas
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<AddIcon />}
                        onClick={handleAddAccount}
                        sx={{ borderRadius: 2, px: 3 }}
                    >
                        Vincular Nueva Cuenta
                    </Button>
                </Box>

                {accounts.length === 0 && !loading ? (
                    <Alert severity="info" sx={{ mb: 3 }}>
                        No tienes cuentas de Mercado Libre vinculadas. Haz clic en "Vincular Nueva Cuenta" para comenzar.
                    </Alert>
                ) : null}
            </Box>

            {/* Grid de Cuentas */}
            <Grid container spacing={3}>
                {accounts.map((account) => (
                    <Grid item xs={12} lg={6} xl={4} key={account.id}>
                        <Card sx={{ height: '100%', position: 'relative' }}>
                            {/* Header de la tarjeta con gradient */}
                            <Box
                                sx={{
                                    background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                                    color: 'white',
                                    p: 3,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2
                                }}
                            >
                                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                                    <PersonIcon sx={{ fontSize: 28 }} />
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="h6" fontWeight="bold">
                                        {account.ml_first_name} {account.ml_last_name}
                                    </Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                        @{account.ml_nickname}
                                    </Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                        ID: {account.ml_user_id}
                                    </Typography>
                                </Box>
                                <Chip 
                                    label={account.is_active ? 'Activa' : 'Inactiva'} 
                                    color={account.is_active ? 'success' : 'default'}
                                    size="small"
                                    sx={{ bgcolor: account.is_active ? 'success.light' : 'grey.300' }}
                                />
                            </Box>

                            <CardContent sx={{ p: 3 }}>
                                {/* Información básica */}
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        INFORMACIÓN BÁSICA
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                        <Typography variant="body2">
                                            {account.ml_email || 'No disponible'}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                        <Typography variant="body2">
                                            {account.ml_phone ? `+${account.ml_country_code || '54'} ${account.ml_phone}` : 'No disponible'}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                        <Typography variant="body2">
                                            {account.ml_country_id} - {account.ml_site_id}
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Métricas rápidas */}
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        MÉTRICAS
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={4}>
                                            <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'success.lighter', borderRadius: 1 }}>
                                                <Typography variant="h6" color="success.main" fontWeight="bold">
                                                    ${(account.total_sales || 0).toLocaleString()}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Ventas
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'info.lighter', borderRadius: 1 }}>
                                                <Typography variant="h6" color="info.main" fontWeight="bold">
                                                    {account.total_orders || 0}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Órdenes
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'warning.lighter', borderRadius: 1 }}>
                                                <Typography variant="h6" color="warning.main" fontWeight="bold">
                                                    {account.active_listings || 0}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Publicaciones
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Box>

                                {/* Botones de acción */}
                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between' }}>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<PersonIcon />}
                                        onClick={() => handleViewDetails(account)}
                                        sx={{ flex: 1 }}
                                    >
                                        Ver Detalles
                                    </Button>
                                    <IconButton 
                                        size="small" 
                                        onClick={() => handleRefreshMetrics(account.id)}
                                        title="Actualizar métricas"
                                        color="primary"
                                    >
                                        <RefreshIcon />
                                    </IconButton>
                                    <IconButton 
                                        size="small" 
                                        onClick={() => handleEditAccount(account)}
                                        title="Editar cuenta"
                                        color="info"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton 
                                        size="small" 
                                        onClick={() => handleDeleteAccount(account.id)}
                                        title="Eliminar cuenta"
                                        color="error"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Dialog para ver detalles completos */}
            <Dialog 
                open={detailDialog.open} 
                onClose={() => setDetailDialog({ open: false, account: null })}
                maxWidth="lg" 
                fullWidth
                PaperProps={{ sx: { height: '90vh' } }}
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <PersonIcon />
                        <Box>
                            <Typography variant="h6">
                                {detailDialog.account?.ml_first_name} {detailDialog.account?.ml_last_name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                @{detailDialog.account?.ml_nickname} • ID: {detailDialog.account?.ml_user_id}
                            </Typography>
                        </Box>
                        <Box sx={{ ml: 'auto' }}>
                            <Chip 
                                label="✅ ML Vinculado" 
                                color="success" 
                                size="small"
                                sx={{ mr: 1 }}
                            />
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<EditIcon />}
                                onClick={() => {
                                    setDetailDialog({ open: false, account: null });
                                    handleEditAccount(detailDialog.account);
                                }}
                            >
                                Editar Perfil
                            </Button>
                        </Box>
                    </Box>
                </DialogTitle>
                
                <DialogContent sx={{ p: 0 }}>
                    <Tabs 
                        value={activeTab} 
                        onChange={(e, newValue) => setActiveTab(newValue)}
                        sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}
                    >
                        <Tab icon={<PersonIcon />} label="Personal" />
                        <Tab icon={<BusinessIcon />} label="Comercial" />
                        <Tab icon={<StarIcon />} label="Reputación" />
                        <Tab icon={<SecurityIcon />} label="Estado" />
                        <Tab icon={<LinkIcon />} label="Integración" />
                    </Tabs>

                    <Box sx={{ p: 3 }}>
                        {/* Tab Personal */}
                        {activeTab === 0 && detailDialog.account && (
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={8}>
                                    <InfoCard icon={PersonIcon} title="Información Personal">
                                        <Grid container spacing={2}>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" color="text.secondary">Nombre</Typography>
                                                <Typography variant="body1" fontWeight="medium">
                                                    {detailDialog.account.ml_first_name}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" color="text.secondary">Apellido</Typography>
                                                <Typography variant="body1" fontWeight="medium">
                                                    {detailDialog.account.ml_last_name}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" color="text.secondary">Nickname</Typography>
                                                <Typography variant="body1" fontWeight="medium">
                                                    @{detailDialog.account.ml_nickname}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" color="text.secondary">Fecha de registro</Typography>
                                                <Typography variant="body1" fontWeight="medium">
                                                    {detailDialog.account.ml_registration_date ? 
                                                        new Date(detailDialog.account.ml_registration_date).toLocaleDateString('es-AR') 
                                                        : 'No disponible'
                                                    }
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Typography variant="caption" color="text.secondary">Enlace de perfil</Typography>
                                                <Typography 
                                                    variant="body2" 
                                                    sx={{ 
                                                        color: 'primary.main', 
                                                        textDecoration: 'underline',
                                                        cursor: 'pointer',
                                                        wordBreak: 'break-all'
                                                    }}
                                                    onClick={() => detailDialog.account.ml_permalink && window.open(detailDialog.account.ml_permalink, '_blank')}
                                                >
                                                    {detailDialog.account.ml_permalink || 'No disponible'}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </InfoCard>
                                </Grid>
                                
                                <Grid item xs={12} md={4}>
                                    <InfoCard icon={EmailIcon} title="Contacto" color="info">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, bgcolor: 'grey.50', borderRadius: 1, mb: 2 }}>
                                            <EmailIcon sx={{ color: 'text.secondary' }} />
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">Email</Typography>
                                                <Typography variant="body2" fontWeight="medium">
                                                    {detailDialog.account.ml_email || 'No disponible'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, bgcolor: 'grey.50', borderRadius: 1, mb: 2 }}>
                                            <PhoneIcon sx={{ color: 'text.secondary' }} />
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="caption" color="text.secondary">Teléfono</Typography>
                                                <Typography variant="body2" fontWeight="medium">
                                                    +{detailDialog.account.ml_country_code || '54'} {detailDialog.account.ml_phone || 'No disponible'}
                                                </Typography>
                                                <Typography variant="caption" color={detailDialog.account.ml_phone_verified ? 'success.main' : 'error.main'}>
                                                    {detailDialog.account.ml_phone_verified ? '✓ Verificado' : '⚠ No verificado'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        
                                        {detailDialog.account.ml_secure_email && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, bgcolor: 'primary.lighter', borderRadius: 1, mb: 2 }}>
                                                <EmailIcon sx={{ color: 'primary.main' }} />
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">Email seguro ML</Typography>
                                                    <Typography variant="body2" fontWeight="medium" sx={{ fontSize: '0.875rem' }}>
                                                        {detailDialog.account.ml_secure_email}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        )}
                                        
                                        {(detailDialog.account.ml_address_street || detailDialog.account.ml_address_city) && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                                                <LocationIcon sx={{ color: 'text.secondary' }} />
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">Dirección</Typography>
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {detailDialog.account.ml_address_street}, {detailDialog.account.ml_address_city}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {detailDialog.account.ml_address_state} - {detailDialog.account.ml_address_zip}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        )}
                                    </InfoCard>
                                </Grid>
                            </Grid>
                        )}

                        {/* Tab Comercial */}
                        {activeTab === 1 && detailDialog.account && (
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={8}>
                                    <InfoCard icon={BusinessIcon} title="Información Comercial" color="success">
                                        <Grid container spacing={2}>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" color="text.secondary">Nombre de la Marca</Typography>
                                                <Typography variant="body1" fontWeight="medium">
                                                    {detailDialog.account.ml_brand_name || 'No disponible'}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" color="text.secondary">Razón Social</Typography>
                                                <Typography variant="body1" fontWeight="medium">
                                                    {detailDialog.account.ml_corporate_name || 'No disponible'}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Typography variant="caption" color="text.secondary">Identificación Fiscal</Typography>
                                                <Typography variant="body1" fontWeight="medium">
                                                    {detailDialog.account.ml_identification_type}: {detailDialog.account.ml_identification_number || 'No disponible'}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </InfoCard>
                                </Grid>
                                
                                <Grid item xs={12} md={4}>
                                    <InfoCard icon={CreditCardIcon} title="Información Crediticia" color="warning">
                                        <Box sx={{ textAlign: 'center', py: 2 }}>
                                            <Avatar sx={{ bgcolor: 'success.light', width: 48, height: 48, mx: 'auto', mb: 2 }}>
                                                <CreditCardIcon />
                                            </Avatar>
                                            <Typography variant="h6" fontWeight="bold">
                                                Nivel: {detailDialog.account.ml_credit_level_id || 'N/A'}
                                            </Typography>
                                            <Typography variant="body2" color="success.main" sx={{ textTransform: 'capitalize', mb: 1 }}>
                                                Rango: {detailDialog.account.ml_credit_rank || 'N/A'}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Crédito consumido: ${detailDialog.account.ml_credit_consumed || 0}
                                            </Typography>
                                        </Box>
                                    </InfoCard>
                                </Grid>
                            </Grid>
                        )}

                        {/* Tab Reputación */}
                        {activeTab === 2 && detailDialog.account && (
                            <Box>
                                <Grid container spacing={3} sx={{ mb: 3 }}>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <StatCard 
                                            label="Transacciones Totales" 
                                            value={detailDialog.account.ml_total_transactions || 0} 
                                            color="primary" 
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <StatCard 
                                            label="Completadas" 
                                            value={detailDialog.account.ml_completed_transactions || 0} 
                                            color="success" 
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <StatCard 
                                            label="Canceladas" 
                                            value={detailDialog.account.ml_canceled_transactions || 0} 
                                            color="error" 
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <StatCard 
                                            label="Calificaciones +" 
                                            value={detailDialog.account.ml_positive_ratings || 0} 
                                            color="success" 
                                        />
                                    </Grid>
                                </Grid>

                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <InfoCard icon={StarIcon} title="Reputación como Vendedor" color="warning">
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, bgcolor: 'warning.lighter', borderRadius: 1, mb: 2 }}>
                                                <Typography variant="body2" fontWeight="medium">Experiencia</Typography>
                                                <Chip
                                                    label={detailDialog.account.ml_seller_experience || 'NEWBIE'}
                                                    color="warning"
                                                    size="small"
                                                />
                                            </Box>
                                            <Box sx={{ space: 1 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                    <Typography variant="body2" color="text.secondary">Tasa de Cancelación</Typography>
                                                    <Typography variant="body1" fontWeight="medium" color="error.main">
                                                        {detailDialog.account.ml_cancellation_rate || 0}%
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                    <Typography variant="body2" color="text.secondary">Tasa de Reclamos</Typography>
                                                    <Typography variant="body1" fontWeight="medium" color="error.main">
                                                        {detailDialog.account.ml_claims_rate || 0}%
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography variant="body2" color="text.secondary">Retraso en Manejo</Typography>
                                                    <Typography variant="body1" fontWeight="medium" color="success.main">
                                                        {detailDialog.account.ml_delayed_handling_rate || 0}%
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </InfoCard>
                                    </Grid>
                                    
                                    <Grid item xs={12} md={6}>
                                        <InfoCard icon={TrendingUpIcon} title="Análisis de Rendimiento" color="info">
                                            <Box sx={{ textAlign: 'center', mb: 3 }}>
                                                <Typography variant="h5" fontWeight="bold" color="warning.main" gutterBottom>
                                                    {detailDialog.account.ml_seller_experience || 'Principiante'}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Power Seller: {detailDialog.account.ml_power_seller_status || 'No alcanzado'}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ space: 1 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                    <Typography variant="body2">Ventas completadas (365 días)</Typography>
                                                    <Typography variant="body1" fontWeight="medium">
                                                        {detailDialog.account.ml_completed_sales || 0}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography variant="body2">Puntos de reputación</Typography>
                                                    <Typography variant="body1" fontWeight="medium">
                                                        {detailDialog.account.ml_points || 0}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </InfoCard>
                                    </Grid>
                                </Grid>

                                <Box sx={{ mt: 3 }}>
                                    <InfoCard icon={StarIcon} title="Calificaciones Detalladas" color="secondary">
                                        <Grid container spacing={2}>
                                            <Grid item xs={4}>
                                                <Box sx={{ p: 2, bgcolor: 'success.lighter', borderRadius: 1, textAlign: 'center' }}>
                                                    <Typography variant="h4" fontWeight="bold" color="success.main">
                                                        {detailDialog.account.ml_positive_ratings || 0}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">Positivas</Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1, textAlign: 'center' }}>
                                                    <Typography variant="h4" fontWeight="bold" color="text.secondary">
                                                        {detailDialog.account.ml_neutral_ratings || 0}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">Neutrales</Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <Box sx={{ p: 2, bgcolor: 'error.lighter', borderRadius: 1, textAlign: 'center' }}>
                                                    <Typography variant="h4" fontWeight="bold" color="error.main">
                                                        {detailDialog.account.ml_negative_ratings || 0}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">Negativas</Typography>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </InfoCard>
                                </Box>
                            </Box>
                        )}

                        {/* Tab Estado */}
                        {activeTab === 3 && detailDialog.account && (
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={8}>
                                    <InfoCard icon={SecurityIcon} title="Estado de la Cuenta" color="info">
                                        <Box sx={{ space: 2 }}>
                                            <StatusBadge status={detailDialog.account.ml_site_status === 'active'} label="Estado del Sitio" />
                                            <StatusBadge status={detailDialog.account.ml_email_confirmed} label="Email Confirmado" />
                                            <StatusBadge status={detailDialog.account.ml_buy_allowed} label="Compras Habilitadas" />
                                            <StatusBadge status={detailDialog.account.ml_sell_allowed} label="Ventas Habilitadas" />
                                            <StatusBadge status={detailDialog.account.ml_billing_allowed} label="Facturación Habilitada" />
                                            <StatusBadge status={detailDialog.account.ml_mercadopago_tc_accepted} label="MercadoPago TyC Aceptados" />
                                        </Box>
                                    </InfoCard>
                                </Grid>
                                
                                <Grid item xs={12} md={4}>
                                    <InfoCard icon={CheckIcon} title="Servicios MercadoLibre" color="success">
                                        <Box sx={{ space: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                <CheckIcon sx={{ fontSize: 16, color: 'success.main' }} />
                                                <Typography variant="body2">Comprar: Habilitado</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                <CheckIcon sx={{ fontSize: 16, color: 'success.main' }} />
                                                <Typography variant="body2">Vender: Habilitado</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                                <CancelIcon sx={{ fontSize: 16, color: 'error.main' }} />
                                                <Typography variant="body2">
                                                    MercadoEnvíos: {detailDialog.account.ml_mercadoenvios || 'not_accepted'}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ p: 2, bgcolor: 'primary.lighter', borderRadius: 1, mb: 2 }}>
                                                <Typography variant="caption" color="text.secondary">Tipo de cuenta MP</Typography>
                                                <Typography variant="body1" fontWeight="medium" color="primary.main" sx={{ textTransform: 'capitalize' }}>
                                                    {detailDialog.account.ml_mercadopago_account_type || 'personal'}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                                                <Typography variant="caption" color="text.secondary">Tipo de usuario</Typography>
                                                <Typography variant="body1" fontWeight="medium" sx={{ textTransform: 'capitalize' }}>
                                                    {detailDialog.account.ml_user_type?.replace('_', ' ') || 'simple registration'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </InfoCard>
                                </Grid>
                            </Grid>
                        )}

                        {/* Tab Integración */}
                        {activeTab === 4 && detailDialog.account && (
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={8}>
                                    <InfoCard icon={LinkIcon} title="Integración SmartSelling" color="primary">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3, bgcolor: 'success.lighter', borderRadius: 1, border: '1px solid', borderColor: 'success.light', mb: 3 }}>
                                            <Box sx={{ width: 12, height: 12, bgcolor: 'success.main', borderRadius: '50%' }} />
                                            <Box>
                                                <Typography variant="subtitle1" fontWeight="medium" color="success.dark">
                                                    Estado de Integración
                                                </Typography>
                                                <Typography variant="body2" color="success.main">
                                                    ✅ Conectado exitosamente con MercadoLibre
                                                </Typography>
                                            </Box>
                                        </Box>
                                        
                                        <Grid container spacing={2}>
                                            <Grid item xs={6}>
                                                <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                                                    <Typography variant="caption" color="text.secondary">País/Sitio</Typography>
                                                    <Typography variant="body1" fontWeight="medium">
                                                        {detailDialog.account.ml_country_id} - {detailDialog.account.ml_site_id}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                                                    <Typography variant="caption" color="text.secondary">Dispositivo</Typography>
                                                    <Typography variant="body1" fontWeight="medium" sx={{ textTransform: 'capitalize' }}>
                                                        {detailDialog.account.ml_context_device || 'web-mobile'}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                                                    <Typography variant="caption" color="text.secondary">IP de conexión</Typography>
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {detailDialog.account.ml_context_ip || 'No disponible'}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                                                    <Typography variant="caption" color="text.secondary">Fuente</Typography>
                                                    <Typography variant="body1" fontWeight="medium" sx={{ textTransform: 'capitalize' }}>
                                                        {detailDialog.account.ml_context_source || 'buflo'}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        </Grid>

                                        {detailDialog.account.ml_tags && (
                                            <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 3, mt: 3 }}>
                                                <Typography variant="subtitle2" color="text.primary" gutterBottom>
                                                    Tags del perfil:
                                                </Typography>
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                    {JSON.parse(detailDialog.account.ml_tags || '[]').map((tag, index) => (
                                                        <Chip 
                                                            key={index} 
                                                            label={tag.replace('_', ' ')} 
                                                            size="small" 
                                                            color="primary" 
                                                            variant="outlined"
                                                        />
                                                    ))}
                                                </Box>
                                            </Box>
                                        )}
                                    </InfoCard>
                                </Grid>
                                
                                <Grid item xs={12} md={4}>
                                    <InfoCard icon={PersonIcon} title="Acciones Rápidas" color="secondary">
                                        <Box sx={{ space: 2 }}>
                                            <Button 
                                                fullWidth 
                                                variant="contained" 
                                                color="primary" 
                                                sx={{ mb: 1, justifyContent: 'flex-start' }}
                                                startIcon={<TrendingUpIcon />}
                                            >
                                                📊 Obtener Datos ML
                                            </Button>
                                            <Button 
                                                fullWidth 
                                                variant="contained" 
                                                color="success" 
                                                sx={{ mb: 1, justifyContent: 'flex-start' }}
                                                startIcon={<RefreshIcon />}
                                            >
                                                🔄 Renovar Token ML
                                            </Button>
                                            <Button 
                                                fullWidth 
                                                variant="contained" 
                                                color="info" 
                                                sx={{ mb: 1, justifyContent: 'flex-start' }}
                                                startIcon={<RefreshIcon />}
                                            >
                                                📱 Sincronizar Datos
                                            </Button>
                                            <Button 
                                                fullWidth 
                                                variant="contained" 
                                                color="error" 
                                                sx={{ justifyContent: 'flex-start' }}
                                                startIcon={<CancelIcon />}
                                            >
                                                🚪 Cerrar Sesión
                                            </Button>
                                        </Box>
                                    </InfoCard>
                                </Grid>
                            </Grid>
                        )}
                    </Box>
                </DialogContent>
                
                <DialogActions sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
                    <Button onClick={() => setDetailDialog({ open: false, account: null })}>
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog para editar cuenta */}
            <Dialog 
                open={editDialog.open} 
                onClose={() => setEditDialog({ open: false, account: null })}
                maxWidth="sm" 
                fullWidth
            >
                <DialogTitle>Editar Cuenta</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <TextField
                        fullWidth
                        label="Alias de la cuenta"
                        value={editDialog.account?.account_alias || ''}
                        onChange={(e) => setEditDialog({
                            ...editDialog,
                            account: { ...editDialog.account, account_alias: e.target.value }
                        })}
                        sx={{ mb: 2 }}
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={editDialog.account?.is_active || false}
                                onChange={(e) => setEditDialog({
                                    ...editDialog,
                                    account: { ...editDialog.account, is_active: e.target.checked }
                                })}
                            />
                        }
                        label="Cuenta activa"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialog({ open: false, account: null })}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSaveAccount} variant="contained">
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AccountManager;

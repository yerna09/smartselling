import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Switch,
    FormControlLabel,
    Divider,
    Alert,
    Avatar,
    Paper,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemSecondaryAction
} from '@mui/material';
import {
    Person as PersonIcon,
    Security as SecurityIcon,
    Notifications as NotificationsIcon,
    Storage as DatabaseIcon,
    Code as ApiIcon,
    Save as SaveIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { apiRequest } from '../../config/api';
import toast from 'react-hot-toast';

const SettingsPage = () => {
    const { user, isAuthenticated } = useAuth();
    const [settings, setSettings] = useState({
        notifications: {
            email: true,
            push: false,
            newOrders: true,
            lowStock: false
        },
        api: {
            autoRefresh: true,
            refreshInterval: 30,
            debug: false
        },
        display: {
            darkMode: false,
            compactView: false,
            showAdvanced: false
        }
    });
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        company: ''
    });

    useEffect(() => {
        if (isAuthenticated && user) {
            setProfile({
                name: user.username || '',
                email: user.email || '',
                company: user.company || ''
            });
            loadSettings();
        }
    }, [isAuthenticated, user]);

    const loadSettings = async () => {
        try {
            // En una implementación real, cargarías las configuraciones desde el backend
            // const data = await apiRequest('/user/settings');
            // setSettings(data.settings);
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    };

    const handleSettingChange = (category, setting, value) => {
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [setting]: value
            }
        }));
    };

    const handleProfileChange = (field, value) => {
        setProfile(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const saveSettings = async () => {
        setLoading(true);
        try {
            // En una implementación real, guardarías en el backend
            // await apiRequest('/user/settings', 'PUT', { settings, profile });
            
            // Simulamos guardado
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('Configuración guardada correctamente');
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Error guardando configuración');
        } finally {
            setLoading(false);
        }
    };

    const resetSettings = () => {
        setSettings({
            notifications: {
                email: true,
                push: false,
                newOrders: true,
                lowStock: false
            },
            api: {
                autoRefresh: true,
                refreshInterval: 30,
                debug: false
            },
            display: {
                darkMode: false,
                compactView: false,
                showAdvanced: false
            }
        });
        toast.success('Configuración restablecida');
    };

    const SettingSection = ({ title, icon: Icon, children }) => (
        <Card sx={{ mb: 3 }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Icon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" component="h3">
                        {title}
                    </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                {children}
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
                    Por favor inicia sesión para acceder a configuración
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ flexGrow: 1 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                    ⚙️ Configuración
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Personaliza tu experiencia en SmartSelling
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {/* Perfil del usuario */}
                <Grid item xs={12} md={6}>
                    <SettingSection title="Perfil de Usuario" icon={PersonIcon}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <Avatar sx={{ width: 64, height: 64, mr: 2 }}>
                                <PersonIcon />
                            </Avatar>
                            <Box>
                                <Typography variant="h6">{profile.name || 'Usuario'}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {profile.email || 'Sin email'}
                                </Typography>
                            </Box>
                        </Box>
                        
                        <TextField
                            fullWidth
                            label="Nombre"
                            value={profile.name}
                            onChange={(e) => handleProfileChange('name', e.target.value)}
                            sx={{ mb: 2 }}
                        />
                        
                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            value={profile.email}
                            onChange={(e) => handleProfileChange('email', e.target.value)}
                            sx={{ mb: 2 }}
                        />
                        
                        <TextField
                            fullWidth
                            label="Empresa"
                            value={profile.company}
                            onChange={(e) => handleProfileChange('company', e.target.value)}
                        />
                    </SettingSection>

                    {/* Configuración de API */}
                    <SettingSection title="Configuración de API" icon={ApiIcon}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={settings.api.autoRefresh}
                                    onChange={(e) => handleSettingChange('api', 'autoRefresh', e.target.checked)}
                                />
                            }
                            label="Auto-actualizar datos"
                        />
                        
                        <TextField
                            fullWidth
                            label="Intervalo de actualización (minutos)"
                            type="number"
                            value={settings.api.refreshInterval}
                            onChange={(e) => handleSettingChange('api', 'refreshInterval', parseInt(e.target.value))}
                            sx={{ mt: 2, mb: 2 }}
                            InputProps={{ inputProps: { min: 5, max: 120 } }}
                        />
                        
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={settings.api.debug}
                                    onChange={(e) => handleSettingChange('api', 'debug', e.target.checked)}
                                />
                            }
                            label="Modo debug (logs detallados)"
                        />
                    </SettingSection>
                </Grid>

                {/* Notificaciones */}
                <Grid item xs={12} md={6}>
                    <SettingSection title="Notificaciones" icon={NotificationsIcon}>
                        <List>
                            <ListItem>
                                <ListItemIcon>
                                    <NotificationsIcon />
                                </ListItemIcon>
                                <ListItemText primary="Notificaciones por email" />
                                <ListItemSecondaryAction>
                                    <Switch
                                        checked={settings.notifications.email}
                                        onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>
                            
                            <ListItem>
                                <ListItemIcon>
                                    <NotificationsIcon />
                                </ListItemIcon>
                                <ListItemText primary="Notificaciones push" />
                                <ListItemSecondaryAction>
                                    <Switch
                                        checked={settings.notifications.push}
                                        onChange={(e) => handleSettingChange('notifications', 'push', e.target.checked)}
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>
                            
                            <ListItem>
                                <ListItemIcon>
                                    <NotificationsIcon />
                                </ListItemIcon>
                                <ListItemText primary="Nuevas órdenes" />
                                <ListItemSecondaryAction>
                                    <Switch
                                        checked={settings.notifications.newOrders}
                                        onChange={(e) => handleSettingChange('notifications', 'newOrders', e.target.checked)}
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>
                            
                            <ListItem>
                                <ListItemIcon>
                                    <NotificationsIcon />
                                </ListItemIcon>
                                <ListItemText primary="Stock bajo" />
                                <ListItemSecondaryAction>
                                    <Switch
                                        checked={settings.notifications.lowStock}
                                        onChange={(e) => handleSettingChange('notifications', 'lowStock', e.target.checked)}
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>
                        </List>
                    </SettingSection>

                    {/* Interfaz */}
                    <SettingSection title="Configuración de Interfaz" icon={DatabaseIcon}>
                        <List>
                            <ListItem>
                                <ListItemIcon>
                                    <DatabaseIcon />
                                </ListItemIcon>
                                <ListItemText primary="Modo oscuro" />
                                <ListItemSecondaryAction>
                                    <Switch
                                        checked={settings.display.darkMode}
                                        onChange={(e) => handleSettingChange('display', 'darkMode', e.target.checked)}
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>
                            
                            <ListItem>
                                <ListItemIcon>
                                    <DatabaseIcon />
                                </ListItemIcon>
                                <ListItemText primary="Vista compacta" />
                                <ListItemSecondaryAction>
                                    <Switch
                                        checked={settings.display.compactView}
                                        onChange={(e) => handleSettingChange('display', 'compactView', e.target.checked)}
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>
                            
                            <ListItem>
                                <ListItemIcon>
                                    <DatabaseIcon />
                                </ListItemIcon>
                                <ListItemText primary="Mostrar opciones avanzadas" />
                                <ListItemSecondaryAction>
                                    <Switch
                                        checked={settings.display.showAdvanced}
                                        onChange={(e) => handleSettingChange('display', 'showAdvanced', e.target.checked)}
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>
                        </List>
                    </SettingSection>
                </Grid>
            </Grid>

            {/* Botones de acción */}
            <Paper sx={{ p: 3, mt: 3, backgroundColor: 'grey.50' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Alert severity="info" sx={{ flex: 1, mr: 2 }}>
                        Los cambios se guardan automáticamente en el servidor
                    </Alert>
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="outlined"
                            startIcon={<RefreshIcon />}
                            onClick={resetSettings}
                            disabled={loading}
                        >
                            Restablecer
                        </Button>
                        
                        <Button
                            variant="contained"
                            startIcon={<SaveIcon />}
                            onClick={saveSettings}
                            disabled={loading}
                        >
                            {loading ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};

export default SettingsPage;

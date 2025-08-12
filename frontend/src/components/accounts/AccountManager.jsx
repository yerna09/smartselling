import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Grid,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Switch,
    FormControlLabel,
    Alert
} from '@mui/material';
import {
    Add as AddIcon,
    Refresh as RefreshIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    AccountBox as AccountIcon
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const AccountManager = () => {
    const { user } = useAuth();
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editDialog, setEditDialog] = useState({ open: false, account: null });

    useEffect(() => {
        loadAccounts();
    }, []);

    const loadAccounts = async () => {
        setLoading(true);
        try {
            const response = await fetch('/ml-accounts', {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setAccounts(data.accounts || []);
            } else {
                toast.error('Error cargando cuentas');
            }
        } catch (error) {
            console.error('Error loading accounts:', error);
            toast.error('Error conectando con el servidor');
        } finally {
            setLoading(false);
        }
    };

    const handleAddAccount = () => {
        // Redirigir a la autorización de ML
        window.location.href = '/mercadolibre/auth';
    };

    const handleEditAccount = (account) => {
        setEditDialog({ open: true, account: { ...account } });
    };

    const handleSaveAccount = async () => {
        try {
            const response = await fetch(`/ml-accounts/${editDialog.account.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    account_alias: editDialog.account.account_alias,
                    is_active: editDialog.account.is_active
                })
            });

            if (response.ok) {
                toast.success('Cuenta actualizada exitosamente');
                setEditDialog({ open: false, account: null });
                loadAccounts();
            } else {
                toast.error('Error actualizando cuenta');
            }
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
            const response = await fetch(`/ml-accounts/${accountId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                toast.success('Cuenta eliminada exitosamente');
                loadAccounts();
            } else {
                toast.error('Error eliminando cuenta');
            }
        } catch (error) {
            console.error('Error deleting account:', error);
            toast.error('Error eliminando cuenta');
        }
    };

    const handleRefreshMetrics = async (accountId) => {
        try {
            const response = await fetch(`/ml-accounts/${accountId}/refresh-metrics`, {
                method: 'POST',
                credentials: 'include'
            });

            if (response.ok) {
                toast.success('Métricas actualizadas');
                loadAccounts();
            } else {
                toast.error('Error actualizando métricas');
            }
        } catch (error) {
            console.error('Error refreshing metrics:', error);
            toast.error('Error actualizando métricas');
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" component="h1">
                    <AccountIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Gestión de Cuentas ML
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddAccount}
                    sx={{ borderRadius: 2 }}
                >
                    Agregar Cuenta
                </Button>
            </Box>

            {accounts.length === 0 && !loading ? (
                <Alert severity="info" sx={{ mb: 3 }}>
                    No tienes cuentas de Mercado Libre vinculadas. Haz clic en "Agregar Cuenta" para comenzar.
                </Alert>
            ) : null}

            <Grid container spacing={3}>
                {accounts.map((account) => (
                    <Grid item xs={12} md={6} lg={4} key={account.id}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                    <Typography variant="h6" component="div">
                                        {account.account_alias || account.ml_nickname}
                                    </Typography>
                                    <Chip 
                                        label={account.is_active ? 'Activa' : 'Inactiva'} 
                                        color={account.is_active ? 'success' : 'default'}
                                        size="small"
                                    />
                                </Box>

                                <Typography color="text.secondary" gutterBottom>
                                    @{account.ml_nickname} • ID: {account.ml_user_id}
                                </Typography>

                                <Typography variant="body2" sx={{ mb: 2 }}>
                                    {account.ml_first_name} {account.ml_last_name}
                                </Typography>

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Ventas: ${account.total_sales?.toLocaleString() || '0'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Órdenes: {account.total_orders || 0}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Publicaciones: {account.active_listings || 0}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <IconButton 
                                        size="small" 
                                        onClick={() => handleRefreshMetrics(account.id)}
                                        title="Actualizar métricas"
                                    >
                                        <RefreshIcon />
                                    </IconButton>
                                    <IconButton 
                                        size="small" 
                                        onClick={() => handleEditAccount(account)}
                                        title="Editar cuenta"
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

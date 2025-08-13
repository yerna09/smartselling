import React, { useEffect, useState } from 'react';
import { 
    Box, 
    Typography, 
    CircularProgress, 
    Alert,
    Paper,
    Card,
    CardContent 
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API_URL } from '../../config/api';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const Loading = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { checkAuthStatus } = useAuth();
    const [status, setStatus] = useState('processing');
    const [message, setMessage] = useState('Procesando autorización de Mercado Libre...');

    useEffect(() => {
        const processMLCallback = async () => {
            try {
                const code = searchParams.get('code');
                const error = searchParams.get('error');

                if (error) {
                    setStatus('error');
                    setMessage(`Error de autorización: ${error}`);
                    return;
                }

                if (!code) {
                    setStatus('error');
                    setMessage('No se recibió código de autorización de Mercado Libre');
                    return;
                }

                setMessage('Intercambiando código por tokens...');

                // Enviar código al backend para procesar
                const response = await fetch(`${API_URL}/mercadolibre/callback?code=${code}`, {
                    method: 'GET',
                    credentials: 'include'
                });

                if (response.ok) {
                    const data = await response.json();
                    setStatus('success');
                    setMessage('¡Cuenta de Mercado Libre vinculada exitosamente!');
                    
                    // Actualizar estado de autenticación
                    await checkAuthStatus();
                    
                    toast.success('Cuenta ML vinculada correctamente');
                    
                    // Redirigir al dashboard después de 2 segundos
                    setTimeout(() => {
                        navigate('/accounts');
                    }, 2000);
                } else {
                    const errorData = await response.json();
                    setStatus('error');
                    setMessage(errorData.message || 'Error procesando la autorización');
                }
            } catch (error) {
                console.error('Error processing ML callback:', error);
                setStatus('error');
                setMessage('Error de conexión al procesar la autorización');
            }
        };

        processMLCallback();
    }, [searchParams, navigate, checkAuthStatus]);

    const getStatusColor = () => {
        switch (status) {
            case 'processing': return 'info';
            case 'success': return 'success';
            case 'error': return 'error';
            default: return 'info';
        }
    };

    return (
        <Box 
            sx={{ 
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2
            }}
        >
            <Card sx={{ maxWidth: 500, width: '100%', textAlign: 'center' }}>
                <CardContent sx={{ p: 4 }}>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h4" component="h1" gutterBottom>
                            SmartSelling
                        </Typography>
                        <Typography variant="h6" color="text.secondary">
                            Procesando autorización
                        </Typography>
                    </Box>

                    {status === 'processing' && (
                        <Box sx={{ mb: 3 }}>
                            <CircularProgress size={60} />
                        </Box>
                    )}

                    <Alert severity={getStatusColor()} sx={{ mb: 3 }}>
                        {message}
                    </Alert>

                    {status === 'success' && (
                        <Typography variant="body2" color="text.secondary">
                            Serás redirigido al panel de cuentas en unos segundos...
                        </Typography>
                    )}

                    {status === 'error' && (
                        <Typography variant="body2" color="text.secondary">
                            Por favor, intenta vincular tu cuenta nuevamente desde el panel de cuentas.
                        </Typography>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

export default Loading;

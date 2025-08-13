import React from 'react';
import { Box, Card, Typography, Button } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { API_URL } from '../../config/api';

const DebugPanel = () => {
    const { user, isAuthenticated, loading } = useAuth();

    const testAPI = async () => {
        try {
            const response = await fetch(`${API_URL}/health`, {
                credentials: 'include'
            });
            const data = await response.json();
            console.log('🏥 Health check result:', data);
        } catch (error) {
            console.error('🚨 Health check failed:', error);
        }
    };

    const testMLAuth = async () => {
        try {
            const response = await fetch(`${API_URL}/mercadolibre/auth`, {
                credentials: 'include'
            });
            const data = await response.json();
            console.log('🛍️ ML Auth URL:', data);
        } catch (error) {
            console.error('🚨 ML Auth failed:', error);
        }
    };

    if (process.env.NODE_ENV === 'production') {
        return null; // No mostrar en producción
    }

    return (
        <Card sx={{ p: 2, mb: 2, backgroundColor: '#f0f0f0' }}>
            <Typography variant="h6" gutterBottom>
                🔧 Panel de Debug
            </Typography>
            
            <Box sx={{ mb: 2 }}>
                <Typography variant="body2">
                    <strong>API URL:</strong> {API_URL}
                </Typography>
                <Typography variant="body2">
                    <strong>Authenticated:</strong> {isAuthenticated ? '✅' : '❌'}
                </Typography>
                <Typography variant="body2">
                    <strong>Loading:</strong> {loading ? '⏳' : '✅'}
                </Typography>
                <Typography variant="body2">
                    <strong>User:</strong> {user ? user.username : 'null'}
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" onClick={testAPI}>
                    Test API Health
                </Button>
                <Button size="small" onClick={testMLAuth}>
                    Test ML Auth
                </Button>
            </Box>
        </Card>
    );
};

export default DebugPanel;

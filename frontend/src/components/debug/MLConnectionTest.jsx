import React, { useState } from 'react';
import { 
    Box, 
    Card, 
    CardContent, 
    Typography, 
    Button, 
    Alert,
    List,
    ListItem,
    ListItemText,
    CircularProgress
} from '@mui/material';
import { API_URL } from '../../config/api';
import toast from 'react-hot-toast';

const MLConnectionTest = () => {
    const [testing, setTesting] = useState(false);
    const [results, setResults] = useState([]);

    const addResult = (test, status, message) => {
        setResults(prev => [...prev, { test, status, message, timestamp: new Date() }]);
    };

    const runTests = async () => {
        setTesting(true);
        setResults([]);
        
        try {
            // Test 1: Health Check
            addResult('Health Check', 'loading', 'Verificando estado del servidor...');
            try {
                const healthResponse = await fetch(`${API_URL}/health`, {
                    credentials: 'include'
                });
                
                if (healthResponse.ok) {
                    const healthData = await healthResponse.json();
                    addResult('Health Check', 'success', `Servidor funcionando: ${healthData.status}`);
                } else {
                    addResult('Health Check', 'error', `Error: ${healthResponse.status}`);
                }
            } catch (error) {
                addResult('Health Check', 'error', `Error de conexión: ${error.message}`);
            }

            // Test 2: ML Auth URL
            addResult('ML Auth URL', 'loading', 'Obteniendo URL de autorización ML...');
            try {
                const authResponse = await fetch(`${API_URL}/mercadolibre/auth`, {
                    credentials: 'include'
                });
                
                if (authResponse.ok) {
                    const authData = await authResponse.json();
                    addResult('ML Auth URL', 'success', `URL generada: ${authData.auth_url?.substring(0, 50)}...`);
                } else {
                    addResult('ML Auth URL', 'error', `Error: ${authResponse.status}`);
                }
            } catch (error) {
                addResult('ML Auth URL', 'error', `Error: ${error.message}`);
            }

            // Test 3: ML Accounts
            addResult('ML Accounts', 'loading', 'Verificando cuentas ML vinculadas...');
            try {
                const accountsResponse = await fetch(`${API_URL}/ml-accounts`, {
                    credentials: 'include'
                });
                
                if (accountsResponse.ok) {
                    const accountsData = await accountsResponse.json();
                    addResult('ML Accounts', 'success', `${accountsData.accounts?.length || 0} cuentas encontradas`);
                } else {
                    addResult('ML Accounts', 'error', `Error: ${accountsResponse.status}`);
                }
            } catch (error) {
                addResult('ML Accounts', 'error', `Error: ${error.message}`);
            }

        } finally {
            setTesting(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'success': return 'success';
            case 'error': return 'error';
            case 'loading': return 'info';
            default: return 'default';
        }
    };

    return (
        <Card sx={{ mb: 3 }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    🛍️ Test de Conexión Mercado Libre
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                    <Button 
                        variant="contained" 
                        onClick={runTests}
                        disabled={testing}
                        startIcon={testing ? <CircularProgress size={20} /> : null}
                    >
                        {testing ? 'Ejecutando Tests...' : 'Ejecutar Tests de ML'}
                    </Button>
                </Box>

                {results.length > 0 && (
                    <List>
                        {results.map((result, index) => (
                            <ListItem key={index}>
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography variant="subtitle2">
                                                {result.test}
                                            </Typography>
                                            <Alert 
                                                severity={getStatusColor(result.status)} 
                                                sx={{ py: 0, px: 1 }}
                                            >
                                                {result.status === 'loading' ? '⏳' : 
                                                 result.status === 'success' ? '✅' : '❌'}
                                            </Alert>
                                        </Box>
                                    }
                                    secondary={result.message}
                                />
                            </ListItem>
                        ))}
                    </List>
                )}
            </CardContent>
        </Card>
    );
};

export default MLConnectionTest;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Alert,
    Container
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const LoginForm = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await login(formData.username, formData.password);
            toast.success('Inicio de sesión exitoso');
            
            // Redirección automática al dashboard
            setTimeout(() => {
                navigate('/dashboard');
            }, 500);
            
        } catch (error) {
            setError(error.message || 'Error al iniciar sesión');
            toast.error('Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h4" sx={{ mb: 4 }}>
                    SmartSelling
                </Typography>
                <Card sx={{ width: '100%', maxWidth: 400 }}>
                    <CardContent sx={{ p: 4 }}>
                        <Typography component="h2" variant="h5" align="center" sx={{ mb: 3 }}>
                            Iniciar Sesión
                        </Typography>
                        
                        {error && (
                            <Alert severity="error" sx={{ mb: 3 }}>
                                {error}
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="username"
                                label="Usuario"
                                value={formData.username}
                                onChange={handleChange}
                                autoFocus
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Contraseña"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                disabled={loading}
                                sx={{ mt: 3, mb: 2 }}
                            >
                                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </Box>
        </Container>
    );
};

export default LoginForm;

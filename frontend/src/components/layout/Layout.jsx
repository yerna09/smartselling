import React from 'react';
import {
    Box,
    AppBar,
    Toolbar,
    Typography,
    Button,
    Container,
    IconButton
} from '@mui/material';
import {
    Logout as LogoutIcon,
    AccountBox as AccountIcon
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const Layout = ({ children }) => {
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
            toast.success('Sesión cerrada exitosamente');
        } catch (error) {
            toast.error('Error cerrando sesión');
        }
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
                <Toolbar>
                    <AccountIcon sx={{ mr: 2 }} />
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        SmartSelling - Dashboard Multicuenta
                    </Typography>
                    {user && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ mr: 2 }}>
                                Hola, {user.username}
                            </Typography>
                            <IconButton color="inherit" onClick={handleLogout}>
                                <LogoutIcon />
                            </IconButton>
                        </Box>
                    )}
                </Toolbar>
            </AppBar>
            <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                {children}
            </Container>
        </Box>
    );
};

export default Layout;

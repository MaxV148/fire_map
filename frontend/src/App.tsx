import './App.css'
import "leaflet/dist/leaflet.css";
import { useState, useEffect } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme, Box } from '@mui/material';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import authService from './services/authService';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    useEffect(() => {
        // Check if user is authenticated using the authService
        const authenticated = authService.isAuthenticated();
        setIsAuthenticated(authenticated);
        
        // Set up redirect callback for when token expires or user is inactive
        authService.setRedirectCallback(() => {
            setIsAuthenticated(false);
        });
        
        // Start the idle timer if user is authenticated
        if (authenticated) {
            authService.startIdleTimer();
        }
        
        // Clean up event listeners when component unmounts
        return () => {
            authService.stopIdleTimer();
        };
    }, []);

    const handleLogout = () => {
        authService.logout();
        setIsAuthenticated(false);
    };

    const theme = createTheme({
        palette: {
            primary: {
                main: '#1976d2',
            },
            secondary: {
                main: '#dc004e',
            },
        },
        components: {
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        width: '100%',
                        boxSizing: 'border-box',
                    },
                },
            },
        },
    });

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                minHeight: '100vh',
                width: '100%',
                margin: 0,
                padding: 0,
                boxSizing: 'border-box'
            }}>
                {isAuthenticated ? (
                    <DashboardPage onLogout={handleLogout} />
                ) : (
                    <LoginPage />
                )}
            </Box>
        </ThemeProvider>
    )
}

export default App

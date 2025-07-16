import React, { useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Container,
    Box,
    Paper,
    Stack,
    Divider,
    Button,
    Card,
    CardContent,
    Alert,
    Snackbar,
    CircularProgress
} from '@mui/material';
import Grid from '@mui/material/Grid'; // Import Grid separately to ensure correct typing
import {
    Apartment as ApartmentIcon,
    Code as CodeIcon,
    Security as SecurityIcon,
    Speed as SpeedIcon,
    CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { checkServerHealth } from './services/api';

function App() {
    const [healthStatus, setHealthStatus] = useState<{ status?: string; message?: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const handleHealthCheck = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await checkServerHealth();
            setHealthStatus(response);
            setSnackbarOpen(true);
        } catch (err) {
            setError("Failed to connect to the server. Make sure it's running.");
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    const features = [
        {
            title: 'Monorepo Structure',
            description: 'Organized codebase with modular architecture for better development experience',
            icon: <ApartmentIcon sx={{ fontSize: 40 }} color="primary" />
        },
        {
            title: 'TypeScript Ready',
            description: 'Full TypeScript support for both frontend and backend components',
            icon: <CodeIcon sx={{ fontSize: 40 }} color="primary" />
        },
        {
            title: 'Secure by Default',
            description: 'Best security practices implemented across the entire stack',
            icon: <SecurityIcon sx={{ fontSize: 40 }} color="primary" />
        },
        {
            title: 'Performance Optimized',
            description: 'Built with performance in mind to deliver exceptional user experience',
            icon: <SpeedIcon sx={{ fontSize: 40 }} color="primary" />
        }
    ];

    return (
        <>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        investor-iq
                    </Typography>
                    <Button
                        color="inherit"
                        onClick={handleHealthCheck}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
                        disabled={loading}
                    >
                        Check Server
                    </Button>
                    <Button color="inherit">Documentation</Button>
                    <Button color="inherit">GitHub</Button>
                </Toolbar>
            </AppBar>

            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={error ? "error" : "success"}
                    sx={{ width: '100%' }}
                >
                    {error || (healthStatus && `Server status: ${healthStatus.status} - ${healthStatus.message}`)}
                </Alert>
            </Snackbar>

            <Box
                sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    py: 8,
                    textAlign: 'center'
                }}
            >
                <Container maxWidth="md">
                    <Typography variant="h2" component="h1" gutterBottom>
                        Welcome to investor-iq
                    </Typography>
                    <Typography variant="h5" sx={{ mb: 4 }}>
                        A modern, flexible monorepo template for multi-language projects
                    </Typography>
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={2}
                        justifyContent="center"
                    >
                        <Button
                            variant="contained"
                            color="secondary"
                            size="large"
                            sx={{ px: 4, py: 1 }}
                        >
                            Get Started
                        </Button>
                        <Button
                            variant="outlined"
                            color="inherit"
                            size="large"
                            sx={{ px: 4, py: 1 }}
                        >
                            Learn More
                        </Button>
                    </Stack>
                </Container>
            </Box>

            <Container sx={{ py: 8 }}>
                <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
                    Key Features
                </Typography>
                <Box sx={{ flexGrow: 1, mt: 2 }}>
                    <Grid container spacing={4}>
                        {features.map((feature, index) => (
                            <Grid key={index} sx={{ width: { xs: '100%', sm: '50%' }, padding: 2 }}>
                                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Box display="flex" justifyContent="center" mb={2}>
                                            {feature.icon}
                                        </Box>
                                        <Typography gutterBottom variant="h5" component="h3" textAlign="center">
                                            {feature.title}
                                        </Typography>
                                        <Typography textAlign="center">
                                            {feature.description}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Container>

            {healthStatus && (
                <Container sx={{ mb: 4 }}>
                    <Card variant="outlined">
                        <CardContent>
                            <Box display="flex" alignItems="center" gap={2}>
                                <CheckCircleIcon color="success" />
                                <Typography variant="h6">
                                    Server Connection: {healthStatus.status}
                                </Typography>
                            </Box>
                            <Typography color="text.secondary" sx={{ mt: 1 }}>
                                {healthStatus.message}
                            </Typography>
                        </CardContent>
                    </Card>
                </Container>
            )}

            <Box sx={{ bgcolor: '#f5f5f5', py: 6 }}>
                <Container>
                    <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
                        Project Structure
                    </Typography>
                    <Paper sx={{ p: 3, mt: 4 }}>
                        <pre style={{ overflowX: 'auto', margin: 0 }}>
                            {`investor-iq/
├── package.json         # Root package.json for workspace management
├── packages/            # All packages live here
│   ├── client/          # React TypeScript client (@investor-iq/client)
│   └── server/          # NestJS TypeScript server (@investor-iq/server)
│       └── src/         # Server source code
│           ├── app.module.ts          
│           └── modules/               
└── README.md`}
                        </pre>
                    </Paper>
                </Container>
            </Box>

            <Container sx={{ py: 8 }}>
                <Box sx={{ flexGrow: 1 }}>
                    <Grid container spacing={3} alignItems="center">
                        <Grid sx={{ width: { xs: '100%', md: '50%' }, padding: 2 }}>
                            <Typography variant="h3" component="h2" gutterBottom>
                                Ready to Build?
                            </Typography>
                            <Typography paragraph>
                                investor-iq provides a solid foundation for building modern web applications
                                with a well-structured monorepo setup, TypeScript integration, and best practices
                                already configured.
                            </Typography>
                            <Button variant="contained" color="primary" size="large">
                                Start Your Project
                            </Button>
                        </Grid>
                        <Grid sx={{ width: { xs: '100%', md: '50%' }, padding: 2 }}>
                            <Box sx={{ maxWidth: '100%', overflow: 'hidden' }}>
                                <pre style={{
                                    backgroundColor: '#282c34',
                                    color: '#abb2bf',
                                    padding: '16px',
                                    borderRadius: '8px',
                                    overflowX: 'auto'
                                }}>
                                    {`$ npx create-investor-iq my-project
$ cd my-project
$ npm install
$ npm run dev

🚀 Server running on port 5000
✅ Client started successfully`}
                                </pre>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Container>

            <Divider />

            <Box component="footer" sx={{ bgcolor: 'background.paper', py: 6 }}>
                <Container>
                    <Typography variant="body2" color="text.secondary" align="center">
                        © {new Date().getFullYear()} investor-iq. All rights reserved.
                    </Typography>
                </Container>
            </Box>
        </>
    );
}

export default App;

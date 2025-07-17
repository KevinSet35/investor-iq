'use client';

import React from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Button,
    Stack,
    Card,
    CardContent,
    Chip,
} from '@mui/material';
import {
    TrendingUp,
    Assessment,
    Security,
    Speed,
} from '@mui/icons-material';
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import Homepage from "./components/HomePage";

// Types
interface LandingFeature {
    icon: React.ReactElement<{ sx?: React.CSSProperties | object }>;
    title: string;
    description: string;
}

// Constants
const LANDING_FEATURES: LandingFeature[] = [
    {
        icon: <TrendingUp sx={{ fontSize: 40 }} />,
        title: 'Smart Analytics',
        description: 'Advanced market analysis powered by AI',
    },
    {
        icon: <Assessment sx={{ fontSize: 40 }} />,
        title: 'Portfolio Insights',
        description: 'Real-time portfolio performance tracking',
    },
    {
        icon: <Security sx={{ fontSize: 40 }} />,
        title: 'Secure Trading',
        description: 'Bank-level security for your investments',
    },
    {
        icon: <Speed sx={{ fontSize: 40 }} />,
        title: 'Lightning Fast',
        description: 'Execute trades in milliseconds',
    },
] as const;

// Components
const HeroSection: React.FC = () => (
    <>
        <Typography
            variant="h2"
            sx={{
                color: 'white',
                fontWeight: 'bold',
                mb: 2,
                fontSize: { xs: '2.5rem', md: '3.5rem' }
            }}
        >
            Investor IQ
        </Typography>
        <Typography
            variant="h5"
            sx={{
                color: 'rgba(255,255,255,0.9)',
                mb: 1,
                fontWeight: 300,
            }}
        >
            Smart Investment Decisions Start Here
        </Typography>
        <Typography
            variant="body1"
            sx={{
                color: 'rgba(255,255,255,0.8)',
                mb: 4,
                maxWidth: '600px',
                mx: 'auto',
            }}
        >
            Harness the power of artificial intelligence to make informed investment decisions.
            Track your portfolio, analyze market trends, and maximize your returns.
        </Typography>
    </>
);

const AuthenticationCard: React.FC = () => (
    <Paper
        elevation={3}
        sx={{
            p: 4,
            maxWidth: '400px',
            mx: 'auto',
            mb: 6,
            borderRadius: 3,
        }}
    >
        <Typography
            variant="h6"
            sx={{ mb: 3, fontWeight: 'bold', color: 'text.primary' }}
        >
            Get Started Today
        </Typography>
        <Stack spacing={2}>
            <SignUpButton mode="modal">
                <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    sx={{
                        py: 1.5,
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                        '&:hover': {
                            background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
                        }
                    }}
                >
                    Start Free Trial
                </Button>
            </SignUpButton>
            <SignInButton mode="modal">
                <Button
                    variant="outlined"
                    size="large"
                    fullWidth
                    sx={{
                        py: 1.5,
                        fontSize: '1rem',
                        borderColor: '#667eea',
                        color: '#667eea',
                        '&:hover': {
                            borderColor: '#5a6fd8',
                            backgroundColor: 'rgba(102, 126, 234, 0.04)',
                        }
                    }}
                >
                    Sign In
                </Button>
            </SignInButton>
        </Stack>
        <Box sx={{ mt: 2 }}>
            <Chip
                label="No Credit Card Required"
                color="success"
                size="small"
                variant="outlined"
            />
        </Box>
    </Paper>
);

const LandingFeatureCard: React.FC<{ feature: LandingFeature }> = ({ feature }) => (
    <Card
        sx={{
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)' }
        }}
    >
        <CardContent sx={{ textAlign: 'center', py: 3 }}>
            <Box sx={{ color: 'white', mb: 2 }}>
                {feature.icon}
            </Box>
            <Typography
                variant="h6"
                sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}
            >
                {feature.title}
            </Typography>
            <Typography
                variant="body2"
                sx={{ color: 'rgba(255,255,255,0.8)' }}
            >
                {feature.description}
            </Typography>
        </CardContent>
    </Card>
);

const FeaturesGrid: React.FC = () => (
    <Box
        sx={{
            display: 'grid',
            gridTemplateColumns: {
                xs: '1fr',
                sm: '1fr 1fr',
                md: '1fr 1fr 1fr 1fr'
            },
            gap: 3
        }}
    >
        {LANDING_FEATURES.map((feature, index) => (
            <LandingFeatureCard
                key={`landing-feature-${index}`}
                feature={feature}
            />
        ))}
    </Box>
);

const LandingPageContent: React.FC = () => (
    <Box
        sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            py: 4,
        }}
    >
        <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center', mb: 6 }}>
                <HeroSection />
                <AuthenticationCard />
                <FeaturesGrid />
            </Box>
        </Container>
    </Box>
);

// Main Component
export default function Home() {
    return (
        <>
            <SignedOut>
                <LandingPageContent />
            </SignedOut>

            <SignedIn>
                <Homepage />
            </SignedIn>
        </>
    );
}
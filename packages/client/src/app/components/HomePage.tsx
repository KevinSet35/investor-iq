'use client';

import React from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Grid,
    Card,
    CardContent,
    Button,
    Avatar,
    Chip,
} from '@mui/material';
import {
    TrendingUp,
    Assessment,
    AccountBalance,
    Notifications,
} from '@mui/icons-material';
import { useUser } from '@clerk/nextjs';
import type { UserResource } from '@clerk/types';

// Types
interface Feature {
    icon: React.ReactElement<{ sx?: React.CSSProperties | object }>;
    title: string;
    description: string;
}

interface StatCardData {
    value: string;
    label: string;
    chipLabel: string;
    chipColor: 'success' | 'info' | 'warning' | 'primary' | 'secondary' | 'error' | 'default';
}

// Better typed user prop
interface WelcomeHeaderProps {
    user: UserResource | null | undefined;
}

interface StatCardProps {
    stat: StatCardData;
}

interface FeatureCardProps {
    feature: Feature;
}

// Constants
const FEATURES: Feature[] = [
    {
        icon: <TrendingUp sx={{ fontSize: 40 }} />,
        title: 'Market Analysis',
        description: 'Real-time market insights and analysis',
    },
    {
        icon: <Assessment sx={{ fontSize: 40 }} />,
        title: 'Portfolio Tracking',
        description: 'Monitor your investment performance',
    },
    {
        icon: <AccountBalance sx={{ fontSize: 40 }} />,
        title: 'Financial Reports',
        description: 'Comprehensive financial reporting',
    },
    {
        icon: <Notifications sx={{ fontSize: 40 }} />,
        title: 'Smart Alerts',
        description: 'Get notified of important market changes',
    },
] as const;

const STATS: StatCardData[] = [
    {
        value: '$24.5K',
        label: 'Portfolio Value',
        chipLabel: '+12.3%',
        chipColor: 'success',
    },
    {
        value: '15',
        label: 'Active Positions',
        chipLabel: 'Diversified',
        chipColor: 'info',
    },
    {
        value: '+8.7%',
        label: 'Monthly Return',
        chipLabel: 'Outperforming',
        chipColor: 'success',
    },
    {
        value: '3',
        label: 'New Alerts',
        chipLabel: 'Review',
        chipColor: 'warning',
    },
] as const;

// Components
const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({ user }) => (
    <Paper elevation={2} sx={{ p: 3, mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ width: 60, height: 60 }}>
                {user?.firstName?.charAt(0) || 'U'}
            </Avatar>
            <Box>
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                    Welcome back, {user?.firstName || 'User'}!
                </Typography>
                <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Ready to explore your investment opportunities?
                </Typography>
            </Box>
        </Box>
    </Paper>
);

const StatCard: React.FC<StatCardProps> = ({ stat }) => (
    <Card sx={{ textAlign: 'center', p: 2 }}>
        <CardContent>
            <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                {stat.value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {stat.label}
            </Typography>
            <Chip
                label={stat.chipLabel}
                color={stat.chipColor}
                size="small"
                sx={{ mt: 1 }}
            />
        </CardContent>
    </Card>
);

const QuickStats: React.FC = () => (
    <Grid container spacing={3} sx={{ mb: 4 }}>
        {STATS.map((stat, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={`stat-${index}`}>
                <StatCard stat={stat} />
            </Grid>
        ))}
    </Grid>
);

const FeatureCard: React.FC<FeatureCardProps> = ({ feature }) => (
    <Card
        sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)' }
        }}
    >
        <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
            <Box sx={{ color: 'primary.main', mb: 2 }}>
                {feature.icon}
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                {feature.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {feature.description}
            </Typography>
        </CardContent>
    </Card>
);

const FeaturesSection: React.FC = () => (
    <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
            Explore Features
        </Typography>
        <Grid container spacing={3}>
            {FEATURES.map((feature, index) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={`feature-${index}`}>
                    <FeatureCard feature={feature} />
                </Grid>
            ))}
        </Grid>
    </Box>
);

const ActionButtons: React.FC = () => (
    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button variant="contained" size="large" sx={{ px: 4 }}>
            View Portfolio
        </Button>
        <Button variant="outlined" size="large" sx={{ px: 4 }}>
            Market Research
        </Button>
        <Button variant="outlined" size="large" sx={{ px: 4 }}>
            Settings
        </Button>
    </Box>
);

// Main Component
const Homepage: React.FC = () => {
    const { user } = useUser();

    return (
        <Container maxWidth="lg">
            <Box sx={{ py: 4 }}>
                <WelcomeHeader user={user} />
                <QuickStats />
                <FeaturesSection />
                <ActionButtons />
            </Box>
        </Container>
    );
};

export default Homepage;
import { CircularProgress } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface RequireAuthenticationProps {
    isAuthenticationLoading: boolean;
    isAuthenticated: boolean;
    children: React.ReactNode;
}

export const RequireAuthentication: React.FC<RequireAuthenticationProps> = (
    props: RequireAuthenticationProps,
) => {
    const { isAuthenticationLoading, isAuthenticated, children } = props;
    const navigate = useNavigate();

    if (isAuthenticationLoading) {
        return <CircularProgress />;
    }

    if (!isAuthenticated) {
        navigate('/');
    }

    return <>{children}</>;
};

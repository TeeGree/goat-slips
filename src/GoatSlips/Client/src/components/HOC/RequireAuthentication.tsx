import { CircularProgress } from '@mui/material';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface RequireAuthenticationProps {
    isAuthenticationLoading: boolean;
    isAccessRightsLoading: boolean;
    isAuthenticated: boolean;
    children: React.ReactNode;
    accessRights: Set<string>;
    requiredAccessRight?: string;
    overrideAccessRightAndAllowAccess?: boolean;
}

export const RequireAuthentication: React.FC<RequireAuthenticationProps> = (
    props: RequireAuthenticationProps,
) => {
    const {
        isAuthenticationLoading,
        isAccessRightsLoading,
        isAuthenticated,
        children,
        accessRights,
        requiredAccessRight,
        overrideAccessRightAndAllowAccess,
    } = props;
    const navigate = useNavigate();

    useEffect(() => {
        if (
            (!isAuthenticationLoading && !isAuthenticated) ||
            (!isAccessRightsLoading &&
                requiredAccessRight !== undefined &&
                !accessRights.has(requiredAccessRight) &&
                !overrideAccessRightAndAllowAccess)
        ) {
            navigate('/');
        }
    }, [
        isAuthenticationLoading,
        requiredAccessRight,
        accessRights,
        overrideAccessRightAndAllowAccess,
    ]);

    if (isAuthenticationLoading || isAccessRightsLoading) {
        return <CircularProgress />;
    }

    return <>{children}</>;
};

import React, { useEffect, useState } from 'react';
import classes from './App.module.scss';
import { WeekView } from './components/WeekView';
import { Login } from './components/Login';
import { Navigate, Route, Routes } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import { fetchGet } from './helpers/fetchFunctions';
import { CreateFirstUser } from './components/CreateUser/CreateFirstUser';
import { AppHeader } from './components/AppHeader';
import { CreateAdditionalUser } from './components/CreateUser/CreateAdditionalUser';
import { ChangePassword } from './components/ChangePassword';

export const App: React.FC<{}> = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAuthenticationLoading, setIsAuthenticationLoading] = useState(true);

    const [anyUsers, setAnyUsers] = useState(false);
    const [isAnyUsersLoading, setAnyUsersLoading] = useState(true);

    const checkIfAuthenticated = async () => {
        setIsAuthenticationLoading(true);
        const result = await fetchGet<boolean>('User/IsAuthenticated');

        setIsAuthenticated(result);
        setIsAuthenticationLoading(false);
    };

    const checkIfAnyUsers = async () => {
        setAnyUsersLoading(true);
        const result = await fetchGet<boolean>('User/AnyUsers');

        setAnyUsers(result);
        setAnyUsersLoading(false);
    };

    useEffect(() => {
        checkIfAuthenticated();
        checkIfAnyUsers();
    }, []);

    const fillScreenWithPage = (page: JSX.Element) => {
        return <div className={classes.fillScreen}>{page}</div>;
    };

    const getPage = () => {
        if (isAuthenticationLoading || isAnyUsersLoading) {
            return fillScreenWithPage(<CircularProgress />);
        }
        if (!isAuthenticated && anyUsers) {
            return fillScreenWithPage(<Login onSuccessfulLogin={() => setIsAuthenticated(true)} />);
        }

        if (!anyUsers) {
            return fillScreenWithPage(
                <CreateFirstUser onSuccessfulUserCreation={checkIfAnyUsers} />,
            );
        }
        return <WeekView />;
    };

    const getAuthenticatedRoutes = (): JSX.Element[] => {
        if (isAuthenticated) {
            return [
                <Route path="/change-password" element={fillScreenWithPage(<ChangePassword />)} />,
                <Route
                    path="/create-user"
                    element={fillScreenWithPage(<CreateAdditionalUser />)}
                />,
            ];
        }

        return [];
    };

    return (
        <div className={classes.app}>
            <AppHeader onLogout={checkIfAuthenticated} isAuthenticated={isAuthenticated} />
            <Routes>
                {getAuthenticatedRoutes()}
                <Route path="/" element={getPage()} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </div>
    );
};

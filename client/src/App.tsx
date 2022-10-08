import React, { useEffect, useState } from 'react';
import classes from './App.module.scss';
import { WeekView } from './components/WeekView';
import { Login } from './components/Login';
import { Navigate, Route, Routes } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import { fetchGet } from './helpers/fetchFunctions';
import { CreateUser } from './components/CreateUser';
import { AppHeader } from './components/AppHeader';

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

    const getPage = () => {
        if (isAuthenticationLoading || isAnyUsersLoading) {
            return (
                <div className={classes.fillScreen}>
                    <CircularProgress />
                </div>
            );
        }
        if (!isAuthenticated && anyUsers) {
            return (
                <div className={classes.fillScreen}>
                    <Login onSuccessfulLogin={() => setIsAuthenticated(true)} />
                </div>
            );
        }

        if (!anyUsers) {
            return <CreateUser onSuccessfulUserCreation={checkIfAnyUsers} />;
        }
        return <WeekView />;
    };

    return (
        <div className={classes.app}>
            <AppHeader onLogout={checkIfAuthenticated} isAuthenticated={isAuthenticated} />
            <Routes>
                <Route path="/" element={getPage()} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </div>
    );
};

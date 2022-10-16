import React, { useEffect, useState } from 'react';
import classes from './App.module.scss';
import { WeekView } from './components/WeekView';
import { Login } from './components/Login';
import { Navigate, Route, Routes } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import { fetchGet, fetchGetResponse } from './helpers/fetchFunctions';
import { CreateFirstUser } from './components/CreateUser/CreateFirstUser';
import { AppHeader } from './components/AppHeader';
import { CreateAdditionalUser } from './components/CreateUser/CreateAdditionalUser';
import { ChangePassword } from './components/ChangePassword';
import { User } from './types/User';
import { QueryTimeSlips } from './components/QueryTimeSlips';

export const App: React.FC<{}> = () => {
    const [username, setUsername] = useState<string>('');
    const [passwordChangeRequired, setPasswordChangeRequired] = useState(true);
    const [isAuthenticationLoading, setIsAuthenticationLoading] = useState(true);

    const [anyUsers, setAnyUsers] = useState(false);
    const [isAnyUsersLoading, setAnyUsersLoading] = useState(true);

    const isAuthenticated = () => {
        return username !== '';
    };

    const checkIfAuthenticated = async () => {
        setIsAuthenticationLoading(true);
        const userResponse = await fetchGetResponse('User/GetUser');

        if (userResponse.ok) {
            const user: User = await userResponse.json();
            setPasswordChangeRequired(user.requiresPasswordChange);
            setUsername(user.username);
        } else {
            setUsername('');
        }

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
        if (!isAuthenticated() && anyUsers) {
            return fillScreenWithPage(<Login onSuccessfulLogin={() => checkIfAuthenticated()} />);
        }

        if (!anyUsers) {
            return fillScreenWithPage(
                <CreateFirstUser onSuccessfulUserCreation={checkIfAnyUsers} />,
            );
        }

        if (passwordChangeRequired) {
            return fillScreenWithPage(
                <ChangePassword
                    onChangePassword={() => checkIfAuthenticated()}
                    prompt="You must change your password before you can access the application."
                />,
            );
        }

        return <WeekView />;
    };

    const getAuthenticatedRoutes = (): JSX.Element[] => {
        if (isAuthenticated() && !passwordChangeRequired) {
            return [
                <Route
                    key="/change-password"
                    path="/change-password"
                    element={fillScreenWithPage(<ChangePassword />)}
                />,
                <Route
                    key="/create-user"
                    path="/create-user"
                    element={fillScreenWithPage(<CreateAdditionalUser />)}
                />,
                <Route
                    key="/query-time-slips"
                    path="/query-time-slips"
                    element={fillScreenWithPage(<QueryTimeSlips />)}
                />,
            ];
        }

        return [];
    };

    return (
        <div className={classes.app}>
            <AppHeader
                onLogout={checkIfAuthenticated}
                username={username}
                passwordChangeRequired={passwordChangeRequired}
            />
            <Routes>
                {getAuthenticatedRoutes()}
                <Route path="/" element={getPage()} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </div>
    );
};

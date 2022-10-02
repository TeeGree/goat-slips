import path from 'path-browserify';
import React, { useEffect, useState } from 'react';
import './App.scss';
import { WeekView } from './components/WeekView';
import { Login } from './components/Login';
import { Navigate, Route, Routes } from 'react-router-dom';
import { CircularProgress } from '@mui/material';

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

export const App: React.FC<{}> = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const checkIfAuthenticated = async () => {
        if (apiEndpoint === undefined) {
            throw Error('No REACT_APP_API_ENDPOINT has been set!');
        }
        setIsLoading(true);
        const url = path.join(apiEndpoint, 'User/IsAuthenticated');
        const result = await fetch(url, { credentials: 'include' });

        const authenticationResult = await result.json();

        setIsAuthenticated(authenticationResult);
        setIsLoading(false);
    };

    useEffect(() => {
        checkIfAuthenticated();
    }, []);

    const getPage = () => {
        if (isLoading) {
            return <CircularProgress />;
        }
        if (!isAuthenticated) {
            return <Login onSuccessfulLogin={() => setIsAuthenticated(true)} />;
        }
        return <WeekView />;
    };

    return (
        <div className="App">
            <Routes>
                <Route path="/" element={getPage()} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </div>
    );
};

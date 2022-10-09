import { Alert, Button, TextField } from '@mui/material';
import React, { useState } from 'react';
import classes from './Login.module.scss';
import { fetchPostResponse } from '../helpers/fetchFunctions';

interface LoginProps {
    onSuccessfulLogin: () => void;
}

export const Login: React.FC<LoginProps> = (props: LoginProps) => {
    const { onSuccessfulLogin } = props;
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(event.target.value);
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();

            login();
        }
    };

    const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value);
    };

    const login = async () => {
        const response = await fetchPostResponse('User/Authenticate', {
            username,
            password,
        });

        if (response.ok) {
            onSuccessfulLogin();
        } else {
            const responseText = await response.text();
            setError(responseText);
        }
    };

    const getError = () => {
        if (error !== null) {
            return <Alert severity="error">{error}</Alert>;
        }

        return <></>;
    };

    return (
        <div className={classes.login}>
            Welcome to G.O.A.T. Slips!
            <div className={classes.loginForm}>
                {getError()}
                <div className={classes.loginInput}>
                    <TextField
                        label="Username"
                        variant="outlined"
                        value={username}
                        onChange={handleUsernameChange}
                        onKeyPress={handleKeyPress}
                    />
                </div>
                <div className={classes.loginInput}>
                    <TextField
                        label="Password"
                        variant="outlined"
                        type="password"
                        value={password}
                        onChange={handlePasswordChange}
                        onKeyPress={handleKeyPress}
                    />
                </div>
                <Button className={classes.loginInput} variant="contained" onClick={login}>
                    Login
                </Button>
            </div>
        </div>
    );
};

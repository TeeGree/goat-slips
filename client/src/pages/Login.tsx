import { Button, TextField } from '@mui/material';
import React, { useState } from 'react';
import classes from './Login.module.scss';
import path from 'path-browserify';

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

interface ILogin {
    onSuccessfulLogin: () => void;
}

export const Login: React.FC<ILogin> = (props: ILogin) => {
    const { onSuccessfulLogin } = props;
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

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
        if (apiEndpoint === undefined) {
            throw Error('No REACT_APP_API_ENDPOINT has been set!');
        }
        const loginUrl = path.join(apiEndpoint, 'User/Authenticate');
        const result = await fetch(loginUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                username,
                password,
            }),
        });

        if (result.ok) {
            onSuccessfulLogin();
        }
    };

    return (
        <div className={classes.login}>
            Welcome to G.O.A.T. Slips!
            <div className={classes.loginForm}>
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

import { Alert, Button, TextField } from '@mui/material';
import React, { useState } from 'react';
import classes from './Login.module.scss';
import { fetchPostResponse } from '../helpers/fetchFunctions';

interface LoginProps {
    onSuccessfulLogin: () => void;
}

export const Login: React.FC<LoginProps> = (props: LoginProps) => {
    const { onSuccessfulLogin } = props;
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(event.target.value);
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
            email,
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
                        label="Email"
                        variant="outlined"
                        value={email}
                        onChange={handleEmailChange}
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

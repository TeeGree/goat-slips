import { Button, TextField } from '@mui/material';
import React, { useState } from 'react';
import classes from './CreateUser.module.scss';

interface CreateUserProps {
    createUser: (
        username: string,
        email: string,
        firstName: string,
        lastName: string,
        password: string,
    ) => Promise<boolean>;
    children: React.ReactNode;
}

export const CreateUser: React.FC<CreateUserProps> = (props: CreateUserProps) => {
    const { createUser, children } = props;
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');

    const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(event.target.value);
    };

    const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(event.target.value);
    };

    const handleFirstNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFirstName(event.target.value);
    };

    const handleLastNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLastName(event.target.value);
    };

    const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value);
    };

    const createUserFromInputValues = async () => {
        const created = await createUser(username, email, firstName, lastName, password);
        if (created) {
            setUsername('');
            setEmail('');
            setFirstName('');
            setLastName('');
            setPassword('');
        }
    };

    return (
        <div className={classes.inputContainer}>
            {children}
            <div className={classes.inputForm}>
                <div className={classes.input}>
                    <TextField
                        label="Username"
                        variant="outlined"
                        value={username}
                        onChange={handleUsernameChange}
                    />
                </div>
                <div className={classes.input}>
                    <TextField
                        label="Email"
                        variant="outlined"
                        value={email}
                        onChange={handleEmailChange}
                    />
                </div>
                <div className={classes.input}>
                    <TextField
                        label="First Name"
                        variant="outlined"
                        value={firstName}
                        onChange={handleFirstNameChange}
                    />
                </div>
                <div className={classes.input}>
                    <TextField
                        label="Last Name"
                        variant="outlined"
                        value={lastName}
                        onChange={handleLastNameChange}
                    />
                </div>
                <div className={classes.input}>
                    <TextField
                        label="Password"
                        variant="outlined"
                        type="password"
                        value={password}
                        onChange={handlePasswordChange}
                    />
                </div>
                <Button
                    className={classes.input}
                    variant="contained"
                    onClick={createUserFromInputValues}
                >
                    Create User
                </Button>
            </div>
        </div>
    );
};

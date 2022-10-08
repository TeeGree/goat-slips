import { Button, TextField } from '@mui/material';
import React, { useState } from 'react';
import classes from './CreateUser.module.scss';
import { fetchPostResponse } from '../helpers/fetchFunctions';

interface CreateUserProps {
    onSuccessfulUserCreation: () => void;
}

export const CreateUser: React.FC<CreateUserProps> = (props: CreateUserProps) => {
    const { onSuccessfulUserCreation } = props;
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');

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

    const createUser = async () => {
        const response = await fetchPostResponse('User/CreateFirstUser', {
            email,
            firstName,
            lastName,
            password,
        });

        if (response.ok) {
            onSuccessfulUserCreation();
        }
    };

    return (
        <div className={classes.inputContainer}>
            Welcome to G.O.A.T. Slips!
            <p>
                There are no users in the system. Please enter user information so that you can log
                in.
            </p>
            <div className={classes.inputForm}>
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
                <Button className={classes.input} variant="contained" onClick={createUser}>
                    Create User
                </Button>
            </div>
        </div>
    );
};

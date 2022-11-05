import { Alert, Snackbar, Stack } from '@mui/material';
import React, { useState } from 'react';
import { fetchPostResponse } from '../../helpers/fetchFunctions';
import { CreateUser } from './CreateUser';

export const CreateAdditionalUser: React.FC<{}> = () => {
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleCloseSuccess = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }

        setSuccessMessage(null);
    };

    const handleCloseError = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }

        setErrorMessage(null);
    };

    const createUser = async (
        username: string,
        email: string,
        firstName: string,
        lastName: string,
        password: string,
    ) => {
        const response = await fetchPostResponse('User/CreateUser', {
            username,
            email,
            firstName,
            lastName,
            password,
        });

        if (response.ok) {
            setSuccessMessage(`Successfully created user "${username}"!`);
            return true;
        }

        setErrorMessage(`Failed to create user "${username}"!`);
        return false;
    };

    return (
        <>
            <CreateUser createUser={createUser} isPasswordTemporary>
                <p>Create a new user</p>
            </CreateUser>
            <Stack spacing={2} sx={{ width: '100%' }}>
                <Snackbar
                    open={successMessage !== null}
                    autoHideDuration={6000}
                    onClose={handleCloseSuccess}
                >
                    <Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%' }}>
                        {successMessage}
                    </Alert>
                </Snackbar>
                <Snackbar
                    open={errorMessage !== null}
                    autoHideDuration={6000}
                    onClose={handleCloseError}
                >
                    <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
                        {errorMessage}
                    </Alert>
                </Snackbar>
            </Stack>
        </>
    );
};

import { Alert, Button, TextField } from '@mui/material';
import React, { useState } from 'react';
import { fetchPostResponse } from '../helpers/fetchFunctions';
import classes from './ChangePassword.module.scss';

interface AlertMessage {
    message: string;
    severity: 'error' | 'success';
}

export const ChangePassword: React.FC<{}> = () => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [alertMessage, setAlertMessage] = useState<AlertMessage | null>(null);

    const handleOldPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setOldPassword(event.target.value);
    };

    const handleNewPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNewPassword(event.target.value);
    };

    const handleConfirmNewPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setConfirmNewPassword(event.target.value);
    };

    const changePassword = async () => {
        const response = await fetchPostResponse('User/ChangePassword', {
            oldPassword,
            newPassword,
        });

        if (response.ok) {
            setOldPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
            setAlertMessage({
                message: 'Password successfully changed.',
                severity: 'success',
            });
        } else {
            const responseText = await response.text();
            setAlertMessage({
                message: responseText,
                severity: 'error',
            });
        }
    };

    const getAlert = () => {
        if (alertMessage !== null) {
            return <Alert severity={alertMessage.severity}>{alertMessage.message}</Alert>;
        }

        return <></>;
    };

    return (
        <div className={classes.inputContainer}>
            <div className={classes.inputForm}>
                {getAlert()}
                <div className={classes.input}>
                    <TextField
                        label="Current Password"
                        variant="outlined"
                        type="password"
                        value={oldPassword}
                        onChange={handleOldPasswordChange}
                    />
                </div>
                <div className={classes.input}>
                    <TextField
                        label="New Password"
                        variant="outlined"
                        type="password"
                        value={newPassword}
                        onChange={handleNewPasswordChange}
                    />
                </div>
                <div className={classes.input}>
                    <TextField
                        label="Confirm New Password"
                        variant="outlined"
                        type="password"
                        value={confirmNewPassword}
                        onChange={handleConfirmNewPasswordChange}
                    />
                </div>
                <Button className={classes.input} variant="contained" onClick={changePassword}>
                    Change Password
                </Button>
            </div>
        </div>
    );
};

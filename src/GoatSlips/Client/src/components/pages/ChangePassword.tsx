import { Alert, Button, TextField, Tooltip } from '@mui/material';
import React, { useState } from 'react';
import { fetchPostResponse } from '../../helpers/fetchFunctions';
import { passwordIsValid } from '../../helpers/passwordValidation';
import { AlertMessage } from '../../types/AlertMessage';
import classes from './ChangePassword.module.scss';

interface ChangePasswordProps {
    prompt?: string;
    onChangePassword?: () => void;
}

export const ChangePassword: React.FC<ChangePasswordProps> = (props: ChangePasswordProps) => {
    const { prompt, onChangePassword } = props;
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

            if (onChangePassword) {
                onChangePassword();
            }
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
            <p>{prompt ?? ''}</p>
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
                    <Tooltip
                        placement="right"
                        title="Password must contain at least 1 letter, one number, and be at least 8 characters long."
                    >
                        <TextField
                            label="New Password"
                            variant="outlined"
                            type="password"
                            value={newPassword}
                            onChange={handleNewPasswordChange}
                        />
                    </Tooltip>
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
                <Button
                    disabled={!passwordIsValid(newPassword)}
                    className={classes.input}
                    variant="contained"
                    onClick={changePassword}
                >
                    Change Password
                </Button>
            </div>
        </div>
    );
};

import { Alert, Snackbar } from '@mui/material';
import React from 'react';

interface ToastProps {
    severity: 'success' | 'error' | undefined;
    message: string | undefined;
    onClose: () => void;
}

export const Toast: React.FC<ToastProps> = (props: ToastProps) => {
    const { severity, message, onClose } = props;

    return (
        <Snackbar open={message !== undefined} autoHideDuration={6000} onClose={onClose}>
            <Alert onClose={onClose} severity={severity} sx={{ width: '100%' }}>
                {message}
            </Alert>
        </Snackbar>
    );
};

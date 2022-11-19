import { Delete } from '@mui/icons-material';
import { Box, Button, Modal } from '@mui/material';
import React, { useState } from 'react';
import { modalStyle } from '../constants/modalStyle';
import { codeInUse } from '../constants/statusCodes';
import { DropdownOption } from '../types/DropdownOption';
import { ErrorDetails } from '../types/ErrorDetails';
import classes from './ExistingTimeCode.module.scss';

interface ExistingTimeCodeProps {
    code: DropdownOption;
    fetchCodes: () => Promise<void>;
    setError: (message: string) => void;
    setSuccess: (message: string) => void;
    deleteApiCall: (id: number) => Promise<Response>;
    label: string;
}

export const ExistingTimeCode: React.FC<ExistingTimeCodeProps> = (props: ExistingTimeCodeProps) => {
    const { code, setError, setSuccess, fetchCodes, deleteApiCall, label } = props;

    const [isBeingDeleted, setIsBeingDeleted] = useState(false);

    const deleteCode = async () => {
        const response = await deleteApiCall(code.id);

        if (response.ok) {
            await fetchCodes();
            setSuccess(`Successfully deleted ${label} ${code.name}!`);
        } else if (response.status === codeInUse) {
            const message: ErrorDetails = await response.json();
            setError(message.detail);
        }

        setIsBeingDeleted(false);
    };

    return (
        <div className={classes.codeContainer}>
            <Modal open={isBeingDeleted}>
                <Box sx={modalStyle}>
                    <h2>Are you sure you want to delete {`${label} "${code.name}"`}?</h2>
                    <div className={classes.modalButtons}>
                        <Button variant="contained" color="error" onClick={() => deleteCode()}>
                            Delete
                        </Button>
                        <Button
                            variant="contained"
                            className={classes.button}
                            onClick={() => setIsBeingDeleted(false)}
                        >
                            Cancel
                        </Button>
                    </div>
                </Box>
            </Modal>
            <span className={classes.codeName}>{code.name}</span>
            <Button
                className={classes.button}
                variant="contained"
                color="error"
                onClick={() => setIsBeingDeleted(true)}
            >
                <Delete />
            </Button>
        </div>
    );
};

import { Alert } from '@mui/material';
import React, { useState } from 'react';
import { AlertMessage } from '../../types/AlertMessage';
import { DropdownOption } from '../../types/DropdownOption';
import { ManageLaborCodes } from '../ManageTimeCodes/ManageLaborCodes';
import classes from './ManageLaborCodesContainer.module.scss';

interface ManageLaborCodesContainerProps {
    laborCodes: DropdownOption[];
    fetchLaborCodes: () => Promise<void>;
    fetchFavorites: () => Promise<void>;
}

export const ManageLaborCodesContainer: React.FC<ManageLaborCodesContainerProps> = (
    props: ManageLaborCodesContainerProps,
) => {
    const { laborCodes, fetchLaborCodes, fetchFavorites } = props;

    const [alertMessage, setAlertMessage] = useState<AlertMessage | null>(null);

    const getAlert = () => {
        if (alertMessage === null) {
            return <></>;
        }

        return <Alert severity={alertMessage.severity}>{alertMessage.message}</Alert>;
    };

    return (
        <div className={classes.pageContainer}>
            <div className={classes.header}>Manage Labor Codes</div>
            {getAlert()}
            <div className={classes.codesList}>
                <ManageLaborCodes
                    laborCodes={laborCodes}
                    fetchLaborCodes={fetchLaborCodes}
                    fetchFavorites={fetchFavorites}
                    setAlertMessage={setAlertMessage}
                />
            </div>
        </div>
    );
};

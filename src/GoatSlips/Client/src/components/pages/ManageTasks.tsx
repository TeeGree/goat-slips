import { Alert } from '@mui/material';
import React, { useState } from 'react';
import { AlertMessage } from '../../types/AlertMessage';
import { DropdownOption } from '../../types/DropdownOption';
import { ManageTaskCodes } from '../ManageTimeCodes/ManageTaskCodes';
import classes from './ManageTasks.module.scss';

interface ManageTasksProps {
    tasks: DropdownOption[];
    fetchTasksAllowed: () => Promise<void>;
    fetchTasks: () => Promise<void>;
    fetchFavorites: () => Promise<void>;
}

export const ManageTasks: React.FC<ManageTasksProps> = (props: ManageTasksProps) => {
    const { tasks, fetchTasksAllowed, fetchTasks, fetchFavorites } = props;

    const [alertMessage, setAlertMessage] = useState<AlertMessage | null>(null);

    const getAlert = () => {
        if (alertMessage === null) {
            return <></>;
        }

        return <Alert severity={alertMessage.severity}>{alertMessage.message}</Alert>;
    };

    return (
        <div className={classes.pageContainer}>
            <div className={classes.header}>Manage Tasks</div>
            {getAlert()}
            <div className={classes.codesList}>
                <ManageTaskCodes
                    tasks={tasks}
                    fetchTasksAllowed={fetchTasksAllowed}
                    fetchTasks={fetchTasks}
                    fetchFavorites={fetchFavorites}
                    setAlertMessage={setAlertMessage}
                />
            </div>
        </div>
    );
};

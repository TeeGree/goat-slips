import { Alert } from '@mui/material';
import React, { useState } from 'react';
import { AlertMessage } from '../../types/AlertMessage';
import { DropdownOption } from '../../types/DropdownOption';
import { Project } from '../../types/Project';
import { ManageProjectCodes } from '../ManageTimeCodes/ManageProjectCodes';
import classes from './ManageProjects.module.scss';

interface ManageTimeCodesProps {
    projects: Project[];
    tasks: DropdownOption[];
    taskMap: Map<number, string>;
    tasksAllowedForProjects: Map<number, number[]>;
    fetchProjects: () => Promise<void>;
    fetchTasksAllowed: () => Promise<void>;
    fetchFavorites: () => Promise<void>;
    isAdmin: boolean;
    managedProjectIds: Set<number>;
}

export const ManageProjects: React.FC<ManageTimeCodesProps> = (props: ManageTimeCodesProps) => {
    const {
        projects,
        tasks,
        taskMap,
        tasksAllowedForProjects,
        fetchProjects,
        fetchTasksAllowed,
        fetchFavorites,
        isAdmin,
        managedProjectIds,
    } = props;

    const [alertMessage, setAlertMessage] = useState<AlertMessage | null>(null);

    const getAlert = () => {
        if (alertMessage === null) {
            return <></>;
        }

        return <Alert severity={alertMessage.severity}>{alertMessage.message}</Alert>;
    };

    return (
        <div className={classes.pageContainer}>
            <div className={classes.header}>Manage Projects</div>
            {getAlert()}
            <div className={classes.codesList}>
                <ManageProjectCodes
                    projects={projects}
                    tasks={tasks}
                    taskMap={taskMap}
                    tasksAllowedForProjects={tasksAllowedForProjects}
                    fetchProjects={fetchProjects}
                    fetchTasksAllowed={fetchTasksAllowed}
                    fetchFavorites={fetchFavorites}
                    setAlertMessage={setAlertMessage}
                    isAdmin={isAdmin}
                    managedProjectIds={managedProjectIds}
                />
            </div>
        </div>
    );
};

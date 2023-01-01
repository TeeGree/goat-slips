import { Alert, ToggleButton, ToggleButtonGroup } from '@mui/material';
import React, { useState } from 'react';
import { AlertMessage } from '../../types/AlertMessage';
import { DropdownOption } from '../../types/DropdownOption';
import { ManageLaborCodes } from '../ManageTimeCodes/ManageLaborCodes';
import { ManageProjectCodes } from '../ManageTimeCodes/ManageProjectCodes';
import { ManageTaskCodes } from '../ManageTimeCodes/ManageTaskCodes';
import classes from './ManageTimeCodes.module.scss';

interface ManageTimeCodesProps {
    projects: DropdownOption[];
    tasks: DropdownOption[];
    taskMap: Map<number, string>;
    tasksAllowedForProjects: Map<number, number[]>;
    laborCodes: DropdownOption[];
    fetchProjects: () => Promise<void>;
    fetchTasksAllowed: () => Promise<void>;
    fetchTasks: () => Promise<void>;
    fetchLaborCodes: () => Promise<void>;
    fetchFavorites: () => Promise<void>;
}

export const ManageTimeCodes: React.FC<ManageTimeCodesProps> = (props: ManageTimeCodesProps) => {
    const {
        projects,
        tasks,
        taskMap,
        tasksAllowedForProjects,
        laborCodes,
        fetchProjects,
        fetchTasksAllowed,
        fetchTasks,
        fetchLaborCodes,
        fetchFavorites,
    } = props;

    const [alertMessage, setAlertMessage] = useState<AlertMessage | null>(null);
    const [codesBeingEdited, setCodesBeingEdited] = React.useState<
        'projects' | 'tasks' | 'laborCodes'
    >('projects');

    const handleChangeCodesBeingEdited = (
        _event: React.MouseEvent<HTMLElement>,
        newCodesBeingEdited: string | null,
    ) => {
        if (
            newCodesBeingEdited === 'projects' ||
            newCodesBeingEdited === 'tasks' ||
            newCodesBeingEdited === 'laborCodes'
        ) {
            setCodesBeingEdited(newCodesBeingEdited);
        }
    };

    const getCodesList = () => {
        if (codesBeingEdited === 'projects') {
            return (
                <ManageProjectCodes
                    projects={projects}
                    tasks={tasks}
                    taskMap={taskMap}
                    tasksAllowedForProjects={tasksAllowedForProjects}
                    fetchProjects={fetchProjects}
                    fetchTasksAllowed={fetchTasksAllowed}
                    fetchFavorites={fetchFavorites}
                    setAlertMessage={setAlertMessage}
                />
            );
        }

        if (codesBeingEdited === 'tasks') {
            return (
                <ManageTaskCodes
                    tasks={tasks}
                    fetchTasksAllowed={fetchTasksAllowed}
                    fetchTasks={fetchTasks}
                    fetchFavorites={fetchFavorites}
                    setAlertMessage={setAlertMessage}
                />
            );
        }

        return (
            <ManageLaborCodes
                laborCodes={laborCodes}
                fetchLaborCodes={fetchLaborCodes}
                fetchFavorites={fetchFavorites}
                setAlertMessage={setAlertMessage}
            />
        );
    };

    const getAlert = () => {
        if (alertMessage === null) {
            return <></>;
        }

        return <Alert severity={alertMessage.severity}>{alertMessage.message}</Alert>;
    };

    return (
        <div className={classes.pageContainer}>
            <div className={classes.header}>Manage Time Codes</div>
            <ToggleButtonGroup
                className={classes.codeTypeButtonGroup}
                value={codesBeingEdited}
                exclusive
                onChange={handleChangeCodesBeingEdited}
                aria-label="text alignment"
            >
                <ToggleButton value="projects">Projects</ToggleButton>
                <ToggleButton value="tasks">Tasks</ToggleButton>
                <ToggleButton value="laborCodes">Labor Codes</ToggleButton>
            </ToggleButtonGroup>
            {getAlert()}
            <div className={classes.codesList}>{getCodesList()}</div>
        </div>
    );
};

import { Alert, Button, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material';
import React, { useState } from 'react';
import { fetchPostResponse } from '../helpers/fetchFunctions';
import { AlertMessage } from '../types/AlertMessage';
import { DropdownOption } from '../types/DropdownOption';
import { ExistingProject } from './ExistingProject';
import { ExistingTask } from './ExistingTask';
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
}

export const ManageTimeCodes: React.FC<ManageTimeCodesProps> = (props: ManageTimeCodesProps) => {
    const {
        projects,
        tasks,
        taskMap,
        tasksAllowedForProjects,
        // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
        laborCodes,
        fetchProjects,
        fetchTasksAllowed,
        fetchTasks,
    } = props;

    const [newProjectName, setNewProjectName] = useState('');
    const [newTaskName, setNewTaskName] = useState('');
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

    const handleNewProjectNameChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = event.target.value;

        setNewProjectName(value);
    };

    const handleNewTaskNameChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = event.target.value;

        setNewTaskName(value);
    };

    const createProject = async () => {
        await fetchPostResponse('Project/Create', { projectName: newProjectName });
        setNewProjectName('');
        await fetchProjects();
    };

    const createTask = async () => {
        await fetchPostResponse('Task/Create', { taskName: newTaskName });
        setNewTaskName('');
        await fetchTasks();
    };

    const getCodesList = () => {
        if (codesBeingEdited === 'projects') {
            return <div>{getProjectsList()}</div>;
        }

        if (codesBeingEdited === 'tasks') {
            return <div>{getTasksList()}</div>;
        }

        return <></>;
    };

    const getProjectsList = () => {
        const existingProjectElements = projects.map((project: DropdownOption) => {
            return (
                <ExistingProject
                    allTasks={tasks}
                    tasksAllowed={tasksAllowedForProjects.get(project.id) ?? []}
                    taskMap={taskMap}
                    key={`project${project.id}`}
                    project={project}
                    fetchProjects={fetchProjects}
                    fetchTasksAllowed={fetchTasksAllowed}
                    setError={(message: string) => setAlertMessage({ message, severity: 'error' })}
                    setSuccess={(message: string) =>
                        setAlertMessage({ message, severity: 'success' })
                    }
                />
            );
        });

        return (
            <div className={classes.projectsContainer}>
                <div className={classes.projectContainer}>
                    <TextField
                        className={classes.projectName}
                        label="New Project"
                        variant="outlined"
                        value={newProjectName}
                        onChange={handleNewProjectNameChange}
                    />
                    <Button
                        variant="contained"
                        color="success"
                        disabled={newProjectName === ''}
                        onClick={createProject}
                    >
                        Add
                    </Button>
                </div>
                {existingProjectElements}
            </div>
        );
    };

    const refetchTasks = async () => {
        await fetchTasks();
        await fetchTasksAllowed();
    };

    const getTasksList = () => {
        const existingTaskElements = tasks.map((task: DropdownOption) => {
            return (
                <ExistingTask
                    key={`task${task.id}`}
                    task={task}
                    fetchTasks={refetchTasks}
                    setError={(message: string) => setAlertMessage({ message, severity: 'error' })}
                    setSuccess={(message: string) =>
                        setAlertMessage({ message, severity: 'success' })
                    }
                />
            );
        });

        return (
            <div className={classes.projectsContainer}>
                <div className={classes.projectContainer}>
                    <TextField
                        className={classes.projectName}
                        label="New Task"
                        variant="outlined"
                        value={newTaskName}
                        onChange={handleNewTaskNameChange}
                    />
                    <Button
                        variant="contained"
                        color="success"
                        disabled={newTaskName === ''}
                        onClick={createTask}
                    >
                        Add
                    </Button>
                </div>
                {existingTaskElements}
            </div>
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
                value={codesBeingEdited}
                exclusive
                onChange={handleChangeCodesBeingEdited}
                aria-label="text alignment"
            >
                <ToggleButton value="projects">Projects</ToggleButton>
                <ToggleButton value="tasks">Tasks</ToggleButton>
            </ToggleButtonGroup>
            {getAlert()}
            <div>{getCodesList()}</div>
        </div>
    );
};
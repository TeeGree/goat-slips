import { Alert, Button, TextField } from '@mui/material';
import React, { useState } from 'react';
import { fetchPostResponse } from '../helpers/fetchFunctions';
import { DropdownOption } from '../types/DropdownOption';
import { ExistingProject } from './ExistingProject';
import classes from './ManageTimeCodes.module.scss';

interface ManageTimeCodesProps {
    projects: DropdownOption[];
    tasks: DropdownOption[];
    taskMap: Map<number, string>;
    tasksAllowedForProjects: Map<number, number[]>;
    laborCodes: DropdownOption[];
    fetchProjects: () => Promise<void>;
    fetchTasksAllowed: () => Promise<void>;
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
    } = props;

    const [newProjectName, setNewProjectName] = useState('');
    const [error, setError] = useState('');

    const handleNewProjectNameChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = event.target.value;

        setNewProjectName(value);
    };

    const createProject = async () => {
        await fetchPostResponse('Project/Create', { projectName: newProjectName });
        setNewProjectName('');
        await fetchProjects();
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
                    setError={setError}
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

    const getAlert = () => {
        if (error === '') {
            return <></>;
        }

        return <Alert severity="error">{error}</Alert>;
    };

    return (
        <div className={classes.pageContainer}>
            <div className={classes.header}>Manage Time Codes</div>
            {getAlert()}
            <div>{getProjectsList()}</div>
        </div>
    );
};

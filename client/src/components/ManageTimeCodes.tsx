import { Delete } from '@mui/icons-material';
import { Alert, Box, Button, Modal, TextField } from '@mui/material';
import React, { useState } from 'react';
import { modalStyle } from '../constants/modalStyle';
import { projectInUse } from '../constants/statusCodes';
import { fetchDeleteResponse, fetchPostResponse } from '../helpers/fetchFunctions';
import { DropdownOption } from '../types/DropdownOption';
import { ErrorDetails } from '../types/ErrorDetails';
import classes from './ManageTimeCodes.module.scss';

interface ManageTimeCodesProps {
    projects: DropdownOption[];
    tasks: DropdownOption[];
    taskMap: Map<number, string>;
    tasksAllowedForProjects: Map<number, number[]>;
    laborCodes: DropdownOption[];
    fetchProjects: () => Promise<void>;
}

export const ManageTimeCodes: React.FC<ManageTimeCodesProps> = (props: ManageTimeCodesProps) => {
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    const { projects, tasks, taskMap, tasksAllowedForProjects, laborCodes, fetchProjects } = props;

    const [newProjectName, setNewProjectName] = useState('');
    const [projectBeingDeleted, setProjectBeingDeleted] = useState<DropdownOption | null>(null);
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

    const deleteProject = async () => {
        const response = await fetchDeleteResponse(`Project/Delete/${projectBeingDeleted?.id}`);

        if (response.ok) {
            await fetchProjects();
        } else if (response.status === projectInUse) {
            const message: ErrorDetails = await response.json();
            setError(message.detail);
        }

        setProjectBeingDeleted(null);
    };

    const getProjectsList = () => {
        const existingProjectElements = projects.map((project: DropdownOption) => {
            return (
                <div key={`project${project.id}`} className={classes.projectContainer}>
                    <span className={classes.projectName}>{project.name}</span>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => setProjectBeingDeleted(project)}
                    >
                        <Delete />
                    </Button>
                </div>
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
            <Modal open={projectBeingDeleted !== null}>
                <Box sx={modalStyle}>
                    <h2>
                        Are you sure you want to delete project {`"${projectBeingDeleted?.name}"`}?
                    </h2>
                    <div className={classes.modalButtons}>
                        <Button variant="contained" color="error" onClick={() => deleteProject()}>
                            Delete
                        </Button>
                        <Button
                            variant="contained"
                            className={classes.cancelButton}
                            onClick={() => setProjectBeingDeleted(null)}
                        >
                            Cancel
                        </Button>
                    </div>
                </Box>
            </Modal>
            <div className={classes.header}>Manage Time Codes</div>
            {getAlert()}
            <div>{getProjectsList()}</div>
        </div>
    );
};

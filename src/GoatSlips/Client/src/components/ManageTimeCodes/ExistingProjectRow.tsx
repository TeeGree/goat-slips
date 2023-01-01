import { Delete, Save } from '@mui/icons-material';
import { Box, Button, Modal, TableCell, TableRow } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { modalStyle } from '../../constants/modalStyle';
import { codeInUse } from '../../constants/statusCodes';
import { fetchDeleteResponse, fetchPostResponse } from '../../helpers/fetchFunctions';
import { DropdownOption } from '../../types/DropdownOption';
import { ErrorDetails } from '../../types/ErrorDetails';
import classes from './ExistingProject.module.scss';
import { MultiSelect } from '../MultiSelect';

interface ExistingProjectRowProps {
    project: DropdownOption;
    allTasks: DropdownOption[];
    tasksAllowed: number[];
    taskMap: Map<number, string>;
    fetchProjects: () => Promise<void>;
    setError: (message: string) => void;
    setSuccess: (message: string) => void;
    fetchTasksAllowed: () => Promise<void>;
}

export const ExistingProjectRow: React.FC<ExistingProjectRowProps> = (
    props: ExistingProjectRowProps,
) => {
    const {
        project,
        allTasks,
        tasksAllowed,
        taskMap,
        setError,
        setSuccess,
        fetchProjects,
        fetchTasksAllowed,
    } = props;

    const [isBeingDeleted, setIsBeingDeleted] = useState(false);
    const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>(tasksAllowed);
    const [isDirty, setIsDirty] = useState(false);
    const [originalTasks, setOriginalTasks] = useState(new Set(tasksAllowed));

    useEffect(() => {
        setSelectedTaskIds(tasksAllowed);
        setOriginalTasks(new Set(tasksAllowed));
        setIsDirty(false);
    }, [tasksAllowed]);

    const deleteProject = async () => {
        const response = await fetchDeleteResponse(`Project/Delete/${project.id}`);

        if (response.ok) {
            await fetchProjects();
            setSuccess(`Successfully deleted project ${project.name}!`);
        } else if (response.status === codeInUse) {
            const message: ErrorDetails = await response.json();
            setError(message.detail);
        }

        setIsBeingDeleted(false);
    };

    const updateAllowedTasksForProject = async () => {
        const response = await fetchPostResponse('Project/SetAllowedTasks', {
            projectId: project.id,
            allowedTaskIds: selectedTaskIds,
        });

        if (response.ok) {
            await fetchTasksAllowed();
            setSuccess(`Successfully updated allowed tasks for project ${project.name}!`);
        }
    };

    return (
        <>
            <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell>{project.name}</TableCell>
                <TableCell>
                    <MultiSelect
                        label="Allowed Tasks"
                        originalSelectedIds={originalTasks}
                        selectedIds={selectedTaskIds}
                        setSelectedIds={setSelectedTaskIds}
                        setIsDirty={setIsDirty}
                        getDisplayTextForId={(id: number) => taskMap.get(id) ?? ''}
                        options={allTasks}
                    />
                </TableCell>
                <TableCell>
                    <Button
                        className={classes.button}
                        variant="contained"
                        color="error"
                        onClick={() => setIsBeingDeleted(true)}
                    >
                        <Delete />
                    </Button>
                    <Button
                        disabled={!isDirty}
                        className={classes.button}
                        variant="contained"
                        color="success"
                        onClick={updateAllowedTasksForProject}
                    >
                        <Save />
                    </Button>
                </TableCell>
            </TableRow>
            <Modal open={isBeingDeleted}>
                <Box sx={modalStyle}>
                    <h2>Are you sure you want to delete project {`"${project.name}"`}?</h2>
                    <div className={classes.modalButtons}>
                        <Button variant="contained" color="error" onClick={() => deleteProject()}>
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
        </>
    );
};

import { Delete, Save } from '@mui/icons-material';
import {
    Box,
    Button,
    Checkbox,
    FormControl,
    InputLabel,
    ListItemText,
    MenuItem,
    Modal,
    Select,
    SelectChangeEvent,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { modalStyle } from '../constants/modalStyle';
import { projectInUse } from '../constants/statusCodes';
import { fetchDeleteResponse, fetchPostResponse } from '../helpers/fetchFunctions';
import { DropdownOption } from '../types/DropdownOption';
import { ErrorDetails } from '../types/ErrorDetails';
import classes from './ExistingProject.module.scss';

interface ExistingProjectProps {
    project: DropdownOption;
    allTasks: DropdownOption[];
    tasksAllowed: number[];
    taskMap: Map<number, string>;
    fetchProjects: () => Promise<void>;
    setError: (message: string) => void;
    setSuccess: (message: string) => void;
    fetchTasksAllowed: () => Promise<void>;
}

export const ExistingProject: React.FC<ExistingProjectProps> = (props: ExistingProjectProps) => {
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

    const handleSelectChange = (
        event: SelectChangeEvent<number[]>,
        setStateAction: React.Dispatch<React.SetStateAction<number[]>>,
    ) => {
        const {
            target: { value },
        } = event;
        const values = typeof value === 'string' ? value.split(',').map((v) => Number(v)) : value;

        if (originalTasks.size !== values.length) {
            setIsDirty(true);
            setStateAction(values);
            return;
        }
        let dirty = false;
        values.forEach((v) => {
            if (!originalTasks.has(v)) {
                dirty = true;
                return;
            }
        });

        setIsDirty(dirty);
        setStateAction(values);
    };

    const handleTaskChange = (event: SelectChangeEvent<number[]>) => {
        handleSelectChange(event, setSelectedTaskIds);
    };

    const deleteProject = async () => {
        const response = await fetchDeleteResponse(`Project/Delete/${project.id}`);

        if (response.ok) {
            await fetchProjects();
            setSuccess(`Successfully deleted project ${project.name}!`);
        } else if (response.status === projectInUse) {
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
        } else if (response.status === projectInUse) {
            const message: ErrorDetails = await response.json();
            setError(message.detail);
        }
    };

    const renderSelected = (selectedIds: number[]) => {
        let displayText = '';
        selectedIds.forEach((id: number, index: number) => {
            displayText += taskMap.get(id) ?? 'N/A';
            if (index < selectedIds.length - 1) {
                displayText += ', ';
            }
        });

        return displayText;
    };

    const getTaskMenuItems = () => {
        return allTasks.map((task: DropdownOption) => {
            const { id, name } = task;
            const isChecked = selectedTaskIds.indexOf(id) > -1;
            return (
                <MenuItem key={`project-${project.name}-${id}`} value={id}>
                    <Checkbox checked={isChecked} />
                    <ListItemText primary={name} />
                </MenuItem>
            );
        });
    };

    return (
        <div className={classes.projectContainer}>
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
            <span className={classes.projectName}>{project.name}</span>
            <FormControl className={classes.projectAllowedTasks}>
                <InputLabel>Allowed Tasks</InputLabel>
                <Select
                    renderValue={(selected) => renderSelected(selected)}
                    multiple
                    value={selectedTaskIds}
                    label="Allowed Tasks"
                    onChange={handleTaskChange}
                >
                    {getTaskMenuItems()}
                </Select>
            </FormControl>
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
        </div>
    );
};

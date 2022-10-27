import { Delete } from '@mui/icons-material';
import { Box, Button, Modal } from '@mui/material';
import React, { useState } from 'react';
import { modalStyle } from '../constants/modalStyle';
import { codeInUse } from '../constants/statusCodes';
import { fetchDeleteResponse } from '../helpers/fetchFunctions';
import { DropdownOption } from '../types/DropdownOption';
import { ErrorDetails } from '../types/ErrorDetails';
import classes from './ExistingTask.module.scss';

interface ExistingTaskProps {
    task: DropdownOption;
    fetchTasks: () => Promise<void>;
    setError: (message: string) => void;
    setSuccess: (message: string) => void;
}

export const ExistingTask: React.FC<ExistingTaskProps> = (props: ExistingTaskProps) => {
    const { task, setError, setSuccess, fetchTasks } = props;

    const [isBeingDeleted, setIsBeingDeleted] = useState(false);

    const deleteTask = async () => {
        const response = await fetchDeleteResponse(`Task/Delete/${task.id}`);

        if (response.ok) {
            await fetchTasks();
            setSuccess(`Successfully deleted task ${task.name}!`);
        } else if (response.status === codeInUse) {
            const message: ErrorDetails = await response.json();
            setError(message.detail);
        }

        setIsBeingDeleted(false);
    };

    return (
        <div className={classes.taskContainer}>
            <Modal open={isBeingDeleted}>
                <Box sx={modalStyle}>
                    <h2>Are you sure you want to delete task {`"${task.name}"`}?</h2>
                    <div className={classes.modalButtons}>
                        <Button variant="contained" color="error" onClick={() => deleteTask()}>
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
            <span className={classes.taskName}>{task.name}</span>
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

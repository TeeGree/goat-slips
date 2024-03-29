import {
    Alert,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
} from '@mui/material';
import React, { useState } from 'react';
import { fetchPostResponse } from '../../helpers/fetchFunctions';
import { AlertMessage } from '../../types/AlertMessage';
import { DropdownOption } from '../../types/DropdownOption';
import { ExistingTaskRow } from '../ManageTimeCodes/ExistingTaskRow';
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
    const [newTaskName, setNewTaskName] = useState('');

    const handleNewTaskNameChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = event.target.value;

        setNewTaskName(value);
    };

    const createTask = async () => {
        await fetchPostResponse('Task/Create', { taskName: newTaskName });
        setNewTaskName('');
        await fetchTasks();
        await fetchTasksAllowed();
    };

    const refetchTasks = async () => {
        await fetchTasks();
        await fetchTasksAllowed();
        await fetchFavorites();
    };

    const existingTaskElements = tasks.map((task: DropdownOption) => {
        return (
            <ExistingTaskRow
                key={`task${task.id}`}
                task={task}
                fetchTasks={refetchTasks}
                setError={(message: string) => setAlertMessage({ message, severity: 'error' })}
                setSuccess={(message: string) => setAlertMessage({ message, severity: 'success' })}
            />
        );
    });

    const getAlert = () => {
        if (alertMessage === null) {
            return <></>;
        }

        return <Alert severity={alertMessage.severity}>{alertMessage.message}</Alert>;
    };

    const getTaskList = () => {
        return (
            <>
                <div className={classes.newTaskContainer}>
                    <TextField
                        className={classes.taskName}
                        label="New Task"
                        variant="outlined"
                        value={newTaskName}
                        onChange={handleNewTaskNameChange}
                    />
                    <Button
                        className={classes.addNewTask}
                        variant="contained"
                        color="success"
                        disabled={newTaskName === ''}
                        onClick={createTask}
                    >
                        Add
                    </Button>
                </div>
                <TableContainer component={Paper} className={classes.tableContainer}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell className={classes.buttonCell} />
                            </TableRow>
                        </TableHead>
                        <TableBody>{existingTaskElements}</TableBody>
                    </Table>
                </TableContainer>
            </>
        );
    };

    return (
        <div className={classes.pageContainer}>
            <div className={classes.header}>Manage Tasks</div>
            {getAlert()}
            <div className={classes.codesList}>{getTaskList()}</div>
        </div>
    );
};

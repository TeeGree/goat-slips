import {
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
import { useState } from 'react';
import { fetchPostResponse } from '../../helpers/fetchFunctions';
import { AlertMessage } from '../../types/AlertMessage';
import { DropdownOption } from '../../types/DropdownOption';
import { ExistingTaskRow } from './ExistingTaskRow';
import classes from './ManageTaskCodes.module.scss';

interface ManageTaskCodesProps {
    tasks: DropdownOption[];
    fetchTasksAllowed: () => Promise<void>;
    fetchTasks: () => Promise<void>;
    fetchFavorites: () => Promise<void>;
    setAlertMessage: (alertMessage: AlertMessage) => void;
}

export const ManageTaskCodes: React.FC<ManageTaskCodesProps> = (props: ManageTaskCodesProps) => {
    const { tasks, fetchTasksAllowed, fetchTasks, fetchFavorites, setAlertMessage } = props;

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

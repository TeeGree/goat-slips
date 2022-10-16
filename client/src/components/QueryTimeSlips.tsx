import {
    CircularProgress,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    SelectChangeEvent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { fetchPost } from '../helpers/fetchFunctions';
import { DropdownOption } from '../types/DropdownOption';
import { TimeSlip } from '../types/TimeSlip';
import classes from './QueryTimeSlips.module.scss';

interface QueryTimeSlipsProps {
    users: DropdownOption[];
    userMap: Map<number, string>;
    projects: DropdownOption[];
    projectMap: Map<number, string>;
    tasks: DropdownOption[];
    taskMap: Map<number, string>;
    laborCodes: DropdownOption[];
    laborCodeMap: Map<number, string>;
}

export const QueryTimeSlips: React.FC<QueryTimeSlipsProps> = (props: QueryTimeSlipsProps) => {
    const { users, userMap, projects, projectMap, tasks, taskMap, laborCodes, laborCodeMap } =
        props;
    const [loadingResults, setLoadingResults] = useState(true);
    const [timeSlips, setTimeSlips] = useState<TimeSlip[]>([]);

    const [selectedUserId, setSelectedUserId] = useState<number | ''>('');
    const [selectedProjectId, setSelectedProjectId] = useState<number | ''>('');
    const [selectedTaskId, setSelectedTaskId] = useState<number | ''>('');
    const [selectedLaborCodeId, setSelectedLaborCodeId] = useState<number | ''>('');

    useEffect(() => {
        fetchTimeSlips();
    }, [selectedUserId, selectedProjectId, selectedTaskId, selectedLaborCodeId]);

    const fetchTimeSlips = async () => {
        setLoadingResults(true);

        const queryBody: any = {};
        if (selectedUserId !== '') {
            queryBody.userIds = [selectedUserId];
        }

        if (selectedProjectId !== '') {
            queryBody.projectIds = [selectedProjectId];
        }

        if (selectedTaskId !== '') {
            queryBody.taskIds = [selectedTaskId];
        }

        if (selectedLaborCodeId !== '') {
            queryBody.laborCodeIds = [selectedLaborCodeId];
        }

        const results = await fetchPost<TimeSlip[]>('TimeSlip/QueryTimeSlips', queryBody);
        setTimeSlips(results);

        setLoadingResults(false);
    };

    const getRows = (): JSX.Element | JSX.Element[] => {
        if (loadingResults) {
            return (
                <TableRow>
                    <TableCell colSpan={7}>
                        <CircularProgress />
                    </TableCell>
                </TableRow>
            );
        }

        const getTask = (taskId: number | null): string => {
            if (taskId === null) {
                return 'N/A';
            }

            return taskMap.get(taskId) ?? 'Not found';
        };

        const getLaborCode = (laborCodeId: number | null): string => {
            if (laborCodeId === null) {
                return 'N/A';
            }

            return laborCodeMap.get(laborCodeId) ?? 'Not found';
        };

        return timeSlips.map((ts: TimeSlip) => {
            return (
                <TableRow key={ts.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell>{userMap.get(ts.userId)}</TableCell>
                    <TableCell>{projectMap.get(ts.projectId)}</TableCell>
                    <TableCell>{getTask(ts.taskId)}</TableCell>
                    <TableCell>{getLaborCode(ts.laborCodeId)}</TableCell>
                    <TableCell>{new Date(ts.date).toLocaleDateString('en')}</TableCell>
                    <TableCell>{ts.hours}</TableCell>
                    <TableCell>{ts.minutes}</TableCell>
                </TableRow>
            );
        });
    };

    const getDropdownOptions = (options: DropdownOption[], dropdownName: string): JSX.Element[] => {
        return options.map((user: DropdownOption) => {
            const { id, name } = user;
            return (
                <MenuItem key={`${dropdownName}${id}`} value={id}>
                    {name}
                </MenuItem>
            );
        });
    };

    const getUserOptions = (): JSX.Element[] => {
        return getDropdownOptions(users, 'user');
    };

    const getProjectOptions = (): JSX.Element[] => {
        return getDropdownOptions(projects, 'project');
    };

    const getTaskOptions = (): JSX.Element[] => {
        return getDropdownOptions(tasks, 'task');
    };

    const getLaborCodeOptions = (): JSX.Element[] => {
        return getDropdownOptions(laborCodes, 'laborCode');
    };

    const handleUserChange = (event: SelectChangeEvent<number>) => {
        setSelectedUserId(Number(event.target.value));
    };

    const handleProjectChange = (event: SelectChangeEvent<number>) => {
        setSelectedProjectId(Number(event.target.value));
    };

    const handleTaskChange = (event: SelectChangeEvent<number>) => {
        setSelectedTaskId(Number(event.target.value));
    };

    const handleLaborCodeChange = (event: SelectChangeEvent<number>) => {
        setSelectedLaborCodeId(Number(event.target.value));
    };

    const getInputs = () => {
        return (
            <div className={classes.inputContainer}>
                <FormControl className={classes.dropdown}>
                    <InputLabel>User</InputLabel>
                    <Select value={selectedUserId} onChange={handleUserChange}>
                        {getUserOptions()}
                    </Select>
                </FormControl>
                <FormControl className={classes.dropdown}>
                    <InputLabel>Project</InputLabel>
                    <Select value={selectedProjectId} onChange={handleProjectChange}>
                        {getProjectOptions()}
                    </Select>
                </FormControl>
                <FormControl className={classes.dropdown}>
                    <InputLabel>Task</InputLabel>
                    <Select value={selectedTaskId} onChange={handleTaskChange}>
                        {getTaskOptions()}
                    </Select>
                </FormControl>
                <FormControl className={classes.dropdown}>
                    <InputLabel>Labor Code</InputLabel>
                    <Select value={selectedLaborCodeId} onChange={handleLaborCodeChange}>
                        {getLaborCodeOptions()}
                    </Select>
                </FormControl>
            </div>
        );
    };

    return (
        <div className={classes.pageContainer}>
            {getInputs()}
            <TableContainer component={Paper} className={classes.tableContainer}>
                <Table aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>User</TableCell>
                            <TableCell>Project</TableCell>
                            <TableCell>Task</TableCell>
                            <TableCell>Labor Code</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Hours</TableCell>
                            <TableCell>Minutes</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>{getRows()}</TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

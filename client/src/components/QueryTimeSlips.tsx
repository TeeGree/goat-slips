import {
    Checkbox,
    CircularProgress,
    FormControl,
    InputLabel,
    ListItemText,
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

const emptyDropdownOption: DropdownOption = {
    id: -1,
    name: 'N/A',
};

export const QueryTimeSlips: React.FC<QueryTimeSlipsProps> = (props: QueryTimeSlipsProps) => {
    const { users, userMap, projects, projectMap, tasks, taskMap, laborCodes, laborCodeMap } =
        props;
    const [loadingResults, setLoadingResults] = useState(true);
    const [timeSlips, setTimeSlips] = useState<TimeSlip[]>([]);

    const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
    const [selectedProjectIds, setSelectedProjectIds] = useState<number[]>([]);
    const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([]);
    const [selectedLaborCodeIds, setSelectedLaborCodeIds] = useState<number[]>([]);

    useEffect(() => {
        fetchTimeSlips();
    }, [selectedUserIds, selectedProjectIds, selectedTaskIds, selectedLaborCodeIds]);

    const fetchTimeSlips = async () => {
        setLoadingResults(true);

        const queryBody: any = {};
        if (selectedUserIds.length !== 0) {
            queryBody.userIds = selectedUserIds;
        }

        if (selectedProjectIds.length !== 0) {
            queryBody.projectIds = selectedProjectIds;
        }

        if (selectedTaskIds.length !== 0) {
            queryBody.taskIds = selectedTaskIds;
        }

        if (selectedLaborCodeIds.length !== 0) {
            queryBody.laborCodeIds = selectedLaborCodeIds;
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

    const getDropdownOptions = (
        options: DropdownOption[],
        dropdownName: string,
        selectedIds: number[],
    ): JSX.Element[] => {
        return options.map((user: DropdownOption) => {
            const { id, name } = user;
            return (
                <MenuItem key={`${dropdownName}${id}`} value={id}>
                    <Checkbox checked={selectedIds.indexOf(id) > -1} />
                    <ListItemText primary={name} />
                </MenuItem>
            );
        });
    };

    const getUserOptions = (): JSX.Element[] => {
        return getDropdownOptions(users, 'user', selectedUserIds);
    };

    const getProjectOptions = (): JSX.Element[] => {
        return getDropdownOptions(projects, 'project', selectedProjectIds);
    };

    const getTaskOptions = (): JSX.Element[] => {
        return getDropdownOptions([emptyDropdownOption, ...tasks], 'task', selectedTaskIds);
    };

    const getLaborCodeOptions = (): JSX.Element[] => {
        return getDropdownOptions(
            [emptyDropdownOption, ...laborCodes],
            'laborCode',
            selectedLaborCodeIds,
        );
    };

    const handleSelectChange = (
        event: SelectChangeEvent<number[]>,
        setStateAction: React.Dispatch<React.SetStateAction<number[]>>,
    ) => {
        const {
            target: { value },
        } = event;
        setStateAction(
            // On autofill we get a stringified value.
            typeof value === 'string' ? value.split(',').map((v) => Number(v)) : value,
        );
    };

    const handleUserChange = (event: SelectChangeEvent<number[]>) => {
        handleSelectChange(event, setSelectedUserIds);
    };

    const handleProjectChange = (event: SelectChangeEvent<number[]>) => {
        handleSelectChange(event, setSelectedProjectIds);
    };

    const handleTaskChange = (event: SelectChangeEvent<number[]>) => {
        handleSelectChange(event, setSelectedTaskIds);
    };

    const handleLaborCodeChange = (event: SelectChangeEvent<number[]>) => {
        handleSelectChange(event, setSelectedLaborCodeIds);
    };

    const renderSelected = (selectedIds: number[], map: Map<number, string>) => {
        let displayText = '';
        selectedIds.forEach((id: number, index: number) => {
            displayText += map.get(id) ?? 'N/A';
            if (index < selectedIds.length - 1) {
                displayText += ', ';
            }
        });

        return displayText;
    };

    const getInputs = () => {
        return (
            <div className={classes.inputContainer}>
                <FormControl className={classes.dropdown}>
                    <InputLabel>User</InputLabel>
                    <Select
                        renderValue={(selected) => renderSelected(selected, userMap)}
                        multiple
                        value={selectedUserIds}
                        onChange={handleUserChange}
                    >
                        {getUserOptions()}
                    </Select>
                </FormControl>
                <FormControl className={classes.dropdown}>
                    <InputLabel>Project</InputLabel>
                    <Select
                        renderValue={(selected) => renderSelected(selected, projectMap)}
                        multiple
                        value={selectedProjectIds}
                        onChange={handleProjectChange}
                    >
                        {getProjectOptions()}
                    </Select>
                </FormControl>
                <FormControl className={classes.dropdown}>
                    <InputLabel>Task</InputLabel>
                    <Select
                        renderValue={(selected) => renderSelected(selected, taskMap)}
                        multiple
                        value={selectedTaskIds}
                        onChange={handleTaskChange}
                    >
                        {getTaskOptions()}
                    </Select>
                </FormControl>
                <FormControl className={classes.dropdown}>
                    <InputLabel>Labor Code</InputLabel>
                    <Select
                        renderValue={(selected) => renderSelected(selected, laborCodeMap)}
                        multiple
                        value={selectedLaborCodeIds}
                        onChange={handleLaborCodeChange}
                    >
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

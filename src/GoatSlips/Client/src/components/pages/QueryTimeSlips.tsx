import { FileDownload } from '@mui/icons-material';
import {
    Button,
    CircularProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from 'dayjs';
import React, { useEffect, useState } from 'react';
import { getCsvOfTimeSlips } from '../../helpers/csvGeneration';
import { fetchGet, fetchPost } from '../../helpers/fetchFunctions';
import { DropdownOption } from '../../types/DropdownOption';
import { ExportableTimeSlip, TimeSlip } from '../../types/TimeSlip';
import { MultiSelect } from '../MultiSelect';
import classes from './QueryTimeSlips.module.scss';

interface QueryTimeSlipsProps {
    projects: DropdownOption[];
    projectMap: Map<number, string>;
    tasks: DropdownOption[];
    taskMap: Map<number, string>;
    laborCodes: DropdownOption[];
    laborCodeMap: Map<number, string>;
    isAdmin: boolean;
    currentUserId: number;
}

const emptyDropdownOption: DropdownOption = {
    id: -1,
    name: 'N/A',
};

export const QueryTimeSlips: React.FC<QueryTimeSlipsProps> = (props: QueryTimeSlipsProps) => {
    const {
        projects,
        projectMap,
        tasks,
        taskMap,
        laborCodes,
        laborCodeMap,
        isAdmin,
        currentUserId,
    } = props;
    const [loadingResults, setLoadingResults] = useState(true);
    const [timeSlips, setTimeSlips] = useState<TimeSlip[]>([]);

    const defaultSelectedUserIds = isAdmin ? [] : [currentUserId];
    const [selectedUserIds, setSelectedUserIds] = useState<number[]>(defaultSelectedUserIds);
    const [selectedProjectIds, setSelectedProjectIds] = useState<number[]>([]);
    const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([]);
    const [selectedLaborCodeIds, setSelectedLaborCodeIds] = useState<number[]>([]);
    const [fromDate, setFromDate] = React.useState<Dayjs | null>(null);
    const [toDate, setToDate] = React.useState<Dayjs | null>(null);
    const [users, setUsers] = useState<DropdownOption[]>([]);
    const [userMap, setUserMap] = useState<Map<number, string>>(new Map<number, string>([]));

    useEffect(() => {
        fetchTimeSlips();
        if (isAdmin) {
            getUsers();
        }
    }, [
        selectedUserIds,
        selectedProjectIds,
        selectedTaskIds,
        selectedLaborCodeIds,
        fromDate,
        toDate,
    ]);

    useEffect(() => {
        if (isAdmin) {
            getUsers();
        }
    }, [isAdmin]);

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

        if (fromDate !== null) {
            queryBody.fromDate = fromDate.format('YYYY-MM-DD');
        }

        if (toDate !== null) {
            queryBody.toDate = toDate.format('YYYY-MM-DD');
        }

        const results = await fetchPost<TimeSlip[]>('Query/QueryTimeSlips', queryBody);
        setTimeSlips(results);

        setLoadingResults(false);
    };

    const getUsers = async () => {
        const usersFromApi: DropdownOption[] = await fetchGet<DropdownOption[]>(
            'User/GetUsersForDropdown',
        );

        const map = new Map<number, string>([]);
        usersFromApi.forEach((userFromApi: DropdownOption) =>
            map.set(userFromApi.id, userFromApi.name),
        );
        setUserMap(map);
        setUsers(usersFromApi);
    };

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

    const getCsvOfSearchResults = (): string => {
        const exportableTimeSlips: ExportableTimeSlip[] = timeSlips.map((ts: TimeSlip) => {
            return {
                username: userMap.get(ts.userId) ?? 'Unknown',
                project: projectMap.get(ts.projectId) ?? 'Unknown',
                task: getTask(ts.taskId),
                laborCode: getLaborCode(ts.laborCodeId),
                date: new Date(ts.date).toLocaleDateString('en'),
                hours: ts.hours,
                minutes: ts.minutes,
            };
        });
        return getCsvOfTimeSlips(exportableTimeSlips);
    };

    const download = () => {
        const data = getCsvOfSearchResults();
        const file = new File([data], 'TimeSlips.csv', {
            type: 'text/plain',
        });

        const link = document.createElement('a');
        const url = URL.createObjectURL(file);

        link.href = url;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    const getUserInput = () => {
        if (isAdmin) {
            return (
                <MultiSelect
                    selectedIds={selectedUserIds}
                    getDisplayTextForId={(id: number) => userMap.get(id) ?? 'N/A'}
                    setSelectedIds={setSelectedUserIds}
                    label="User"
                    options={users}
                    keyPrefix="user-"
                />
            );
        }
        return null;
    };

    const getInputs = () => {
        return (
            <div className={classes.inputContainer}>
                {getUserInput()}
                <MultiSelect
                    selectedIds={selectedProjectIds}
                    getDisplayTextForId={(id: number) => projectMap.get(id) ?? 'N/A'}
                    setSelectedIds={setSelectedProjectIds}
                    label="Project"
                    options={projects}
                    keyPrefix="project-"
                />
                <MultiSelect
                    selectedIds={selectedTaskIds}
                    getDisplayTextForId={(id: number) => taskMap.get(id) ?? 'N/A'}
                    setSelectedIds={setSelectedTaskIds}
                    label="Task"
                    options={[emptyDropdownOption, ...tasks]}
                    keyPrefix="task-"
                />
                <MultiSelect
                    selectedIds={selectedLaborCodeIds}
                    getDisplayTextForId={(id: number) => laborCodeMap.get(id) ?? 'N/A'}
                    setSelectedIds={setSelectedLaborCodeIds}
                    label="Labor Code"
                    options={[emptyDropdownOption, ...laborCodes]}
                    keyPrefix="laborCode-"
                />
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        label="From Date"
                        value={fromDate}
                        onChange={(newValue) => {
                            setFromDate(newValue);
                        }}
                        renderInput={(params) => <TextField {...params} />}
                    />
                </LocalizationProvider>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        label="To Date"
                        value={toDate}
                        onChange={(newValue) => {
                            setToDate(newValue);
                        }}
                        renderInput={(params) => <TextField {...params} />}
                    />
                </LocalizationProvider>
                <Tooltip title="Export results as csv.">
                    <Button variant="contained" onClick={download}>
                        <FileDownload />
                    </Button>
                </Tooltip>
            </div>
        );
    };

    const getActionBar = () => {
        return <div className={classes.actionBar}>hey there</div>;
    };

    return (
        <div className={classes.pageContainer}>
            {getActionBar()}
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

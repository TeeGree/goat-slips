import {
    CircularProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { fetchGet } from '../../helpers/fetchFunctions';
import { DropdownOption } from '../../types/DropdownOption';
import { TimeSlipLog } from '../../types/TimeSlipLog';
import classes from './TimeSlipLogView.module.scss';

interface TimeSlipLogProps {
    projectMap: Map<number, string>;
    taskMap: Map<number, string>;
    laborCodeMap: Map<number, string>;
}

export const TimeSlipLogView: React.FC<TimeSlipLogProps> = (props: TimeSlipLogProps) => {
    const { projectMap, taskMap, laborCodeMap } = props;

    const [isLoaded, setIsLoaded] = useState(false);

    const [userMap, setUserMap] = useState(new Map<number, string>());
    const [timeSlipLogs, setTimeSlipLogs] = useState<TimeSlipLog[]>([]);

    useEffect(() => {
        fetchTimeSlips();
        getUsers();
    }, []);

    const fetchTimeSlips = async () => {
        const results = await fetchGet<TimeSlipLog[]>('TimeSlipLog');
        setTimeSlipLogs(
            results.map((r) => {
                return {
                    ...r,
                    timeStamp: new Date(r.timeStamp),
                    oldDate: r.oldDate === null ? null : new Date(r.oldDate),
                    newDate: r.newDate === null ? null : new Date(r.newDate),
                };
            }),
        );

        setIsLoaded(true);
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
    };

    const getLogRows = () => {
        if (!isLoaded) {
            return (
                <TableRow>
                    <TableCell className={classes.emptyRow} colSpan={8}>
                        <CircularProgress />
                    </TableCell>
                </TableRow>
            );
        }
        const timeSlipLogElements = timeSlipLogs.map((timeSlipLog: TimeSlipLog) => {
            return (
                <TableRow
                    key={timeSlipLog.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                    <TableCell>{getUpdateTypeCell(timeSlipLog.updateType)}</TableCell>
                    <TableCell>
                        {getUserCell(timeSlipLog.oldUserId, timeSlipLog.newUserId)}
                    </TableCell>
                    <TableCell>
                        {formatCell(
                            timeSlipLog.oldDate?.toLocaleDateString(),
                            timeSlipLog.newDate?.toLocaleDateString(),
                        )}
                    </TableCell>
                    <TableCell>
                        {getProjectCell(timeSlipLog.oldProjectId, timeSlipLog.newProjectId)}
                    </TableCell>
                    <TableCell>
                        {getTaskCell(timeSlipLog.oldTaskId, timeSlipLog.newTaskId)}
                    </TableCell>
                    <TableCell>
                        {getLaborCodeCell(timeSlipLog.oldLaborCodeId, timeSlipLog.newLaborCodeId)}
                    </TableCell>
                    <TableCell>
                        {formatCell(timeSlipLog.oldDescription, timeSlipLog.newDescription)}
                    </TableCell>
                    <TableCell>
                        {formatCell(
                            timeSlipLog.oldHours?.toString(),
                            timeSlipLog.newHours?.toString(),
                        )}
                    </TableCell>
                    <TableCell>
                        {formatCell(
                            timeSlipLog.oldMinutes?.toString(),
                            timeSlipLog.newMinutes?.toString(),
                        )}
                    </TableCell>
                    <TableCell>{timeSlipLog.timeStamp.toLocaleString('en')}</TableCell>
                    <TableCell>{userMap.get(timeSlipLog.updateUserId)}</TableCell>
                </TableRow>
            );
        });

        return timeSlipLogElements;
    };

    const getUpdateTypeCell = (updateType: 'C' | 'U' | 'D') => {
        if (updateType === 'C') {
            return <span className={classes.newValue}>Create</span>;
        }

        if (updateType === 'D') {
            return <span className={classes.oldValue}>Delete</span>;
        }

        return 'Update';
    };

    const getUserCell = (oldUserId: number | null, newUserId: number | null) => {
        const oldUser = oldUserId === null ? '' : userMap.get(oldUserId) ?? '';
        const newUser = newUserId === null ? '' : userMap.get(newUserId) ?? '';
        return formatCell(oldUser, newUser);
    };

    const getProjectCell = (oldProjectId: number | null, newProjectId: number | null) => {
        const oldProject = oldProjectId === null ? '' : projectMap.get(oldProjectId) ?? '';
        const newProject = newProjectId === null ? '' : projectMap.get(newProjectId) ?? '';
        return formatCell(oldProject, newProject);
    };

    const getTaskCell = (oldTaskId: number | null, newTaskId: number | null) => {
        const oldTask = oldTaskId === null ? '' : taskMap.get(oldTaskId) ?? '';
        const newTask = newTaskId === null ? '' : taskMap.get(newTaskId) ?? '';
        return formatCell(oldTask, newTask);
    };

    const getLaborCodeCell = (oldLaborCodeId: number | null, newLaborCodeId: number | null) => {
        const oldLaborCode = oldLaborCodeId === null ? '' : laborCodeMap.get(oldLaborCodeId) ?? '';
        const newLaborCode = newLaborCodeId === null ? '' : laborCodeMap.get(newLaborCodeId) ?? '';
        return formatCell(oldLaborCode, newLaborCode);
    };

    const formatCell = (
        oldValue: string | null | undefined,
        newValue: string | null | undefined,
    ) => {
        if (
            oldValue !== newValue &&
            oldValue !== '' &&
            oldValue !== null &&
            oldValue !== undefined
        ) {
            if (newValue === '' || newValue === null || newValue === undefined) {
                return <span className={classes.oldValue}>{oldValue}</span>;
            }
            return (
                <>
                    <span className={classes.oldValueStrike}>{oldValue}</span>
                    <span className={classes.newValuePadded}>{newValue}</span>
                </>
            );
        }

        return <span className={classes.newValue}>{newValue}</span>;
    };

    return (
        <div className={classes.pageContainer}>
            <div className={classes.header}>Time Slip Log</div>
            <TableContainer component={Paper} className={classes.tableContainer}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Update Type</TableCell>
                            <TableCell>User</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Project</TableCell>
                            <TableCell>Task</TableCell>
                            <TableCell>Labor Code</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Hours</TableCell>
                            <TableCell>Minutes</TableCell>
                            <TableCell>Update Date</TableCell>
                            <TableCell>Updated By</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>{getLogRows()}</TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

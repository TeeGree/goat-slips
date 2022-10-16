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
import { fetchPost } from '../helpers/fetchFunctions';
import { TimeSlip } from '../types/TimeSlip';

export const QueryTimeSlips: React.FC<{}> = () => {
    const [loadingResults, setLoadingResults] = useState(true);
    const [timeSlips, setTimeSlips] = useState<TimeSlip[]>([]);

    useEffect(() => {
        fetchTimeSlips();
    }, []);

    const fetchTimeSlips = async () => {
        setLoadingResults(true);

        const results = await fetchPost<TimeSlip[]>('TimeSlip/QueryTimeSlips', {});
        setTimeSlips(results);

        setLoadingResults(false);
    };

    const getRows = (): JSX.Element | JSX.Element[] => {
        if (loadingResults) {
            return (
                <TableRow>
                    <TableCell colSpan={6}>
                        <CircularProgress />
                    </TableCell>
                </TableRow>
            );
        }

        return timeSlips.map((ts: TimeSlip) => {
            return (
                <TableRow key={ts.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell component="th" scope="row">
                        {ts.userId}
                    </TableCell>
                    <TableCell>{ts.projectId}</TableCell>
                    <TableCell>{ts.taskId ?? 'N/A'}</TableCell>
                    <TableCell>{ts.laborCodeId ?? 'N/A'}</TableCell>
                    <TableCell>{ts.hours}</TableCell>
                    <TableCell>{ts.minutes}</TableCell>
                </TableRow>
            );
        });
    };

    return (
        <div>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>User ID</TableCell>
                            <TableCell>Project ID</TableCell>
                            <TableCell>Task ID</TableCell>
                            <TableCell>Labor Code ID</TableCell>
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

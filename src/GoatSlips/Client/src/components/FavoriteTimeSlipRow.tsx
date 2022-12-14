import { Delete } from '@mui/icons-material';
import { Box, Button, Modal, TableCell, TableRow } from '@mui/material';
import React, { useState } from 'react';
import { modalStyle } from '../constants/modalStyle';
import { codeInUse } from '../constants/statusCodes';
import { fetchPostResponse } from '../helpers/fetchFunctions';
import { ErrorDetails } from '../types/ErrorDetails';
import { FavoriteTimeSlipData } from '../types/TimeSlip';
import classes from './FavoriteTimeSlip.module.scss';

interface FavoriteTimeSlipRowProps {
    favoriteTimeSlip: FavoriteTimeSlipData;
    fetchFavoriteTimeSlips: () => Promise<void>;
    setError: (message: string) => void;
    setSuccess: (message: string) => void;
    projectMap: Map<number, string>;
    taskMap: Map<number, string>;
    laborCodeMap: Map<number, string>;
}

export const FavoriteTimeSlipRow: React.FC<FavoriteTimeSlipRowProps> = (
    props: FavoriteTimeSlipRowProps,
) => {
    const {
        favoriteTimeSlip,
        setError,
        setSuccess,
        fetchFavoriteTimeSlips,
        projectMap,
        taskMap,
        laborCodeMap,
    } = props;

    const [isBeingDeleted, setIsBeingDeleted] = useState(false);

    const deleteFavorite = async () => {
        const response = await fetchPostResponse(
            `FavoriteTimeSlip/DeleteFavoriteTimeSlip/${favoriteTimeSlip.id}`,
        );

        if (response.ok) {
            await fetchFavoriteTimeSlips();
            setSuccess(`Successfully deleted "${favoriteTimeSlip.name}".`);
        } else if (response.status === codeInUse) {
            const message: ErrorDetails = await response.json();
            setError(message.detail);
        }

        setIsBeingDeleted(false);
    };

    const getProjectName = (): string => {
        const projectName = projectMap.get(favoriteTimeSlip.projectId);

        return projectName ?? 'N/A';
    };

    const getTaskName = (): string => {
        const defaultTaskName = 'N/A';
        if (favoriteTimeSlip.taskId === null) {
            return defaultTaskName;
        }

        const taskName = taskMap.get(favoriteTimeSlip.taskId);
        return taskName ?? defaultTaskName;
    };

    const getLaborCodeName = (): string => {
        const defaultLaborCodeName = 'N/A';
        if (favoriteTimeSlip.laborCodeId === null) {
            return defaultLaborCodeName;
        }

        const laborCodeName = laborCodeMap.get(favoriteTimeSlip.laborCodeId);
        return laborCodeName ?? defaultLaborCodeName;
    };

    return (
        <>
            <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell>{favoriteTimeSlip.name}</TableCell>
                <TableCell>{getProjectName()}</TableCell>
                <TableCell>{getTaskName()}</TableCell>
                <TableCell>{getLaborCodeName()}</TableCell>
                <TableCell>
                    <Button
                        className={classes.button}
                        variant="contained"
                        color="error"
                        onClick={() => setIsBeingDeleted(true)}
                    >
                        <Delete />
                    </Button>
                </TableCell>
            </TableRow>
            <Modal open={isBeingDeleted}>
                <Box sx={modalStyle}>
                    <h2>Are you sure you want to delete {`"${favoriteTimeSlip.name}"`}?</h2>
                    <div className={classes.modalButtons}>
                        <Button variant="contained" color="error" onClick={() => deleteFavorite()}>
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

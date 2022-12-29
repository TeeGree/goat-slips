import {
    Alert,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import React, { useState } from 'react';
import { AlertMessage } from '../../types/AlertMessage';
import { FavoriteTimeSlipData } from '../../types/TimeSlip';
import { FavoriteTimeSlipRow } from '../FavoriteTimeSlipRow';
import classes from './ManageFavorites.module.scss';

interface ManageFavoritesProps {
    favoriteTimeSlips: FavoriteTimeSlipData[];
    fetchFavoriteTimeSlips: () => Promise<void>;
    projectMap: Map<number, string>;
    taskMap: Map<number, string>;
    laborCodeMap: Map<number, string>;
}

export const ManageFavorites: React.FC<ManageFavoritesProps> = (props: ManageFavoritesProps) => {
    const { favoriteTimeSlips, fetchFavoriteTimeSlips, projectMap, taskMap, laborCodeMap } = props;

    const [alertMessage, setAlertMessage] = useState<AlertMessage | null>(null);

    const getFavoriteTimeSlipRows = () => {
        const existingLaborCodeElements = favoriteTimeSlips.map(
            (favoriteTimeSlip: FavoriteTimeSlipData) => {
                return (
                    <FavoriteTimeSlipRow
                        key={`favoriteTimeSlip-${favoriteTimeSlip.id}`}
                        favoriteTimeSlip={favoriteTimeSlip}
                        fetchFavoriteTimeSlips={fetchFavoriteTimeSlips}
                        setError={(message: string) =>
                            setAlertMessage({ message, severity: 'error' })
                        }
                        setSuccess={(message: string) =>
                            setAlertMessage({ message, severity: 'success' })
                        }
                        projectMap={projectMap}
                        taskMap={taskMap}
                        laborCodeMap={laborCodeMap}
                    />
                );
            },
        );

        return existingLaborCodeElements;
    };

    const getAlert = () => {
        if (alertMessage === null) {
            return <></>;
        }

        return <Alert severity={alertMessage.severity}>{alertMessage.message}</Alert>;
    };

    return (
        <div className={classes.pageContainer}>
            <div className={classes.header}>Favorite Time Slips</div>
            {getAlert()}
            <TableContainer component={Paper} className={classes.tableContainer}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Project</TableCell>
                            <TableCell>Task</TableCell>
                            <TableCell>Labor Code</TableCell>
                            <TableCell className={classes.buttonCell} />
                        </TableRow>
                    </TableHead>
                    <TableBody>{getFavoriteTimeSlipRows()}</TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

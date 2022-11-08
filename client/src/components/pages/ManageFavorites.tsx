import { Alert } from '@mui/material';
import React, { useState } from 'react';
import { AlertMessage } from '../../types/AlertMessage';
import { FavoriteTimeSlipData } from '../../types/TimeSlip';
import { FavoriteTimeSlip } from '../FavoriteTimeSlip';
import classes from './ManageTimeCodes.module.scss';

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

    const getFavoriteTimeSlipsList = () => {
        const existingLaborCodeElements = favoriteTimeSlips.map(
            (favoriteTimeSlip: FavoriteTimeSlipData) => {
                return (
                    <FavoriteTimeSlip
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

        return <div className={classes.projectsContainer}>{existingLaborCodeElements}</div>;
    };

    const getAlert = () => {
        if (alertMessage === null) {
            return <></>;
        }

        return <Alert severity={alertMessage.severity}>{alertMessage.message}</Alert>;
    };

    return (
        <div className={classes.pageContainer}>
            <div className={classes.header}>Manage Favorite Time Slips</div>
            {getAlert()}
            <div>{getFavoriteTimeSlipsList()}</div>
        </div>
    );
};

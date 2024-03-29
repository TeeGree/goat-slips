import React, { useState } from 'react';
import classes from './ReadOnlyTimeSlip.module.scss';
import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Modal,
    TextField,
    Tooltip,
} from '@mui/material';
import { TimeSlip } from '../../types/TimeSlip';
import { Add, Star } from '@mui/icons-material';
import { modalStyle } from '../../constants/modalStyle';
import { fetchPostResponse } from '../../helpers/fetchFunctions';
import { Toast } from '../Toast';
import { ErrorDetails } from '../../types/ErrorDetails';
import { AlertMessage } from '../../types/AlertMessage';
import { EntityLabelWithIcon } from '../EntityLabelWithIcon';
import { adminAccessRight } from '../../constants/requiredAccessRights';
import { Project } from '../../types/Project';

interface ReadOnlyTimeSlipProps {
    date: Date;
    timeSlip: TimeSlip;
    projectMap: Map<number, Project>;
    getTaskName: (taskId: number) => string;
    getLaborCodeName: (laborCodeId: number) => string;
    handleEdit: () => void;
    deleteTimeSlip: (timeSlipId: number) => Promise<void>;
    fetchFavoriteTimeSlips: () => void;
    userProjectIds: Set<number>;
    userAccessRights: Set<string>;
}

export const ReadOnlyTimeSlip: React.FC<ReadOnlyTimeSlipProps> = (props: ReadOnlyTimeSlipProps) => {
    const {
        date,
        timeSlip,
        projectMap,
        getTaskName,
        getLaborCodeName,
        handleEdit,
        deleteTimeSlip,
        fetchFavoriteTimeSlips,
        userProjectIds,
        userAccessRights,
    } = props;

    const task = timeSlip.taskId === null ? 'N/A' : getTaskName(timeSlip.taskId);
    const laborCode =
        timeSlip.laborCodeId === null ? 'N/A' : getLaborCodeName(timeSlip.laborCodeId);

    const [isDeleting, setIsDeleting] = useState(false);
    const [isFavoriting, setIsFavoriting] = useState(false);
    const [favoriteName, setFavoriteName] = useState('');
    const [alertMessage, setAlertMessage] = useState<AlertMessage | null>(null);

    const handleFavoriteNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFavoriteName(event.target.value);
    };

    const saveFavoriteTimeSlip = async (): Promise<void> => {
        const response = await fetchPostResponse('FavoriteTimeSlip/AddFavoriteTimeSlip', {
            name: favoriteName,
            projectId: timeSlip.projectId,
            taskId: timeSlip.taskId,
            laborCodeId: timeSlip.laborCodeId,
        });

        if (response.ok) {
            setAlertMessage({ message: `Saved "${favoriteName}"`, severity: 'success' });
            handleCloseFavoriteModal();
            fetchFavoriteTimeSlips();
        } else {
            const message: ErrorDetails = await response.json();
            setAlertMessage({ message: message.detail, severity: 'error' });
        }
    };

    const handleCloseFavoriteModal = () => {
        setIsFavoriting(false);
        setFavoriteName('');
    };

    const canUserEditTimeSlip = () => {
        const project = projectMap.get(timeSlip.projectId);
        if (project === undefined) {
            throw Error('Project not found!');
        }

        if (project.lockDate === null) {
            return true;
        }

        const dateNoTime = new Date(date);
        dateNoTime.setHours(0, 0, 0, 0);

        return (
            project.lockDate < dateNoTime ||
            userAccessRights.has(adminAccessRight) ||
            userProjectIds.has(timeSlip.projectId)
        );
    };

    const getEditButton = () => {
        if (!canUserEditTimeSlip()) {
            return <></>;
        }

        return (
            <Button variant="contained" onClick={handleEdit}>
                Edit
            </Button>
        );
    };

    const getDeleteButton = () => {
        if (!canUserEditTimeSlip()) {
            return <></>;
        }

        return (
            <Button variant="contained" color="error" onClick={() => setIsDeleting(true)}>
                Delete
            </Button>
        );
    };

    return (
        <>
            <Card>
                <CardContent className={classes.content}>
                    <EntityLabelWithIcon
                        label={projectMap.get(timeSlip.projectId)?.name ?? ''}
                        timeCodeType="project"
                    />
                    <EntityLabelWithIcon label={task} timeCodeType="task" />
                    <EntityLabelWithIcon label={laborCode} timeCodeType="laborCode" />
                    <div className={classes.description}>{timeSlip.description}</div>
                    <div
                        className={classes.time}
                    >{`${timeSlip.hours} hr ${timeSlip.minutes} min`}</div>
                </CardContent>
                <CardActions className={classes.cardActions}>
                    <Tooltip title="Add as favorite">
                        <Button
                            color="warning"
                            className={classes.favoriteButton}
                            onClick={() => setIsFavoriting(true)}
                        >
                            <Add />
                            <Star />
                        </Button>
                    </Tooltip>
                    {getEditButton()}
                    {getDeleteButton()}
                </CardActions>
            </Card>
            <Modal open={isDeleting}>
                <Box sx={modalStyle}>
                    <h2>Are you sure you want to delete this time slip?</h2>
                    <div className={classes.modalButtons}>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={() => deleteTimeSlip(timeSlip.id)}
                        >
                            Delete
                        </Button>
                        <Button
                            variant="contained"
                            className={classes.cancelButton}
                            onClick={() => setIsDeleting(false)}
                        >
                            Cancel
                        </Button>
                    </div>
                </Box>
            </Modal>
            <Modal open={isFavoriting}>
                <Box sx={modalStyle}>
                    <h2>Enter a name for this favorite:</h2>
                    <div className={classes.padded}>
                        <TextField
                            label="Name"
                            value={favoriteName}
                            onChange={handleFavoriteNameChange}
                        />
                    </div>
                    <div className={`${classes.padded} ${classes.content}`}>
                        <EntityLabelWithIcon
                            label={projectMap.get(timeSlip.projectId)?.name ?? ''}
                            timeCodeType="project"
                        />
                        <EntityLabelWithIcon label={task} timeCodeType="task" />
                        <EntityLabelWithIcon label={laborCode} timeCodeType="laborCode" />
                    </div>
                    <div className={classes.modalButtons}>
                        <Button
                            disabled={favoriteName === ''}
                            variant="contained"
                            color="success"
                            onClick={saveFavoriteTimeSlip}
                        >
                            Save Favorite
                        </Button>
                        <Button
                            variant="contained"
                            className={classes.cancelButton}
                            onClick={handleCloseFavoriteModal}
                        >
                            Cancel
                        </Button>
                    </div>
                </Box>
            </Modal>
            <Toast
                severity={alertMessage?.severity}
                message={alertMessage?.message}
                onClose={() => setAlertMessage(null)}
            />
        </>
    );
};

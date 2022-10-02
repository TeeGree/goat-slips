import React, { useState } from 'react';
import classes from './ReadOnlyTimeSlip.module.scss';
import { Box, Button, Card, CardActions, CardContent, Modal } from '@mui/material';
import { TimeSlip } from '../../types/TimeSlip';

interface ReadOnlyTimeSlipProps {
    timeSlip: TimeSlip;
    getProjectName: (projectId: number) => string;
    getTaskName: (taskId: number) => string;
    getLaborCodeName: (laborCodeId: number) => string;
    handleEdit: () => void;
    deleteTimeSlip: (timeSlipId: number) => Promise<void>;
}

export const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    color: 'white',
    p: 4,
};

export const ReadOnlyTimeSlip: React.FC<ReadOnlyTimeSlipProps> = (props: ReadOnlyTimeSlipProps) => {
    const { timeSlip, getProjectName, getTaskName, getLaborCodeName, handleEdit, deleteTimeSlip } =
        props;

    const task = timeSlip.taskId === null ? 'N/A' : getTaskName(timeSlip.taskId);
    const laborCode =
        timeSlip.laborCodeId === null ? 'N/A' : getLaborCodeName(timeSlip.laborCodeId);

    const [isDeleting, setIsDeleting] = useState(false);

    return (
        <>
            <Card>
                <CardContent>
                    <div>Project: {getProjectName(timeSlip.projectId)}</div>
                    <div>Task: {task}</div>
                    <div>Labor Code: {laborCode}</div>
                    <div>Hours: {timeSlip.hours}</div>
                    <div>Minutes: {timeSlip.minutes}</div>
                </CardContent>
                <CardActions className={classes.cardActions}>
                    <Button variant="contained" onClick={handleEdit}>
                        Edit
                    </Button>
                    <Button variant="contained" color="error" onClick={() => setIsDeleting(true)}>
                        Delete
                    </Button>
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
        </>
    );
};

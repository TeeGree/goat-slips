import React from 'react';
import classes from './ReadOnlyTimeSlip.module.scss';
import { Button, Card, CardActions, CardContent } from '@mui/material';
import { TimeSlip } from '../../types/TimeSlip';

interface ReadOnlyTimeSlipProps {
    timeSlip: TimeSlip;
    getProjectName: (projectId: number) => string;
    getTaskName: (taskId: number) => string;
    getLaborCodeName: (laborCodeId: number) => string;
    handleEdit: () => void;
    deleteTimeSlip: (timeSlipId: number) => Promise<void>;
}

export const ReadOnlyTimeSlip: React.FC<ReadOnlyTimeSlipProps> = (props: ReadOnlyTimeSlipProps) => {
    const { timeSlip, getProjectName, getTaskName, getLaborCodeName, handleEdit, deleteTimeSlip } =
        props;

    const task = timeSlip.taskId === null ? 'N/A' : getTaskName(timeSlip.taskId);
    const laborCode =
        timeSlip.laborCodeId === null ? 'N/A' : getLaborCodeName(timeSlip.laborCodeId);

    return (
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
                <Button
                    variant="contained"
                    color="error"
                    onClick={() => deleteTimeSlip(timeSlip.id)}
                >
                    Delete
                </Button>
            </CardActions>
        </Card>
    );
};

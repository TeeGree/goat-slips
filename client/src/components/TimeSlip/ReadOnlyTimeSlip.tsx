import React, { useState } from 'react';
import classes from './ReadOnlyTimeSlip.module.scss';
import { Box, Button, Card, CardActions, CardContent, Modal, Tooltip } from '@mui/material';
import { TimeSlip } from '../../types/TimeSlip';
import { Flag, Task, Work } from '@mui/icons-material';
import { modalStyle } from '../../constants/modalStyle';

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

    const [isDeleting, setIsDeleting] = useState(false);

    const getReadonlyPropText = (text: string, icon: React.ReactNode, tooltip: string) => {
        return (
            <div className={classes.readonlyPropText}>
                <Tooltip title={tooltip} placement="left">
                    <span className={classes.readonlyPropTextSpan}>
                        {icon}
                        {text}
                    </span>
                </Tooltip>
            </div>
        );
    };

    return (
        <>
            <Card>
                <CardContent className={classes.content}>
                    {getReadonlyPropText(
                        getProjectName(timeSlip.projectId),
                        <Flag className={classes.icon} />,
                        'Project',
                    )}
                    {getReadonlyPropText(task, <Task className={classes.icon} />, 'Task')}
                    {getReadonlyPropText(
                        laborCode,
                        <Work className={classes.icon} />,
                        'Labor Code',
                    )}
                    <div
                        className={classes.time}
                    >{`${timeSlip.hours} hr ${timeSlip.minutes} min`}</div>
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

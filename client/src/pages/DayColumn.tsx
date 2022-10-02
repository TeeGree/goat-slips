import React, { useState } from 'react';
import classes from './DayColumn.module.scss';
import { Day } from '../types/Day';
import { Button, Card, CardContent } from '@mui/material';
import { Add } from '@mui/icons-material';
import { EditableTimeSlip } from './EditableTimeSlip';
import { DropdownOption } from '../types/DropdownOption';
import { TimeSlip } from '../types/TimeSlip';

interface DayColumnProps {
    date: Date;
    day: Day;
    isCurrentDay: boolean;
    projectOptions: DropdownOption[];
    laborCodeOptions: DropdownOption[];
    getTaskOptionsForProject: (projectId: number) => DropdownOption[];
    saveTimeSlip: (
        projectId: number,
        taskId: number | null,
        laborCodeId: number | null,
        hours: number,
        minutes: number,
        date: Date,
    ) => Promise<Response>;
    timeSlips: TimeSlip[];
    getProjectName: (projectId: number) => string;
    getTaskName: (taskId: number) => string;
    getLaborCodeName: (laborCodeId: number) => string;
}

export const DayColumn: React.FC<DayColumnProps> = (props: DayColumnProps) => {
    const [addingTimeSlip, setAddingTimeSlip] = useState(false);

    const {
        date,
        day,
        isCurrentDay,
        projectOptions,
        laborCodeOptions,
        getTaskOptionsForProject,
        saveTimeSlip,
        timeSlips,
        getProjectName,
        getTaskName,
        getLaborCodeName,
    } = props;

    const getDateString = () => {
        return date.toLocaleDateString('en');
    };

    const saveTimeSlipAndStopAddingTimeSlip = async (
        projectId: number,
        taskId: number | null,
        laborCodeId: number | null,
        hours: number,
        minutes: number,
    ) => {
        const response = await saveTimeSlip(projectId, taskId, laborCodeId, hours, minutes, date);

        if (response.ok) {
            setAddingTimeSlip(false);
        }
    };

    const getAddTimeSlipButtonElements = (): JSX.Element => {
        if (addingTimeSlip) {
            return (
                <EditableTimeSlip
                    saveTimeSlip={saveTimeSlipAndStopAddingTimeSlip}
                    projectOptions={projectOptions}
                    laborCodeOptions={laborCodeOptions}
                    getTaskOptionsForProject={getTaskOptionsForProject}
                    stopAddingTimeslip={() => setAddingTimeSlip(false)}
                />
            );
        }

        return (
            <Button variant="contained" onClick={() => setAddingTimeSlip(true)}>
                <Add />
            </Button>
        );
    };

    const getExistingTimeSlipCards = (): JSX.Element[] => {
        return timeSlips?.map((ts: TimeSlip) => {
            const task = ts.taskId === null ? 'N/A' : getTaskName(ts.taskId);
            const laborCode = ts.laborCodeId === null ? 'N/A' : getLaborCodeName(ts.laborCodeId);
            return (
                <Card key={ts.id} className={classes.timeSlipCard}>
                    <CardContent>
                        <div>Project: {getProjectName(ts.projectId)}</div>
                        <div>Task: {task}</div>
                        <div>Labor Code: {laborCode}</div>
                        <div>Hours: {ts.hours}</div>
                        <div>Minutes: {ts.minutes}</div>
                    </CardContent>
                </Card>
            );
        });
    };

    const className = isCurrentDay ? 'current-day ' : '';
    return (
        <div className={`${className} ${classes.dayColumn}`}>
            <div className={classes.dayHeader}>
                <div>{day}</div>
                <div>{getDateString()}</div>
                <hr />
            </div>
            <div className={classes.dayBody}>
                {getAddTimeSlipButtonElements()}
                {getExistingTimeSlipCards()}
            </div>
        </div>
    );
};

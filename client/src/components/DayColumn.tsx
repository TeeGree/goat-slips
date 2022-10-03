import React, { useState } from 'react';
import classes from './DayColumn.module.scss';
import { Day } from '../types/Day';
import { Button } from '@mui/material';
import { Add } from '@mui/icons-material';
import { EditableTimeSlip } from './TimeSlip/EditableTimeSlip';
import { DropdownOption } from '../types/DropdownOption';
import { TimeSlip } from '../types/TimeSlip';
import { ExistingTimeSlip } from './TimeSlip/ExistingTimeSlip';

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
    updateTimeSlip: (
        timeSlipId: number,
        projectId: number,
        taskId: number | null,
        laborCodeId: number | null,
        hours: number,
        minutes: number,
    ) => Promise<Response>;
    deleteTimeSlip: (timeSlipId: number) => Promise<void>;
    timeSlips: TimeSlip[];
    getProjectName: (projectId: number) => string;
    getTaskName: (taskId: number) => string;
    getLaborCodeName: (laborCodeId: number) => string;
    totalHours: number;
    totalMinutes: number;
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
        updateTimeSlip,
        timeSlips,
        getProjectName,
        getTaskName,
        getLaborCodeName,
        deleteTimeSlip,
        totalHours,
        totalMinutes,
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
            return (
                <ExistingTimeSlip
                    key={ts.id}
                    timeSlip={ts}
                    getProjectName={getProjectName}
                    getTaskName={getTaskName}
                    getLaborCodeName={getLaborCodeName}
                    projectOptions={projectOptions}
                    laborCodeOptions={laborCodeOptions}
                    getTaskOptionsForProject={getTaskOptionsForProject}
                    saveTimeSlip={updateTimeSlip}
                    deleteTimeSlip={deleteTimeSlip}
                />
            );
        });
    };

    const className = isCurrentDay ? 'current-day ' : '';
    return (
        <div className={`${className} ${classes.dayColumn}`}>
            <div className={classes.dayHeader}>
                <div>{day}</div>
                <div>{getDateString()}</div>
            </div>
            <div className={classes.dayTotal}>{`${totalHours} hr ${totalMinutes} min`}</div>
            <div className={classes.dayBody}>
                {getAddTimeSlipButtonElements()}
                {getExistingTimeSlipCards()}
            </div>
        </div>
    );
};

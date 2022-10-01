import React, { useState } from 'react';
import classes from './DayColumn.module.scss';
import { Day } from '../types/Day';
import { Button } from '@mui/material';
import { Add } from '@mui/icons-material';
import { EditableTimeSlip } from './EditableTimeSlip';
import { DropdownOption } from '../types/DropdownOption';

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

    const className = isCurrentDay ? 'current-day ' : '';
    return (
        <div className={`${className} ${classes.dayColumn}`}>
            <div className={classes.dayHeader}>
                <div>{day}</div>
                <div>{getDateString()}</div>
                <hr />
            </div>
            <div className={classes.dayBody}>{getAddTimeSlipButtonElements()}</div>
        </div>
    );
};

import React, { useState } from 'react';
import { TimeSlip } from '../../types/TimeSlip';
import { DropdownOption } from '../../types/DropdownOption';
import { ReadOnlyTimeSlip } from './ReadOnlyTimeSlip';
import { EditableTimeSlip } from './EditableTimeSlip';
import classes from './ExistingTimeSlip.module.scss';
import { Day } from '../../types/Day';

interface ExistingTimeSlipProps {
    day: Day;
    timeSlip: TimeSlip;
    getProjectName: (projectId: number) => string;
    getTaskName: (taskId: number) => string;
    getLaborCodeName: (laborCodeId: number) => string;
    projectOptions: DropdownOption[];
    laborCodeOptions: DropdownOption[];
    getTaskOptionsForProject: (projectId: number) => DropdownOption[];
    saveTimeSlip: (
        timeSlipId: number,
        projectId: number,
        taskId: number | null,
        laborCodeId: number | null,
        hours: number,
        minutes: number,
        days: Day[],
        description: string,
    ) => Promise<Response>;
    deleteTimeSlip: (timeSlipId: number) => Promise<void>;
    setMinutesDiff: (minutesDiff: number) => void;
    fetchFavoriteTimeSlips: () => void;
}

export const ExistingTimeSlip: React.FC<ExistingTimeSlipProps> = (props: ExistingTimeSlipProps) => {
    const {
        day,
        timeSlip,
        getProjectName,
        getTaskName,
        getLaborCodeName,
        getTaskOptionsForProject,
        laborCodeOptions,
        projectOptions,
        saveTimeSlip,
        deleteTimeSlip,
        setMinutesDiff,
        fetchFavoriteTimeSlips,
    } = props;

    const [isEditing, setIsEditing] = useState(false);

    const saveEditedTimeSlip = async (
        projectId: number,
        taskId: number | null,
        laborCodeId: number | null,
        hours: number,
        minutes: number,
        days: Day[],
        description: string,
    ) => {
        const response = await saveTimeSlip(
            timeSlip.id,
            projectId,
            taskId,
            laborCodeId,
            hours,
            minutes,
            days,
            description,
        );
        if (response.ok) {
            setIsEditing(false);
        }
    };

    const getCard = () => {
        if (isEditing) {
            return (
                <EditableTimeSlip
                    day={day}
                    projectOptions={projectOptions}
                    laborCodeOptions={laborCodeOptions}
                    getTaskOptionsForProject={getTaskOptionsForProject}
                    saveTimeSlip={saveEditedTimeSlip}
                    stopAddingTimeslip={() => setIsEditing(false)}
                    projectId={timeSlip.projectId}
                    taskId={timeSlip.taskId === null ? undefined : timeSlip.taskId}
                    laborCodeId={timeSlip.laborCodeId === null ? undefined : timeSlip.laborCodeId}
                    hours={timeSlip.hours}
                    minutes={timeSlip.minutes}
                    description={timeSlip.description}
                    setMinutesDiff={setMinutesDiff}
                    isNewTimeSlip={false}
                />
            );
        }

        return (
            <ReadOnlyTimeSlip
                fetchFavoriteTimeSlips={fetchFavoriteTimeSlips}
                timeSlip={timeSlip}
                getProjectName={getProjectName}
                getTaskName={getTaskName}
                getLaborCodeName={getLaborCodeName}
                handleEdit={() => setIsEditing(true)}
                deleteTimeSlip={deleteTimeSlip}
            />
        );
    };

    return <div className={classes.timeSlipCard}>{getCard()}</div>;
};

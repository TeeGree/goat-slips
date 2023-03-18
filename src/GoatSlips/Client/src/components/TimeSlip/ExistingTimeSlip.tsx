import React, { useState } from 'react';
import { TimeSlip } from '../../types/TimeSlip';
import { DropdownOption } from '../../types/DropdownOption';
import { ReadOnlyTimeSlip } from './ReadOnlyTimeSlip';
import { EditableTimeSlip } from './EditableTimeSlip';
import classes from './ExistingTimeSlip.module.scss';
import { Day } from '../../types/Day';
import { AllowedMinutesPartition } from '../../types/AllowedMinutesPartition';
import { Project } from '../../types/Project';

interface ExistingTimeSlipProps {
    date: Date;
    day: Day;
    timeSlip: TimeSlip;
    getTaskName: (taskId: number) => string;
    getLaborCodeName: (laborCodeId: number) => string;
    projectOptions: Project[];
    laborCodeOptions: DropdownOption[];
    getTaskOptionsForProject: (projectId: number | null) => DropdownOption[];
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
    setMinutesDiff: (day: Day, minutesDiff: number) => void;
    fetchFavoriteTimeSlips: () => void;
    projectMap: Map<number, Project>;
    taskMap: Map<number, string>;
    laborCodeMap: Map<number, string>;
    minutesPartition: AllowedMinutesPartition;
    userProjectIds: Set<number>;
    userAccessRights: Set<string>;
}

export const ExistingTimeSlip: React.FC<ExistingTimeSlipProps> = (props: ExistingTimeSlipProps) => {
    const {
        date,
        day,
        timeSlip,
        getTaskName,
        getLaborCodeName,
        getTaskOptionsForProject,
        laborCodeOptions,
        projectOptions,
        saveTimeSlip,
        deleteTimeSlip,
        setMinutesDiff,
        fetchFavoriteTimeSlips,
        projectMap,
        taskMap,
        laborCodeMap,
        minutesPartition,
        userProjectIds,
        userAccessRights,
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
                    date={date}
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
                    projectMap={projectMap}
                    taskMap={taskMap}
                    laborCodeMap={laborCodeMap}
                    minutesPartition={minutesPartition}
                    userAccessRights={userAccessRights}
                    userProjectIds={userProjectIds}
                />
            );
        }

        return (
            <ReadOnlyTimeSlip
                date={date}
                fetchFavoriteTimeSlips={fetchFavoriteTimeSlips}
                timeSlip={timeSlip}
                projectMap={projectMap}
                getTaskName={getTaskName}
                getLaborCodeName={getLaborCodeName}
                handleEdit={() => setIsEditing(true)}
                deleteTimeSlip={deleteTimeSlip}
                userAccessRights={userAccessRights}
                userProjectIds={userProjectIds}
            />
        );
    };

    return <div className={classes.timeSlipCard}>{getCard()}</div>;
};

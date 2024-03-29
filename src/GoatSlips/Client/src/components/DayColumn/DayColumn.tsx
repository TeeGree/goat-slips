import React, { useEffect, useState } from 'react';
import classes from './DayColumn.module.scss';
import { Day } from '../../types/Day';
import { Button, Menu, MenuItem, Tooltip } from '@mui/material';
import { Add, Star } from '@mui/icons-material';
import { EditableTimeSlip } from '../TimeSlip/EditableTimeSlip';
import { DropdownOption } from '../../types/DropdownOption';
import { FavoriteTimeSlipData, TimeSlip } from '../../types/TimeSlip';
import { ExistingTimeSlip } from '../TimeSlip/ExistingTimeSlip';
import { TimeTotals } from './TimeTotals';
import { AlertMessage } from '../../types/AlertMessage';
import { Toast } from '../Toast';
import { ErrorDetails } from '../../types/ErrorDetails';
import { AllowedMinutesPartition } from '../../types/AllowedMinutesPartition';
import { Project } from '../../types/Project';
import { AllowedFirstDayOfWeek } from '../../types/AllowedFirstDayOfWeek';

interface DayColumnProps {
    dayIndex: number;
    date: Date;
    day: Day;
    isCurrentDay: boolean;
    projectOptions: Project[];
    laborCodeOptions: DropdownOption[];
    getTaskOptionsForProject: (projectId: number | null) => DropdownOption[];
    saveTimeSlip: (
        projectId: number,
        taskId: number | null,
        laborCodeId: number | null,
        hours: number,
        minutes: number,
        dates: Date[],
        description: string,
    ) => Promise<Response>;
    updateTimeSlip: (
        timeSlipId: number,
        projectId: number,
        taskId: number | null,
        laborCodeId: number | null,
        hours: number,
        minutes: number,
        description: string,
    ) => Promise<Response>;
    deleteTimeSlip: (timeSlipId: number) => Promise<void>;
    timeSlips: TimeSlip[];
    getTaskName: (taskId: number) => string;
    getLaborCodeName: (laborCodeId: number) => string;
    totalHours: number;
    totalMinutes: number;
    fetchFavoriteTimeSlips: () => Promise<void>;
    favoriteTimeSlipsOptions: FavoriteTimeSlipData[];
    isFiltered: boolean;
    newDayMinuteDiffs: Map<Day, Map<number, number>>;
    setNewDayMinuteDiffs: (day: Day, timeSlipId: number, minutes: number) => void;
    projectMap: Map<number, Project>;
    taskMap: Map<number, string>;
    laborCodeMap: Map<number, string>;
    minutesPartition: AllowedMinutesPartition;
    userProjectIds: Set<number>;
    userAccessRights: Set<string>;
    firstDayOfWeek: AllowedFirstDayOfWeek;
}

export const DayColumn: React.FC<DayColumnProps> = (props: DayColumnProps) => {
    const [addingTimeSlip, setAddingTimeSlip] = useState(false);

    const [favoriteTimeSlipToAdd, setFavoriteTimeSlipToAdd] = useState<FavoriteTimeSlipData>();

    const [favoriteMenuAnchorEl, setFavoriteMenuAnchorEl] = React.useState<null | HTMLElement>(
        null,
    );
    const favoriteMenuOpen = Boolean(favoriteMenuAnchorEl);

    const handleFavoriteMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setFavoriteMenuAnchorEl(event.currentTarget);
    };

    const [alertMessage, setAlertMessage] = useState<AlertMessage | null>(null);

    const handleFavoriteMenuClose = () => {
        setFavoriteMenuAnchorEl(null);
    };

    useEffect(() => {
        if (!addingTimeSlip && favoriteTimeSlipToAdd !== undefined) {
            setFavoriteTimeSlipToAdd(undefined);
        }
    }, [addingTimeSlip]);

    const {
        dayIndex,
        date,
        day,
        isCurrentDay,
        projectOptions,
        laborCodeOptions,
        getTaskOptionsForProject,
        saveTimeSlip,
        updateTimeSlip,
        timeSlips,
        getTaskName,
        getLaborCodeName,
        deleteTimeSlip,
        totalHours,
        totalMinutes,
        fetchFavoriteTimeSlips,
        favoriteTimeSlipsOptions,
        isFiltered,
        newDayMinuteDiffs,
        setNewDayMinuteDiffs,
        projectMap,
        taskMap,
        laborCodeMap,
        minutesPartition,
        userProjectIds,
        userAccessRights,
        firstDayOfWeek,
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
        dates: Date[],
        description: string,
    ) => {
        const response = await saveTimeSlip(
            projectId,
            taskId,
            laborCodeId,
            hours,
            minutes,
            dates,
            description,
        );

        if (response.ok) {
            setAddingTimeSlip(false);
        } else {
            const message: ErrorDetails = await response.json();
            setAlertMessage({ message: message.detail, severity: 'error' });
        }
    };

    const handleNewBlankTimeSlipFromFavorite = (favoritetimeSlip: FavoriteTimeSlipData) => {
        setAddingTimeSlip(true);
        setFavoriteTimeSlipToAdd(favoritetimeSlip);
        handleFavoriteMenuClose();
    };

    const getFavoriteMenuItems = () => {
        return favoriteTimeSlipsOptions.map((fts: FavoriteTimeSlipData) => {
            return (
                <MenuItem
                    key={`favoriteTimeSlip-${fts.id}`}
                    onClick={() => handleNewBlankTimeSlipFromFavorite(fts)}
                >
                    {fts.name}
                </MenuItem>
            );
        });
    };

    const getAddTimeSlipFromFavoriteButton = () => {
        if (favoriteTimeSlipsOptions.length === 0) {
            return null;
        }
        return (
            <Tooltip title="Start from a favorite time slip.">
                <Button
                    variant="contained"
                    className={classes.addFromFavorites}
                    color="warning"
                    onClick={handleFavoriteMenuClick}
                >
                    <Add />
                    <Star />
                </Button>
            </Tooltip>
        );
    };

    const getAddTimeSlipButtonElements = (): JSX.Element => {
        if (addingTimeSlip) {
            return (
                <EditableTimeSlip
                    day={day}
                    date={date}
                    setMinutesDiff={(d: Day, m: number) =>
                        // Use day index to ensure no overlap when adding multiple new time slips to same day at once.
                        setNewDayMinuteDiffs(d, -1 * dayIndex, m)
                    }
                    saveTimeSlip={saveTimeSlipAndStopAddingTimeSlip}
                    projectOptions={projectOptions}
                    laborCodeOptions={laborCodeOptions}
                    getTaskOptionsForProject={getTaskOptionsForProject}
                    stopAddingTimeslip={() => setAddingTimeSlip(false)}
                    projectId={favoriteTimeSlipToAdd?.projectId}
                    taskId={favoriteTimeSlipToAdd?.taskId ?? undefined}
                    laborCodeId={favoriteTimeSlipToAdd?.laborCodeId ?? undefined}
                    isNewTimeSlip
                    projectMap={projectMap}
                    taskMap={taskMap}
                    laborCodeMap={laborCodeMap}
                    minutesPartition={minutesPartition}
                    userAccessRights={userAccessRights}
                    userProjectIds={userProjectIds}
                    firstDayOfWeek={firstDayOfWeek}
                />
            );
        }

        return (
            <div>
                <Button variant="contained" onClick={() => setAddingTimeSlip(true)}>
                    <Add />
                </Button>
                {getAddTimeSlipFromFavoriteButton()}
                <Menu
                    anchorEl={favoriteMenuAnchorEl}
                    open={favoriteMenuOpen}
                    onClose={handleFavoriteMenuClose}
                    MenuListProps={{
                        'aria-labelledby': 'basic-button',
                    }}
                >
                    {getFavoriteMenuItems()}
                </Menu>
            </div>
        );
    };

    const saveExistingTimeSlip = async (
        timeSlipId: number,
        projectId: number,
        taskId: number | null,
        laborCodeId: number | null,
        hours: number,
        minutes: number,
        _dates: Date[],
        description: string,
    ) => {
        const response = await updateTimeSlip(
            timeSlipId,
            projectId,
            taskId,
            laborCodeId,
            hours,
            minutes,
            description,
        );

        return response;
    };

    const getExistingTimeSlipCards = (): JSX.Element[] => {
        return timeSlips?.map((ts: TimeSlip) => {
            return (
                <ExistingTimeSlip
                    key={ts.id}
                    date={date}
                    day={day}
                    setMinutesDiff={(d: Day, m: number) => setNewDayMinuteDiffs(d, ts.id, m)}
                    timeSlip={ts}
                    getTaskName={getTaskName}
                    getLaborCodeName={getLaborCodeName}
                    projectOptions={projectOptions}
                    laborCodeOptions={laborCodeOptions}
                    getTaskOptionsForProject={getTaskOptionsForProject}
                    saveTimeSlip={saveExistingTimeSlip}
                    deleteTimeSlip={deleteTimeSlip}
                    fetchFavoriteTimeSlips={fetchFavoriteTimeSlips}
                    projectMap={projectMap}
                    taskMap={taskMap}
                    laborCodeMap={laborCodeMap}
                    minutesPartition={minutesPartition}
                    userAccessRights={userAccessRights}
                    userProjectIds={userProjectIds}
                    firstDayOfWeek={firstDayOfWeek}
                />
            );
        });
    };

    const className = isCurrentDay ? `${classes.currentDay} ` : '';
    return (
        <div className={`${className} ${classes.dayColumn}`}>
            <div className={classes.dayHeader}>
                <div>{day}</div>
                <div>{getDateString()}</div>
            </div>
            <TimeTotals
                totalHours={totalHours}
                totalMinutes={totalMinutes}
                newMinuteDiffs={newDayMinuteDiffs.get(day) ?? new Map<number, number>()}
                isFiltered={isFiltered}
            />
            <div className={classes.dayBody}>
                {getAddTimeSlipButtonElements()}
                {getExistingTimeSlipCards()}
            </div>
            <Toast
                severity={alertMessage?.severity}
                message={alertMessage?.message}
                onClose={() => setAlertMessage(null)}
            />
        </div>
    );
};

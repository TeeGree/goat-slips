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
    fetchFavoriteTimeSlips: () => Promise<void>;
    favoriteTimeSlipsOptions: FavoriteTimeSlipData[];
}

export const DayColumn: React.FC<DayColumnProps> = (props: DayColumnProps) => {
    const [addingTimeSlip, setAddingTimeSlip] = useState(false);
    const [newMinuteDiffs, setNewMinuteDiffs] = useState<Map<number, number>>(
        new Map<number, number>([]),
    );

    const [favoriteTimeSlipToAdd, setFavoriteTimeSlipToAdd] = useState<FavoriteTimeSlipData>();

    const [favoriteMenuAnchorEl, setFavoriteMenuAnchorEl] = React.useState<null | HTMLElement>(
        null,
    );
    const favoriteMenuOpen = Boolean(favoriteMenuAnchorEl);

    const handleFavoriteMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setFavoriteMenuAnchorEl(event.currentTarget);
    };

    const handleFavoriteMenuClose = () => {
        setFavoriteMenuAnchorEl(null);
    };

    useEffect(() => {
        if (!addingTimeSlip && favoriteTimeSlipToAdd !== undefined) {
            setFavoriteTimeSlipToAdd(undefined);
        }
    }, [addingTimeSlip]);

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
        fetchFavoriteTimeSlips,
        favoriteTimeSlipsOptions,
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

    const setMinutesDiff = (timeSlipId: number, minutes: number) => {
        setNewMinuteDiffs((prev: Map<number, number>) => {
            prev.set(timeSlipId, minutes);
            return new Map(prev);
        });
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
                    setMinutesDiff={(m: number) => setMinutesDiff(-1, m)}
                    saveTimeSlip={saveTimeSlipAndStopAddingTimeSlip}
                    projectOptions={projectOptions}
                    laborCodeOptions={laborCodeOptions}
                    getTaskOptionsForProject={getTaskOptionsForProject}
                    stopAddingTimeslip={() => setAddingTimeSlip(false)}
                    projectId={favoriteTimeSlipToAdd?.projectId}
                    taskId={favoriteTimeSlipToAdd?.taskId ?? undefined}
                    laborCodeId={favoriteTimeSlipToAdd?.laborCodeId ?? undefined}
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

    const getExistingTimeSlipCards = (): JSX.Element[] => {
        return timeSlips?.map((ts: TimeSlip) => {
            return (
                <ExistingTimeSlip
                    key={ts.id}
                    setMinutesDiff={(m: number) => setMinutesDiff(ts.id, m)}
                    timeSlip={ts}
                    getProjectName={getProjectName}
                    getTaskName={getTaskName}
                    getLaborCodeName={getLaborCodeName}
                    projectOptions={projectOptions}
                    laborCodeOptions={laborCodeOptions}
                    getTaskOptionsForProject={getTaskOptionsForProject}
                    saveTimeSlip={updateTimeSlip}
                    deleteTimeSlip={deleteTimeSlip}
                    fetchFavoriteTimeSlips={fetchFavoriteTimeSlips}
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
                newMinuteDiffs={newMinuteDiffs}
            />
            <div className={classes.dayBody}>
                {getAddTimeSlipButtonElements()}
                {getExistingTimeSlipCards()}
            </div>
        </div>
    );
};

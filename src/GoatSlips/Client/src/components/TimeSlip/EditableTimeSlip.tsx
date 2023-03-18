import React, { useEffect, useState } from 'react';
import classes from './EditableTimeSlip.module.scss';
import {
    Autocomplete,
    Button,
    Card,
    CardActions,
    CardContent,
    IconButton,
    TextField,
    Tooltip,
} from '@mui/material';
import { DropdownOption } from '../../types/DropdownOption';
import { DateRange, KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { Day, DayIndex } from '../../types/Day';
import { AllowedMinutesPartition } from '../../types/AllowedMinutesPartition';
import { TimeSlipMinutesInput } from './TimeSlipMinutesInput';
import { adminAccessRight } from '../../constants/requiredAccessRights';
import { Project } from '../../types/Project';
import { AllowedFirstDayOfWeek } from '../../types/AllowedFirstDayOfWeek';
import { dayMap } from '../../constants/dayMap';
import { dayIndexMap } from '../../constants/dayIndexMap';

const dayLabelMap = new Map<Day, string>([
    ['Sunday', 'Su'],
    ['Monday', 'M'],
    ['Tuesday', 'Tu'],
    ['Wednesday', 'W'],
    ['Thursday', 'Th'],
    ['Friday', 'F'],
    ['Saturday', 'Sa'],
]);

interface EditableTimeSlipProps {
    date: Date;
    day: Day;
    projectOptions: Project[];
    laborCodeOptions: DropdownOption[];
    getTaskOptionsForProject: (projectId: number | null) => DropdownOption[];
    stopAddingTimeslip: () => void;
    saveTimeSlip: (
        projectId: number,
        taskId: number | null,
        laborCodeId: number | null,
        hours: number,
        minutes: number,
        dates: Date[],
        description: string,
    ) => Promise<void>;
    projectId?: number;
    taskId?: number;
    laborCodeId?: number;
    hours?: number;
    minutes?: number;
    description?: string;
    setMinutesDiff: (day: Day, minutesDiff: number) => void;
    isNewTimeSlip: boolean;
    projectMap: Map<number, Project>;
    taskMap: Map<number, string>;
    laborCodeMap: Map<number, string>;
    minutesPartition: AllowedMinutesPartition;
    userProjectIds: Set<number>;
    userAccessRights: Set<string>;
    firstDayOfWeek: AllowedFirstDayOfWeek;
}

export const EditableTimeSlip: React.FC<EditableTimeSlipProps> = (props: EditableTimeSlipProps) => {
    const {
        date,
        day,
        getTaskOptionsForProject,
        laborCodeOptions,
        projectOptions,
        saveTimeSlip,
        stopAddingTimeslip,
        projectId,
        taskId,
        laborCodeId,
        hours,
        minutes,
        description,
        setMinutesDiff,
        isNewTimeSlip,
        projectMap,
        taskMap,
        laborCodeMap,
        minutesPartition,
        userProjectIds,
        userAccessRights,
        firstDayOfWeek,
    } = props;

    const getTotalMinutes = (h: number | '', m: number | '') => {
        return (h === '' ? 0 : h) * 60 + (m === '' ? 0 : m);
    };

    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(projectId ?? null);
    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(taskId ?? null);
    const [selectedLaborCodeId, setSelectedLaborCodeId] = useState<number | null>(
        laborCodeId ?? null,
    );
    const [selectedHours, setSelectedHours] = useState<number | ''>(hours ?? '');
    const [selectedMinutes, setSelectedMinutes] = useState<number | ''>(minutes ?? '');
    const [enteredDescription, setEnteredDescription] = useState(description ?? '');
    const [expandMultiDaySelect, setExpandMultiDaySelect] = useState(false);

    useEffect(() => {
        const tasksForProject = getTaskOptionsForProject(selectedProjectId);
        const taskIdsForProject = new Set(tasksForProject.map((t) => t.id));
        if (selectedTaskId !== null && !taskIdsForProject.has(selectedTaskId)) {
            setSelectedTaskId(null);
        }
    }, [selectedProjectId]);

    const [addToDayMap, setAddToDayMap] = useState<Map<Day, boolean>>(
        new Map([
            ['Sunday', day === 'Sunday'],
            ['Monday', day === 'Monday'],
            ['Tuesday', day === 'Tuesday'],
            ['Wednesday', day === 'Wednesday'],
            ['Thursday', day === 'Thursday'],
            ['Friday', day === 'Friday'],
            ['Saturday', day === 'Saturday'],
        ]),
    );

    useEffect(() => {
        addToDayMap.forEach((addToDay, d) => {
            if (addToDay) {
                setMinutesDiff(
                    d,
                    getTotalMinutes(selectedHours, selectedMinutes) - totalInitialMinutes,
                );
            } else {
                setMinutesDiff(d, 0);
            }
        });
    }, [addToDayMap, selectedHours, selectedMinutes]);

    const totalInitialMinutes = getTotalMinutes(hours ?? '', minutes ?? '');

    const handleHoursChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = event.target.value;

        const hrs = value === '' ? '' : Number(value);

        if (hrs !== '' && (hrs < 0 || hrs > 24 || !Number.isInteger(hrs))) {
            return;
        }

        setSelectedHours(hrs);
    };

    const handleMinutesChange = (mins: number | '') => {
        if (mins !== '' && (mins < 0 || mins >= 60 || !Number.isInteger(mins))) {
            return;
        }

        setSelectedMinutes(mins);
    };

    const submitTimeSlip = () => {
        if (selectedProjectId === null || !isSaveAllowed(selectedProjectId ?? '')) {
            return;
        }

        const dates: Date[] = [];
        const currentDayIndex = dayIndexMap.get(day);
        if (currentDayIndex === undefined) {
            throw Error('Invalid day for time slip!');
        }

        addToDayMap.forEach((addToDay, d) => {
            if (addToDay) {
                let dayIndex = dayIndexMap.get(d) as number;

                let dateToAdd = new Date(date);

                if (dayIndex < firstDayOfWeek) {
                    dayIndex += 7;
                }

                const indexDiff = dayIndex - currentDayIndex;
                dateToAdd = new Date(date.getTime() + indexDiff * 24 * 60 * 60 * 1000);

                dates.push(dateToAdd);
            }
        });
        saveTimeSlip(
            selectedProjectId,
            selectedTaskId,
            selectedLaborCodeId,
            selectedHours === '' ? 0 : selectedHours,
            selectedMinutes === '' ? 0 : selectedMinutes,
            dates,
            enteredDescription,
        );
    };

    const isSaveAllowed = (p: number | ''): p is number => {
        const hoursNumber = selectedHours === '' ? 0 : selectedHours;
        const minutesNumber = selectedMinutes === '' ? 0 : selectedMinutes;
        return p !== '' && (hoursNumber > 0 || minutesNumber > 0);
    };

    const handleCancel = () => {
        addToDayMap.forEach((_addToDay, d) => {
            setMinutesDiff(d, 0);
        });

        stopAddingTimeslip();
    };

    const handleSave = () => {
        addToDayMap.forEach((_addToDay, d) => {
            setMinutesDiff(d, 0);
        });

        submitTimeSlip();
    };

    const handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEnteredDescription(event.target.value);
    };

    const resetSelectedDays = () => {
        // Revert to only the current day being selected.
        setAddToDayMap((prev) => {
            const newMap = new Map(prev);

            newMap.forEach((_addToDay, d) => {
                newMap.set(d, d === day);
            });

            return newMap;
        });
    };

    const toggleMultiDaySelect = () => {
        setExpandMultiDaySelect((prev) => {
            const newValue = !prev;

            // If collapsing multi select section, clear selected days
            if (!newValue) {
                resetSelectedDays();
            }
            return newValue;
        });
    };

    const getMultiAddButton = () => {
        if (!isNewTimeSlip) {
            return <></>;
        }

        const tooltipTitle = expandMultiDaySelect
            ? 'Stop adding time slip to multiple days at once'
            : 'Add time slip to multiple days at once.';

        const arrowIcon = expandMultiDaySelect ? <KeyboardArrowUp /> : <KeyboardArrowDown />;

        return (
            <Tooltip title={tooltipTitle} placement="left">
                <IconButton className={classes.squareIconButton} onClick={toggleMultiDaySelect}>
                    {arrowIcon}
                    <DateRange />
                </IconButton>
            </Tooltip>
        );
    };

    const toggleDaySelected = (buttonDay: Day) => {
        setAddToDayMap((prev) => {
            const newAddToDayMap = new Map(prev);
            newAddToDayMap.set(buttonDay, !prev.get(buttonDay));
            return newAddToDayMap;
        });
    };

    const getDayButton = (buttonDay: Day) => {
        const label = dayLabelMap.get(buttonDay);
        let className = classes.dayButton;
        if (addToDayMap.get(buttonDay)) {
            className += ` ${classes.selectedDay}`;
        }
        return (
            <IconButton
                disabled={buttonDay === day}
                className={className}
                onClick={() => toggleDaySelected(buttonDay)}
            >
                {label}
            </IconButton>
        );
    };

    const getMultiDaySelectOptions = () => {
        if (expandMultiDaySelect) {
            return (
                <div className={classes.dayButtonContainer}>
                    {getDayButton(dayMap.get(((0 + firstDayOfWeek) % 7) as DayIndex) ?? 'Sunday')}
                    {getDayButton(dayMap.get(((1 + firstDayOfWeek) % 7) as DayIndex) ?? 'Sunday')}
                    {getDayButton(dayMap.get(((2 + firstDayOfWeek) % 7) as DayIndex) ?? 'Sunday')}
                    {getDayButton(dayMap.get(((3 + firstDayOfWeek) % 7) as DayIndex) ?? 'Sunday')}
                    {getDayButton(dayMap.get(((4 + firstDayOfWeek) % 7) as DayIndex) ?? 'Sunday')}
                    {getDayButton(dayMap.get(((5 + firstDayOfWeek) % 7) as DayIndex) ?? 'Sunday')}
                    {getDayButton(dayMap.get(((6 + firstDayOfWeek) % 7) as DayIndex) ?? 'Sunday')}
                </div>
            );
        }

        return <></>;
    };

    const getSelectedAutocompleteProjectId = () => {
        if (selectedProjectId === null) {
            return null;
        }

        return { label: projectMap.get(selectedProjectId)?.name, id: selectedProjectId };
    };

    const getSelectedAutocompleteTaskId = () => {
        if (selectedTaskId === null) {
            return null;
        }

        return { label: taskMap.get(selectedTaskId), id: selectedTaskId };
    };

    const getSelectedAutocompleteLaborCodeId = () => {
        if (selectedLaborCodeId === null) {
            return null;
        }

        return { label: laborCodeMap.get(selectedLaborCodeId), id: selectedLaborCodeId };
    };

    const onProjectChange = (
        _event: React.SyntheticEvent<Element, Event>,
        value: {
            label: string | undefined;
            id: number;
        } | null,
    ) => {
        if (value === null) {
            setSelectedProjectId(null);
        } else if (value !== null && projectMap.has(value.id)) {
            setSelectedProjectId(value.id);
        }
    };

    const onTaskChange = (
        _event: React.SyntheticEvent<Element, Event>,
        value: {
            label: string | undefined;
            id: number;
        } | null,
    ) => {
        if (value === null) {
            setSelectedTaskId(null);
        } else if (value !== null && taskMap.has(value.id)) {
            setSelectedTaskId(value.id);
        }
    };

    const onLaborCodeChange = (
        _event: React.SyntheticEvent<Element, Event>,
        value: {
            label: string | undefined;
            id: number;
        } | null,
    ) => {
        if (value === null) {
            setSelectedLaborCodeId(null);
        } else if (value !== null && laborCodeMap.has(value.id)) {
            setSelectedLaborCodeId(value.id);
        }
    };

    const doesUserHaveAccessToProject = (id: number) => {
        return userAccessRights.has(adminAccessRight) || userProjectIds.has(id);
    };

    const filteredProjectOptions = projectOptions.filter((po) => {
        if (po.lockDate === null) {
            return true;
        }

        const dateNoTime = new Date(date);
        dateNoTime.setHours(0, 0, 0, 0);

        return po.lockDate < dateNoTime || doesUserHaveAccessToProject(po.id);
    });

    return (
        <Card>
            <CardContent>
                <Autocomplete
                    disablePortal
                    options={filteredProjectOptions.map((p) => {
                        return { label: p.name, id: p.id };
                    })}
                    renderInput={(params) => <TextField {...params} label="Project" />}
                    value={getSelectedAutocompleteProjectId()}
                    isOptionEqualToValue={(option, value) => option?.id === value?.id}
                    onChange={onProjectChange}
                />
                <Autocomplete
                    className={classes.cardInput}
                    disablePortal
                    options={getTaskOptionsForProject(selectedProjectId).map((t) => {
                        return { label: t.name, id: t.id };
                    })}
                    renderInput={(params) => <TextField {...params} label="Task" />}
                    value={getSelectedAutocompleteTaskId()}
                    isOptionEqualToValue={(option, value) => option?.id === value?.id}
                    onChange={onTaskChange}
                />
                <Autocomplete
                    className={classes.cardInput}
                    disablePortal
                    options={laborCodeOptions.map((t) => {
                        return { label: t.name, id: t.id };
                    })}
                    renderInput={(params) => <TextField {...params} label="Labor Code" />}
                    value={getSelectedAutocompleteLaborCodeId()}
                    isOptionEqualToValue={(option, value) => option?.id === value?.id}
                    onChange={onLaborCodeChange}
                />

                <TextField
                    className={classes.description}
                    label="Description"
                    value={enteredDescription}
                    onChange={handleDescriptionChange}
                    multiline
                    maxRows={3}
                />

                <div className={classes.timeSection}>
                    <TextField
                        className={`${classes.cardInput} ${classes.timeTextField}`}
                        label="Hours"
                        variant="outlined"
                        value={selectedHours}
                        onChange={handleHoursChange}
                    />
                    <TimeSlipMinutesInput
                        minutesPartition={minutesPartition}
                        selectedMinutes={selectedMinutes}
                        setSelectedMinutes={handleMinutesChange}
                    />
                </div>
            </CardContent>
            <CardActions className={classes.cardActions}>
                <div className={classes.cardActionsBase}>
                    <span className={classes.cardButtons}>
                        <Button
                            disabled={!isSaveAllowed(selectedProjectId ?? '')}
                            variant="contained"
                            onClick={handleSave}
                        >
                            Save
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            className={classes.cancelButton}
                            onClick={handleCancel}
                        >
                            Cancel
                        </Button>
                    </span>
                    {getMultiAddButton()}
                </div>
                {getMultiDaySelectOptions()}
            </CardActions>
        </Card>
    );
};

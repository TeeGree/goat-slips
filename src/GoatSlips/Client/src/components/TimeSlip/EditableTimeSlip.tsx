import React, { useEffect, useState } from 'react';
import classes from './EditableTimeSlip.module.scss';
import {
    Button,
    Card,
    CardActions,
    CardContent,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    TextField,
    Tooltip,
} from '@mui/material';
import { DropdownOption } from '../../types/DropdownOption';
import { DateRange, KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { Day } from '../../types/Day';

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
    day: Day;
    projectOptions: DropdownOption[];
    laborCodeOptions: DropdownOption[];
    getTaskOptionsForProject: (projectId: number) => DropdownOption[];
    stopAddingTimeslip: () => void;
    saveTimeSlip: (
        projectId: number,
        taskId: number | null,
        laborCodeId: number | null,
        hours: number,
        minutes: number,
        days: Day[],
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
}

export const EditableTimeSlip: React.FC<EditableTimeSlipProps> = (props: EditableTimeSlipProps) => {
    const {
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
    } = props;

    const getTotalMinutes = (h: number | '', m: number | '') => {
        return (h === '' ? 0 : h) * 60 + (m === '' ? 0 : m);
    };

    const [selectedProjectId, setSelectedProjectId] = useState<number | ''>(projectId ?? '');
    const [selectedTaskId, setSelectedTaskId] = useState<number | ''>(taskId ?? '');
    const [selectedLaborCodeId, setSelectedLaborCodeId] = useState<number | ''>(laborCodeId ?? '');
    const [selectedHours, setSelectedHours] = useState<number | ''>(hours ?? '');
    const [selectedMinutes, setSelectedMinutes] = useState<number | ''>(minutes ?? '');
    const [enteredDescription, setEnteredDescription] = useState(description ?? '');
    const [expandMultiDaySelect, setExpandMultiDaySelect] = useState(false);

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

    const getProjectOptions = (): JSX.Element[] => {
        return projectOptions.map((project: DropdownOption) => {
            const { id, name } = project;
            return (
                <MenuItem key={`project${id}`} value={id}>
                    {name}
                </MenuItem>
            );
        });
    };

    const getTaskOptions = (): JSX.Element[] => {
        if (selectedProjectId === '') {
            return [];
        }
        const tasks = getTaskOptionsForProject(selectedProjectId);
        return tasks.map((task: DropdownOption) => {
            const { id, name } = task;
            return (
                <MenuItem key={`task${id}`} value={id}>
                    {name}
                </MenuItem>
            );
        });
    };

    const getLaborCodeOptions = (): JSX.Element[] => {
        return laborCodeOptions.map((laborCode: DropdownOption) => {
            const { id, name } = laborCode;
            return (
                <MenuItem key={`laborCode${id}`} value={id}>
                    {name}
                </MenuItem>
            );
        });
    };

    const handleProjectChange = (event: SelectChangeEvent<number>) => {
        setSelectedProjectId(Number(event.target.value));
    };

    const handleTaskChange = (event: SelectChangeEvent<number>) => {
        setSelectedTaskId(Number(event.target.value));
    };

    const handleLaborCodeChange = (event: SelectChangeEvent<number>) => {
        setSelectedLaborCodeId(Number(event.target.value));
    };

    const handleHoursChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = event.target.value;

        const hrs = value === '' ? '' : Number(value);

        if (hrs !== '' && (hrs < 0 || hrs > 24 || !Number.isInteger(hrs))) {
            return;
        }

        setSelectedHours(hrs);
    };

    const handleMinutesChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = event.target.value;
        const mins = value === '' ? '' : Number(value);

        if (mins !== '' && (mins < 0 || mins >= 60 || !Number.isInteger(mins))) {
            return;
        }

        setSelectedMinutes(mins);
    };

    const submitTimeSlip = () => {
        if (!isSaveAllowed(selectedProjectId)) {
            return;
        }

        const taskIdForSubmit = selectedTaskId === '' ? null : selectedTaskId;
        const laborCodeIdForSubmit = selectedLaborCodeId === '' ? null : selectedLaborCodeId;
        const days: Day[] = [];

        addToDayMap.forEach((addToDay, d) => {
            if (addToDay) {
                days.push(d);
            }
        });
        saveTimeSlip(
            selectedProjectId,
            taskIdForSubmit,
            laborCodeIdForSubmit,
            selectedHours === '' ? 0 : selectedHours,
            selectedMinutes === '' ? 0 : selectedMinutes,
            days,
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

            newMap.forEach((addToDay, d) => {
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
                    {getDayButton('Sunday')}
                    {getDayButton('Monday')}
                    {getDayButton('Tuesday')}
                    {getDayButton('Wednesday')}
                    {getDayButton('Thursday')}
                    {getDayButton('Friday')}
                    {getDayButton('Saturday')}
                </div>
            );
        }

        return <></>;
    };

    return (
        <Card>
            <CardContent>
                <FormControl fullWidth>
                    <InputLabel>Project</InputLabel>
                    <Select
                        value={selectedProjectId}
                        onChange={handleProjectChange}
                        label="Project"
                    >
                        {getProjectOptions()}
                    </Select>
                </FormControl>

                <FormControl fullWidth className={classes.cardInput}>
                    <InputLabel>Task</InputLabel>
                    <Select value={selectedTaskId} onChange={handleTaskChange} label="Task">
                        {getTaskOptions()}
                    </Select>
                </FormControl>

                <FormControl fullWidth className={classes.cardInput}>
                    <InputLabel>Labor Code</InputLabel>
                    <Select
                        disabled={selectedProjectId === undefined}
                        value={selectedLaborCodeId}
                        label="Labor Code"
                        onChange={handleLaborCodeChange}
                    >
                        {getLaborCodeOptions()}
                    </Select>
                </FormControl>

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
                    <TextField
                        className={`${classes.cardInput} ${classes.timeTextField}`}
                        label="Minutes"
                        variant="outlined"
                        value={selectedMinutes}
                        onChange={handleMinutesChange}
                    />
                </div>
            </CardContent>
            <CardActions className={classes.cardActions}>
                <div className={classes.cardActionsBase}>
                    <span className={classes.cardButtons}>
                        <Button
                            disabled={!isSaveAllowed(selectedProjectId)}
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

import React, { useState } from 'react';
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

interface EditableTimeSlipProps {
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
        description: string,
    ) => Promise<void>;
    projectId?: number;
    taskId?: number;
    laborCodeId?: number;
    hours?: number;
    minutes?: number;
    description?: string;
    setMinutesDiff: (minutesDiff: number) => void;
}

export const EditableTimeSlip: React.FC<EditableTimeSlipProps> = (props: EditableTimeSlipProps) => {
    const {
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

        if (hrs !== '' && hrs < 0) {
            return;
        }

        setSelectedHours(hrs);
        setMinutesDiff(getTotalMinutes(hrs, selectedMinutes) - totalInitialMinutes);
    };

    const handleMinutesChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = event.target.value;
        const mins = value === '' ? '' : Number(value);

        if (mins !== '' && (mins < 0 || mins >= 60)) {
            return;
        }

        setSelectedMinutes(mins);
        setMinutesDiff(getTotalMinutes(selectedHours, mins) - totalInitialMinutes);
    };

    const submitTimeSlip = () => {
        if (!isSaveAllowed(selectedProjectId)) {
            return;
        }

        const taskIdForSubmit = selectedTaskId === '' ? null : selectedTaskId;
        const laborCodeIdForSubmit = selectedLaborCodeId === '' ? null : selectedLaborCodeId;
        saveTimeSlip(
            selectedProjectId,
            taskIdForSubmit,
            laborCodeIdForSubmit,
            selectedHours === '' ? 0 : selectedHours,
            selectedMinutes === '' ? 0 : selectedMinutes,
            enteredDescription,
        );
    };

    const isSaveAllowed = (p: number | ''): p is number => {
        const hoursNumber = selectedHours === '' ? 0 : selectedHours;
        const minutesNumber = selectedMinutes === '' ? 0 : selectedMinutes;
        return p !== '' && (hoursNumber > 0 || minutesNumber > 0);
    };

    const handleCancel = () => {
        setMinutesDiff(0);
        stopAddingTimeslip();
    };

    const handleSave = () => {
        setMinutesDiff(0);
        submitTimeSlip();
    };

    const handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEnteredDescription(event.target.value);
    };

    const getMultiAddButton = () => {
        const tooltipTitle = expandMultiDaySelect
            ? 'Stop adding time slip to multiple days at once'
            : 'Add time slip to multiple days at once.';

        const arrowIcon = expandMultiDaySelect ? <KeyboardArrowUp /> : <KeyboardArrowDown />;

        return (
            <Tooltip title={tooltipTitle} placement="left">
                <IconButton
                    className={classes.squareIconButton}
                    onClick={() => setExpandMultiDaySelect((prev) => !prev)}
                >
                    {arrowIcon}
                    <DateRange />
                </IconButton>
            </Tooltip>
        );
    };

    const getMultiDaySelectOptions = () => {
        if (expandMultiDaySelect) {
            return (
                <div className={classes.dayButtonContainer}>
                    <IconButton className={classes.dayButton}>Su</IconButton>
                    <IconButton className={classes.dayButton}>M</IconButton>
                    <IconButton className={classes.dayButton}>Tu</IconButton>
                    <IconButton className={classes.dayButton}>W</IconButton>
                    <IconButton className={classes.dayButton}>Th</IconButton>
                    <IconButton className={classes.dayButton}>F</IconButton>
                    <IconButton className={classes.dayButton}>Sa</IconButton>
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
                        type="number"
                        value={selectedHours}
                        onChange={handleHoursChange}
                    />
                    <TextField
                        className={`${classes.cardInput} ${classes.timeTextField}`}
                        label="Minutes"
                        variant="outlined"
                        type="number"
                        value={selectedMinutes}
                        onChange={handleMinutesChange}
                    />
                </div>
            </CardContent>
            <CardActions className={classes.cardActions}>
                <div className={classes.cardActionsBase}>
                    {getMultiAddButton()}
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
                </div>
                {getMultiDaySelectOptions()}
            </CardActions>
        </Card>
    );
};

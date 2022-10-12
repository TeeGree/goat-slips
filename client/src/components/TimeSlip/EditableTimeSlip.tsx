import React, { useState } from 'react';
import classes from './EditableTimeSlip.module.scss';
import {
    Button,
    Card,
    CardActions,
    CardContent,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    TextField,
} from '@mui/material';
import { DropdownOption } from '../../types/DropdownOption';

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
    ) => Promise<void>;
    projectId?: number;
    taskId?: number;
    laborCodeId?: number;
    hours?: number;
    minutes?: number;
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
        setMinutesDiff,
    } = props;

    const getTotalMinutes = (h: number | undefined, m: number | undefined) => {
        return (h ?? 0) * 60 + (m ?? 0);
    };

    const [selectedProjectId, setSelectedProjectId] = useState<number | ''>(projectId ?? '');
    const [selectedTaskId, setSelectedTaskId] = useState<number | ''>(taskId ?? '');
    const [selectedLaborCodeId, setSelectedLaborCodeId] = useState<number | ''>(laborCodeId ?? '');
    const [selectedHours, setSelectedHours] = useState<number>(hours ?? 0);
    const [selectedMinutes, setSelectedMinutes] = useState<number>(minutes ?? 0);

    const totalInitialMinutes = getTotalMinutes(hours, minutes);

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
        const hrs = Number(event.target.value);
        setSelectedHours(hrs);
        setMinutesDiff(getTotalMinutes(hrs, selectedMinutes) - totalInitialMinutes);
    };

    const handleMinutesChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const mins = Number(event.target.value);
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
            selectedHours,
            selectedMinutes,
        );
    };

    const isSaveAllowed = (p: number | ''): p is number => {
        return p !== '' && (selectedHours > 0 || selectedMinutes > 0);
    };

    const handleCancel = () => {
        setMinutesDiff(0);
        stopAddingTimeslip();
    };

    const handleSave = () => {
        setMinutesDiff(0);
        submitTimeSlip();
    };

    return (
        <Card>
            <CardContent>
                <FormControl fullWidth>
                    <InputLabel>Project</InputLabel>
                    <Select value={selectedProjectId} onChange={handleProjectChange}>
                        {getProjectOptions()}
                    </Select>
                </FormControl>

                <FormControl fullWidth className={classes.cardInput}>
                    <InputLabel>Task</InputLabel>
                    <Select value={selectedTaskId} onChange={handleTaskChange}>
                        {getTaskOptions()}
                    </Select>
                </FormControl>

                <FormControl fullWidth className={classes.cardInput}>
                    <InputLabel>Labor Code</InputLabel>
                    <Select
                        disabled={selectedProjectId === undefined}
                        value={selectedLaborCodeId}
                        onChange={handleLaborCodeChange}
                    >
                        {getLaborCodeOptions()}
                    </Select>
                </FormControl>

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
                <Button
                    disabled={!isSaveAllowed(selectedProjectId)}
                    variant="contained"
                    onClick={handleSave}
                >
                    Save
                </Button>
                <Button variant="contained" color="error" onClick={handleCancel}>
                    Cancel
                </Button>
            </CardActions>
        </Card>
    );
};

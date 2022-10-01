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
import { DropdownOption } from '../types/DropdownOption';

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
}

export const EditableTimeSlip: React.FC<EditableTimeSlipProps> = (props: EditableTimeSlipProps) => {
    const {
        getTaskOptionsForProject,
        laborCodeOptions,
        projectOptions,
        saveTimeSlip,
        stopAddingTimeslip,
    } = props;

    const [projectId, setProjectId] = useState<number | ''>('');
    const [taskId, setTaskId] = useState<number | ''>('');
    const [laborCodeId, setLaborCodeId] = useState<number | ''>('');
    const [hours, setHours] = useState<number>(0);
    const [minutes, setMinutes] = useState<number>(0);

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
        if (projectId === '') {
            return [];
        }
        const tasks = getTaskOptionsForProject(projectId);
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
        setProjectId(Number(event.target.value));
    };

    const handleTaskChange = (event: SelectChangeEvent<number>) => {
        setTaskId(Number(event.target.value));
    };

    const handleLaborCodeChange = (event: SelectChangeEvent<number>) => {
        setLaborCodeId(Number(event.target.value));
    };

    const handleHoursChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setHours(Number(event.target.value));
    };

    const handleMinutesChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMinutes(Number(event.target.value));
    };

    const submitTimeSlip = () => {
        if (!isSaveAllowed(projectId)) {
            return;
        }

        const taskIdForSubmit = taskId === '' ? null : taskId;
        const laborCodeIdForSubmit = laborCodeId === '' ? null : laborCodeId;
        saveTimeSlip(projectId, taskIdForSubmit, laborCodeIdForSubmit, hours, minutes);
    };

    const isSaveAllowed = (p: number | ''): p is number => {
        return p !== '' && (hours > 0 || minutes > 0);
    };

    return (
        <Card>
            <CardContent>
                <FormControl fullWidth>
                    <InputLabel>Project</InputLabel>
                    <Select value={projectId} onChange={handleProjectChange}>
                        {getProjectOptions()}
                    </Select>
                </FormControl>

                <FormControl fullWidth className={classes.cardInput}>
                    <InputLabel>Task</InputLabel>
                    <Select value={taskId} onChange={handleTaskChange}>
                        {getTaskOptions()}
                    </Select>
                </FormControl>

                <FormControl fullWidth className={classes.cardInput}>
                    <InputLabel>Labor Code</InputLabel>
                    <Select
                        disabled={projectId === undefined}
                        value={laborCodeId}
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
                        value={hours}
                        onChange={handleHoursChange}
                    />
                    <TextField
                        className={`${classes.cardInput} ${classes.timeTextField}`}
                        label="Minutes"
                        variant="outlined"
                        type="number"
                        value={minutes}
                        onChange={handleMinutesChange}
                    />
                </div>
            </CardContent>
            <CardActions className={classes.cardActions}>
                <Button
                    disabled={!isSaveAllowed(projectId)}
                    variant="contained"
                    onClick={submitTimeSlip}
                >
                    Save
                </Button>
                <Button variant="contained" color="error" onClick={stopAddingTimeslip}>
                    Cancel
                </Button>
            </CardActions>
        </Card>
    );
};

import {
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    TextField,
} from '@mui/material';
import React from 'react';
import { AllowedMinutesPartition } from '../../types/AllowedMinutesPartition';
import classes from './TimeSlipMinutesInput.module.scss';

interface TimeSlipMinutesInputProps {
    minutesPartition: AllowedMinutesPartition;
    selectedMinutes: number | '';
    setSelectedMinutes: (mins: number | '') => void;
}

export const TimeSlipMinutesInput: React.FC<TimeSlipMinutesInputProps> = (
    props: TimeSlipMinutesInputProps,
) => {
    const { minutesPartition, selectedMinutes, setSelectedMinutes } = props;

    const handleMinutesChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = event.target.value;
        const mins = value === '' ? '' : Number(value);

        setSelectedMinutes(mins);
    };

    const getTextFieldInput = () => {
        return (
            <TextField
                className={classes.textField}
                label="Minutes"
                variant="outlined"
                value={selectedMinutes}
                onChange={handleMinutesChange}
            />
        );
    };

    const handleMinutesPartitionChange = (event: SelectChangeEvent<number>) => {
        setSelectedMinutes(Number(event.target.value));
    };

    const getMinutesOptions = () => {
        const menuItems: JSX.Element[] = [];
        for (let i = 0; i < 60; i += minutesPartition) {
            menuItems.push(
                <MenuItem key={`minutes-${i}`} value={i}>
                    {i}
                </MenuItem>,
            );
        }
        return menuItems;
    };

    if (minutesPartition === 1) {
        return getTextFieldInput();
    }

    return (
        <FormControl className={classes.select}>
            <InputLabel>Minutes</InputLabel>
            <Select value={selectedMinutes} onChange={handleMinutesPartitionChange} label="Minutes">
                {getMinutesOptions()}
            </Select>
        </FormControl>
    );
};

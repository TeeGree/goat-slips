import {
    Checkbox,
    FormControl,
    InputLabel,
    ListItemText,
    MenuItem,
    Select,
    SelectChangeEvent,
} from '@mui/material';
import React from 'react';
import { DropdownOption } from '../types/DropdownOption';
import classes from './MultiSelect.module.scss';

interface MultiSelectProps {
    originalSelectedIds?: Set<number>;
    selectedIds: number[];
    setSelectedIds: (selectedIds: number[]) => void;
    setIsDirty?: (isDirty: boolean) => void;
    getDisplayTextForId: (id: number) => string;
    label: string;
    keyPrefix?: string;
    options: DropdownOption[];
}

export const MultiSelect: React.FC<MultiSelectProps> = (props: MultiSelectProps) => {
    const {
        originalSelectedIds,
        selectedIds,
        setSelectedIds,
        setIsDirty,
        getDisplayTextForId,
        label,
        keyPrefix,
        options,
    } = props;

    const renderSelected = (selectedIdsToRender: number[]) => {
        let displayText = '';
        selectedIdsToRender.forEach((id: number, index: number) => {
            displayText += getDisplayTextForId(id) ?? 'N/A';
            if (index < selectedIdsToRender.length - 1) {
                displayText += ', ';
            }
        });

        return displayText;
    };

    const handleSelectChange = (
        event: SelectChangeEvent<number[]>,
        setStateAction: (n: number[]) => void,
    ) => {
        const {
            target: { value },
        } = event;
        const values = typeof value === 'string' ? value.split(',').map((v) => Number(v)) : value;

        if (originalSelectedIds === undefined || originalSelectedIds.size !== values.length) {
            if (setIsDirty !== undefined) {
                setIsDirty(true);
            }
            setStateAction(values);
            return;
        }
        let dirty = false;
        values.forEach((v) => {
            if (!originalSelectedIds.has(v)) {
                dirty = true;
                return;
            }
        });

        if (setIsDirty !== undefined) {
            setIsDirty(dirty);
        }
        setStateAction(values);
    };

    const handleChange = (event: SelectChangeEvent<number[]>) => {
        handleSelectChange(event, setSelectedIds);
    };

    const getTaskMenuItems = () => {
        return options.map((task: DropdownOption) => {
            const { id, name } = task;
            const isChecked = selectedIds.indexOf(id) > -1;
            const prefix = keyPrefix ?? '';
            return (
                <MenuItem key={`${prefix}${id}`} value={id}>
                    <Checkbox checked={isChecked} />
                    <ListItemText primary={name} />
                </MenuItem>
            );
        });
    };

    return (
        <FormControl className={classes.dropdown}>
            <InputLabel>{label}</InputLabel>
            <Select
                renderValue={(selected) => renderSelected(selected)}
                multiple
                value={selectedIds}
                label={label}
                onChange={handleChange}
            >
                {getTaskMenuItems()}
            </Select>
        </FormControl>
    );
};

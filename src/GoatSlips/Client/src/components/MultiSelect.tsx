import { Autocomplete, TextField } from '@mui/material';
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
    className?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = (props: MultiSelectProps) => {
    const {
        originalSelectedIds,
        selectedIds,
        setSelectedIds,
        setIsDirty,
        getDisplayTextForId,
        label,
        options,
        className,
    } = props;

    const onTaskChange = (
        _event: React.SyntheticEvent<Element, Event>,
        value:
            | {
                  label: string | undefined;
                  id: number;
              }[]
            | null,
    ) => {
        const values = value === null ? [] : value.map((v) => v.id);

        checkIfDirty(values);

        setSelectedIds(values);
    };

    const checkIfDirty = (newValues: number[]) => {
        if (originalSelectedIds === undefined || originalSelectedIds.size !== newValues.length) {
            if (setIsDirty !== undefined) {
                setIsDirty(true);
            }
        } else {
            let dirty = false;
            newValues.forEach((v) => {
                if (!originalSelectedIds.has(v)) {
                    dirty = true;
                    return;
                }
            });

            if (setIsDirty !== undefined) {
                setIsDirty(dirty);
            }
        }
    };

    const autoCompleteWidthClass = className ?? classes.dropdown;

    return (
        <Autocomplete
            multiple
            className={autoCompleteWidthClass}
            disablePortal
            options={options.map((o) => {
                return { label: o.name, id: o.id };
            })}
            renderInput={(params) => <TextField {...params} label={label} />}
            value={selectedIds.map((id) => {
                return { id, label: getDisplayTextForId(id) };
            })}
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
            onChange={onTaskChange}
        />
    );
};

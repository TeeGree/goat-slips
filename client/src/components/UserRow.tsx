import { Save } from '@mui/icons-material';
import { Button, TableCell, TableRow } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { fetchPostResponse } from '../helpers/fetchFunctions';
import { AccessRight } from '../types/AccessRight';
import { DropdownOption } from '../types/DropdownOption';
import { UserQueryResult } from '../types/User';
import { MultiSelect } from './MultiSelect';
import classes from './UserRow.module.scss';

interface UserRowProps {
    user: UserQueryResult;
    allAccessRights: AccessRight[];
    accessRightMap: Map<number, string>;
    fetchUsers: () => Promise<void>;
}

export const UserRow: React.FC<UserRowProps> = (props: UserRowProps) => {
    const { user, allAccessRights, accessRightMap, fetchUsers } = props;
    const [isDirty, setIsDirty] = useState(false);
    const [originalSelectedIds, setOriginalSelectedIds] = useState(new Set<number>());
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    useEffect(() => {
        if (user.accessRights) {
            const ids = user.accessRights.map((ar) => ar.id);
            setOriginalSelectedIds(new Set(ids));
            setSelectedIds(ids);
        }
    }, [user]);

    const getAllAccessRightOptions = (): DropdownOption[] => {
        return allAccessRights.map((ar) => {
            return {
                id: ar.id,
                name: ar.code,
            };
        });
    };

    const updateAccessRightsForUser = async () => {
        const response = await fetchPostResponse('User/SetAccessRights', {
            userId: user.id,
            accessRightIds: selectedIds,
        });

        if (response.ok) {
            await fetchUsers();
            setIsDirty(false);
        }
    };

    return (
        <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
            <TableCell>{user.username}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.firstName}</TableCell>
            <TableCell>{user.lastName}</TableCell>
            <TableCell>
                <div className={classes.accessRightsCell}>
                    <MultiSelect
                        setIsDirty={setIsDirty}
                        label="Access Rights"
                        keyPrefix={`user-${user.id}-`}
                        options={getAllAccessRightOptions()}
                        originalSelectedIds={originalSelectedIds}
                        selectedIds={selectedIds}
                        setSelectedIds={setSelectedIds}
                        getDisplayTextForId={(id: number) => accessRightMap.get(id) ?? ''}
                    />
                    <Button
                        className={classes.saveButton}
                        variant="contained"
                        color="success"
                        disabled={!isDirty}
                        onClick={updateAccessRightsForUser}
                    >
                        <Save />
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );
};

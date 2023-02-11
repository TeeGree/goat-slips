import { Save } from '@mui/icons-material';
import { Button } from '@mui/material';
import { useEffect, useState } from 'react';
import { fetchPostResponse } from '../../helpers/fetchFunctions';
import { AccessRight } from '../../types/AccessRight';
import { AlertMessage } from '../../types/AlertMessage';
import { DropdownOption } from '../../types/DropdownOption';
import { ErrorDetails } from '../../types/ErrorDetails';
import { UserQueryResult } from '../../types/User';
import { MultiSelect } from '../MultiSelect';
import classes from './AccessRightMultiSelect.module.scss';

interface AccessRightMultiSelectProps {
    user: UserQueryResult;
    allAccessRights: AccessRight[];
    accessRightMap: Map<number, string>;
    fetchUsers: () => Promise<void>;
    setAlertMessage: (alertMessage: AlertMessage) => void;
}

export const AccessRightMultiSelect: React.FC<AccessRightMultiSelectProps> = (
    props: AccessRightMultiSelectProps,
) => {
    const { user, allAccessRights, accessRightMap, fetchUsers, setAlertMessage } = props;

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
            setAlertMessage({
                message: `Access rights updated for user "${user.username}".`,
                severity: 'success',
            });
        } else {
            const message: ErrorDetails = await response.json();
            setAlertMessage({ message: message.detail, severity: 'error' });
        }
    };

    return (
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
    );
};

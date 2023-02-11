import { Save } from '@mui/icons-material';
import { Button } from '@mui/material';
import { useEffect, useState } from 'react';
import { fetchPostResponse } from '../../helpers/fetchFunctions';
import { AlertMessage } from '../../types/AlertMessage';
import { DropdownOption } from '../../types/DropdownOption';
import { ErrorDetails } from '../../types/ErrorDetails';
import { UserQueryResult } from '../../types/User';
import { MultiSelect } from '../MultiSelect';
import classes from './AccessRightMultiSelect.module.scss';

interface ProjectMultiSelectProps {
    user: UserQueryResult;
    allProjects: DropdownOption[];
    allProjectsMap: Map<number, string>;
    projectsForUser: number[];
    fetchProjectsForUsers: () => Promise<void>;
    setAlertMessage: (alertMessage: AlertMessage) => void;
}

export const ProjectMultiSelect: React.FC<ProjectMultiSelectProps> = (
    props: ProjectMultiSelectProps,
) => {
    const {
        user,
        allProjects,
        allProjectsMap,
        projectsForUser,
        fetchProjectsForUsers,
        setAlertMessage,
    } = props;

    const [isDirty, setIsDirty] = useState(false);
    const [originalSelectedIds, setOriginalSelectedIds] = useState(new Set<number>());
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    useEffect(() => {
        setOriginalSelectedIds(new Set(projectsForUser));
        setSelectedIds(projectsForUser);
    }, [projectsForUser]);

    const updateProjectsForUser = async () => {
        const response = await fetchPostResponse('User/SetProjectsForUser', {
            userId: user.id,
            projectIds: selectedIds,
        });

        if (response.ok) {
            await fetchProjectsForUsers();
            setIsDirty(false);
            setAlertMessage({
                message: `Projects updated for user "${user.username}".`,
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
                label="Projects"
                keyPrefix={`projects-${user.id}-`}
                options={allProjects}
                originalSelectedIds={originalSelectedIds}
                selectedIds={selectedIds}
                setSelectedIds={setSelectedIds}
                getDisplayTextForId={(id: number) => allProjectsMap.get(id) ?? ''}
            />
            <Button
                className={classes.saveButton}
                variant="contained"
                color="success"
                disabled={!isDirty}
                onClick={updateProjectsForUser}
            >
                <Save />
            </Button>
        </div>
    );
};

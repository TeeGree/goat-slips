import { TableCell, TableRow } from '@mui/material';
import React from 'react';
import { AccessRight } from '../../types/AccessRight';
import { AlertMessage } from '../../types/AlertMessage';
import { DropdownOption } from '../../types/DropdownOption';
import { UserQueryResult } from '../../types/User';
import { AccessRightMultiSelect } from './AccessRightMultiSelect';
import { ProjectMultiSelect } from './ProjectMultiSelect';

interface UserRowProps {
    user: UserQueryResult;
    allAccessRights: AccessRight[];
    accessRightMap: Map<number, string>;
    allProjects: DropdownOption[];
    allProjectsMap: Map<number, string>;
    projectsForUser: number[];
    fetchUsers: () => Promise<void>;
    fetchProjectsForUsers: () => Promise<void>;
    setAlertMessage: (alertMessage: AlertMessage) => void;
}

export const UserRow: React.FC<UserRowProps> = (props: UserRowProps) => {
    const {
        user,
        allAccessRights,
        accessRightMap,
        allProjects,
        allProjectsMap,
        projectsForUser,
        fetchUsers,
        fetchProjectsForUsers,
        setAlertMessage,
    } = props;

    return (
        <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
            <TableCell>{user.username}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.firstName}</TableCell>
            <TableCell>{user.lastName}</TableCell>
            <TableCell>
                <AccessRightMultiSelect
                    user={user}
                    allAccessRights={allAccessRights}
                    accessRightMap={accessRightMap}
                    fetchUsers={fetchUsers}
                    setAlertMessage={setAlertMessage}
                />
            </TableCell>
            <TableCell>
                <ProjectMultiSelect
                    user={user}
                    allProjects={allProjects}
                    allProjectsMap={allProjectsMap}
                    projectsForUser={projectsForUser}
                    fetchProjectsForUsers={fetchProjectsForUsers}
                    setAlertMessage={setAlertMessage}
                />
            </TableCell>
        </TableRow>
    );
};

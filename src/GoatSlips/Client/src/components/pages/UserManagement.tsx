import { PersonAdd, Replay, Search } from '@mui/icons-material';
import {
    Box,
    Button,
    CircularProgress,
    Modal,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { fetchGet, fetchPostResponse } from '../../helpers/fetchFunctions';
import { AccessRight } from '../../types/AccessRight';
import { AlertMessage } from '../../types/AlertMessage';
import { UserQueryResult } from '../../types/User';
import { Toast } from '../Toast';
import classes from './UserManagement.module.scss';
import { UserRow } from '../UserRow/UserRow';
import { modalStyle } from '../../constants/modalStyle';
import { passwordIsValid } from '../../helpers/passwordValidation';
import { UserProject } from '../../types/UserProject';
import { DropdownOption } from '../../types/DropdownOption';

interface UserManagementProps {
    allProjects: DropdownOption[];
    allProjectsMap: Map<number, string>;
}

export const UserManagement: React.FC<UserManagementProps> = (props: UserManagementProps) => {
    const { allProjects, allProjectsMap } = props;

    const [searchModified, setSearchModified] = useState(false);
    const [loadingResults, setLoadingResults] = useState(true);
    const [userFilterText, setUserFilterText] = useState('');
    const [users, setUsers] = useState<UserQueryResult[]>([]);
    const [isCreatingNewUser, setIsCreatingNewUser] = useState(false);

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');

    const [accessRights, setAccessRights] = useState<AccessRight[]>([]);
    const [accessRightMap, setAccessRightMap] = useState<Map<number, string>>(
        new Map<number, string>([]),
    );
    const [userProjectsMap, setUserProjectsMap] = useState<Map<number, number[]>>(
        new Map<number, number[]>([]),
    );
    const [alertMessage, setAlertMessage] = useState<AlertMessage | null>(null);

    useEffect(() => {
        getUsers('');
        getAllAccessRights();
        getUserProjects();
    }, []);

    const getUsers = async (searchText: string) => {
        setLoadingResults(true);
        const usersFromApi: UserQueryResult[] = await fetchGet<UserQueryResult[]>(
            `User/QueryUsers/${searchText}`,
        );

        setUsers(usersFromApi);

        if (searchText !== '') {
            setSearchModified(true);
        } else {
            setSearchModified(false);
        }

        setLoadingResults(false);
    };

    const getAllAccessRights = async () => {
        const accessRightsFromApi: AccessRight[] = await fetchGet<AccessRight[]>('AccessRight');

        const map = new Map<number, string>([]);
        accessRightsFromApi.forEach((accessRightFromApi: AccessRight) =>
            map.set(accessRightFromApi.id, accessRightFromApi.code),
        );

        setAccessRightMap(map);
        setAccessRights(accessRightsFromApi);
    };

    const getUserProjects = async () => {
        const userProjectsFromApi: UserProject[] = await fetchGet<UserProject[]>('User/Projects');

        const map = new Map<number, number[]>([]);
        userProjectsFromApi.forEach(({ userId, projectId }: UserProject) => {
            if (map.has(userId)) {
                map.get(userId)?.push(projectId);
            } else {
                map.set(userId, [projectId]);
            }
        });

        setUserProjectsMap(map);
    };

    const handleUserFilterChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = event.target.value;

        setUserFilterText(value);
    };

    const listenForEnter = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter') {
            getUsers(userFilterText);
            event.stopPropagation();
        }
    };

    const resetSearch = () => {
        setUserFilterText('');
        getUsers('');
    };

    const getRows = (): JSX.Element | JSX.Element[] => {
        if (loadingResults) {
            return (
                <TableRow>
                    <TableCell colSpan={7}>
                        <div className={classes.spinnerContainer}>
                            <CircularProgress />
                        </div>
                    </TableCell>
                </TableRow>
            );
        }

        return users.map((user: UserQueryResult) => {
            return (
                <UserRow
                    key={user.id}
                    setAlertMessage={setAlertMessage}
                    user={user}
                    allAccessRights={accessRights}
                    accessRightMap={accessRightMap}
                    fetchUsers={() => getUsers(userFilterText)}
                    fetchProjectsForUsers={getUserProjects}
                    allProjects={allProjects}
                    allProjectsMap={allProjectsMap}
                    projectsForUser={userProjectsMap.get(user.id) ?? []}
                />
            );
        });
    };

    const getInputs = () => {
        return (
            <div className={classes.inputContainer}>
                <TextField
                    label="Search User"
                    onChange={handleUserFilterChange}
                    value={userFilterText}
                    onKeyDown={listenForEnter}
                />
                <Tooltip title="Search for users starting with the entered text">
                    <span className={classes.searchButtonContainer}>
                        <Button
                            className={classes.searchButton}
                            onClick={() => getUsers(userFilterText)}
                            variant="contained"
                            color="primary"
                        >
                            <Search />
                        </Button>
                    </span>
                </Tooltip>

                <Tooltip title="Revert search and show all users in the system">
                    <span className={classes.searchButtonContainer}>
                        <Button
                            className={classes.searchButton}
                            disabled={!searchModified}
                            onClick={resetSearch}
                            variant="contained"
                            color="primary"
                        >
                            <Replay />
                        </Button>
                    </span>
                </Tooltip>
                <Button
                    className={classes.addNewUserButton}
                    variant="contained"
                    color="primary"
                    onClick={() => setIsCreatingNewUser(true)}
                >
                    <PersonAdd />
                </Button>
            </div>
        );
    };

    const handleSnackbarClose = () => {
        setAlertMessage(null);
    };

    const createUser = async () => {
        const response = await fetchPostResponse('User/CreateUser', {
            username,
            email,
            firstName,
            lastName,
            password,
        });

        if (response.ok) {
            setAlertMessage({
                message: `Successfully created user "${username}"!`,
                severity: 'success',
            });
            await getUsers(userFilterText);
            stopCreatingNewUser();
            return true;
        }

        setAlertMessage({ message: `Failed to create user "${username}"!`, severity: 'error' });
        return false;
    };

    const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(event.target.value);
    };

    const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(event.target.value);
    };

    const handleFirstNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFirstName(event.target.value);
    };

    const handleLastNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLastName(event.target.value);
    };

    const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value);
    };

    const stopCreatingNewUser = () => {
        setUsername('');
        setEmail('');
        setFirstName('');
        setLastName('');
        setPassword('');
        setIsCreatingNewUser(false);
    };

    return (
        <div className={classes.pageContainer}>
            {getInputs()}
            <TableContainer component={Paper} className={classes.tableContainer}>
                <Table aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>User</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>First Name</TableCell>
                            <TableCell>Last Name</TableCell>
                            <TableCell>Access Rights</TableCell>
                            <TableCell>Projects</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>{getRows()}</TableBody>
                </Table>
            </TableContainer>
            <Modal open={isCreatingNewUser}>
                <Box sx={modalStyle}>
                    <h2>Create new user</h2>
                    <div>
                        <div className={classes.newUserInputRow}>
                            <TextField
                                required
                                label="Username"
                                variant="outlined"
                                value={username}
                                onChange={handleUsernameChange}
                            />
                            <TextField
                                required
                                className={classes.secondInput}
                                label="Email"
                                variant="outlined"
                                value={email}
                                onChange={handleEmailChange}
                            />
                        </div>
                        <div className={classes.newUserInputRow}>
                            <TextField
                                label="First Name"
                                variant="outlined"
                                value={firstName}
                                onChange={handleFirstNameChange}
                            />
                            <TextField
                                className={classes.secondInput}
                                label="Last Name"
                                variant="outlined"
                                value={lastName}
                                onChange={handleLastNameChange}
                            />
                        </div>
                        <div className={classes.newUserInputRow}>
                            <Tooltip
                                placement="right"
                                title="Password must contain at least 1 letter, one number, and be at least 8 characters long."
                            >
                                <TextField
                                    required
                                    label="Temporary Password"
                                    variant="outlined"
                                    type="password"
                                    value={password}
                                    onChange={handlePasswordChange}
                                />
                            </Tooltip>
                        </div>
                    </div>
                    <div className={classes.modalButtons}>
                        <Button
                            variant="contained"
                            color="success"
                            disabled={email === '' || username === '' || !passwordIsValid(password)}
                            onClick={createUser}
                        >
                            Create
                        </Button>
                        <Button
                            variant="contained"
                            className={classes.secondInput}
                            onClick={stopCreatingNewUser}
                        >
                            Cancel
                        </Button>
                    </div>
                </Box>
            </Modal>
            <Toast
                severity={alertMessage?.severity}
                message={alertMessage?.message}
                onClose={handleSnackbarClose}
            />
        </div>
    );
};

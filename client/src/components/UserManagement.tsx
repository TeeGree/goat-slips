import { Replay, Search } from '@mui/icons-material';
import {
    Button,
    CircularProgress,
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
import { fetchGet } from '../helpers/fetchFunctions';
import { AccessRight } from '../types/AccessRight';
import { AlertMessage } from '../types/AlertMessage';
import { UserQueryResult } from '../types/User';
import { Toast } from './Toast';
import classes from './UserManagement.module.scss';
import { UserRow } from './UserRow';

export const UserManagement: React.FC<{}> = () => {
    const [searchModified, setSearchModified] = useState(false);
    const [loadingResults, setLoadingResults] = useState(true);
    const [userFilterText, setUserFilterText] = useState('');
    const [users, setUsers] = useState<UserQueryResult[]>([]);

    const [accessRights, setAccessRights] = useState<AccessRight[]>([]);
    const [accessRightMap, setAccessRightMap] = useState<Map<number, string>>(
        new Map<number, string>([]),
    );
    const [alertMessage, setAlertMessage] = useState<AlertMessage | null>(null);

    useEffect(() => {
        getUsers('');
        getAllAccessRights();
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
            </div>
        );
    };

    const handleSnackbarClose = () => {
        setAlertMessage(null);
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
                        </TableRow>
                    </TableHead>
                    <TableBody>{getRows()}</TableBody>
                </Table>
            </TableContainer>
            <Toast
                severity={alertMessage?.severity}
                message={alertMessage?.message}
                onClose={handleSnackbarClose}
            />
        </div>
    );
};

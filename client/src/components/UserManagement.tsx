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
import { DropdownOption } from '../types/DropdownOption';
import { UserQueryResult } from '../types/User';
import classes from './UserManagement.module.scss';

// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
const emptyDropdownOption: DropdownOption = {
    id: -1,
    name: 'N/A',
};

export const UserManagement: React.FC<{}> = () => {
    const [searchModified, setSearchModified] = useState(false);
    const [loadingResults, setLoadingResults] = useState(true);
    const [userFilterText, setUserFilterText] = useState('');
    const [users, setUsers] = useState<UserQueryResult[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    const [userMap, setUserMap] = useState<Map<number, UserQueryResult>>(
        new Map<number, UserQueryResult>([]),
    );

    useEffect(() => {
        getUsers('');
    }, []);

    const getUsers = async (searchText: string) => {
        setLoadingResults(true);
        const usersFromApi: UserQueryResult[] = await fetchGet<UserQueryResult[]>(
            `User/QueryUsers/${searchText}`,
        );

        const map = new Map<number, UserQueryResult>([]);
        usersFromApi.forEach((userFromApi: UserQueryResult) =>
            map.set(userFromApi.id, userFromApi),
        );
        setUserMap(map);
        setUsers(usersFromApi);

        if (searchText !== '') {
            setSearchModified(true);
        } else {
            setSearchModified(false);
        }

        setLoadingResults(false);
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
                        <CircularProgress />
                    </TableCell>
                </TableRow>
            );
        }

        return users.map((user: UserQueryResult) => {
            return (
                <TableRow key={user.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.firstName}</TableCell>
                    <TableCell>{user.lastName}</TableCell>
                </TableRow>
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
                    <Button
                        className={classes.searchButton}
                        onClick={() => getUsers(userFilterText)}
                        variant="contained"
                        color="primary"
                    >
                        <Search />
                    </Button>
                </Tooltip>

                <Tooltip title="Revert search and show all users in the system">
                    <Button
                        disabled={!searchModified}
                        className={classes.searchButton}
                        onClick={resetSearch}
                        variant="contained"
                        color="primary"
                    >
                        <Replay />
                    </Button>
                </Tooltip>
            </div>
        );
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
                        </TableRow>
                    </TableHead>
                    <TableBody>{getRows()}</TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

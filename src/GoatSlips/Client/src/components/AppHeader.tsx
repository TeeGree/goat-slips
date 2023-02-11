import React from 'react';
import classes from './AppHeader.module.scss';
import { Button, IconButton, Menu, MenuItem, Paper } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Person } from '@mui/icons-material';
import { fetchGetResponse } from '../helpers/fetchFunctions';
import { Link } from 'react-router-dom';
import { ComponentName, requiredAccessRights } from '../constants/requiredAccessRights';

interface AppHeaderProps {
    onLogout: () => void;
    username: string;
    passwordChangeRequired: boolean;
    accessRights: Set<string>;
}

export const AppHeader: React.FC<AppHeaderProps> = (props: AppHeaderProps) => {
    const { onLogout, username, passwordChangeRequired, accessRights } = props;

    const [appMenuAnchorEl, setAppMenuAnchorEl] = React.useState<null | HTMLElement>(null);
    const appMenuOpen = Boolean(appMenuAnchorEl);

    const handleAppMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAppMenuAnchorEl(event.currentTarget);
    };

    const handleAppMenuClose = () => {
        setAppMenuAnchorEl(null);
    };

    const [userMenuAnchorEl, setUserMenuAnchorEl] = React.useState<null | HTMLElement>(null);
    const userMenuOpen = Boolean(userMenuAnchorEl);

    const handleUserMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setUserMenuAnchorEl(event.currentTarget);
    };

    const handleUserMenuClose = () => {
        setUserMenuAnchorEl(null);
    };

    const handleLogout = async () => {
        handleUserMenuClose();

        const response = await fetchGetResponse('User/Logout');

        if (response.ok) {
            onLogout();
        }
    };

    const createLink = (path: string, label: ComponentName) => {
        const requiredAccessRight = requiredAccessRights.get(label);
        if (
            passwordChangeRequired ||
            (requiredAccessRight !== undefined && !accessRights.has(requiredAccessRight))
        ) {
            return null;
        }
        return (
            <Link className={classes.link} to={path}>
                <MenuItem onClick={handleAppMenuClose}>{label}</MenuItem>
            </Link>
        );
    };

    const isAuthenticated = () => {
        return username !== '';
    };

    const getAppMenuIcon = () => {
        if (isAuthenticated() && !passwordChangeRequired) {
            return (
                <>
                    <IconButton className={classes.appMenuIcon} onClick={handleAppMenuClick}>
                        <MenuIcon />
                    </IconButton>
                    <Menu
                        anchorEl={appMenuAnchorEl}
                        open={appMenuOpen}
                        onClose={handleAppMenuClose}
                        MenuListProps={{
                            'aria-labelledby': 'basic-button',
                        }}
                    >
                        {createLink('/configurations', 'Manage Configurations')}
                        {createLink('/manage-users', 'Manage Users')}
                        {createLink('/', 'Week View')}
                        {createLink('/query-time-slips', 'Query Time Slips')}
                        {createLink('/manage-projects', 'Manage Projects')}
                        {createLink('/manage-tasks', 'Manage Tasks')}
                        {createLink('/manage-labor-codes', 'Manage Labor Codes')}
                        {createLink('/time-slip-log', 'View Log')}
                    </Menu>
                </>
            );
        }

        return <></>;
    };

    const getUserMenuIcon = () => {
        if (isAuthenticated()) {
            return (
                <>
                    <Button className={classes.userMenuIcon} onClick={handleUserMenuClick}>
                        <Person />
                        {username}
                    </Button>
                    <Menu
                        anchorEl={userMenuAnchorEl}
                        open={userMenuOpen}
                        onClose={handleUserMenuClose}
                        MenuListProps={{
                            'aria-labelledby': 'basic-button',
                        }}
                    >
                        {createLink('/manage-favorites', 'Manage Favorites')}
                        {createLink('/change-password', 'Change Password')}
                        <MenuItem onClick={handleLogout}>Logout</MenuItem>
                    </Menu>
                </>
            );
        }

        return <></>;
    };

    return (
        <Paper className={classes.header}>
            {getAppMenuIcon()}
            G.O.A.T. Slips
            {getUserMenuIcon()}
        </Paper>
    );
};

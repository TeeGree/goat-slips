import React, { useState } from 'react';
import classes from './AppHeader.module.scss';
import { Box, Button, IconButton, Menu, MenuItem, Modal, Paper, Tooltip } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { ContentCopy, Person } from '@mui/icons-material';
import { fetchGet, fetchGetResponse } from '../helpers/fetchFunctions';
import { Link } from 'react-router-dom';
import { ComponentName, requiredAccessRights } from '../constants/requiredAccessRights';
import { modalStyle } from '../constants/modalStyle';

interface AppHeaderProps {
    onLogout: () => void;
    username: string;
    passwordChangeRequired: boolean;
    accessRights: Set<string>;
    showManageProjects: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = (props: AppHeaderProps) => {
    const { onLogout, username, passwordChangeRequired, accessRights, showManageProjects } = props;

    const [appMenuAnchorEl, setAppMenuAnchorEl] = useState<null | HTMLElement>(null);
    const appMenuOpen = Boolean(appMenuAnchorEl);

    const handleAppMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAppMenuAnchorEl(event.currentTarget);
    };

    const handleAppMenuClose = () => {
        setAppMenuAnchorEl(null);
    };

    const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<null | HTMLElement>(null);
    const userMenuOpen = Boolean(userMenuAnchorEl);

    const [isGenerateApiKeyOpen, setIsGenerateApiKeyOpen] = useState(false);
    const [apiKey, setApiKey] = useState('');

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

    const generateApiKey = async () => {
        const generatedApiKey: string = await fetchGet<string>('User/GenerateApiKey');

        setApiKey(generatedApiKey);
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

    const createManageProjectsLink = () => {
        if (!showManageProjects) {
            return null;
        }
        return (
            <Link className={classes.link} to="/manage-projects">
                <MenuItem onClick={handleAppMenuClose}>Manage Projects</MenuItem>
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
                        {createLink('/week-table', 'Week Table View')}
                        {createLink('/query-time-slips', 'Query Time Slips')}
                        {createManageProjectsLink()}
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
                        <MenuItem onClick={() => setIsGenerateApiKeyOpen(true)}>API Key</MenuItem>
                        {createLink('/manage-favorites', 'Manage Favorites')}
                        {createLink('/change-password', 'Change Password')}
                        <MenuItem onClick={handleLogout}>Logout</MenuItem>
                    </Menu>
                </>
            );
        }

        return <></>;
    };

    const getApiKeyElements = () => {
        if (apiKey === '') {
            return <></>;
        }

        return (
            <div className={classes.apiKeySection}>
                <div>
                    <span>{apiKey}</span>
                    <Tooltip title="Copy to clipboard" placement="right">
                        <IconButton
                            className={classes.button}
                            onClick={() => navigator.clipboard.writeText(apiKey)}
                        >
                            <ContentCopy />
                        </IconButton>
                    </Tooltip>
                </div>
                Please copy this key, as it will no longer be visible once you leave this dialog.
            </div>
        );
    };

    return (
        <Paper className={classes.header}>
            {getAppMenuIcon()}
            G.O.A.T. Slips
            {getUserMenuIcon()}
            <Modal open={isGenerateApiKeyOpen}>
                <Box sx={modalStyle}>
                    <h2>Would you like to generate an API key?</h2>
                    <div className={classes.apiKeySection}>
                        Please note that this will overwrite any API key you may have generated
                        before.
                    </div>
                    {getApiKeyElements()}
                    <div className={classes.modalButtons}>
                        <Button
                            variant="contained"
                            className={classes.button}
                            onClick={() => setIsGenerateApiKeyOpen(false)}
                        >
                            Close
                        </Button>
                        <Button
                            variant="contained"
                            className={classes.button}
                            onClick={generateApiKey}
                        >
                            Generate
                        </Button>
                    </div>
                </Box>
            </Modal>
        </Paper>
    );
};

import React from 'react';
import classes from './AppHeader.module.scss';
import { IconButton, Menu, MenuItem, Paper } from '@mui/material';
import { Person } from '@mui/icons-material';
import { fetchGetResponse } from '../helpers/fetchFunctions';

interface AppHeaderProps {
    onLogout: () => void;
    isAuthenticated: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = (props: AppHeaderProps) => {
    const { onLogout, isAuthenticated } = props;
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        handleClose();

        const response = await fetchGetResponse('User/Logout');

        if (response.ok) {
            onLogout();
        }
    };

    const getUserMenuIcon = () => {
        if (isAuthenticated) {
            return (
                <>
                    <IconButton className={classes.userMenuIcon} onClick={handleClick}>
                        <Person />
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        MenuListProps={{
                            'aria-labelledby': 'basic-button',
                        }}
                    >
                        <MenuItem onClick={handleLogout}>Logout</MenuItem>
                    </Menu>
                </>
            );
        }

        return <></>;
    };

    return (
        <Paper className={classes.header}>
            G.O.A.T. Slips
            {getUserMenuIcon()}
        </Paper>
    );
};

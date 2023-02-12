import {
    Alert,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
} from '@mui/material';
import React, { useState } from 'react';
import { fetchPostResponse } from '../../helpers/fetchFunctions';
import { AlertMessage } from '../../types/AlertMessage';
import { DropdownOption } from '../../types/DropdownOption';
import { ExistingLaborCodeRow } from '../ManageTimeCodes/ExistingLaborCodeRow';
import classes from './ManageLaborCodes.module.scss';

interface ManageLaborCodesContainerProps {
    laborCodes: DropdownOption[];
    fetchLaborCodes: () => Promise<void>;
    fetchFavorites: () => Promise<void>;
}

export const ManageLaborCodesContainer: React.FC<ManageLaborCodesContainerProps> = (
    props: ManageLaborCodesContainerProps,
) => {
    const { laborCodes, fetchLaborCodes, fetchFavorites } = props;

    const [alertMessage, setAlertMessage] = useState<AlertMessage | null>(null);

    const [newLaborCodeName, setNewLaborCodeName] = useState('');

    const handleNewLaborCodeNameChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = event.target.value;

        setNewLaborCodeName(value);
    };

    const fetchLaborCodesAndFavorites = async () => {
        await fetchLaborCodes();
        await fetchFavorites();
    };

    const createLaborCode = async () => {
        await fetchPostResponse('LaborCode/Create', { laborCodeName: newLaborCodeName });
        setNewLaborCodeName('');
        await fetchLaborCodes();
    };

    const existingLaborCodeElements = laborCodes.map((laborCode: DropdownOption) => {
        return (
            <ExistingLaborCodeRow
                key={`laborCode${laborCode.id}`}
                laborCode={laborCode}
                fetchLaborCodes={fetchLaborCodesAndFavorites}
                setError={(message: string) => setAlertMessage({ message, severity: 'error' })}
                setSuccess={(message: string) => setAlertMessage({ message, severity: 'success' })}
            />
        );
    });

    const getAlert = () => {
        if (alertMessage === null) {
            return <></>;
        }

        return <Alert severity={alertMessage.severity}>{alertMessage.message}</Alert>;
    };

    const getLaborCodesList = () => {
        return (
            <>
                <div className={classes.newLaborCodeContainer}>
                    <TextField
                        className={classes.laborCodeName}
                        label="New Labor Code"
                        variant="outlined"
                        value={newLaborCodeName}
                        onChange={handleNewLaborCodeNameChange}
                    />
                    <Button
                        className={classes.addNewLaborCode}
                        variant="contained"
                        color="success"
                        disabled={newLaborCodeName === ''}
                        onClick={createLaborCode}
                    >
                        Add
                    </Button>
                </div>
                <TableContainer component={Paper} className={classes.tableContainer}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell className={classes.buttonCell} />
                            </TableRow>
                        </TableHead>
                        <TableBody>{existingLaborCodeElements}</TableBody>
                    </Table>
                </TableContainer>
            </>
        );
    };

    return (
        <div className={classes.pageContainer}>
            <div className={classes.header}>Manage Labor Codes</div>
            {getAlert()}
            <div className={classes.codesList}>{getLaborCodesList()}</div>
        </div>
    );
};

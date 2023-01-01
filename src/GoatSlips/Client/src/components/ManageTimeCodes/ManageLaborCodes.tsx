import {
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
import { useState } from 'react';
import { fetchPostResponse } from '../../helpers/fetchFunctions';
import { AlertMessage } from '../../types/AlertMessage';
import { DropdownOption } from '../../types/DropdownOption';
import { ExistingLaborCodeRow } from './ExistingLaborCodeRow';
import classes from './ManageLaborCodes.module.scss';

interface ManageLaborCodesProps {
    laborCodes: DropdownOption[];
    fetchLaborCodes: () => Promise<void>;
    fetchFavorites: () => Promise<void>;
    setAlertMessage: (alertMessage: AlertMessage) => void;
}

export const ManageLaborCodes: React.FC<ManageLaborCodesProps> = (props: ManageLaborCodesProps) => {
    const { laborCodes, fetchLaborCodes, fetchFavorites, setAlertMessage } = props;

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

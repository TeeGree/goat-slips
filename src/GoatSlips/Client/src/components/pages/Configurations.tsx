import {
    Alert,
    Button,
    MenuItem,
    Paper,
    Select,
    SelectChangeEvent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { fetchGetResponse } from '../../helpers/fetchFunctions';
import { AlertMessage } from '../../types/AlertMessage';
import { AllowedFirstDayOfWeek } from '../../types/AllowedFirstDayOfWeek';
import { AllowedMinutesPartition } from '../../types/AllowedMinutesPartition';
import classes from './Configurations.module.scss';

const minutesPartitionDescription =
    'The allowed number of minutes selectable for time slips. ' +
    'For example, if the partition is "15", then the allowed minutes for time slips are "0", "15", "30", ' +
    'and "45".';

const firstDayOfWeekDescription = 'The first day of week for the week view.';

interface ConfigurationsProps {
    minutesPartition: AllowedMinutesPartition;
    firstDayOfWeek: AllowedFirstDayOfWeek;
    onChangeMinutesPartition: () => Promise<void>;
    onChangeFirstDayOfWeek: () => Promise<void>;
}

export const Configurations: React.FC<ConfigurationsProps> = (props: ConfigurationsProps) => {
    const { minutesPartition, firstDayOfWeek, onChangeMinutesPartition, onChangeFirstDayOfWeek } =
        props;
    const [alertMessage, setAlertMessage] = useState<AlertMessage | null>(null);
    const [newMinutesPartition, setNewMinutesPartition] =
        useState<AllowedMinutesPartition>(minutesPartition);

    const [newFirstDayOfWeek, setNewFirstDayOfWeek] =
        useState<AllowedFirstDayOfWeek>(firstDayOfWeek);

    useEffect(() => {
        setNewMinutesPartition(minutesPartition);
    }, [minutesPartition]);

    useEffect(() => {
        setNewFirstDayOfWeek(firstDayOfWeek);
    }, [firstDayOfWeek]);

    const changeMinutesPartition = async () => {
        const response = await fetchGetResponse(
            `Configuration/SetMinutesPartition/${newMinutesPartition}`,
        );

        if (response.ok) {
            setAlertMessage({
                message: 'Minutes partition successfully changed.',
                severity: 'success',
            });

            if (onChangeMinutesPartition) {
                await onChangeMinutesPartition();
            }
        } else {
            const responseText = await response.text();
            setAlertMessage({
                message: responseText,
                severity: 'error',
            });
        }
    };

    const changeFirstDayOfWeek = async () => {
        const response = await fetchGetResponse(
            `Configuration/SetFirstDayOfWeek/${newFirstDayOfWeek}`,
        );

        if (response.ok) {
            setAlertMessage({
                message: 'First day of week successfully changed.',
                severity: 'success',
            });

            if (onChangeFirstDayOfWeek) {
                await onChangeFirstDayOfWeek();
            }
        } else {
            const responseText = await response.text();
            setAlertMessage({
                message: responseText,
                severity: 'error',
            });
        }
    };

    const getAlert = () => {
        if (alertMessage !== null) {
            return (
                <Alert className={classes.alert} severity={alertMessage.severity}>
                    {alertMessage.message}
                </Alert>
            );
        }

        return <></>;
    };

    const handleMinutesPartitionChange = (event: SelectChangeEvent<number>) => {
        setNewMinutesPartition(Number(event.target.value) as AllowedMinutesPartition);
    };

    const handleFirstDayOfWeekChange = (event: SelectChangeEvent<number>) => {
        setNewFirstDayOfWeek(Number(event.target.value) as AllowedFirstDayOfWeek);
    };

    const getRows = (): JSX.Element | JSX.Element[] => {
        return (
            <>
                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell>Minutes Partition</TableCell>
                    <TableCell>
                        <Select
                            className={classes.select}
                            value={newMinutesPartition}
                            onChange={handleMinutesPartitionChange}
                        >
                            <MenuItem value={1}>1</MenuItem>
                            <MenuItem value={15}>15</MenuItem>
                            <MenuItem value={30}>30</MenuItem>
                        </Select>
                    </TableCell>
                    <TableCell>{minutesPartitionDescription}</TableCell>
                    <TableCell>
                        <Button
                            className={classes.input}
                            variant="contained"
                            onClick={changeMinutesPartition}
                        >
                            Update
                        </Button>
                    </TableCell>
                </TableRow>
                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell>First Day of Week</TableCell>
                    <TableCell>
                        <Select
                            className={classes.select}
                            value={newFirstDayOfWeek}
                            onChange={handleFirstDayOfWeekChange}
                        >
                            <MenuItem value={0}>Sunday</MenuItem>
                            <MenuItem value={1}>Monday</MenuItem>
                            <MenuItem value={2}>Tuesday</MenuItem>
                            <MenuItem value={3}>Wednesday</MenuItem>
                            <MenuItem value={4}>Thursday</MenuItem>
                            <MenuItem value={5}>Friday</MenuItem>
                            <MenuItem value={6}>Saturday</MenuItem>
                        </Select>
                    </TableCell>
                    <TableCell>{firstDayOfWeekDescription}</TableCell>
                    <TableCell>
                        <Button
                            className={classes.input}
                            variant="contained"
                            onClick={changeFirstDayOfWeek}
                        >
                            Update
                        </Button>
                    </TableCell>
                </TableRow>
            </>
        );
    };

    return (
        <div className={classes.inputContainer}>
            {getAlert()}
            <div className={classes.inputForm}>
                <TableContainer component={Paper} className={classes.tableContainer}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Selection</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell />
                            </TableRow>
                        </TableHead>
                        <TableBody>{getRows()}</TableBody>
                    </Table>
                </TableContainer>
            </div>
        </div>
    );
};

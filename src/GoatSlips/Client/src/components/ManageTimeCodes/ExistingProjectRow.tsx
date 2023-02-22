import { ArrowDropDown, Delete, Save } from '@mui/icons-material';
import {
    Box,
    Button,
    ClickAwayListener,
    Grow,
    MenuItem,
    MenuList,
    Modal,
    Paper,
    Popper,
    Select,
    TableCell,
    TableRow,
    TextField,
    Tooltip,
} from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { modalStyle } from '../../constants/modalStyle';
import { codeInUse } from '../../constants/statusCodes';
import { fetchDeleteResponse, fetchPostResponse } from '../../helpers/fetchFunctions';
import { DropdownOption } from '../../types/DropdownOption';
import { ErrorDetails } from '../../types/ErrorDetails';
import classes from './ExistingProjectRow.module.scss';
import { MultiSelect } from '../MultiSelect';
import { Project } from '../../types/Project';
import { unitedStates } from '../../constants/unitedStates';

interface ExistingProjectRowProps {
    project: Project;
    allProjects: Project[];
    allTasks: DropdownOption[];
    tasksAllowed: number[];
    taskMap: Map<number, string>;
    fetchProjects: () => Promise<void>;
    setError: (message: string) => void;
    setSuccess: (message: string) => void;
    fetchTasksAllowed: () => Promise<void>;
}

export const ExistingProjectRow: React.FC<ExistingProjectRowProps> = (
    props: ExistingProjectRowProps,
) => {
    const {
        project,
        allProjects,
        allTasks,
        tasksAllowed,
        taskMap,
        setError,
        setSuccess,
        fetchProjects,
        fetchTasksAllowed,
    } = props;

    const anchorRef = useRef<HTMLDivElement>(null);

    const [isBeingDeleted, setIsBeingDeleted] = useState(false);
    const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>(tasksAllowed);
    const [haveTasksChanged, setHaveTasksChanged] = useState(false);
    const [originalTasks, setOriginalTasks] = useState(new Set(tasksAllowed));
    const [rate, setRate] = useState<string>(project.rate.toString());
    const [firstName, setFirstName] = useState(project.firstName ?? '');
    const [lastName, setLastName] = useState(project.lastName ?? '');
    const [businessName, setBusinessName] = useState(project.businessName ?? '');
    const [email, setEmail] = useState(project.email ?? '');
    const [address1, setAddress1] = useState(project.address1 ?? '');
    const [address2, setAddress2] = useState(project.address2 ?? '');
    const [city, setCity] = useState(project.city ?? '');
    const [state, setState] = useState(project.state ?? '');
    const [zip, setZip] = useState<number | ''>(project.zip ?? '');
    const [zipExt, setZipExt] = useState<number | ''>(project.zipExtension ?? '');

    const [isRateDropdownOpen, setIsRateDropdownOpen] = useState(false);

    useEffect(() => {
        setSelectedTaskIds(tasksAllowed);
        setOriginalTasks(new Set(tasksAllowed));
        setHaveTasksChanged(false);
    }, [tasksAllowed]);

    const deleteProject = async () => {
        const response = await fetchDeleteResponse(`Project/Delete/${project.id}`);

        if (response.ok) {
            await fetchProjects();
            setSuccess(`Successfully deleted project ${project.name}!`);
        } else if (response.status === codeInUse) {
            const message: ErrorDetails = await response.json();
            setError(message.detail);
        }

        setIsBeingDeleted(false);
    };

    const handleRateChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = event.target.value;
        const regex = /^\d*\.?(?:\d{0,2})$/;
        if (!regex.test(value)) {
            return;
        }

        const newRateNumeric = Number(value);

        if (value !== '' && newRateNumeric < 0) {
            return;
        }

        setRate(value);
    };

    const handleZipChange = (
        event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
        setStateAction: (value: React.SetStateAction<number | ''>) => void,
        maxDigits: number,
    ) => {
        const value = event.target.value;
        if (value === '') {
            setStateAction('');
        }

        const newRateNumeric = Number(value);
        if (
            value === '' ||
            Number.isNaN(newRateNumeric) ||
            newRateNumeric < 0 ||
            value.length > maxDigits
        ) {
            return;
        }

        setStateAction(newRateNumeric);
    };

    const getIsDirty = () => {
        return (
            haveTasksChanged ||
            Number(rate) !== (project.rate ?? '') ||
            firstName !== (project.firstName ?? '') ||
            lastName !== (project.lastName ?? '') ||
            businessName !== (project.businessName ?? '') ||
            email !== (project.email ?? '') ||
            address1 !== (project.address1 ?? '') ||
            address2 !== (project.address2 ?? '') ||
            city !== (project.city ?? '') ||
            state !== (project.state ?? '') ||
            zip !== (project.zip ?? '') ||
            zipExt !== (project.zipExtension ?? '')
        );
    };

    const updateProject = async () => {
        const regex = /^.+@.+\..+$/;
        if (email !== '' && !regex.test(email)) {
            setError('Invalid email!');
            return;
        }

        const response = await fetchPostResponse('Project/Update', {
            projectId: project.id,
            allowedTaskIds: selectedTaskIds,
            rate: rate === '' ? 0 : Number(rate),
            firstName: firstName === '' ? null : firstName,
            lastName: lastName === '' ? null : lastName,
            businessName: businessName === '' ? null : businessName,
            email: email === '' ? null : email,
            address1: address1 === '' ? null : address1,
            address2: address2 === '' ? null : address2,
            city: city === '' ? null : city,
            state: state === '' ? null : state,
            zip: zip === '' ? null : zip,
            zipExtension: zipExt === '' ? null : zipExt,
        });

        if (response.ok) {
            await fetchTasksAllowed();
            await fetchProjects();
            setSuccess(`Successfully updated project ${project.name}!`);
        }
    };

    const getRateOptions = () => {
        const ratesUsed = new Set<number>();
        return allProjects.map((p: Project) => {
            if (p.id === project.id || ratesUsed.has(p.rate)) {
                return null;
            }

            ratesUsed.add(p.rate);

            const label = `${p.name} ($${p.rate.toFixed(2)})`;

            return (
                <MenuItem
                    key={`${project.name}-${p.rate}`}
                    onClick={() => setRate(p.rate.toString())}
                >
                    {label}
                </MenuItem>
            );
        });
    };

    return (
        <>
            <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell>{project.name}</TableCell>
                <TableCell>
                    <MultiSelect
                        className={classes.full}
                        label="Allowed Tasks"
                        originalSelectedIds={originalTasks}
                        selectedIds={selectedTaskIds}
                        setSelectedIds={setSelectedTaskIds}
                        setIsDirty={setHaveTasksChanged}
                        getDisplayTextForId={(id: number) => taskMap.get(id) ?? ''}
                        options={allTasks}
                    />
                </TableCell>
                <TableCell>
                    <span ref={anchorRef} className={classes.rateContainer}>
                        <TextField
                            className={classes.rate}
                            label="Rate"
                            variant="outlined"
                            value={rate}
                            onChange={handleRateChange}
                        />
                        <Tooltip title="Copy rate from another project" placement="top">
                            <Button
                                className={classes.rateDropdownMore}
                                variant="contained"
                                onClick={() => setIsRateDropdownOpen((prev) => !prev)}
                            >
                                <ArrowDropDown />
                            </Button>
                        </Tooltip>
                        <Popper
                            style={{
                                zIndex: 5,
                            }}
                            open={isRateDropdownOpen}
                            anchorEl={anchorRef.current}
                            role={undefined}
                            placement="bottom-start"
                            transition
                            disablePortal
                        >
                            {({ TransitionProps, placement }) => (
                                <Grow
                                    {...TransitionProps}
                                    style={{
                                        transformOrigin:
                                            placement === 'bottom' ? 'center top' : 'center bottom',
                                    }}
                                >
                                    <Paper>
                                        <ClickAwayListener
                                            onClickAway={() => setIsRateDropdownOpen(false)}
                                        >
                                            <MenuList autoFocusItem>{getRateOptions()}</MenuList>
                                        </ClickAwayListener>
                                    </Paper>
                                </Grow>
                            )}
                        </Popper>
                    </span>
                </TableCell>
                <TableCell>
                    <div className={classes.verticalInputContainer}>
                        <TextField
                            className={classes.textField}
                            label="First"
                            variant="outlined"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                        />
                        <TextField
                            className={classes.textField}
                            label="Last"
                            variant="outlined"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                        />
                        <TextField
                            className={classes.textField}
                            label="Business"
                            variant="outlined"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                        />
                    </div>
                </TableCell>
                <TableCell>
                    <TextField
                        className={classes.textField}
                        label="Email"
                        variant="outlined"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </TableCell>
                <TableCell>
                    <div className={classes.verticalInputContainer}>
                        <TextField
                            className={classes.textField}
                            label="Address1"
                            variant="outlined"
                            value={address1}
                            onChange={(e) => setAddress1(e.target.value)}
                        />
                        <TextField
                            className={classes.textField}
                            label="Address2"
                            variant="outlined"
                            value={address2}
                            onChange={(e) => setAddress2(e.target.value)}
                        />
                        <TextField
                            className={classes.textField}
                            label="City"
                            variant="outlined"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                        />
                        <span className={classes.address3}>
                            <Select
                                className={classes.state}
                                value={state}
                                onChange={(e) => setState(e.target.value)}
                                MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
                            >
                                <MenuItem value="" />
                                {unitedStates.map((us) => (
                                    <MenuItem key={us} value={us}>
                                        {us}
                                    </MenuItem>
                                ))}
                            </Select>
                            <span className={classes.verticalCenter}>
                                <TextField
                                    className={classes.zip}
                                    label="Zip"
                                    variant="outlined"
                                    value={zip}
                                    onChange={(e) => handleZipChange(e, setZip, 5)}
                                />
                                -
                                <TextField
                                    className={classes.zipExt}
                                    label="Zip Ext"
                                    variant="outlined"
                                    value={zipExt}
                                    onChange={(e) => handleZipChange(e, setZipExt, 4)}
                                />
                            </span>
                        </span>
                    </div>
                </TableCell>
                <TableCell>
                    <Button
                        className={classes.button}
                        variant="contained"
                        color="error"
                        onClick={() => setIsBeingDeleted(true)}
                    >
                        <Delete />
                    </Button>
                    <Button
                        disabled={!getIsDirty()}
                        className={classes.button}
                        variant="contained"
                        color="success"
                        onClick={updateProject}
                    >
                        <Save />
                    </Button>
                </TableCell>
            </TableRow>
            <Modal open={isBeingDeleted}>
                <Box sx={modalStyle}>
                    <h2>Are you sure you want to delete project {`"${project.name}"`}?</h2>
                    <div className={classes.modalButtons}>
                        <Button variant="contained" color="error" onClick={() => deleteProject()}>
                            Delete
                        </Button>
                        <Button
                            variant="contained"
                            className={classes.button}
                            onClick={() => setIsBeingDeleted(false)}
                        >
                            Cancel
                        </Button>
                    </div>
                </Box>
            </Modal>
        </>
    );
};

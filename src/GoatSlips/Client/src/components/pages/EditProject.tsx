import { ArrowBack, ArrowDropDown, Save } from '@mui/icons-material';
import {
    Alert,
    Button,
    ClickAwayListener,
    Grow,
    MenuItem,
    MenuList,
    Paper,
    Popper,
    Select,
    TextField,
    Tooltip,
} from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { fetchPostResponse } from '../../helpers/fetchFunctions';
import { DropdownOption } from '../../types/DropdownOption';
import { MultiSelect } from '../MultiSelect';
import { Project } from '../../types/Project';
import { unitedStates } from '../../constants/unitedStates';
import { RequireAuthentication } from '../HOC/RequireAuthentication';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertMessage } from '../../types/AlertMessage';
import classes from './EditProject.module.scss';
import MomentUtils from '@date-io/moment';
import moment from 'moment';
import 'moment/locale/de';
import { AllowedFirstDayOfWeek } from '../../types/AllowedFirstDayOfWeek';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';

interface EditProjectProps {
    projectMap: Map<number, Project>;
    allProjects: Project[];
    allTasks: DropdownOption[];
    tasksAllowedForProjects: Map<number, number[]>;
    taskMap: Map<number, string>;
    fetchProjects: () => Promise<void>;
    fetchTasksAllowed: () => Promise<void>;
    isAuthenticated: boolean;
    isAccessRightsLoading: boolean;
    isAuthenticationLoading: boolean;
    accessRights: Set<string>;
    requiredAccessRight?: string;
    overrideAccessRightLoading: boolean;
    userProjectIds: Set<number>;
    firstDayOfWeek: AllowedFirstDayOfWeek;
}

export const EditProject: React.FC<EditProjectProps> = (props: EditProjectProps) => {
    const {
        projectMap,
        allProjects,
        allTasks,
        tasksAllowedForProjects,
        taskMap,
        fetchProjects,
        fetchTasksAllowed,
        isAuthenticated,
        isAccessRightsLoading,
        isAuthenticationLoading,
        accessRights,
        requiredAccessRight,
        overrideAccessRightLoading,
        userProjectIds,
        firstDayOfWeek,
    } = props;

    const anchorRef = useRef<HTMLDivElement>(null);
    const [alertMessage, setAlertMessage] = useState<AlertMessage | null>(null);

    const setSuccess = (message: string) => {
        setAlertMessage({ message, severity: 'success' });
    };

    const setError = (message: string) => {
        setAlertMessage({ message, severity: 'error' });
    };

    const navigate = useNavigate();

    const params = useParams();

    const projectId = Number(params.projectIdText);

    const project = projectMap.get(projectId);
    if (project === undefined) {
        navigate('/');
        throw Error('Invalid project ID!');
    }
    const tasksAllowed = tasksAllowedForProjects.get(projectId) ?? [];

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
    const [lockDate, setLockDate] = React.useState<Date | null>(
        project.lockDate === null ? null : project.lockDate,
    );

    const [isRateDropdownOpen, setIsRateDropdownOpen] = useState(false);

    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setSelectedTaskIds(tasksAllowed);
        setOriginalTasks(new Set(tasksAllowed));
        setHaveTasksChanged(false);
    }, [tasksAllowed]);

    useEffect(() => {
        moment.locale('en', { week: { dow: firstDayOfWeek } });
        setIsLoaded(true);
    }, []);

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
            zipExt !== (project.zipExtension ?? '') ||
            lockDate?.toLocaleDateString('en') !== project.lockDate?.toLocaleDateString('en')
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
            lockDate,
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

    const getAlert = () => {
        if (alertMessage === null) {
            return <></>;
        }

        return <Alert severity={alertMessage.severity}>{alertMessage.message}</Alert>;
    };

    const getElements = () => {
        return (
            <div className={classes.page}>
                {getAlert()}
                <div className={classes.header}>
                    <Button
                        className={classes.backButton}
                        variant="contained"
                        color="primary"
                        onClick={() => navigate('/manage-projects')}
                    >
                        <ArrowBack className={classes.marginRight} />
                        Back
                    </Button>
                    {project.name}
                    <Button
                        disabled={!getIsDirty()}
                        className={classes.saveButton}
                        variant="contained"
                        color="success"
                        onClick={updateProject}
                    >
                        <Save className={classes.marginRight} />
                        Save
                    </Button>
                </div>
                <div className={classes.contactInfoContainer}>
                    <TextField
                        className={classes.textField}
                        label="First"
                        variant="outlined"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    />
                    <TextField
                        className={classes.inlineTextField}
                        label="Last"
                        variant="outlined"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                    />
                    <TextField
                        className={classes.inlineTextField}
                        label="Business"
                        variant="outlined"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                    />
                    <TextField
                        className={classes.inlineTextField}
                        label="Email"
                        variant="outlined"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className={classes.addressContainer}>
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
                <div className={classes.allowedTasksContainer}>
                    <MultiSelect
                        className={classes.allowedTasks}
                        label="Allowed Tasks"
                        originalSelectedIds={originalTasks}
                        selectedIds={selectedTaskIds}
                        setSelectedIds={setSelectedTaskIds}
                        setIsDirty={setHaveTasksChanged}
                        getDisplayTextForId={(id: number) => taskMap.get(id) ?? ''}
                        options={allTasks}
                    />
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
                    <LocalizationProvider dateAdapter={MomentUtils}>
                        <DatePicker
                            label="Lock Date"
                            value={lockDate}
                            onChange={(newValue) => {
                                setLockDate((newValue as any)?.toDate());
                            }}
                            renderInput={(p) => <TextField {...p} />}
                        />
                    </LocalizationProvider>
                </div>
            </div>
        );
    };

    if (!isLoaded) {
        return <></>;
    }

    return (
        <RequireAuthentication
            isAuthenticated={isAuthenticated}
            isAccessRightsLoading={isAccessRightsLoading}
            isAuthenticationLoading={isAuthenticationLoading}
            accessRights={accessRights}
            requiredAccessRight={requiredAccessRight}
            // Show link if user manages any projects
            overrideAccessRightAndAllowAccess={userProjectIds.has(Number(projectId))}
            overrideAccessRightLoading={overrideAccessRightLoading}
        >
            {getElements()}
        </RequireAuthentication>
    );
};

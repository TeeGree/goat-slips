import { Delete, FileDownload, Save, SavedSearch } from '@mui/icons-material';
import {
    Box,
    Button,
    CircularProgress,
    FormControl,
    InputLabel,
    MenuItem,
    Modal,
    Paper,
    Select,
    SelectChangeEvent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import React, { useEffect, useState } from 'react';
import { modalStyle } from '../../constants/modalStyle';
import { getCsvOfTimeSlips } from '../../helpers/csvGeneration';
import {
    fetchGet,
    fetchPost,
    fetchPostResponse,
    fetchDeleteResponse,
} from '../../helpers/fetchFunctions';
import { AlertMessage } from '../../types/AlertMessage';
import { DropdownOption } from '../../types/DropdownOption';
import { Query } from '../../types/Query';
import { ExportableTimeSlip, TimeSlipQueryResult } from '../../types/TimeSlip';
import { MultiSelect } from '../MultiSelect';
import { EntityLabelWithIcon } from '../EntityLabelWithIcon';
import { Toast } from '../Toast';
import classes from './QueryTimeSlips.module.scss';
import { useDebounce } from '../../helpers/debounce';
import MomentUtils from '@date-io/moment';
import moment from 'moment';
import 'moment/locale/de';
import { AllowedFirstDayOfWeek } from '../../types/AllowedFirstDayOfWeek';

interface QueryTimeSlipsProps {
    projects: DropdownOption[];
    projectMap: Map<number, string>;
    tasks: DropdownOption[];
    taskMap: Map<number, string>;
    laborCodes: DropdownOption[];
    laborCodeMap: Map<number, string>;
    isAdmin: boolean;
    currentUserId: number;
    savedQueries: DropdownOption[];
    savedQueriesMap: Map<number, Query>;
    fetchSavedQueries: () => Promise<void>;
    firstDayOfWeek: AllowedFirstDayOfWeek;
}

const emptyDropdownOption: DropdownOption = {
    id: -1,
    name: 'N/A',
};

interface QueryBody {
    userIds?: number[];
    projectIds?: number[];
    taskIds?: number[];
    laborCodeIds?: number[];
    fromDate?: string;
    toDate?: string;
    descriptionSearchText: string;
}

interface SaveQueryBody extends QueryBody {
    name: string;
}

export const QueryTimeSlips: React.FC<QueryTimeSlipsProps> = (props: QueryTimeSlipsProps) => {
    const {
        projects,
        projectMap,
        tasks,
        taskMap,
        laborCodes,
        laborCodeMap,
        isAdmin,
        currentUserId,
        savedQueries,
        savedQueriesMap,
        fetchSavedQueries,
        firstDayOfWeek,
    } = props;
    const [loadingResults, setLoadingResults] = useState(true);
    const [timeSlips, setTimeSlips] = useState<TimeSlipQueryResult[]>([]);

    const defaultSelectedUserIds = isAdmin ? [] : [currentUserId];
    const [selectedUserIds, setSelectedUserIds] = useState<number[]>(defaultSelectedUserIds);
    const [selectedProjectIds, setSelectedProjectIds] = useState<number[]>([]);
    const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([]);
    const [selectedLaborCodeIds, setSelectedLaborCodeIds] = useState<number[]>([]);

    // There are two separate states for description to prevent the debounce when loading a query.
    const [descriptionSearchText, setDescriptionSearchText] = useState('');
    const [inputDescriptionSearchText, setInputDescriptionSearchText] = useState('');

    // Wait 1 second after last user input to search using description search text.
    const debouncedDescription = useDebounce(inputDescriptionSearchText, 1000);

    const [fromDate, setFromDate] = React.useState<Dayjs | null>(null);
    const [toDate, setToDate] = React.useState<Dayjs | null>(null);
    const [users, setUsers] = useState<DropdownOption[]>([]);
    const [userMap, setUserMap] = useState<Map<number, string>>(new Map<number, string>([]));
    const [isSavingQuery, setIsSavingQuery] = useState(false);
    const [queryName, setQueryName] = useState('');
    const [selectedQueryId, setSelectedQueryId] = useState<number | ''>('');

    const [isDeletingQuery, setIsDeletingQuery] = useState(false);

    const [alertMessage, setAlertMessage] = useState<AlertMessage | null>(null);

    useEffect(() => {
        fetchTimeSlips();
        if (isAdmin) {
            getUsers();
        }
    }, [
        selectedUserIds,
        selectedProjectIds,
        selectedTaskIds,
        selectedLaborCodeIds,
        fromDate,
        toDate,
        debouncedDescription,
    ]);

    useEffect(() => {
        if (isAdmin) {
            getUsers();
        }
    }, [isAdmin]);

    useEffect(() => {
        moment.locale('en', { week: { dow: firstDayOfWeek } });
    }, []);

    const onDescriptionChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const description = event.target.value;
        setInputDescriptionSearchText(description);
        setDescriptionSearchText(description);
    };

    const buildQueryBody = () => {
        const newQueryBody: QueryBody = { descriptionSearchText };
        if (selectedUserIds.length !== 0) {
            newQueryBody.userIds = selectedUserIds;
        }

        if (selectedProjectIds.length !== 0) {
            newQueryBody.projectIds = selectedProjectIds;
        }

        if (selectedTaskIds.length !== 0) {
            newQueryBody.taskIds = selectedTaskIds;
        }

        if (selectedLaborCodeIds.length !== 0) {
            newQueryBody.laborCodeIds = selectedLaborCodeIds;
        }

        if (fromDate !== null) {
            newQueryBody.fromDate = fromDate.format('YYYY-MM-DD');
        }

        if (toDate !== null) {
            newQueryBody.toDate = toDate.format('YYYY-MM-DD');
        }

        return newQueryBody;
    };

    const fetchTimeSlips = async () => {
        setLoadingResults(true);

        const queryBody: QueryBody = buildQueryBody();

        const results = await fetchPost<TimeSlipQueryResult[]>('Query/QueryTimeSlips', queryBody);
        setTimeSlips(results);

        setLoadingResults(false);
    };

    const getUsers = async () => {
        const usersFromApi: DropdownOption[] = await fetchGet<DropdownOption[]>(
            'User/GetUsersForDropdown',
        );

        const map = new Map<number, string>([]);
        usersFromApi.forEach((userFromApi: DropdownOption) =>
            map.set(userFromApi.id, userFromApi.name),
        );
        setUserMap(map);
        setUsers(usersFromApi);
    };

    const getTask = (taskId: number | null): string => {
        if (taskId === null) {
            return 'N/A';
        }

        return taskMap.get(taskId) ?? 'Not found';
    };

    const getLaborCode = (laborCodeId: number | null): string => {
        if (laborCodeId === null) {
            return 'N/A';
        }

        return laborCodeMap.get(laborCodeId) ?? 'Not found';
    };

    const getRows = (): JSX.Element | JSX.Element[] => {
        if (loadingResults) {
            return (
                <TableRow>
                    <TableCell className={classes.emptyRow} colSpan={8}>
                        <CircularProgress />
                    </TableCell>
                </TableRow>
            );
        }

        return timeSlips.map((ts: TimeSlipQueryResult) => {
            return (
                <TableRow key={ts.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell>{userMap.get(ts.userId)}</TableCell>
                    <TableCell>{projectMap.get(ts.projectId)}</TableCell>
                    <TableCell>{getTask(ts.taskId)}</TableCell>
                    <TableCell>{getLaborCode(ts.laborCodeId)}</TableCell>
                    <TableCell>{ts.description}</TableCell>
                    <TableCell>{new Date(ts.date).toLocaleDateString('en')}</TableCell>
                    <TableCell>{ts.hours}</TableCell>
                    <TableCell>{ts.minutes}</TableCell>
                    <TableCell>{`$${ts.cost.toFixed(2)}`}</TableCell>
                </TableRow>
            );
        });
    };

    const getCsvOfSearchResults = (): string => {
        const exportableTimeSlips: ExportableTimeSlip[] = timeSlips.map(
            (ts: TimeSlipQueryResult) => {
                return {
                    username: userMap.get(ts.userId) ?? 'Unknown',
                    project: projectMap.get(ts.projectId) ?? 'Unknown',
                    task: getTask(ts.taskId),
                    laborCode: getLaborCode(ts.laborCodeId),
                    description: ts.description,
                    date: new Date(ts.date).toLocaleDateString('en'),
                    hours: ts.hours,
                    minutes: ts.minutes,
                    cost: `$${ts.cost.toFixed(2)}`,
                };
            },
        );
        return getCsvOfTimeSlips(exportableTimeSlips);
    };

    const download = () => {
        const data = getCsvOfSearchResults();
        const file = new File([data], 'TimeSlips.csv', {
            type: 'text/plain',
        });

        const link = document.createElement('a');
        const url = URL.createObjectURL(file);

        link.href = url;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    const getUserInput = () => {
        if (isAdmin) {
            return (
                <MultiSelect
                    className={classes.multiSelect}
                    selectedIds={selectedUserIds}
                    getDisplayTextForId={(id: number) => userMap.get(id) ?? 'N/A'}
                    setSelectedIds={setSelectedUserIds}
                    label="User"
                    options={users}
                />
            );
        }
        return null;
    };

    const getInputs = () => {
        return (
            <div>
                <div className={classes.inputContainer}>
                    <TextField
                        label="Description Contains"
                        variant="outlined"
                        value={descriptionSearchText}
                        onChange={onDescriptionChange}
                    />
                    <LocalizationProvider dateAdapter={MomentUtils}>
                        <DatePicker
                            label="From Date"
                            value={fromDate}
                            onChange={(newValue) => {
                                setFromDate(newValue);
                            }}
                            renderInput={(params) => <TextField {...params} />}
                        />
                    </LocalizationProvider>
                    <LocalizationProvider dateAdapter={MomentUtils}>
                        <DatePicker
                            label="To Date"
                            value={toDate}
                            onChange={(newValue) => {
                                setToDate(newValue);
                            }}
                            renderInput={(params) => <TextField {...params} />}
                        />
                    </LocalizationProvider>
                    <Tooltip title="Export results as csv.">
                        <Button variant="contained" onClick={download}>
                            <FileDownload />
                        </Button>
                    </Tooltip>
                </div>
                <div className={classes.inputContainer}>
                    {getUserInput()}
                    <MultiSelect
                        className={classes.multiSelect}
                        selectedIds={selectedProjectIds}
                        getDisplayTextForId={(id: number) => projectMap.get(id) ?? 'N/A'}
                        setSelectedIds={setSelectedProjectIds}
                        label="Project"
                        options={projects}
                    />
                    <MultiSelect
                        className={classes.multiSelect}
                        selectedIds={selectedTaskIds}
                        getDisplayTextForId={(id: number) => taskMap.get(id) ?? 'N/A'}
                        setSelectedIds={setSelectedTaskIds}
                        label="Task"
                        options={[emptyDropdownOption, ...tasks]}
                    />
                    <MultiSelect
                        className={classes.multiSelect}
                        selectedIds={selectedLaborCodeIds}
                        getDisplayTextForId={(id: number) => laborCodeMap.get(id) ?? 'N/A'}
                        setSelectedIds={setSelectedLaborCodeIds}
                        label="Labor Code"
                        options={[emptyDropdownOption, ...laborCodes]}
                    />
                </div>
            </div>
        );
    };

    const handleCloseSaveQueryModal = () => {
        setIsSavingQuery(false);
        setQueryName('');
    };

    const handleQueryNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setQueryName(event.target.value);
    };

    const saveQuery = async (): Promise<void> => {
        const saveQueryBody: SaveQueryBody = { ...buildQueryBody(), name: queryName };

        const response = await fetchPostResponse('Query/SaveQuery', saveQueryBody);

        if (response.ok) {
            setAlertMessage({ message: `Saved "${queryName}"`, severity: 'success' });
            handleCloseSaveQueryModal();
            fetchSavedQueries();
        } else {
            setAlertMessage({
                message: `Error occurred while attempting to save "${queryName}"`,
                severity: 'error',
            });
        }
    };

    const deleteSelectedQuery = async () => {
        const nameOfQueryBeingDeleted = getSelectedQueryName();
        const response = await fetchDeleteResponse(`Query/Delete/${selectedQueryId}`);

        if (response.ok) {
            await fetchSavedQueries();
            setAlertMessage({
                message: `Deleted "${nameOfQueryBeingDeleted}"`,
                severity: 'success',
            });
            setSelectedQueryId('');
            setIsDeletingQuery(false);
        } else {
            setAlertMessage({
                message: `Error occurred while attempting to delete "${nameOfQueryBeingDeleted}"`,
                severity: 'error',
            });
        }
    };

    const handleSelectedQueryChange = (event: SelectChangeEvent<number>) => {
        setSelectedQueryId(Number(event.target.value));
    };

    const getSavedQueryOptions = (): JSX.Element[] => {
        return savedQueries.map((query: DropdownOption) => {
            const { id, name } = query;
            return (
                <MenuItem key={`query${id}`} value={id}>
                    {name}
                </MenuItem>
            );
        });
    };

    const anyParametersSelected = () => {
        return (
            selectedProjectIds.length > 0 ||
            selectedTaskIds.length > 0 ||
            selectedLaborCodeIds.length > 0 ||
            fromDate !== null ||
            toDate !== null ||
            descriptionSearchText !== '' ||
            (isAdmin && selectedUserIds.length > 0)
        );
    };

    const getSaveQueryButton = () => {
        const nothingSelected = !anyParametersSelected();

        const button = (
            <Button
                disabled={nothingSelected}
                variant="contained"
                className={classes.saveQuery}
                onClick={() => setIsSavingQuery(true)}
            >
                <Save />
                Save Query
            </Button>
        );

        if (nothingSelected) {
            return (
                <Tooltip title="Cannot save a query with no filters selected!">
                    <span className={classes.saveQuerySpan}>{button}</span>
                </Tooltip>
            );
        }
        return button;
    };

    const getSelectedQuery = () => {
        if (selectedQueryId === '') {
            throw Error('No query selected to load!');
        }

        const query = savedQueriesMap.get(selectedQueryId);
        if (query === undefined) {
            throw Error('Error loading saved query!');
        }

        return query;
    };

    const getSelectedQueryName = () => {
        const defaultName = 'N/A';
        if (selectedQueryId === '') {
            return defaultName;
        }

        const query = savedQueriesMap.get(selectedQueryId);
        if (query === undefined) {
            return defaultName;
        }

        return query.name;
    };

    const loadSelectedQuery = () => {
        const query = getSelectedQuery();

        setDescriptionSearchText(query.description);
        setSelectedUserIds(query.userIds);
        setSelectedProjectIds(query.projectIds);
        setSelectedTaskIds(query.taskIds);
        setSelectedLaborCodeIds(query.laborCodeIds);
        setFromDate(query.fromDate === null ? null : dayjs(query.fromDate));
        setToDate(query.toDate === null ? null : dayjs(query.toDate));
    };

    const getActionBar = () => {
        return (
            <div className={classes.actionBar}>
                <span className={classes.fullHeight}>
                    <FormControl className={classes.dropdown}>
                        <InputLabel>Saved Queries</InputLabel>
                        <Select
                            value={selectedQueryId}
                            onChange={handleSelectedQueryChange}
                            label="Saved Queries"
                        >
                            {getSavedQueryOptions()}
                        </Select>
                    </FormControl>
                    <Button
                        disabled={selectedQueryId === ''}
                        variant="contained"
                        className={classes.loadQuery}
                        onClick={loadSelectedQuery}
                    >
                        <SavedSearch />
                        Load Query
                    </Button>
                    <Tooltip title="Delete the selected query">
                        <span className={classes.deleteQuerySpan}>
                            <Button
                                disabled={selectedQueryId === ''}
                                variant="contained"
                                color="error"
                                className={classes.deleteQuery}
                                onClick={() => setIsDeletingQuery(true)}
                            >
                                <Delete />
                            </Button>
                        </span>
                    </Tooltip>
                </span>
                {getSaveQueryButton()}
            </div>
        );
    };

    const getDatesForModal = () => {
        const dateDivs: JSX.Element[] = [];
        if (fromDate !== null) {
            dateDivs.push(
                <div className={classes.modalCodes}>
                    <>From Date: {fromDate.toDate().toLocaleDateString('en')}</>
                </div>,
            );
        }
        if (toDate !== null) {
            dateDivs.push(
                <div className={classes.modalCodes}>
                    <>To Date: {toDate.toDate().toLocaleDateString('en')}</>
                </div>,
            );
        }

        return dateDivs;
    };

    const getDescriptionForModal = () => {
        return (
            <div className={classes.modalCodes}>
                <>Description: {`"${descriptionSearchText}"`}</>
            </div>
        );
    };

    const getUsersForModal = () => {
        if (!isAdmin || selectedUserIds.length === 0) {
            return null;
        }

        const label = selectedUserIds
            .map((uid) => {
                return userMap.get(uid) ?? 'N/A';
            })
            .join(', ');

        return (
            <div className={classes.modalCodes}>
                <EntityLabelWithIcon label={label} timeCodeType="user" />
            </div>
        );
    };

    const getProjectsForModal = () => {
        if (selectedProjectIds.length === 0) {
            return null;
        }

        const label = selectedProjectIds
            .map((pid) => {
                return projectMap.get(pid) ?? 'N/A';
            })
            .join(', ');

        return (
            <div className={classes.modalCodes}>
                <EntityLabelWithIcon label={label} timeCodeType="project" />
            </div>
        );
    };

    const getTasksForModal = () => {
        if (selectedTaskIds.length === 0) {
            return null;
        }

        const label = selectedTaskIds
            .map((tid) => {
                return taskMap.get(tid) ?? 'N/A';
            })
            .join(', ');

        return (
            <div className={classes.modalCodes}>
                <EntityLabelWithIcon label={label} timeCodeType="task" />
            </div>
        );
    };

    const getLaborCodesForModal = () => {
        if (selectedLaborCodeIds.length === 0) {
            return null;
        }

        const label = selectedLaborCodeIds
            .map((lcid) => {
                return laborCodeMap.get(lcid) ?? 'N/A';
            })
            .join(', ');

        return (
            <div className={classes.modalCodes}>
                <EntityLabelWithIcon label={label} timeCodeType="laborCode" />
            </div>
        );
    };

    const getSaveQueryModal = () => {
        return (
            <Modal open={isSavingQuery}>
                <Box sx={modalStyle}>
                    <h2>Enter a name for this query:</h2>
                    <div className={classes.padded}>
                        <TextField
                            label="Name"
                            value={queryName}
                            onChange={handleQueryNameChange}
                        />
                    </div>
                    <div className={classes.padded}>
                        <>
                            {getUsersForModal()}
                            {getProjectsForModal()}
                            {getTasksForModal()}
                            {getLaborCodesForModal()}
                            {getDatesForModal()}
                            {getDescriptionForModal()}
                        </>
                    </div>
                    <div className={classes.modalButtons}>
                        <Button
                            disabled={queryName === ''}
                            variant="contained"
                            color="success"
                            onClick={saveQuery}
                        >
                            Save Query
                        </Button>
                        <Button
                            variant="contained"
                            className={classes.cancelButton}
                            onClick={handleCloseSaveQueryModal}
                        >
                            Cancel
                        </Button>
                    </div>
                </Box>
            </Modal>
        );
    };

    const getDeleteQueryModal = () => {
        return (
            <Modal open={isDeletingQuery}>
                <Box sx={modalStyle}>
                    <h2>
                        Are you sure you want to delete the {`"${getSelectedQueryName()}"`} query?
                    </h2>
                    <div className={classes.modalButtons}>
                        <Button variant="contained" color="error" onClick={deleteSelectedQuery}>
                            Delete
                        </Button>
                        <Button
                            variant="contained"
                            className={classes.cancelButton}
                            onClick={() => setIsDeletingQuery(false)}
                        >
                            Cancel
                        </Button>
                    </div>
                </Box>
            </Modal>
        );
    };

    return (
        <div className={classes.pageContainer}>
            <>
                {getActionBar()}
                {getInputs()}
                <TableContainer component={Paper} className={classes.tableContainer}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>User</TableCell>
                                <TableCell>Project</TableCell>
                                <TableCell>Task</TableCell>
                                <TableCell>Labor Code</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Hours</TableCell>
                                <TableCell>Minutes</TableCell>
                                <TableCell>Cost</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>{getRows()}</TableBody>
                    </Table>
                </TableContainer>
                {getSaveQueryModal()}
                {getDeleteQueryModal()}
                <Toast
                    severity={alertMessage?.severity}
                    message={alertMessage?.message}
                    onClose={() => setAlertMessage(null)}
                />
            </>
        </div>
    );
};

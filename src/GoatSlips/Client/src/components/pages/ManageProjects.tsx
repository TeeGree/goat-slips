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
import { useState } from 'react';
import { fetchPostResponse } from '../../helpers/fetchFunctions';
import { AlertMessage } from '../../types/AlertMessage';
import { DropdownOption } from '../../types/DropdownOption';
import { Project } from '../../types/Project';
import { ExistingProjectRow } from '../ManageTimeCodes/ExistingProjectRow';
import classes from './ManageProjects.module.scss';

interface ManageProjectsProps {
    projects: Project[];
    tasks: DropdownOption[];
    taskMap: Map<number, string>;
    tasksAllowedForProjects: Map<number, number[]>;
    fetchProjects: () => Promise<void>;
    fetchTasksAllowed: () => Promise<void>;
    fetchFavorites: () => Promise<void>;
    isAdmin: boolean;
    managedProjectIds: Set<number>;
}

export const ManageProjects: React.FC<ManageProjectsProps> = (props: ManageProjectsProps) => {
    const {
        projects,
        tasks,
        taskMap,
        tasksAllowedForProjects,
        fetchProjects,
        fetchTasksAllowed,
        fetchFavorites,
        isAdmin,
        managedProjectIds,
    } = props;

    const [newProjectName, setNewProjectName] = useState('');
    const [alertMessage, setAlertMessage] = useState<AlertMessage | null>(null);

    const handleNewProjectNameChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = event.target.value;

        setNewProjectName(value);
    };

    const createProject = async () => {
        await fetchPostResponse('Project/Create', { projectName: newProjectName });
        setNewProjectName('');
        await fetchProjects();
        await fetchTasksAllowed();
    };

    const fetchProjectsAndFavorites = async () => {
        await fetchProjects();
        await fetchFavorites();
    };

    const existingProjectElements = projects.map((project: Project) => {
        if (!isAdmin && !managedProjectIds.has(project.id)) {
            return null;
        }
        return (
            <ExistingProjectRow
                allTasks={tasks}
                tasksAllowed={tasksAllowedForProjects.get(project.id) ?? []}
                taskMap={taskMap}
                key={`project${project.id}`}
                project={project}
                fetchProjects={fetchProjectsAndFavorites}
                fetchTasksAllowed={fetchTasksAllowed}
                setError={(message: string) => setAlertMessage({ message, severity: 'error' })}
                setSuccess={(message: string) => setAlertMessage({ message, severity: 'success' })}
            />
        );
    });

    const getProjectsList = () => {
        return (
            <>
                <div className={classes.newProjectContainer}>
                    <TextField
                        className={classes.projectName}
                        label="New Project"
                        variant="outlined"
                        value={newProjectName}
                        onChange={handleNewProjectNameChange}
                    />
                    <Button
                        className={classes.addNewProject}
                        variant="contained"
                        color="success"
                        disabled={newProjectName === ''}
                        onClick={createProject}
                    >
                        Add
                    </Button>
                </div>
                <TableContainer component={Paper} className={classes.tableContainer}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell className={classes.taskCell}>Allowed Tasks</TableCell>
                                <TableCell>Rate</TableCell>
                                <TableCell className={classes.buttonCell} />
                            </TableRow>
                        </TableHead>
                        <TableBody>{existingProjectElements}</TableBody>
                    </Table>
                </TableContainer>
            </>
        );
    };

    const getAlert = () => {
        if (alertMessage === null) {
            return <></>;
        }

        return <Alert severity={alertMessage.severity}>{alertMessage.message}</Alert>;
    };

    return (
        <div className={classes.pageContainer}>
            <div className={classes.header}>Manage Projects</div>
            {getAlert()}
            <div className={classes.codesList}>{getProjectsList()}</div>
        </div>
    );
};

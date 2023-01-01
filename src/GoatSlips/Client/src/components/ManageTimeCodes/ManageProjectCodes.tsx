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
import { ExistingProjectRow } from './ExistingProjectRow';
import classes from './ManageProjectCodes.module.scss';

interface ManageProjectCodesProps {
    projects: DropdownOption[];
    tasks: DropdownOption[];
    taskMap: Map<number, string>;
    tasksAllowedForProjects: Map<number, number[]>;
    fetchProjects: () => Promise<void>;
    fetchTasksAllowed: () => Promise<void>;
    fetchFavorites: () => Promise<void>;
    setAlertMessage: (alertMessage: AlertMessage) => void;
}

export const ManageProjectCodes: React.FC<ManageProjectCodesProps> = (
    props: ManageProjectCodesProps,
) => {
    const {
        projects,
        tasks,
        taskMap,
        tasksAllowedForProjects,
        fetchProjects,
        fetchTasksAllowed,
        fetchFavorites,
        setAlertMessage,
    } = props;

    const [newProjectName, setNewProjectName] = useState('');

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

    const existingProjectElements = projects.map((project: DropdownOption) => {
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
                            <TableCell>Allowed Tasks</TableCell>
                            <TableCell className={classes.buttonCell} />
                        </TableRow>
                    </TableHead>
                    <TableBody>{existingProjectElements}</TableBody>
                </Table>
            </TableContainer>
        </>
    );
};

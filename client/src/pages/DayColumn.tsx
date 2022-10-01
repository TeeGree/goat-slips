import React, { useEffect, useState } from 'react';
import classes from './DayColumn.module.scss';
import path from 'path-browserify';
import { Day } from '../types/Day';
import { DropdownOption } from '../types/DropdownOption';
import { Button } from '@mui/material';
import { Add } from '@mui/icons-material';
import { EditableTimeSlip } from './EditableTimeSlip';

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

interface TaskMap {
    projectId: number;
    allowedTaskIds: number[];
}

interface DayColumnProps {
    date: Date;
    day: Day;
    isCurrentDay: boolean;
}

export const DayColumn: React.FC<DayColumnProps> = (props: DayColumnProps) => {
    const [projects, setProjects] = useState<DropdownOption[]>([]);
    const [tasks, setTasks] = useState<Map<number, string>>(new Map<number, string>([]));

    const [tasksAllowedForProjects, setTasksAllowedForProjects] = useState<Map<number, number[]>>(
        new Map<number, number[]>([]),
    );

    const [laborCodes, setLaborCodes] = useState<DropdownOption[]>([]);

    const [addingTimeSlip, setAddingTimeSlip] = useState(false);

    const { date, day, isCurrentDay } = props;

    const getProjects = async () => {
        if (apiEndpoint === undefined) {
            throw Error('No REACT_APP_API_ENDPOINT has been set!');
        }
        const url = path.join(apiEndpoint, 'Project');
        const result = await fetch(url, { credentials: 'include' });

        const projectsFromApi: DropdownOption[] = await result.json();
        setProjects(projectsFromApi);
    };

    const getTasks = async () => {
        if (apiEndpoint === undefined) {
            throw Error('No REACT_APP_API_ENDPOINT has been set!');
        }
        const url = path.join(apiEndpoint, 'Task');
        const result = await fetch(url, { credentials: 'include' });

        const tasksFromApi: DropdownOption[] = await result.json();

        const taskMap = new Map<number, string>([]);
        tasksFromApi.forEach((task) => taskMap.set(task.id, task.name));
        setTasks(taskMap);
    };

    const getTasksAllowedForProjects = async () => {
        if (apiEndpoint === undefined) {
            throw Error('No REACT_APP_API_ENDPOINT has been set!');
        }
        const url = path.join(apiEndpoint, 'Task/ProjectsAllowedTasks');
        const result = await fetch(url, { credentials: 'include' });

        const taskMapsFromApi: TaskMap[] = await result.json();

        const taskProjectMap = new Map<number, number[]>([]);
        taskMapsFromApi.forEach((taskMap) =>
            taskProjectMap.set(taskMap.projectId, taskMap.allowedTaskIds),
        );
        setTasksAllowedForProjects(taskProjectMap);
    };

    const getLaborCodes = async () => {
        if (apiEndpoint === undefined) {
            throw Error('No REACT_APP_API_ENDPOINT has been set!');
        }
        const url = path.join(apiEndpoint, 'LaborCode');
        const result = await fetch(url, { credentials: 'include' });

        const laborCodesFromApi: DropdownOption[] = await result.json();
        setLaborCodes(laborCodesFromApi);
    };

    const saveTimeSlip = async (
        projectId: number,
        taskId: number | null,
        laborCodeId: number | null,
        hours: number,
        minutes: number,
    ) => {
        if (apiEndpoint === undefined) {
            throw Error('No REACT_APP_API_ENDPOINT has been set!');
        }
        const url = path.join(apiEndpoint, 'TimeSlip/AddTimeSlip');
        const result = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                projectId,
                taskId,
                laborCodeId,
                hours,
                minutes,
                date,
            }),
        });

        if (result.ok) {
            setAddingTimeSlip(false);
        }
    };

    const getDateString = () => {
        return date.toLocaleDateString('en');
    };

    useEffect(() => {
        getProjects();
        getTasks();
        getTasksAllowedForProjects();
        getLaborCodes();
    }, []);

    const getTaskOptionsForProject = (projectId: number): DropdownOption[] => {
        const tasksForProject = tasksAllowedForProjects.get(projectId);
        if (tasksForProject === undefined) {
            throw Error('No tasks found for project!');
        }

        return tasksForProject.map((taskId: number) => {
            const name = tasks.get(taskId);
            if (name === undefined) {
                throw Error('No tasks found for project!');
            }

            return { id: taskId, name };
        });
    };

    const getAddTimeSlipButtonElements = (): JSX.Element => {
        if (addingTimeSlip) {
            return (
                <EditableTimeSlip
                    saveTimeSlip={saveTimeSlip}
                    projectOptions={projects}
                    laborCodeOptions={laborCodes}
                    getTaskOptionsForProject={getTaskOptionsForProject}
                    stopAddingTimeslip={() => setAddingTimeSlip(false)}
                />
            );
        }

        return (
            <Button variant="contained" onClick={() => setAddingTimeSlip(true)}>
                <Add />
            </Button>
        );
    };

    const className = isCurrentDay ? 'current-day ' : '';
    return (
        <div className={`${className} ${classes.dayColumn}`}>
            <div className={classes.dayHeader}>
                <div>{day}</div>
                <div>{getDateString()}</div>
                <hr />
            </div>
            <div className={classes.dayBody}>{getAddTimeSlipButtonElements()}</div>
        </div>
    );
};

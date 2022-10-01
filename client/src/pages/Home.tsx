import React, { useEffect, useState } from 'react';
import classes from './Home.module.scss';
import { DayColumn } from './DayColumn';
import { Day } from '../types/Day';
import { DropdownOption } from '../types/DropdownOption';
import path from 'path-browserify';
import { TimeSlip } from '../types/TimeSlip';

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

interface TaskMap {
    projectId: number;
    allowedTaskIds: number[];
}

const dayMap = new Map<number, Day>([
    [0, 'Sunday'],
    [1, 'Monday'],
    [2, 'Tuesday'],
    [3, 'Wednesday'],
    [4, 'Thursday'],
    [5, 'Friday'],
    [6, 'Saturday'],
]);

export const Home: React.FC<{}> = () => {
    const currentDate = new Date();

    const [projects, setProjects] = useState<DropdownOption[]>([]);
    const [tasks, setTasks] = useState<Map<number, string>>(new Map<number, string>([]));

    const [tasksAllowedForProjects, setTasksAllowedForProjects] = useState<Map<number, number[]>>(
        new Map<number, number[]>([]),
    );

    const [timeSlipsPerDay, setTimeSlipsPerDay] = useState<Map<string, TimeSlip[]>>(
        new Map<string, TimeSlip[]>([]),
    );

    const [laborCodes, setLaborCodes] = useState<DropdownOption[]>([]);

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

    const getTimeSlips = async () => {
        if (apiEndpoint === undefined) {
            throw Error('No REACT_APP_API_ENDPOINT has been set!');
        }
        const url = path.join(apiEndpoint, 'TimeSlip/TimeSlipsForCurrentUser');
        const result = await fetch(url, { credentials: 'include' });

        const timeSlipsFromApi: TimeSlip[] = await result.json();

        const timeSlipMap = new Map<string, TimeSlip[]>([]);
        timeSlipsFromApi.forEach((timeSlip: TimeSlip) => {
            const dateOftimeSlip = new Date(timeSlip.date).toLocaleDateString('en');
            if (timeSlipMap.has(dateOftimeSlip)) {
                const timeSlips = timeSlipMap.get(dateOftimeSlip) ?? [];
                timeSlips?.push(timeSlip);
                timeSlipMap.set(dateOftimeSlip, timeSlips);
            } else {
                timeSlipMap.set(dateOftimeSlip, [timeSlip]);
            }
        });

        setTimeSlipsPerDay(timeSlipMap);
    };

    const saveTimeSlip = async (
        projectId: number,
        taskId: number | null,
        laborCodeId: number | null,
        hours: number,
        minutes: number,
        date: Date,
    ): Promise<Response> => {
        if (apiEndpoint === undefined) {
            throw Error('No REACT_APP_API_ENDPOINT has been set!');
        }
        const url = path.join(apiEndpoint, 'TimeSlip/AddTimeSlip');
        const response = await fetch(url, {
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

        if (response.ok) {
            getTimeSlips();
        }

        return response;
    };

    useEffect(() => {
        getProjects();
        getTasks();
        getTasksAllowedForProjects();
        getLaborCodes();
        getTimeSlips();
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

    const getDayColumn = (day: 0 | 1 | 2 | 3 | 4 | 5 | 6) => {
        const currentDay = currentDate.getDay();
        const isCurrentDay = day === currentDay;
        const dayString = dayMap.get(day);

        if (dayString === undefined) {
            throw Error('Invalid day!');
        }

        const dayDate = new Date();
        dayDate.setDate(dayDate.getDate() + (day - currentDay));

        const timeSlips = timeSlipsPerDay.get(dayDate.toLocaleDateString('en')) ?? [];

        return (
            <DayColumn
                timeSlips={timeSlips}
                projectOptions={projects}
                laborCodeOptions={laborCodes}
                getTaskOptionsForProject={getTaskOptionsForProject}
                saveTimeSlip={saveTimeSlip}
                day={dayString}
                isCurrentDay={isCurrentDay}
                date={dayDate}
            />
        );
    };

    return (
        <div className={classes.homeContainer}>
            So glad you made it. Welcome to the Greatest Of All Time Slips Applications!
            <div className={classes.weekContainer}>
                {getDayColumn(0)}
                {getDayColumn(1)}
                {getDayColumn(2)}
                {getDayColumn(3)}
                {getDayColumn(4)}
                {getDayColumn(5)}
                {getDayColumn(6)}
            </div>
        </div>
    );
};

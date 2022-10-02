import React, { useEffect, useState } from 'react';
import classes from './Home.module.scss';
import { DayColumn } from './DayColumn';
import { Day } from '../types/Day';
import { DropdownOption } from '../types/DropdownOption';
import path from 'path-browserify';
import { TimeSlip } from '../types/TimeSlip';
import { Button } from '@mui/material';
import { ArrowLeft, ArrowRight } from '@mui/icons-material';

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

    const getSundayDateForDate = (date: Date) => {
        const currentDay = date.getDay();
        const calculatedSundayDate = new Date();
        calculatedSundayDate.setDate(calculatedSundayDate.getDate() - currentDay);
        return calculatedSundayDate;
    };

    const [sundayDate, setSundayDate] = useState<Date>(getSundayDateForDate(currentDate));
    const [projects, setProjects] = useState<DropdownOption[]>([]);
    const [projectMap, setProjectMap] = useState<Map<number, string>>(new Map<number, string>([]));
    const [tasks, setTasks] = useState<Map<number, string>>(new Map<number, string>([]));

    const [tasksAllowedForProjects, setTasksAllowedForProjects] = useState<Map<number, number[]>>(
        new Map<number, number[]>([]),
    );

    const [timeSlipsPerDay, setTimeSlipsPerDay] = useState<Map<string, TimeSlip[]>>(
        new Map<string, TimeSlip[]>([]),
    );

    const [laborCodes, setLaborCodes] = useState<DropdownOption[]>([]);
    const [laborCodeMap, setLaborCodeMap] = useState<Map<number, string>>(
        new Map<number, string>([]),
    );

    const getProjects = async () => {
        if (apiEndpoint === undefined) {
            throw Error('No REACT_APP_API_ENDPOINT has been set!');
        }
        const url = path.join(apiEndpoint, 'Project');
        const result = await fetch(url, { credentials: 'include' });

        const projectsFromApi: DropdownOption[] = await result.json();

        const map = new Map<number, string>([]);
        projectsFromApi.forEach((project: DropdownOption) => map.set(project.id, project.name));
        setProjectMap(map);
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

        const map = new Map<number, string>([]);
        laborCodesFromApi.forEach((laborCode: DropdownOption) =>
            map.set(laborCode.id, laborCode.name),
        );
        setLaborCodeMap(map);
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

    const saveNewTimeSlip = async (
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
                date: new Date(date.getTime() - date.getTimezoneOffset() * 60000),
            }),
        });

        if (response.ok) {
            getTimeSlips();
        }

        return response;
    };

    const updateTimeSlip = async (
        timeSlipId: number,
        projectId: number,
        taskId: number | null,
        laborCodeId: number | null,
        hours: number,
        minutes: number,
    ): Promise<Response> => {
        if (apiEndpoint === undefined) {
            throw Error('No REACT_APP_API_ENDPOINT has been set!');
        }
        const url = path.join(apiEndpoint, 'TimeSlip/UpdateTimeSlip');
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                timeSlipId,
                projectId,
                taskId,
                laborCodeId,
                hours,
                minutes,
            }),
        });

        if (response.ok) {
            getTimeSlips();
        }

        return response;
    };

    const deleteTimeSlip = async (timeSlipId: number): Promise<void> => {
        if (apiEndpoint === undefined) {
            throw Error('No REACT_APP_API_ENDPOINT has been set!');
        }
        const url = path.join(apiEndpoint, `TimeSlip/DeleteTimeSlip/${timeSlipId}`);
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        if (response.ok) {
            getTimeSlips();
        }
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

    const getProjectName = (projectId: number) => {
        return projectMap.get(projectId) ?? '';
    };

    const getTaskName = (taskId: number) => {
        return tasks.get(taskId) ?? '';
    };

    const getLaborCodeName = (laborCodeId: number) => {
        return laborCodeMap.get(laborCodeId) ?? '';
    };

    const getDateOfDay = (day: 0 | 1 | 2 | 3 | 4 | 5 | 6) => {
        const dayDate = new Date(sundayDate.getTime() + day * 24 * 60 * 60 * 1000);
        return dayDate;
    };

    const getDayColumn = (day: 0 | 1 | 2 | 3 | 4 | 5 | 6) => {
        const currentDay = currentDate.getDay();
        const isCurrentDay = day === currentDay;
        const dayString = dayMap.get(day);

        if (dayString === undefined) {
            throw Error('Invalid day!');
        }

        const dayDate = getDateOfDay(day);

        const timeSlips = timeSlipsPerDay.get(dayDate.toLocaleDateString('en')) ?? [];

        return (
            <DayColumn
                getProjectName={getProjectName}
                getTaskName={getTaskName}
                getLaborCodeName={getLaborCodeName}
                timeSlips={timeSlips}
                projectOptions={projects}
                laborCodeOptions={laborCodes}
                getTaskOptionsForProject={getTaskOptionsForProject}
                saveTimeSlip={saveNewTimeSlip}
                updateTimeSlip={updateTimeSlip}
                deleteTimeSlip={deleteTimeSlip}
                day={dayString}
                isCurrentDay={isCurrentDay}
                date={dayDate}
            />
        );
    };

    const changeWeek = (forward: boolean) => {
        const modifier = forward ? 1 : -1;
        const newSundayDate = new Date(sundayDate.getTime() + 7 * modifier * 24 * 60 * 60 * 1000);
        setSundayDate(newSundayDate);
    };

    const sundayDateString = sundayDate.toLocaleDateString('en');

    return (
        <div className={classes.homeContainer}>
            <div className={classes.weekChanger}>
                <Button variant="contained" onClick={() => changeWeek(false)}>
                    <ArrowLeft />
                </Button>
                Week of {sundayDateString}
                <Button variant="contained" onClick={() => changeWeek(true)}>
                    <ArrowRight />
                </Button>
            </div>
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

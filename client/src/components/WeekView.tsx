import React, { useEffect, useState } from 'react';
import classes from './WeekView.module.scss';
import { DayColumn } from './DayColumn';
import { Day } from '../types/Day';
import { DropdownOption } from '../types/DropdownOption';
import { TimeSlip } from '../types/TimeSlip';
import { Button } from '@mui/material';
import { ArrowLeft, ArrowRight } from '@mui/icons-material';
import { fetchGet, fetchPostResponse } from '../helpers/fetchFunctions';

interface TaskMap {
    projectId: number;
    allowedTaskIds: number[];
}

interface TimeSlipDaySummary {
    timeSlips: TimeSlip[];
    totalHours: number;
    totalMinutes: number;
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

export const WeekView: React.FC<{}> = () => {
    const currentDate = new Date();

    const defaultTimeSlipDaySummary: TimeSlipDaySummary = {
        timeSlips: [],
        totalHours: 0,
        totalMinutes: 0,
    };

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

    const [timeSlipsPerDay, setTimeSlipsPerDay] = useState<Map<string, TimeSlipDaySummary>>(
        new Map<string, TimeSlipDaySummary>([]),
    );

    const [laborCodes, setLaborCodes] = useState<DropdownOption[]>([]);
    const [laborCodeMap, setLaborCodeMap] = useState<Map<number, string>>(
        new Map<number, string>([]),
    );

    const getProjects = async () => {
        const projectsFromApi: DropdownOption[] = await fetchGet<DropdownOption[]>('Project');

        const map = new Map<number, string>([]);
        projectsFromApi.forEach((project: DropdownOption) => map.set(project.id, project.name));
        setProjectMap(map);
        setProjects(projectsFromApi);
    };

    const getTasks = async () => {
        const tasksFromApi: DropdownOption[] = await fetchGet<DropdownOption[]>('Task');

        const taskMap = new Map<number, string>([]);
        tasksFromApi.forEach((task) => taskMap.set(task.id, task.name));
        setTasks(taskMap);
    };

    const getTasksAllowedForProjects = async () => {
        const taskMapsFromApi: TaskMap[] = await fetchGet<TaskMap[]>('Task/ProjectsAllowedTasks');

        const taskProjectMap = new Map<number, number[]>([]);
        taskMapsFromApi.forEach((taskMap) =>
            taskProjectMap.set(taskMap.projectId, taskMap.allowedTaskIds),
        );
        setTasksAllowedForProjects(taskProjectMap);
    };

    const getLaborCodes = async () => {
        const laborCodesFromApi: DropdownOption[] = await fetchGet<DropdownOption[]>('LaborCode');

        const map = new Map<number, string>([]);
        laborCodesFromApi.forEach((laborCode: DropdownOption) =>
            map.set(laborCode.id, laborCode.name),
        );
        setLaborCodeMap(map);
        setLaborCodes(laborCodesFromApi);
    };

    const getTimeSlips = async () => {
        const timeSlipsFromApi: TimeSlip[] = await fetchGet<TimeSlip[]>(
            'TimeSlip/TimeSlipsForCurrentUser',
        );

        const timeSlipMap = new Map<string, TimeSlipDaySummary>([]);
        timeSlipsFromApi.forEach((timeSlip: TimeSlip) => {
            const dateOftimeSlip = new Date(timeSlip.date).toLocaleDateString('en');
            if (timeSlipMap.has(dateOftimeSlip)) {
                const timeSlipsDaySummary =
                    timeSlipMap.get(dateOftimeSlip) ?? defaultTimeSlipDaySummary;

                timeSlipsDaySummary.timeSlips.push(timeSlip);

                const hours = timeSlipsDaySummary.totalHours + timeSlip.hours;

                const totalMinutes =
                    timeSlipsDaySummary.totalMinutes + timeSlip.minutes + hours * 60;

                timeSlipsDaySummary.totalHours = Math.floor(totalMinutes / 60);

                timeSlipsDaySummary.totalMinutes =
                    totalMinutes - timeSlipsDaySummary.totalHours * 60;

                timeSlipMap.set(dateOftimeSlip, timeSlipsDaySummary);
            } else {
                const timeSlipsDaySummary: TimeSlipDaySummary = {
                    timeSlips: [timeSlip],
                    totalHours: timeSlip.hours,
                    totalMinutes: timeSlip.minutes,
                };
                timeSlipMap.set(dateOftimeSlip, timeSlipsDaySummary);
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
        const response = await fetchPostResponse('TimeSlip/AddTimeSlip', {
            projectId,
            taskId,
            laborCodeId,
            hours,
            minutes,
            date: new Date(date.getTime() - date.getTimezoneOffset() * 60000),
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
        const response = await fetchPostResponse('TimeSlip/UpdateTimeSlip', {
            timeSlipId,
            projectId,
            taskId,
            laborCodeId,
            hours,
            minutes,
        });

        if (response.ok) {
            getTimeSlips();
        }

        return response;
    };

    const deleteTimeSlip = async (timeSlipId: number): Promise<void> => {
        const response = await fetchPostResponse(`TimeSlip/DeleteTimeSlip/${timeSlipId}`);

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

        const timeSlipsDaySummary =
            timeSlipsPerDay.get(dayDate.toLocaleDateString('en')) ?? defaultTimeSlipDaySummary;

        return (
            <DayColumn
                getProjectName={getProjectName}
                getTaskName={getTaskName}
                getLaborCodeName={getLaborCodeName}
                timeSlips={timeSlipsDaySummary.timeSlips}
                projectOptions={projects}
                laborCodeOptions={laborCodes}
                getTaskOptionsForProject={getTaskOptionsForProject}
                saveTimeSlip={saveNewTimeSlip}
                updateTimeSlip={updateTimeSlip}
                deleteTimeSlip={deleteTimeSlip}
                day={dayString}
                isCurrentDay={isCurrentDay}
                date={dayDate}
                totalHours={timeSlipsDaySummary.totalHours}
                totalMinutes={timeSlipsDaySummary.totalMinutes}
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

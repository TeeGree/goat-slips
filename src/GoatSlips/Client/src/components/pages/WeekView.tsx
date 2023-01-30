import React, { useEffect, useState } from 'react';
import classes from './WeekView.module.scss';
import { DayColumn } from '../DayColumn/DayColumn';
import { Day, DayIndex } from '../../types/Day';
import { DropdownOption } from '../../types/DropdownOption';
import { FavoriteTimeSlipData, TimeSlip } from '../../types/TimeSlip';
import { IconButton, Tooltip } from '@mui/material';
import { FilterAlt, FilterAltOff, KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { fetchGet, fetchPostResponse } from '../../helpers/fetchFunctions';
import { MultiSelect } from '../MultiSelect';
import { getSundayDateForDate } from '../../helpers/dateHelpers';
import { WeekChanger } from '../WeekChanger';
import { AllowedMinutesPartition } from '../../types/AllowedMinutesPartition';

const dayMap = new Map<DayIndex, Day>([
    [0, 'Sunday'],
    [1, 'Monday'],
    [2, 'Tuesday'],
    [3, 'Wednesday'],
    [4, 'Thursday'],
    [5, 'Friday'],
    [6, 'Saturday'],
]);

const dayIndexMap = new Map<Day, DayIndex>([
    ['Sunday', 0],
    ['Monday', 1],
    ['Tuesday', 2],
    ['Wednesday', 3],
    ['Thursday', 4],
    ['Friday', 5],
    ['Saturday', 6],
]);

interface WeekViewProps {
    projects: DropdownOption[];
    projectMap: Map<number, string>;
    tasks: DropdownOption[];
    taskMap: Map<number, string>;
    tasksAllowedForProjects: Map<number, number[]>;
    laborCodes: DropdownOption[];
    laborCodeMap: Map<number, string>;
    favoriteTimeSlips: FavoriteTimeSlipData[];
    fetchFavoriteTimeSlips: () => Promise<void>;
    minutesPartition: AllowedMinutesPartition;
}

interface HoursMinutesSplit {
    hours: number;
    minutes: number;
}

export const WeekView: React.FC<WeekViewProps> = (props: WeekViewProps) => {
    const {
        projects,
        projectMap,
        tasks,
        taskMap,
        tasksAllowedForProjects,
        laborCodes,
        laborCodeMap,
        favoriteTimeSlips,
        fetchFavoriteTimeSlips,
        minutesPartition,
    } = props;

    const currentDate = new Date();

    const [sundayDate, setSundayDate] = useState<Date>(getSundayDateForDate(currentDate));

    const [showFilterSection, setShowFilterSection] = useState(false);
    const [projectIdsInUse, setProjectIdsInUse] = useState<Set<number>>(new Set<number>());
    const [taskIdsInUse, setTaskIdsInUse] = useState<Set<number>>(new Set<number>());
    const [laborCodeIdsInUse, setLaborCodeIdsInUse] = useState<Set<number>>(new Set<number>());

    const [selectedFilterProjectIds, setSelectedFilterProjectIds] = useState<number[]>([]);
    const [selectedFilterTaskIds, setSelectedFilterTaskIds] = useState<number[]>([]);
    const [selectedFilterLaborCodeIds, setSelectedFilterLaborCodeIds] = useState<number[]>([]);

    const [timeSlipsPerDay, setTimeSlipsPerDay] = useState<Map<string, TimeSlip[]>>(
        new Map<string, TimeSlip[]>([]),
    );

    const [newDayMinuteDiffs, setNewDayMinuteDiffs] = useState<Map<Day, Map<number, number>>>(
        new Map([
            ['Sunday', new Map<number, number>()],
            ['Monday', new Map<number, number>()],
            ['Tuesday', new Map<number, number>()],
            ['Wednesday', new Map<number, number>()],
            ['Thursday', new Map<number, number>()],
            ['Friday', new Map<number, number>()],
            ['Saturday', new Map<number, number>()],
        ]),
    );

    const setDayMinutesDiff = (day: Day, timeSlipId: number, minutes: number) => {
        setNewDayMinuteDiffs((prev: Map<Day, Map<number, number>>) => {
            const newMap = new Map(prev);
            const dayNewMinutesMap = newMap.get(day) ?? new Map<number, number>();
            dayNewMinutesMap.set(timeSlipId, minutes);
            return newMap;
        });
    };

    const addInUseProjectId = (projectId: number) => {
        setProjectIdsInUse((prev) => {
            const newInUseProjectIds = new Set(prev);
            newInUseProjectIds.add(projectId);
            return newInUseProjectIds;
        });
    };

    const addInUseTaskId = (taskId: number | null) => {
        if (taskId !== null) {
            setTaskIdsInUse((prev) => {
                const newInUseTaskIds = new Set(prev);
                newInUseTaskIds.add(taskId);
                return newInUseTaskIds;
            });
        }
    };

    const addInUseLaborCodeId = (laborCodeId: number | null) => {
        if (laborCodeId !== null) {
            setLaborCodeIdsInUse((prev) => {
                const newInUseLaborCodeIds = new Set(prev);
                newInUseLaborCodeIds.add(laborCodeId);
                return newInUseLaborCodeIds;
            });
        }
    };

    const getTimeSlips = async () => {
        const sundayDateText = sundayDate.toLocaleDateString('en').replaceAll('/', '-');
        const timeSlipsFromApi: TimeSlip[] = await fetchGet<TimeSlip[]>(
            `TimeSlip/WeekOfTimeSlipsForCurrentUser/${sundayDateText}`,
        );

        const timeSlipMap = new Map<string, TimeSlip[]>([]);
        timeSlipsFromApi.forEach((timeSlip: TimeSlip) => {
            const dateOftimeSlip = new Date(timeSlip.date).toLocaleDateString('en');

            addInUseProjectId(timeSlip.projectId);
            addInUseTaskId(timeSlip.taskId);
            addInUseLaborCodeId(timeSlip.laborCodeId);

            if (timeSlipMap.has(dateOftimeSlip)) {
                const timeSlips = timeSlipMap.get(dateOftimeSlip) ?? [];

                timeSlips.push(timeSlip);

                timeSlipMap.set(dateOftimeSlip, timeSlips);
            } else {
                const timeSlips = [timeSlip];

                timeSlipMap.set(dateOftimeSlip, timeSlips);
            }
        });

        setTimeSlipsPerDay(timeSlipMap);
    };

    const getDateOfDayForApi = (day: Day) => {
        const index = dayIndexMap.get(day) ?? 0;
        const date = getDateOfDay(index);
        return new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    };

    const saveNewTimeSlip = async (
        projectId: number,
        taskId: number | null,
        laborCodeId: number | null,
        hours: number,
        minutes: number,
        days: Day[],
        description: string,
    ): Promise<Response> => {
        const dates = days.map((d) => getDateOfDayForApi(d));
        const response = await fetchPostResponse('TimeSlip/AddTimeSlip', {
            projectId,
            taskId,
            laborCodeId,
            hours,
            minutes,
            dates,
            description,
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
        description: string,
    ): Promise<Response> => {
        const response = await fetchPostResponse('TimeSlip/UpdateTimeSlip', {
            timeSlipId,
            projectId,
            taskId,
            laborCodeId,
            hours,
            minutes,
            description,
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
        getTimeSlips();
    }, [sundayDate]);

    const getTaskOptionsForProject = (projectId: number | null): DropdownOption[] => {
        if (projectId === null) {
            return tasks;
        }

        const tasksForProject = tasksAllowedForProjects.get(projectId);
        if (tasksForProject === undefined) {
            throw Error('No tasks found for project!');
        }

        return tasksForProject.map((taskId: number) => {
            const name = taskMap.get(taskId);
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
        return taskMap.get(taskId) ?? '';
    };

    const getLaborCodeName = (laborCodeId: number) => {
        return laborCodeMap.get(laborCodeId) ?? '';
    };

    const getDateOfDay = (day: DayIndex): Date => {
        const dayDate = new Date(sundayDate.getTime() + day * 24 * 60 * 60 * 1000);
        return dayDate;
    };

    const getTimeSlipsForDay = (day: DayIndex) => {
        const dayDate = getDateOfDay(day);
        const timeSlips = timeSlipsPerDay.get(dayDate.toLocaleDateString('en')) ?? [];

        const filteredProjectIds = new Set(selectedFilterProjectIds);
        const filteredTaskIds = new Set(selectedFilterTaskIds);
        const filteredLaborCodeIds = new Set(selectedFilterLaborCodeIds);

        return timeSlips.filter((timeSlip: TimeSlip) => {
            if (filteredProjectIds.size > 0 && !filteredProjectIds.has(timeSlip.projectId)) {
                return false;
            }

            if (
                filteredTaskIds.size > 0 &&
                ((timeSlip.taskId !== null && !filteredTaskIds.has(timeSlip.taskId)) ||
                    (timeSlip.taskId === null && !filteredTaskIds.has(-1)))
            ) {
                return false;
            }

            if (
                filteredLaborCodeIds.size > 0 &&
                ((timeSlip.laborCodeId !== null &&
                    !filteredLaborCodeIds.has(timeSlip.laborCodeId)) ||
                    (timeSlip.laborCodeId === null && !filteredLaborCodeIds.has(-1)))
            ) {
                return false;
            }

            return true;
        });
    };

    const getTotalMinutesForDay = (day: DayIndex) => {
        const timeSlips = getTimeSlipsForDay(day);

        return getTotalMinutes(timeSlips);
    };

    const getTotalMinutes = (timeSlips: TimeSlip[]) => {
        return timeSlips.reduce((sum, timeSlip) => {
            return sum + timeSlip.minutes + timeSlip.hours * 60;
        }, 0);
    };

    const getDayColumn = (day: DayIndex) => {
        const dayString = dayMap.get(day);

        if (dayString === undefined) {
            throw Error('Invalid day!');
        }

        const dayDate = getDateOfDay(day);
        const isCurrentDay =
            dayDate.getFullYear() === currentDate.getFullYear() &&
            dayDate.getMonth() === currentDate.getMonth() &&
            dayDate.getDate() === currentDate.getDate();

        const timeSlips = getTimeSlipsForDay(day);
        const totalMinutes = getTotalMinutes(timeSlips);
        const { hours, minutes } = splitHoursAndMinutes(totalMinutes);

        return (
            <DayColumn
                dayIndex={day}
                fetchFavoriteTimeSlips={fetchFavoriteTimeSlips}
                favoriteTimeSlipsOptions={favoriteTimeSlips}
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
                totalHours={hours}
                totalMinutes={minutes}
                isFiltered={isFiltered()}
                newDayMinuteDiffs={newDayMinuteDiffs}
                setNewDayMinuteDiffs={setDayMinutesDiff}
                projectMap={projectMap}
                taskMap={taskMap}
                laborCodeMap={laborCodeMap}
                minutesPartition={minutesPartition}
            />
        );
    };

    const splitHoursAndMinutes = (totalMinutes: number): HoursMinutesSplit => {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes - hours * 60;
        return {
            hours,
            minutes,
        };
    };

    const isFiltered = () => {
        return (
            selectedFilterProjectIds.length > 0 ||
            selectedFilterTaskIds.length > 0 ||
            selectedFilterLaborCodeIds.length > 0
        );
    };

    const getWeekTotalText = () => {
        let totalMinutes = 0;
        for (let i = 0; i <= 6; i++) {
            totalMinutes += getTotalMinutesForDay(i as DayIndex);
        }

        const { hours, minutes } = splitHoursAndMinutes(totalMinutes);

        const text = `${hours} hr ${minutes} min`;

        if (isFiltered()) {
            return (
                <Tooltip title="Total is based on filtered time slips" placement="top">
                    <span className={classes.filteredTotal}>{text}*</span>
                </Tooltip>
            );
        }

        return <span className={classes.weekTotal}>{text}</span>;
    };

    const getInUseProjectOptions = () => {
        const projectsInUse = projects.filter((project) => {
            return projectIdsInUse.has(project.id);
        });
        return projectsInUse;
    };

    const getInUseTaskOptions = () => {
        const tasksInUse = tasks.filter((task) => {
            return taskIdsInUse.has(task.id);
        });
        return [{ name: 'N/A', id: -1 }, ...tasksInUse];
    };

    const getInUseLaborCodeOptions = () => {
        const laborCodesInUse = laborCodes.filter((laborCode) => {
            return laborCodeIdsInUse.has(laborCode.id);
        });
        return [{ name: 'N/A', id: -1 }, ...laborCodesInUse];
    };

    const getFilterSection = () => {
        if (showFilterSection) {
            return (
                <div className={classes.filterSection}>
                    <MultiSelect
                        label="Projects"
                        options={getInUseProjectOptions()}
                        selectedIds={selectedFilterProjectIds}
                        setSelectedIds={setSelectedFilterProjectIds}
                        getDisplayTextForId={(id: number) => projectMap.get(id) ?? ''}
                    />
                    <MultiSelect
                        label="Tasks"
                        options={getInUseTaskOptions()}
                        selectedIds={selectedFilterTaskIds}
                        setSelectedIds={setSelectedFilterTaskIds}
                        getDisplayTextForId={(id: number) => taskMap.get(id) ?? 'N/A'}
                    />
                    <MultiSelect
                        label="Labor Codes"
                        options={getInUseLaborCodeOptions()}
                        selectedIds={selectedFilterLaborCodeIds}
                        setSelectedIds={setSelectedFilterLaborCodeIds}
                        getDisplayTextForId={(id: number) => laborCodeMap.get(id) ?? 'N/A'}
                    />
                </div>
            );
        }

        return <></>;
    };

    const hideFilters = () => {
        setShowFilterSection(false);
        if (isFiltered()) {
            setSelectedFilterProjectIds([]);
            setSelectedFilterTaskIds([]);
            setSelectedFilterLaborCodeIds([]);
        }
    };

    const getShowFilterButton = () => {
        if (showFilterSection) {
            return (
                <Tooltip title="Hide and clear the filters" placement="right">
                    <IconButton className={classes.weekFilterButton} onClick={hideFilters}>
                        <KeyboardArrowUp />
                        <FilterAltOff />
                    </IconButton>
                </Tooltip>
            );
        }
        return (
            <Tooltip
                title="Show dropdowns that can be used to filter the visible time slips"
                placement="right"
            >
                <IconButton
                    className={classes.weekFilterButton}
                    onClick={() => setShowFilterSection(true)}
                >
                    <KeyboardArrowDown />
                    <FilterAlt />
                </IconButton>
            </Tooltip>
        );
    };

    return (
        <div className={classes.homeContainer}>
            <div className={classes.weekHeader}>
                <div className={classes.basicHeader}>
                    {getShowFilterButton()}
                    <div className={classes.weekHeaderHalf}>
                        <WeekChanger sundayDate={sundayDate} setSundayDate={setSundayDate} />
                    </div>
                    <div className={classes.weekHeaderHalf}>Week Total:{getWeekTotalText()}</div>
                </div>
                {getFilterSection()}
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

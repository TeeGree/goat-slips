import React, { useEffect, useState } from 'react';
import classes from './WeekTableView.module.scss';
import { DayIndex } from '../../types/Day';
import { DropdownOption } from '../../types/DropdownOption';
import { TimeSlip } from '../../types/TimeSlip';
import {
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
} from '@mui/material';
import { FilterAlt, FilterAltOff, KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { fetchGet } from '../../helpers/fetchFunctions';
import { MultiSelect } from '../MultiSelect';
import { getSundayDateForDate } from '../../helpers/dateHelpers';
import { WeekChanger } from '../WeekChanger';
import { AllowedFirstDayOfWeek } from '../../types/AllowedFirstDayOfWeek';
import { Project } from '../../types/Project';
import { dayMap } from '../../constants/dayMap';

interface WeekTableViewProps {
    projects: Project[];
    projectMap: Map<number, Project>;
    tasks: DropdownOption[];
    taskMap: Map<number, string>;
    laborCodes: DropdownOption[];
    laborCodeMap: Map<number, string>;
    firstDayOfWeek: AllowedFirstDayOfWeek;
}

export const WeekTableView: React.FC<WeekTableViewProps> = (props: WeekTableViewProps) => {
    const { projects, projectMap, tasks, taskMap, laborCodes, laborCodeMap, firstDayOfWeek } =
        props;

    const currentDate = new Date();

    const beginningOfWeek = getSundayDateForDate(currentDate);
    beginningOfWeek.setDate(beginningOfWeek.getDate() + firstDayOfWeek);

    const [startOfWeekDate, setStartOfWeekDate] = useState<Date>(beginningOfWeek);

    const [showFilterSection, setShowFilterSection] = useState(false);
    const [projectIdsInUse, setProjectIdsInUse] = useState<Set<number>>(new Set<number>());
    const [taskIdsInUse, setTaskIdsInUse] = useState<Set<number>>(new Set<number>());
    const [laborCodeIdsInUse, setLaborCodeIdsInUse] = useState<Set<number>>(new Set<number>());

    const [selectedFilterProjectIds, setSelectedFilterProjectIds] = useState<number[]>([]);
    const [selectedFilterTaskIds, setSelectedFilterTaskIds] = useState<number[]>([]);
    const [selectedFilterLaborCodeIds, setSelectedFilterLaborCodeIds] = useState<number[]>([]);

    // const [sortedTimeSlips, setSortedTimeSlips] = useState<TimeSlip[]>([]);
    const [groupedTimeSlips, setGroupedTimeSlips] = useState<
        Map<number, Map<number | null, Map<number | null, TimeSlip[]>>>
    >(new Map<number, Map<number | null, Map<number | null, TimeSlip[]>>>());

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
        const sundayDateText = startOfWeekDate.toLocaleDateString('en').replaceAll('/', '-');
        const timeSlipsFromApi: TimeSlip[] = await fetchGet<TimeSlip[]>(
            `TimeSlip/WeekOfTimeSlipsForCurrentUser/${sundayDateText}`,
        );

        const newGroupedTimeSlips = new Map<
            number,
            Map<number | null, Map<number | null, TimeSlip[]>>
        >();
        timeSlipsFromApi.forEach((ts) => {
            addInUseProjectId(ts.projectId);
            addInUseTaskId(ts.taskId);
            addInUseLaborCodeId(ts.laborCodeId);

            const taskTimeSlipMap = newGroupedTimeSlips.get(ts.projectId);
            if (taskTimeSlipMap === undefined) {
                const laborCodeTimeSlipMap = new Map<number | null, TimeSlip[]>([
                    [ts.laborCodeId, [ts]],
                ]);
                const newTaskTimeSlipMap = new Map<number | null, Map<number | null, TimeSlip[]>>([
                    [ts.taskId, laborCodeTimeSlipMap],
                ]);
                newGroupedTimeSlips.set(ts.projectId, newTaskTimeSlipMap);
            } else {
                const laborCodeTimeSlipMap = taskTimeSlipMap.get(ts.taskId);
                if (laborCodeTimeSlipMap === undefined) {
                    const newLaborCodeTimeSlipMap = new Map<number | null, TimeSlip[]>([
                        [ts.laborCodeId, [ts]],
                    ]);

                    taskTimeSlipMap.set(ts.taskId, newLaborCodeTimeSlipMap);
                } else {
                    const timeSlipsFromMap = laborCodeTimeSlipMap.get(ts.laborCodeId);
                    if (timeSlipsFromMap === undefined) {
                        laborCodeTimeSlipMap.set(ts.laborCodeId, [ts]);
                    } else {
                        laborCodeTimeSlipMap.set(ts.laborCodeId, [...timeSlipsFromMap, ts]);
                    }
                }
            }
        });

        setGroupedTimeSlips(newGroupedTimeSlips);

        // const timeSlipsOrdered = timeSlipsFromApi.sort((a, b) => {
        //     const projectA = projectMap.get(a.projectId);
        //     const projectB = projectMap.get(b.projectId);

        //     const projectNameA = (projectA?.name ?? '').toLowerCase();
        //     const projectNameB = (projectB?.name ?? '').toLowerCase();
        //     if (projectNameA < projectNameB) {
        //         return -1;
        //     }

        //     if (projectNameA > projectNameB) {
        //         return 1;
        //     }

        //     const taskNameA = a.taskId === null ? '' : (taskMap.get(a.taskId) ?? '').toLowerCase();
        //     const taskNameB = b.taskId === null ? '' : (taskMap.get(b.taskId) ?? '').toLowerCase();

        //     if (taskNameA < taskNameB) {
        //         return -1;
        //     }

        //     if (taskNameA < taskNameB) {
        //         return -1;
        //     }

        //     const laborCodeNameA =
        //         a.laborCodeId === null ? '' : (taskMap.get(a.laborCodeId) ?? '').toLowerCase();
        //     const laborCodeNameB =
        //         b.laborCodeId === null ? '' : (taskMap.get(b.laborCodeId) ?? '').toLowerCase();

        //     if (laborCodeNameA < laborCodeNameB) {
        //         return -1;
        //     }

        //     if (laborCodeNameA < laborCodeNameB) {
        //         return -1;
        //     }

        //     return 0;
        // });

        // timeSlipsOrdered.forEach((timeSlip: TimeSlip) => {
        //     addInUseProjectId(timeSlip.projectId);
        //     addInUseTaskId(timeSlip.taskId);
        //     addInUseLaborCodeId(timeSlip.laborCodeId);
        // });

        // setSortedTimeSlips(timeSlipsOrdered);
    };

    useEffect(() => {
        getTimeSlips();
    }, [startOfWeekDate]);

    const getDayLabel = (day: DayIndex) => {
        const actualDay = day + firstDayOfWeek;
        const actualDayIndex = (actualDay % 7) as DayIndex;
        const dayString = dayMap.get(actualDayIndex);

        if (dayString === undefined) {
            throw Error('Invalid day!');
        }

        return dayString;
    };

    const isFiltered = () => {
        return (
            selectedFilterProjectIds.length > 0 ||
            selectedFilterTaskIds.length > 0 ||
            selectedFilterLaborCodeIds.length > 0
        );
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
                        getDisplayTextForId={(id: number) => projectMap.get(id)?.name ?? ''}
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

    const getRows = (): JSX.Element | JSX.Element[] => {
        const projectIds = Array.from(groupedTimeSlips.keys());
        projectIds.sort((a: number, b: number) => {
            const projectA = projectMap.get(a);
            const projectB = projectMap.get(b);

            const projectNameA = (projectA?.name ?? '').toLowerCase();
            const projectNameB = (projectB?.name ?? '').toLowerCase();
            if (projectNameA < projectNameB) {
                return -1;
            }

            if (projectNameA > projectNameB) {
                return 1;
            }

            return 0;
        });

        const rows: JSX.Element[] = [];

        projectIds.forEach((projectId: number) => {
            const projectName = projectMap.get(projectId)?.name;
            const taskTimeSlipMap = groupedTimeSlips.get(projectId);
            if (taskTimeSlipMap === undefined) {
                return;
            }
            const taskIds = Array.from(taskTimeSlipMap.keys());
            taskIds.sort((a: number | null, b: number | null) => {
                if (a === null && b === null) {
                    return 0;
                }

                if (a === null) {
                    return -1;
                }

                if (b === null) {
                    return 1;
                }

                const taskA = (taskMap.get(a) ?? '').toLowerCase();
                const taskB = (taskMap.get(b) ?? '').toLowerCase();

                if (taskA < taskB) {
                    return -1;
                }

                if (taskA > taskB) {
                    return 1;
                }

                return 0;
            });

            taskIds.forEach((taskId: number | null) => {
                const taskName = taskId === null ? 'N/A' : taskMap.get(taskId) ?? '';
                const laborCodeTimeSlipMap = taskTimeSlipMap.get(taskId);
                if (laborCodeTimeSlipMap === undefined) {
                    return;
                }
                const laborCodeIds = Array.from(laborCodeTimeSlipMap.keys());
                laborCodeIds.sort((a: number | null, b: number | null) => {
                    if (a === null && b === null) {
                        return 0;
                    }

                    if (a === null) {
                        return -1;
                    }

                    if (b === null) {
                        return 1;
                    }

                    const laborCodeA = (laborCodeMap.get(a) ?? '').toLowerCase();
                    const laborCodeB = (laborCodeMap.get(b) ?? '').toLowerCase();

                    if (laborCodeA < laborCodeB) {
                        return -1;
                    }

                    if (laborCodeA > laborCodeB) {
                        return 1;
                    }

                    return 0;
                });

                laborCodeIds.forEach((laborCodeId: number | null) => {
                    const laborCodeName =
                        laborCodeId === null ? 'N/A' : laborCodeMap.get(laborCodeId) ?? '';

                    const timeSlipsFromMap = laborCodeTimeSlipMap.get(laborCodeId);
                    if (timeSlipsFromMap === undefined) {
                        return;
                    }

                    timeSlipsFromMap.forEach((ts: TimeSlip) => {
                        rows.push(
                            <TableRow key={ts.id}>
                                <TableCell>{projectName}</TableCell>
                                <TableCell>{taskName}</TableCell>
                                <TableCell>{laborCodeName}</TableCell>
                                <TableCell>{ts.description}</TableCell>
                                <TableCell>-1</TableCell>
                                <TableCell>-1</TableCell>
                                <TableCell>-1</TableCell>
                                <TableCell>-1</TableCell>
                                <TableCell>-1</TableCell>
                                <TableCell>-1</TableCell>
                                <TableCell>-1</TableCell>
                            </TableRow>,
                        );
                    });
                });
            });
        });

        return rows;
    };

    return (
        <div className={classes.homeContainer}>
            <div className={classes.weekHeader}>
                <div className={classes.basicHeader}>
                    {getShowFilterButton()}
                    <div className={classes.weekHeaderHalf}>
                        <WeekChanger
                            sundayDate={startOfWeekDate}
                            setSundayDate={setStartOfWeekDate}
                            firstDayOfWeek={firstDayOfWeek}
                        />
                    </div>
                </div>
                {getFilterSection()}
            </div>
            <div className={classes.weekContainer}>
                <TableContainer component={Paper} className={classes.tableContainer}>
                    <Table aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Project</TableCell>
                                <TableCell>Task</TableCell>
                                <TableCell>Labor Code</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>{getDayLabel(0)}</TableCell>
                                <TableCell>{getDayLabel(1)}</TableCell>
                                <TableCell>{getDayLabel(2)}</TableCell>
                                <TableCell>{getDayLabel(3)}</TableCell>
                                <TableCell>{getDayLabel(4)}</TableCell>
                                <TableCell>{getDayLabel(5)}</TableCell>
                                <TableCell>{getDayLabel(6)}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>{getRows()}</TableBody>
                    </Table>
                </TableContainer>
            </div>
        </div>
    );
};

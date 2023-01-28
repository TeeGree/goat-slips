import React, { useEffect, useState } from 'react';
import classes from './App.module.scss';
import { WeekView } from './components/pages/WeekView';
import { Login } from './components/pages/Login';
import { Navigate, Route, Routes } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import { fetchGet, fetchGetResponse } from './helpers/fetchFunctions';
import { CreateFirstUser } from './components/pages/CreateUser/CreateFirstUser';
import { AppHeader } from './components/AppHeader';
import { ChangePassword } from './components/pages/ChangePassword';
import { User } from './types/User';
import { QueryTimeSlips } from './components/pages/QueryTimeSlips';
import { DropdownOption } from './types/DropdownOption';
import { ManageTimeCodes } from './components/pages/ManageTimeCodes';
import { TaskMap } from './types/TaskMap';
import { RequireAuthentication } from './components/HOC/RequireAuthentication';
import { AccessRight } from './types/AccessRight';
import {
    adminAccessRight,
    manageConfigurations,
    manageTimeCodes,
    manageUsers,
    requiredAccessRights,
} from './constants/requiredAccessRights';
import { UserManagement } from './components/pages/UserManagement';
import { FavoriteTimeSlipData } from './types/TimeSlip';
import { ManageFavorites } from './components/pages/ManageFavorites';
import { Query } from './types/Query';
import { Configurations } from './components/pages/Configurations';
import { AllowedMinutesPartition } from './types/AllowedMinutesPartition';

const defaultUser: User = {
    userId: 0,
    username: '',
    requiresPasswordChange: true,
};

export const App: React.FC<{}> = () => {
    const [user, setUser] = useState<User>(defaultUser);
    const [userAccessRights, setUserAccessRights] = useState<Set<string>>(new Set());
    const [isAuthenticationLoading, setIsAuthenticationLoading] = useState(true);
    const [isUserAccessRightsLoading, setIsUserAccessRightsLoading] = useState(true);

    const [anyUsers, setAnyUsers] = useState(false);
    const [isAnyUsersLoading, setAnyUsersLoading] = useState(true);

    const [projects, setProjects] = useState<DropdownOption[]>([]);
    const [projectMap, setProjectMap] = useState<Map<number, string>>(new Map<number, string>([]));

    const [tasks, setTasks] = useState<DropdownOption[]>([]);
    const [taskMap, setTaskMap] = useState<Map<number, string>>(new Map<number, string>([]));

    const [tasksAllowedForProjects, setTasksAllowedForProjects] = useState<Map<number, number[]>>(
        new Map<number, number[]>([]),
    );

    const [laborCodes, setLaborCodes] = useState<DropdownOption[]>([]);
    const [laborCodeMap, setLaborCodeMap] = useState<Map<number, string>>(
        new Map<number, string>([]),
    );

    const [favoriteTimeSlips, setFavoriteTimeSlips] = useState<FavoriteTimeSlipData[]>([]);

    const [savedQueries, setSavedQueries] = useState<DropdownOption[]>([]);
    const [savedQueriesMap, setSavedQueriesMap] = useState<Map<number, Query>>(
        new Map<number, Query>([]),
    );

    const [minutesPartition, setMinutesPartition] = useState<AllowedMinutesPartition>(1);

    const isAuthenticated = () => {
        return user.username !== '';
    };

    const checkIfAuthenticated = async () => {
        setIsAuthenticationLoading(true);
        const userResponse = await fetchGetResponse('User/GetUser');

        if (userResponse.ok) {
            const userFromApi: User = await userResponse.json();
            setUser(userFromApi);
        } else {
            setUser(defaultUser);
        }

        setIsAuthenticationLoading(false);
    };

    const checkIfAnyUsers = async () => {
        setAnyUsersLoading(true);
        const result = await fetchGet<boolean>('User/AnyUsers');

        setAnyUsers(result);
        setAnyUsersLoading(false);
    };

    useEffect(() => {
        checkIfAuthenticated();
        checkIfAnyUsers();
    }, []);

    useEffect(() => {
        if (isAuthenticated()) {
            getProjects();
            getTasks();
            getTasksAllowedForProjects();
            getLaborCodes();
            getAccessRights();
            getFavoriteTimeSlips();
            getSavedQueries();
            getMinutesPartition();
        }
    }, [user]);

    const getProjects = async () => {
        const projectsFromApi: DropdownOption[] = await fetchGet<DropdownOption[]>('Project');

        const map = new Map<number, string>([]);
        projectsFromApi.forEach((project: DropdownOption) => map.set(project.id, project.name));
        setProjectMap(map);
        setProjects(projectsFromApi);
    };

    const getTasks = async () => {
        const tasksFromApi: DropdownOption[] = await fetchGet<DropdownOption[]>('Task');

        const taskMapFromApi = new Map<number, string>([]);
        tasksFromApi.forEach((task) => {
            taskMapFromApi.set(task.id, task.name);
        });
        setTaskMap(taskMapFromApi);
        setTasks(tasksFromApi);
    };

    const getTasksAllowedForProjects = async () => {
        const taskMapsFromApi: TaskMap[] = await fetchGet<TaskMap[]>('Task/ProjectsAllowedTasks');

        const taskProjectMap = new Map<number, number[]>([]);
        taskMapsFromApi.forEach((tm) => taskProjectMap.set(tm.projectId, tm.allowedTaskIds));
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

    const getAccessRights = async () => {
        setIsUserAccessRightsLoading(true);
        const accessRightsFromApi: AccessRight[] = await fetchGet<AccessRight[]>(
            `User/AccessRights/${user.userId}`,
        );

        const accessRightCodes = accessRightsFromApi.map((ar) => ar.code);
        setUserAccessRights(new Set(accessRightCodes));
        setIsUserAccessRightsLoading(false);
    };

    const getFavoriteTimeSlips = async () => {
        const favoriteTimeSlipsFromApi: FavoriteTimeSlipData[] = await fetchGet<
            FavoriteTimeSlipData[]
        >('FavoriteTimeSlip/FavoriteTimeSlipsForCurrentUser');

        setFavoriteTimeSlips(favoriteTimeSlipsFromApi);
    };

    const getMinutesPartition = async () => {
        const minutesPartitionFromApi: AllowedMinutesPartition =
            await fetchGet<AllowedMinutesPartition>('TimeSlipConfiguration/GetMinutesPartition');

        setMinutesPartition(minutesPartitionFromApi);
    };

    const getSavedQueries = async () => {
        const queriesFromApi: Query[] = await fetchGet<Query[]>('Query');

        const map = new Map<number, Query>([]);
        queriesFromApi.forEach((query: Query) => map.set(query.id, query));

        setSavedQueriesMap(map);
        setSavedQueries(queriesFromApi);
    };

    const fillScreenWithPage = (page: JSX.Element) => {
        return <div className={classes.fillScreen}>{page}</div>;
    };

    const getPage = () => {
        if (isAuthenticationLoading || isAnyUsersLoading) {
            return fillScreenWithPage(<CircularProgress />);
        }
        if (!isAuthenticated() && anyUsers) {
            return fillScreenWithPage(<Login onSuccessfulLogin={() => checkIfAuthenticated()} />);
        }

        if (!anyUsers) {
            return fillScreenWithPage(
                <CreateFirstUser onSuccessfulUserCreation={checkIfAnyUsers} />,
            );
        }

        if (user.requiresPasswordChange) {
            return fillScreenWithPage(
                <ChangePassword
                    onChangePassword={() => checkIfAuthenticated()}
                    prompt="You must change your password before you can access the application."
                />,
            );
        }

        return (
            <WeekView
                fetchFavoriteTimeSlips={getFavoriteTimeSlips}
                favoriteTimeSlips={favoriteTimeSlips}
                projects={projects}
                projectMap={projectMap}
                tasks={tasks}
                taskMap={taskMap}
                tasksAllowedForProjects={tasksAllowedForProjects}
                laborCodes={laborCodes}
                laborCodeMap={laborCodeMap}
            />
        );
    };

    const canAccessGuardedRoutes = isAuthenticated() && !user.requiresPasswordChange;

    return (
        <div className={classes.app}>
            <AppHeader
                onLogout={checkIfAuthenticated}
                username={user.username}
                passwordChangeRequired={user.requiresPasswordChange}
                accessRights={userAccessRights}
            />
            <div className={classes.appContent}>
                <Routes>
                    <Route
                        key="/change-password"
                        path="/change-password"
                        element={
                            <RequireAuthentication
                                isAuthenticated={canAccessGuardedRoutes}
                                isAccessRightsLoading={isUserAccessRightsLoading}
                                isAuthenticationLoading={isAuthenticationLoading}
                                accessRights={userAccessRights}
                            >
                                <ChangePassword />
                            </RequireAuthentication>
                        }
                    />
                    <Route
                        key="/manage-users"
                        path="/manage-users"
                        element={
                            <RequireAuthentication
                                isAuthenticated={canAccessGuardedRoutes}
                                isAccessRightsLoading={isUserAccessRightsLoading}
                                isAuthenticationLoading={isAuthenticationLoading}
                                accessRights={userAccessRights}
                                requiredAccessRight={requiredAccessRights.get(manageUsers)}
                            >
                                <UserManagement />
                            </RequireAuthentication>
                        }
                    />
                    <Route
                        key="/query-time-slips"
                        path="/query-time-slips"
                        element={
                            <RequireAuthentication
                                isAuthenticated={canAccessGuardedRoutes}
                                isAccessRightsLoading={isUserAccessRightsLoading}
                                isAuthenticationLoading={isAuthenticationLoading}
                                accessRights={userAccessRights}
                            >
                                <QueryTimeSlips
                                    projects={projects}
                                    projectMap={projectMap}
                                    tasks={tasks}
                                    taskMap={taskMap}
                                    laborCodes={laborCodes}
                                    laborCodeMap={laborCodeMap}
                                    isAdmin={userAccessRights.has(adminAccessRight)}
                                    currentUserId={user.userId}
                                    savedQueries={savedQueries}
                                    savedQueriesMap={savedQueriesMap}
                                    fetchSavedQueries={getSavedQueries}
                                />
                            </RequireAuthentication>
                        }
                    />
                    <Route
                        key="/manage-codes"
                        path="/manage-codes"
                        element={
                            <RequireAuthentication
                                isAuthenticated={canAccessGuardedRoutes}
                                isAccessRightsLoading={isUserAccessRightsLoading}
                                isAuthenticationLoading={isAuthenticationLoading}
                                accessRights={userAccessRights}
                                requiredAccessRight={requiredAccessRights.get(manageTimeCodes)}
                            >
                                <ManageTimeCodes
                                    projects={projects}
                                    tasks={tasks}
                                    taskMap={taskMap}
                                    tasksAllowedForProjects={tasksAllowedForProjects}
                                    laborCodes={laborCodes}
                                    fetchProjects={getProjects}
                                    fetchTasksAllowed={getTasksAllowedForProjects}
                                    fetchTasks={getTasks}
                                    fetchLaborCodes={getLaborCodes}
                                    fetchFavorites={getFavoriteTimeSlips}
                                />
                            </RequireAuthentication>
                        }
                    />
                    <Route
                        key="/manage-favorites"
                        path="/manage-favorites"
                        element={
                            <RequireAuthentication
                                isAuthenticated={canAccessGuardedRoutes}
                                isAccessRightsLoading={isUserAccessRightsLoading}
                                isAuthenticationLoading={isAuthenticationLoading}
                                accessRights={userAccessRights}
                            >
                                <ManageFavorites
                                    favoriteTimeSlips={favoriteTimeSlips}
                                    fetchFavoriteTimeSlips={getFavoriteTimeSlips}
                                    projectMap={projectMap}
                                    taskMap={taskMap}
                                    laborCodeMap={laborCodeMap}
                                />
                            </RequireAuthentication>
                        }
                    />
                    <Route
                        key="/configurations"
                        path="/configurations"
                        element={
                            <RequireAuthentication
                                isAuthenticated={canAccessGuardedRoutes}
                                isAccessRightsLoading={isUserAccessRightsLoading}
                                isAuthenticationLoading={isAuthenticationLoading}
                                accessRights={userAccessRights}
                                requiredAccessRight={requiredAccessRights.get(manageConfigurations)}
                            >
                                <Configurations
                                    minutesPartition={minutesPartition}
                                    onChangeMinutesPartition={getMinutesPartition}
                                />
                            </RequireAuthentication>
                        }
                    />
                    <Route path="/" element={getPage()} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </div>
    );
};

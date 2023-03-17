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
import { ManageLaborCodesContainer } from './components/pages/ManageLaborCodes';
import { TaskMap } from './types/TaskMap';
import { RequireAuthentication } from './components/HOC/RequireAuthentication';
import { AccessRight } from './types/AccessRight';
import {
    adminAccessRight,
    manageConfigurations,
    manageProjects,
    manageLaborCodes,
    manageUsers,
    requiredAccessRights,
    manageTasks,
} from './constants/requiredAccessRights';
import { UserManagement } from './components/pages/UserManagement';
import { FavoriteTimeSlipData } from './types/TimeSlip';
import { ManageFavorites } from './components/pages/ManageFavorites';
import { Query } from './types/Query';
import { Configurations } from './components/pages/Configurations';
import { AllowedMinutesPartition } from './types/AllowedMinutesPartition';
import { TimeSlipLogView } from './components/pages/TimeSlipLogView';
import { UserProject } from './types/UserProject';
import { ManageProjects } from './components/pages/ManageProjects';
import { ManageTasks } from './components/pages/ManageTasks';
import { Project } from './types/Project';
import { EditProject } from './components/pages/EditProject';

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

    const [projects, setProjects] = useState<Project[]>([]);
    const [projectMap, setProjectMap] = useState<Map<number, Project>>(
        new Map<number, Project>([]),
    );
    const [projectNameMap, setProjectNameMap] = useState<Map<number, string>>(
        new Map<number, string>([]),
    );

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

    const [isProjectsForUserLoading, setIsProjectsForUserLoading] = useState(false);
    const [userProjectIds, setUserProjectIds] = useState<Set<number>>(new Set<number>());

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
            getAccessRightsAndUserProjects();
            getFavoriteTimeSlips();
            getSavedQueries();
            getMinutesPartition();
        }
    }, [user]);

    const getProjects = async () => {
        const projectsFromApi: Project[] = await fetchGet<Project[]>('Project');

        const nameMap = new Map<number, string>([]);
        projectsFromApi.forEach((project: Project) => nameMap.set(project.id, project.name));

        const map = new Map<number, Project>([]);
        projectsFromApi.forEach((project: Project) => map.set(project.id, project));

        setProjectNameMap(nameMap);
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

    const getAccessRightsAndUserProjects = async () => {
        await getUserProjects();
        await getAccessRights();
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

    const getUserProjects = async () => {
        setIsProjectsForUserLoading(true);
        const userProjectsFromApi: UserProject[] = await fetchGet<UserProject[]>(
            'User/ProjectsForUser',
        );

        const projectIds = userProjectsFromApi.map((up) => up.projectId);

        setUserProjectIds(new Set(projectIds));
        setIsProjectsForUserLoading(false);
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
                projectMap={projectNameMap}
                tasks={tasks}
                taskMap={taskMap}
                tasksAllowedForProjects={tasksAllowedForProjects}
                laborCodes={laborCodes}
                laborCodeMap={laborCodeMap}
                minutesPartition={minutesPartition}
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
                showManageProjects={
                    userAccessRights.has(adminAccessRight) || userProjectIds.size > 0
                }
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
                                <UserManagement
                                    allProjects={projects}
                                    allProjectsMap={projectNameMap}
                                />
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
                                    projectMap={projectNameMap}
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
                        key="/manage-projects"
                        path="/manage-projects"
                        element={
                            <RequireAuthentication
                                isAuthenticated={canAccessGuardedRoutes}
                                isAccessRightsLoading={isUserAccessRightsLoading}
                                isAuthenticationLoading={isAuthenticationLoading}
                                accessRights={userAccessRights}
                                requiredAccessRight={requiredAccessRights.get(manageProjects)}
                                // Show link if user manages any projects
                                overrideAccessRightAndAllowAccess={userProjectIds.size > 0}
                                overrideAccessRightLoading={isProjectsForUserLoading}
                            >
                                <ManageProjects
                                    projects={projects}
                                    fetchProjects={getProjects}
                                    fetchTasksAllowed={getTasksAllowedForProjects}
                                    fetchFavorites={getFavoriteTimeSlips}
                                    isAdmin={userAccessRights.has(adminAccessRight)}
                                    managedProjectIds={userProjectIds}
                                />
                            </RequireAuthentication>
                        }
                    />
                    <Route
                        key="/edit-project"
                        path="/edit-project/:projectIdText"
                        element={
                            <RequireAuthentication
                                isAuthenticated={canAccessGuardedRoutes}
                                isAccessRightsLoading={isUserAccessRightsLoading}
                                isAuthenticationLoading={isAuthenticationLoading}
                                accessRights={userAccessRights}
                                requiredAccessRight={requiredAccessRights.get(manageProjects)}
                                // Show link if user manages any projects
                                overrideAccessRightAndAllowAccess={userProjectIds.size > 0}
                                overrideAccessRightLoading={isProjectsForUserLoading}
                            >
                                <EditProject
                                    projectMap={projectMap}
                                    allProjects={projects}
                                    allTasks={tasks}
                                    tasksAllowedForProjects={tasksAllowedForProjects}
                                    taskMap={taskMap}
                                    fetchProjects={getProjects}
                                    fetchTasksAllowed={getTasksAllowedForProjects}
                                    isAuthenticated={canAccessGuardedRoutes}
                                    isAccessRightsLoading={isUserAccessRightsLoading}
                                    isAuthenticationLoading={isAuthenticationLoading}
                                    accessRights={userAccessRights}
                                    requiredAccessRight={requiredAccessRights.get(manageProjects)}
                                    overrideAccessRightLoading={false}
                                    userProjectIds={userProjectIds}
                                />
                            </RequireAuthentication>
                        }
                    />
                    <Route
                        key="/manage-tasks"
                        path="/manage-tasks"
                        element={
                            <RequireAuthentication
                                isAuthenticated={canAccessGuardedRoutes}
                                isAccessRightsLoading={isUserAccessRightsLoading}
                                isAuthenticationLoading={isAuthenticationLoading}
                                accessRights={userAccessRights}
                                requiredAccessRight={requiredAccessRights.get(manageTasks)}
                            >
                                <ManageTasks
                                    tasks={tasks}
                                    fetchTasksAllowed={getTasksAllowedForProjects}
                                    fetchTasks={getTasks}
                                    fetchFavorites={getFavoriteTimeSlips}
                                />
                            </RequireAuthentication>
                        }
                    />
                    <Route
                        key="/manage-labor-codes"
                        path="/manage-labor-codes"
                        element={
                            <RequireAuthentication
                                isAuthenticated={canAccessGuardedRoutes}
                                isAccessRightsLoading={isUserAccessRightsLoading}
                                isAuthenticationLoading={isAuthenticationLoading}
                                accessRights={userAccessRights}
                                requiredAccessRight={requiredAccessRights.get(manageLaborCodes)}
                            >
                                <ManageLaborCodesContainer
                                    laborCodes={laborCodes}
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
                                    projectMap={projectNameMap}
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
                    <Route
                        key="/time-slip-log"
                        path="/time-slip-log"
                        element={
                            <RequireAuthentication
                                isAuthenticated={canAccessGuardedRoutes}
                                isAccessRightsLoading={isUserAccessRightsLoading}
                                isAuthenticationLoading={isAuthenticationLoading}
                                accessRights={userAccessRights}
                                requiredAccessRight={requiredAccessRights.get(manageConfigurations)}
                            >
                                <TimeSlipLogView
                                    projectMap={projectNameMap}
                                    taskMap={taskMap}
                                    laborCodeMap={laborCodeMap}
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

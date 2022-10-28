import React, { useEffect, useState } from 'react';
import classes from './App.module.scss';
import { WeekView } from './components/WeekView';
import { Login } from './components/Login';
import { Navigate, Route, Routes } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import { fetchGet, fetchGetResponse } from './helpers/fetchFunctions';
import { CreateFirstUser } from './components/CreateUser/CreateFirstUser';
import { AppHeader } from './components/AppHeader';
import { CreateAdditionalUser } from './components/CreateUser/CreateAdditionalUser';
import { ChangePassword } from './components/ChangePassword';
import { User } from './types/User';
import { QueryTimeSlips } from './components/QueryTimeSlips';
import { DropdownOption } from './types/DropdownOption';
import { ManageTimeCodes } from './components/ManageTimeCodes';
import { TaskMap } from './types/TaskMap';
import { RequireAuthentication } from './components/RequireAuthentication';

export const App: React.FC<{}> = () => {
    const [username, setUsername] = useState<string>('');
    const [passwordChangeRequired, setPasswordChangeRequired] = useState(true);
    const [isAuthenticationLoading, setIsAuthenticationLoading] = useState(true);

    const [anyUsers, setAnyUsers] = useState(false);
    const [isAnyUsersLoading, setAnyUsersLoading] = useState(true);

    const [users, setUsers] = useState<DropdownOption[]>([]);
    const [userMap, setUserMap] = useState<Map<number, string>>(new Map<number, string>([]));

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

    const isAuthenticated = () => {
        return username !== '';
    };

    const checkIfAuthenticated = async () => {
        setIsAuthenticationLoading(true);
        const userResponse = await fetchGetResponse('User/GetUser');

        if (userResponse.ok) {
            const user: User = await userResponse.json();
            setPasswordChangeRequired(user.requiresPasswordChange);
            setUsername(user.username);
        } else {
            setUsername('');
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
            getUsers();
            getProjects();
            getTasks();
            getTasksAllowedForProjects();
            getLaborCodes();
        }
    }, [username]);

    const getUsers = async () => {
        const usersFromApi: DropdownOption[] = await fetchGet<DropdownOption[]>('User');

        const map = new Map<number, string>([]);
        usersFromApi.forEach((user: DropdownOption) => map.set(user.id, user.name));
        setUserMap(map);
        setUsers(usersFromApi);
    };

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

        if (passwordChangeRequired) {
            return fillScreenWithPage(
                <ChangePassword
                    onChangePassword={() => checkIfAuthenticated()}
                    prompt="You must change your password before you can access the application."
                />,
            );
        }

        return (
            <WeekView
                projects={projects}
                projectMap={projectMap}
                tasks={taskMap}
                tasksAllowedForProjects={tasksAllowedForProjects}
                laborCodes={laborCodes}
                laborCodeMap={laborCodeMap}
            />
        );
    };

    const canAccessGuardedRoutes = isAuthenticated() && !passwordChangeRequired;

    return (
        <div className={classes.app}>
            <AppHeader
                onLogout={checkIfAuthenticated}
                username={username}
                passwordChangeRequired={passwordChangeRequired}
            />
            <div className={classes.appContent}>
                <Routes>
                    <Route
                        key="/change-password"
                        path="/change-password"
                        element={
                            <RequireAuthentication
                                isAuthenticated={canAccessGuardedRoutes}
                                isAuthenticationLoading={isAuthenticationLoading}
                            >
                                <ChangePassword />
                            </RequireAuthentication>
                        }
                    />
                    <Route
                        key="/create-user"
                        path="/create-user"
                        element={
                            <RequireAuthentication
                                isAuthenticated={canAccessGuardedRoutes}
                                isAuthenticationLoading={isAuthenticationLoading}
                            >
                                <CreateAdditionalUser />
                            </RequireAuthentication>
                        }
                    />
                    <Route
                        key="/query-time-slips"
                        path="/query-time-slips"
                        element={
                            <RequireAuthentication
                                isAuthenticated={canAccessGuardedRoutes}
                                isAuthenticationLoading={isAuthenticationLoading}
                            >
                                <QueryTimeSlips
                                    users={users}
                                    userMap={userMap}
                                    projects={projects}
                                    projectMap={projectMap}
                                    tasks={tasks}
                                    taskMap={taskMap}
                                    laborCodes={laborCodes}
                                    laborCodeMap={laborCodeMap}
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
                                isAuthenticationLoading={isAuthenticationLoading}
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

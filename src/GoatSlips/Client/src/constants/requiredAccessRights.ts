export const queryTimeSlips = 'Query Time Slips';
export const manageProjects = 'Manage Projects';
export const manageTasks = 'Manage Tasks';
export const manageLaborCodes = 'Manage Labor Codes';
export const weekView = 'Week View';
export const weekTableView = 'Week Table View';
export const changePassword = 'Change Password';
export const manageUsers = 'Manage Users';
export const manageFavorites = 'Manage Favorites';
export const manageConfigurations = 'Manage Configurations';
export const viewLog = 'View Log';

export type ComponentName =
    | typeof queryTimeSlips
    | typeof manageLaborCodes
    | typeof weekView
    | typeof weekTableView
    | typeof changePassword
    | typeof manageUsers
    | typeof manageFavorites
    | typeof manageConfigurations
    | typeof viewLog
    | typeof manageProjects
    | typeof manageTasks;

export const adminAccessRight = 'ADMIN';

export const requiredAccessRights = new Map<ComponentName, string>([
    [manageLaborCodes, adminAccessRight],
    [manageProjects, adminAccessRight],
    [manageTasks, adminAccessRight],
    [manageUsers, adminAccessRight],
    [manageConfigurations, adminAccessRight],
    [viewLog, adminAccessRight],
]);

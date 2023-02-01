export const queryTimeSlips = 'Query Time Slips';
export const manageTimeCodes = 'Manage Time Codes';
export const weekView = 'Week View';
export const changePassword = 'Change Password';
export const manageUsers = 'Manage Users';
export const manageFavorites = 'Manage Favorites';
export const manageConfigurations = 'Manage Configurations';
export const viewLog = 'View Log';

export type ComponentName =
    | typeof queryTimeSlips
    | typeof manageTimeCodes
    | typeof weekView
    | typeof changePassword
    | typeof manageUsers
    | typeof manageFavorites
    | typeof manageConfigurations
    | typeof viewLog;

export const adminAccessRight = 'ADMIN';

export const requiredAccessRights = new Map<ComponentName, string>([
    [manageTimeCodes, adminAccessRight],
    [manageUsers, adminAccessRight],
    [manageConfigurations, adminAccessRight],
    [viewLog, adminAccessRight],
]);

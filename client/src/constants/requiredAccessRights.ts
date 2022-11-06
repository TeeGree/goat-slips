export const queryTimeSlips = 'Query Time Slips';
export const manageTimeCodes = 'Manage Time Codes';
export const addUser = 'Add User';
export const weekView = 'Week View';
export const changePassword = 'Change Password';
export const manageUsers = 'Manage Users';

export type ComponentName =
    | typeof queryTimeSlips
    | typeof manageTimeCodes
    | typeof addUser
    | typeof weekView
    | typeof changePassword
    | typeof manageUsers;

const adminAccessRight = 'ADMIN';

export const requiredAccessRights = new Map<ComponentName, string>([
    [queryTimeSlips, adminAccessRight],
    [manageTimeCodes, adminAccessRight],
    [addUser, adminAccessRight],
]);

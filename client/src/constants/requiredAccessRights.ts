export const queryTimeSlips = 'Query Time Slips';
export const manageTimeCodes = 'Manage Time Codes';
export const addUser = 'Add User';
export const weekView = 'Week View';
export const changePassword = 'Change Password';

export type ComponentName =
    | typeof queryTimeSlips
    | typeof manageTimeCodes
    | typeof addUser
    | typeof weekView
    | typeof changePassword;

const adminAccessRight = 'ADMIN';

export const requiredAccessRights = new Map<ComponentName, string>([
    [queryTimeSlips, adminAccessRight],
    [manageTimeCodes, adminAccessRight],
    [addUser, adminAccessRight],
]);

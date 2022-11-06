export interface User {
    userId: number;
    username: string;
    requiresPasswordChange: boolean;
}

export interface UserQueryResult {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
}

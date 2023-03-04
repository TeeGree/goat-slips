export interface Query {
    id: number;
    name: string;
    userIds: number[];
    projectIds: number[];
    taskIds: number[];
    laborCodeIds: number[];
    fromDate: string;
    toDate: string;
    description: string;
}

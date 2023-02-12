export interface TimeSlip {
    id: number;
    hours: number;
    minutes: number;
    date: Date;
    userId: number;
    projectId: number;
    taskId: number | null;
    laborCodeId: number | null;
    description: string;
}

export interface TimeSlipQueryResult {
    id: number;
    hours: number;
    minutes: number;
    date: Date;
    userId: number;
    projectId: number;
    taskId: number | null;
    laborCodeId: number | null;
    description: string;
    cost: number;
}

export interface ExportableTimeSlip {
    username: string;
    project: string;
    task: string;
    laborCode: string;
    description: string;
    date: string;
    hours: number;
    minutes: number;
    cost: string;
}

export interface FavoriteTimeSlipData {
    id: number;
    name: string;
    projectId: number;
    taskId: number | null;
    laborCodeId: number | null;
}

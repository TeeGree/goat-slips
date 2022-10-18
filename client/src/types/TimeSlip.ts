export interface TimeSlip {
    id: number;
    hours: number;
    minutes: number;
    date: Date;
    userId: number;
    projectId: number;
    taskId: number | null;
    laborCodeId: number | null;
}

export interface ExportableTimeSlip {
    username: string;
    project: string;
    task: string;
    laborCode: string;
    date: string;
    hours: number;
    minutes: number;
}

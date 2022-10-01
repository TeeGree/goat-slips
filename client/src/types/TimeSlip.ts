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

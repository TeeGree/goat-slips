export interface TimeSlipLog {
    id: number;
    timeSlipId: number;
    oldHours: number | null;
    oldMinutes: number | null;
    oldDate: Date | null;
    oldUserId: number | null;
    oldProjectId: number | null;
    oldTaskId: number | null;
    oldLaborCodeId: number | null;
    oldDescription: string | null;
    newHours: number | null;
    newMinutes: number | null;
    newDate: Date | null;
    newUserId: number | null;
    newProjectId: number | null;
    newTaskId: number | null;
    newLaborCodeId: number | null;
    newDescription: string | null;
    updateType: 'C' | 'U' | 'D';
    timeStamp: Date;
    updateUserId: number;
}

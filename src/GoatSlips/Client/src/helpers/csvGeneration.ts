import { ExportableTimeSlip } from '../types/TimeSlip';

export const getCsvOfTimeSlips = (timeSlips: ExportableTimeSlip[]): string => {
    const formatValue = (val: string) => {
        const commaRegex = /.*[,].*/;
        if (val.match(commaRegex) !== null) {
            const quoteRegex = /.*["].*/;
            if (val.match(quoteRegex)) {
                return `"${val.replaceAll('"', '""')}"`;
            }
            return `"${val}"`;
        }
        return val;
    };
    let csv = 'Username,Project,Task,Labor Code,Date,Hours,Minutes\n';
    timeSlips.forEach((ts: ExportableTimeSlip) => {
        const username = formatValue(ts.username);
        const project = formatValue(ts.project);
        const task = formatValue(ts.task);
        const laborCode = formatValue(ts.laborCode);
        csv += `${username},${project},${task},${laborCode},${ts.date},${ts.hours},${ts.minutes}\n`;
    });

    return csv;
};
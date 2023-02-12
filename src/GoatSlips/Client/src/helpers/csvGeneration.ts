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
    let csv = 'Username,Project,Task,Labor Code,Description,Date,Hours,Minutes,Cost\n';
    timeSlips.forEach((ts: ExportableTimeSlip) => {
        const username = formatValue(ts.username);
        const project = formatValue(ts.project);
        const task = formatValue(ts.task);
        const laborCode = formatValue(ts.laborCode);
        const description = formatValue(ts.description ?? '');
        csv += `${username},${project},${task},${laborCode},${description},${ts.date},${ts.hours},${ts.minutes},${ts.cost}\n`;
    });

    return csv;
};

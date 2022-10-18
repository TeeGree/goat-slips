import { ExportableTimeSlip } from '../types/TimeSlip';
import { getCsvOfTimeSlips } from './csvGeneration';

describe('Get CSV of Time Slips Tests:', () => {
    it('Single element comma delimited.', () => {
        const timeSlips: ExportableTimeSlip[] = [
            {
                username: 'testUser',
                project: 'testProject',
                task: 'testTask',
                laborCode: 'testLaborCode',
                date: '1/5/2011',
                hours: 5,
                minutes: 11,
            },
        ];
        const csv = getCsvOfTimeSlips(timeSlips);
        const expectedCsv =
            'Username,Project,Task,Labor Code,Date,Hours,Minutes\n' +
            'testUser,testProject,testTask,testLaborCode,1/5/2011,5,11\n';
        expect(csv).toEqual(expectedCsv);
    });

    it('Empty list just returns headers.', () => {
        const timeSlips: ExportableTimeSlip[] = [];
        const csv = getCsvOfTimeSlips(timeSlips);
        const expectedCsv = 'Username,Project,Task,Labor Code,Date,Hours,Minutes\n';
        expect(csv).toEqual(expectedCsv);
    });

    it('Multiple elements return multiple comma delimited rows.', () => {
        const timeSlips: ExportableTimeSlip[] = [
            {
                username: 'test',
                project: 'test',
                task: 'test',
                laborCode: 'test',
                date: '1/5/2011',
                hours: 5,
                minutes: 11,
            },
            {
                username: 'x',
                project: 'y',
                task: 'z',
                laborCode: 'w',
                date: '12/15/2099',
                hours: 20,
                minutes: 0,
            },
        ];
        const csv = getCsvOfTimeSlips(timeSlips);
        const expectedCsv =
            'Username,Project,Task,Labor Code,Date,Hours,Minutes\n' +
            'test,test,test,test,1/5/2011,5,11\n' +
            'x,y,z,w,12/15/2099,20,0\n';
        expect(csv).toEqual(expectedCsv);
    });

    it('Empty fields have no space.', () => {
        const timeSlips: ExportableTimeSlip[] = [
            {
                username: '',
                project: '',
                task: '',
                laborCode: '',
                date: '',
                hours: 0,
                minutes: 0,
            },
        ];
        const csv = getCsvOfTimeSlips(timeSlips);
        const expectedCsv = 'Username,Project,Task,Labor Code,Date,Hours,Minutes\n,,,,,0,0\n';
        expect(csv).toEqual(expectedCsv);
    });

    it('Fields with commas are wrapped in double quotes.', () => {
        const timeSlips: ExportableTimeSlip[] = [
            {
                username: 'test,trying a',
                project: 'test',
                task: 'this one, too',
                laborCode: '',
                date: '',
                hours: 0,
                minutes: 0,
            },
        ];
        const csv = getCsvOfTimeSlips(timeSlips);
        const expectedCsv =
            'Username,Project,Task,Labor Code,Date,Hours,Minutes\n' +
            '"test,trying a",test,"this one, too",,,0,0\n';
        expect(csv).toEqual(expectedCsv);
    });

    it('Fields with commas and double quotes have their double quotes escaped.', () => {
        const timeSlips: ExportableTimeSlip[] = [
            {
                username: 'test,trying "a"',
                project: 'test',
                task: '"this one", too',
                laborCode: 'nah, im good',
                date: '',
                hours: 0,
                minutes: 0,
            },
        ];
        const csv = getCsvOfTimeSlips(timeSlips);
        const expectedCsv =
            'Username,Project,Task,Labor Code,Date,Hours,Minutes\n' +
            '"test,trying ""a""",test,"""this one"", too","nah, im good",,0,0\n';
        expect(csv).toEqual(expectedCsv);
    });
});

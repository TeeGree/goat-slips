import React from 'react';
import classes from './Home.module.scss';
import { DayColumn } from './DayColumn';
import { Day } from '../types/Day';

const dayMap = new Map<number, Day>([
    [0, 'Sunday'],
    [1, 'Monday'],
    [2, 'Tuesday'],
    [3, 'Wednesday'],
    [4, 'Thursday'],
    [5, 'Friday'],
    [6, 'Saturday'],
]);

export const Home: React.FC<{}> = () => {
    const date = new Date();

    const getDayColumn = (day: 0 | 1 | 2 | 3 | 4 | 5 | 6) => {
        const currentDay = date.getDay();
        const isCurrentDay = day === currentDay;
        const dayString = dayMap.get(day);

        if (dayString === undefined) {
            throw Error('Invalid day!');
        }

        const dayDate = new Date();
        dayDate.setDate(dayDate.getDate() + (day - currentDay));

        return <DayColumn day={dayString} isCurrentDay={isCurrentDay} date={dayDate} />;
    };

    return (
        <div className={classes.homeContainer}>
            So glad you made it. Welcome to the Greatest Of All Time Slips Applications!
            <div className={classes.weekContainer}>
                {getDayColumn(0)}
                {getDayColumn(1)}
                {getDayColumn(2)}
                {getDayColumn(3)}
                {getDayColumn(4)}
                {getDayColumn(5)}
                {getDayColumn(6)}
            </div>
        </div>
    );
};

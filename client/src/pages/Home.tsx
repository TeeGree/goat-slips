import React, { useEffect, useState } from 'react';
import classes from './Home.module.scss';
import path from 'path-browserify';

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

const dayMap = new Map<number, string>([
    [0, 'Sunday'],
    [1, 'Monday'],
    [2, 'Tuesday'],
    [3, 'Wednesday'],
    [4, 'Thursday'],
    [5, 'Friday'],
    [6, 'Saturday'],
]);

interface Project {
    id: number;
    name: string;
}

export const Home: React.FC<{}> = () => {
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    const [projects, setProjects] = useState<Project[]>([]);
    const date = new Date();

    const checkIfAuthenticated = async () => {
        if (apiEndpoint === undefined) {
            throw Error('No REACT_APP_API_ENDPOINT has been set!');
        }
        const url = path.join(apiEndpoint, 'Project');
        const result = await fetch(url, { credentials: 'include' });

        const projectsFromApi = await result.json();
        setProjects(projectsFromApi);
    };

    useEffect(() => {
        checkIfAuthenticated();
    }, []);

    const getDate = () => {
        return date.toLocaleDateString('en');
    };

    const getDay = () => {
        return date.getDay();
    };

    const getDayColumn = (day: 0 | 1 | 2 | 3 | 4 | 5 | 6) => {
        const className = day === getDay() ? 'current-day ' : '';
        return <div className={`${className} ${classes.dayColumn}`}>{dayMap.get(day)}</div>;
    };

    return (
        <div className={classes.homeContainer}>
            So glad you made it. Welcome to the Greatest Of All Time Slips Applications!
            <div>{getDate()}</div>
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

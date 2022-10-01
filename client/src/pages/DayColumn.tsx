import React, { useEffect, useState } from 'react';
import classes from './DayColumn.module.scss';
import path from 'path-browserify';
import { Day } from '../types/Day';

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

interface Project {
    id: number;
    name: string;
}

interface DayColumnProps {
    date: Date;
    day: Day;
    isCurrentDay: boolean;
}

export const DayColumn: React.FC<DayColumnProps> = (props: DayColumnProps) => {
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    const [projects, setProjects] = useState<Project[]>([]);

    const { date, day, isCurrentDay } = props;

    const getProjects = async () => {
        if (apiEndpoint === undefined) {
            throw Error('No REACT_APP_API_ENDPOINT has been set!');
        }
        const url = path.join(apiEndpoint, 'Project');
        const result = await fetch(url, { credentials: 'include' });

        const projectsFromApi = await result.json();
        setProjects(projectsFromApi);
    };

    const getDateString = () => {
        return date.toLocaleDateString('en');
    };

    useEffect(() => {
        getProjects();
    }, []);

    const className = isCurrentDay ? 'current-day ' : '';
    return (
        <div className={`${className} ${classes.dayColumn}`}>
            <div className={classes.dayHeader}>
                <div>{day}</div>
                <div>{getDateString()}</div>
                <hr />
            </div>
        </div>
    );
};

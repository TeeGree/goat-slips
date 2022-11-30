import { Tooltip } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import classes from './TimeTotals.module.scss';

interface TimeTotalsProps {
    totalHours: number;
    totalMinutes: number;
    newMinuteDiffs: Map<number, number>;
    isFiltered: boolean;
}

const minTotalWidthForLargeTotals = 145;

export const TimeTotals: React.FC<TimeTotalsProps> = (props: TimeTotalsProps) => {
    const elementRef = useRef<HTMLInputElement | null>(null);
    const [shortenTimeTotal, setShortenTimeTotal] = useState(false);

    const { totalHours, totalMinutes, newMinuteDiffs, isFiltered } = props;

    const getShouldShortenTimeTotal = (): boolean => {
        const offsetWidth = elementRef?.current?.offsetWidth ?? 0;
        return offsetWidth < minTotalWidthForLargeTotals;
    };

    useEffect(() => {
        const handleResize = (): void => {
            setShortenTimeTotal(getShouldShortenTimeTotal());
        };

        if (elementRef.current != null) {
            setShortenTimeTotal(getShouldShortenTimeTotal());
        }

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [elementRef]);

    const getNewTotal = () => {
        if (isFiltered) {
            return <></>;
        }

        let minutesDiff = 0;

        newMinuteDiffs.forEach((value: number, _key: number, _map: Map<number, number>) => {
            minutesDiff += value;
        });

        const newTotalMinutes = minutesDiff + totalMinutes;
        const additionalNewHours = Math.floor(newTotalMinutes / 60);
        const newTotalHours = totalHours + additionalNewHours;
        const newMinutes = newTotalMinutes - additionalNewHours * 60;

        if (newTotalHours !== totalHours || newMinutes !== totalMinutes) {
            return (
                <div className={classes.newTime}>{`${getTimeText(newTotalHours, newMinutes)}`}</div>
            );
        }

        return <></>;
    };

    const getTimeText = (hours: number, minutes: number) => {
        const text = shortenTimeTotal ? `${hours}h${minutes}m` : `${hours} hr ${minutes} min`;
        if (isFiltered) {
            return (
                <Tooltip title="Total is based on filtered time slips. Modified total based on new/edited time slips won't be displayed while filters are active.">
                    <span className={classes.filteredTotal}>{text}*</span>
                </Tooltip>
            );
        }

        return text;
    };

    const timeText = getTimeText(totalHours, totalMinutes);

    return (
        <div className={classes.dayTotal} ref={elementRef}>
            <div>{timeText}</div>
            {getNewTotal()}
        </div>
    );
};

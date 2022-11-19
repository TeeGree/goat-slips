import React, { useEffect, useRef, useState } from 'react';
import classes from './TimeTotals.module.scss';

interface TimeTotalsProps {
    totalHours: number;
    totalMinutes: number;
    newMinuteDiffs: Map<number, number>;
}

const minTotalWidthForLargeTotals = 145;

export const TimeTotals: React.FC<TimeTotalsProps> = (props: TimeTotalsProps) => {
    const elementRef = useRef<HTMLInputElement | null>(null);
    const [shortenTimeTotal, setShortenTimeTotal] = useState(false);

    const { totalHours, totalMinutes, newMinuteDiffs } = props;

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
        return shortenTimeTotal ? `${hours}h${minutes}m` : `${hours} hr ${minutes} min`;
    };

    const text = getTimeText(totalHours, totalMinutes);

    return (
        <div className={classes.dayTotal} ref={elementRef}>
            <div>{text}</div>
            {getNewTotal()}
        </div>
    );
};

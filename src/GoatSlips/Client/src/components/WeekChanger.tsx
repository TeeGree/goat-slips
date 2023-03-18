import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import { IconButton, styled, TextField } from '@mui/material';
import { DatePicker, LocalizationProvider, PickersDay, PickersDayProps } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import 'dayjs/plugin/isBetween';
import { getSundayDateForDate } from '../helpers/dateHelpers';
import classes from './WeekChanger.module.scss';
import MomentUtils from '@date-io/moment';
import moment from 'moment';
import 'moment/locale/de';
import { AllowedFirstDayOfWeek } from '../types/AllowedFirstDayOfWeek';
import { useEffect, useState } from 'react';

interface CustomPickerDayProps extends PickersDayProps<Date> {
    dayIsBetween: boolean;
    isFirstDay: boolean;
    isLastDay: boolean;
}

const CustomPickersDay = styled(PickersDay, {
    shouldForwardProp: (prop) =>
        prop !== 'dayIsBetween' && prop !== 'isFirstDay' && prop !== 'isLastDay',
})<CustomPickerDayProps>(({ theme, dayIsBetween, isFirstDay, isLastDay }) => ({
    ...(dayIsBetween && {
        borderRadius: 0,
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.common.white,
        '&:hover, &:focus': {
            backgroundColor: theme.palette.primary.dark,
        },
    }),
    ...(isFirstDay && {
        borderTopLeftRadius: '50%',
        borderBottomLeftRadius: '50%',
    }),
    ...(isLastDay && {
        borderTopRightRadius: '50%',
        borderBottomRightRadius: '50%',
    }),
})) as React.ComponentType<CustomPickerDayProps>;

interface WeekChangerProps {
    sundayDate: Date;
    setSundayDate: (date: Date) => void;
    firstDayOfWeek: AllowedFirstDayOfWeek;
}

export const WeekChanger: React.FC<WeekChangerProps> = (props: WeekChangerProps) => {
    const { sundayDate, setSundayDate, firstDayOfWeek } = props;

    const changeToPreviousWeek = () => changeWeekByOne(false);

    const changeToNextWeek = () => changeWeekByOne(true);

    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        moment.locale('en', { week: { dow: firstDayOfWeek } });
        setIsLoaded(true);
    }, []);

    const changeToAnyWeek = (newValue: any | null, _keyboardInputValue?: string | undefined) => {
        if (newValue !== null) {
            const newDate = newValue.toDate();
            const newSundayDate = getSundayDateForDate(newDate);
            newSundayDate.setDate(newSundayDate.getDate() + firstDayOfWeek);
            setSundayDate(newSundayDate);
        }
    };

    const changeWeekByOne = (forward: boolean) => {
        const modifier = forward ? 1 : -1;
        const newSundayDate = new Date(sundayDate.getTime() + 7 * modifier * 24 * 60 * 60 * 1000);
        setSundayDate(newSundayDate);
    };

    const renderWeekPickerDay = (
        date: Date,
        _selectedDates: Array<Date | null>,
        pickersDayProps: PickersDayProps<Date>,
    ) => {
        if (!sundayDate) {
            return <PickersDay {...pickersDayProps} />;
        }

        const sundayDayjs = dayjs(sundayDate);
        const start = sundayDayjs.subtract(1, 'day');
        const end = start.add(7, 'day');

        const dateJs = dayjs(date);
        const dayIsBetween = dateJs.isAfter(start) && dateJs.isBefore(end);
        const isFirstDay = dateJs.isSame(start, 'day');
        const isLastDay = dateJs.isSame(end, 'day');

        return (
            <CustomPickersDay
                {...pickersDayProps}
                disableMargin
                dayIsBetween={dayIsBetween}
                isFirstDay={isFirstDay}
                isLastDay={isLastDay}
            />
        );
    };

    if (!isLoaded) {
        return <></>;
    }

    return (
        <div className={classes.weekChanger}>
            <IconButton className={classes.squareIconButton} onClick={changeToPreviousWeek}>
                <KeyboardArrowLeft />
            </IconButton>
            <LocalizationProvider dateAdapter={MomentUtils}>
                <DatePicker
                    className={classes.weekChangeInput}
                    label="Week of"
                    value={sundayDate}
                    onChange={changeToAnyWeek}
                    renderDay={renderWeekPickerDay}
                    renderInput={(params) => <TextField {...params} />}
                />
            </LocalizationProvider>
            <IconButton className={classes.squareIconButton} onClick={changeToNextWeek}>
                <KeyboardArrowRight />
            </IconButton>
        </div>
    );
};

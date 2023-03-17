import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import { IconButton, styled, TextField } from '@mui/material';
import { DatePicker, LocalizationProvider, PickersDay, PickersDayProps } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/plugin/isBetween';
import { getSundayDateForDate } from '../helpers/dateHelpers';
import classes from './WeekChanger.module.scss';
import MomentUtils from '@date-io/moment';
import moment from 'moment';
import 'moment/locale/de';
import { AllowedFirstDayOfWeek } from '../types/AllowedFirstDayOfWeek';
import { useEffect, useState } from 'react';

interface CustomPickerDayProps extends PickersDayProps<Dayjs> {
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

    const changeToAnyWeek = (
        newValue: dayjs.Dayjs | null,
        _keyboardInputValue?: string | undefined,
    ) => {
        const newDate = newValue?.toDate();
        if (newDate !== undefined) {
            const newSundayDate = getSundayDateForDate(newDate);
            setSundayDate(newSundayDate);
        }
    };

    const changeWeekByOne = (forward: boolean) => {
        const modifier = forward ? 1 : -1;
        const newSundayDate = new Date(sundayDate.getTime() + 7 * modifier * 24 * 60 * 60 * 1000);
        setSundayDate(newSundayDate);
    };

    const renderWeekPickerDay = (
        date: Dayjs,
        _selectedDates: Array<Dayjs | null>,
        pickersDayProps: PickersDayProps<Dayjs>,
    ) => {
        if (!sundayDate) {
            return <PickersDay {...pickersDayProps} />;
        }

        const sundayDayjs = dayjs(sundayDate);
        const start = sundayDayjs.startOf('week');
        const end = sundayDayjs.endOf('week');

        const dayIsBetween = date.isBetween(start, end, null, '[]');
        const isFirstDay = date.isSame(start, 'day');
        const isLastDay = date.isSame(end, 'day');

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
                    value={dayjs(sundayDate)}
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

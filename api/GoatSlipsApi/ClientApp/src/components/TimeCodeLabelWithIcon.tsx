import React from 'react';
import classes from './TimeCodeLabelWithIcon.module.scss';
import { Tooltip } from '@mui/material';
import { Flag, Task, Work } from '@mui/icons-material';

const project = 'project';
const task = 'task';
const laborCode = 'laborCode';

type TimeCodeType = typeof project | typeof task | typeof laborCode;

interface TimeCodeLabelWithIconProps {
    label: string;
    timeCodeType: TimeCodeType;
}

interface LabelProps {
    iconElement: React.ReactNode;
    tooltip: string;
}

const labelPropsMap = new Map<TimeCodeType, LabelProps>([
    [project, { iconElement: <Flag className={classes.icon} />, tooltip: 'Project' }],
    [task, { iconElement: <Task className={classes.icon} />, tooltip: 'Task' }],
    [laborCode, { iconElement: <Work className={classes.icon} />, tooltip: 'Labor Code' }],
]);

export const TimeCodeLabelWithIcon: React.FC<TimeCodeLabelWithIconProps> = (
    props: TimeCodeLabelWithIconProps,
) => {
    const { label, timeCodeType } = props;

    const labelProps = labelPropsMap.get(timeCodeType);

    return (
        <div className={classes.readonlyPropText}>
            <Tooltip title={labelProps?.tooltip ?? ''} placement="left">
                <span className={classes.readonlyPropTextSpan}>
                    {labelProps?.iconElement}
                    {label}
                </span>
            </Tooltip>
        </div>
    );
};

import React from 'react';
import classes from './EntityLabelWithIcon.module.scss';
import { Tooltip } from '@mui/material';
import { EmojiPeople, Flag, Task, Work } from '@mui/icons-material';

const project = 'project';
const task = 'task';
const laborCode = 'laborCode';
const user = 'user';

type EntityType = typeof project | typeof task | typeof laborCode | typeof user;

interface EntityLabelWithIconProps {
    label: string;
    timeCodeType: EntityType;
}

interface LabelProps {
    iconElement: React.ReactNode;
    tooltip: string;
}

const labelPropsMap = new Map<EntityType, LabelProps>([
    [project, { iconElement: <Flag className={classes.icon} />, tooltip: 'Project' }],
    [task, { iconElement: <Task className={classes.icon} />, tooltip: 'Task' }],
    [laborCode, { iconElement: <Work className={classes.icon} />, tooltip: 'Labor Code' }],
    [user, { iconElement: <EmojiPeople className={classes.icon} />, tooltip: 'User' }],
]);

export const EntityLabelWithIcon: React.FC<EntityLabelWithIconProps> = (
    props: EntityLabelWithIconProps,
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

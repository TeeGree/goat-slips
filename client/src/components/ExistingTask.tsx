import React from 'react';
import { fetchDeleteResponse } from '../helpers/fetchFunctions';
import { DropdownOption } from '../types/DropdownOption';
import { ExistingTimeCode } from './ExistingTimeCode';

interface ExistingTaskProps {
    task: DropdownOption;
    fetchTasks: () => Promise<void>;
    setError: (message: string) => void;
    setSuccess: (message: string) => void;
}

export const ExistingTask: React.FC<ExistingTaskProps> = (props: ExistingTaskProps) => {
    const { task, setError, setSuccess, fetchTasks } = props;

    const deleteTask = async (id: number) => {
        const response = await fetchDeleteResponse(`Task/Delete/${id}`);
        return response;
    };

    return (
        <ExistingTimeCode
            code={task}
            fetchCodes={fetchTasks}
            setError={setError}
            setSuccess={setSuccess}
            deleteApiCall={deleteTask}
            label="task"
        />
    );
};

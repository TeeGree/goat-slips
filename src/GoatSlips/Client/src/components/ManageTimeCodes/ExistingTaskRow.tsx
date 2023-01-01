import React from 'react';
import { fetchDeleteResponse } from '../../helpers/fetchFunctions';
import { DropdownOption } from '../../types/DropdownOption';
import { ExistingTimeCodeRow } from './ExistingTimeCodeRow';

interface ExistingTaskRowProps {
    task: DropdownOption;
    fetchTasks: () => Promise<void>;
    setError: (message: string) => void;
    setSuccess: (message: string) => void;
}

export const ExistingTaskRow: React.FC<ExistingTaskRowProps> = (props: ExistingTaskRowProps) => {
    const { task, setError, setSuccess, fetchTasks } = props;

    const deleteTask = async (id: number) => {
        const response = await fetchDeleteResponse(`Task/Delete/${id}`);
        return response;
    };

    return (
        <ExistingTimeCodeRow
            code={task}
            fetchCodes={fetchTasks}
            setError={setError}
            setSuccess={setSuccess}
            deleteApiCall={deleteTask}
            label="task"
        />
    );
};

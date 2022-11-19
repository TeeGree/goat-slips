import React from 'react';
import { fetchDeleteResponse } from '../helpers/fetchFunctions';
import { DropdownOption } from '../types/DropdownOption';
import { ExistingTimeCode } from './ExistingTimeCode';

interface ExistingLaborCodeProps {
    laborCode: DropdownOption;
    fetchLaborCodes: () => Promise<void>;
    setError: (message: string) => void;
    setSuccess: (message: string) => void;
}

export const ExistingLaborCode: React.FC<ExistingLaborCodeProps> = (
    props: ExistingLaborCodeProps,
) => {
    const { laborCode, setError, setSuccess, fetchLaborCodes } = props;

    const deleteLaborCode = async (id: number) => {
        const response = await fetchDeleteResponse(`LaborCode/Delete/${id}`);
        return response;
    };

    return (
        <ExistingTimeCode
            code={laborCode}
            fetchCodes={fetchLaborCodes}
            setError={setError}
            setSuccess={setSuccess}
            deleteApiCall={deleteLaborCode}
            label="labor code"
        />
    );
};

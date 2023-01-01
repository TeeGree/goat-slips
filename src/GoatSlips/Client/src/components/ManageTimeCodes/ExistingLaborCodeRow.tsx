import React from 'react';
import { fetchDeleteResponse } from '../../helpers/fetchFunctions';
import { DropdownOption } from '../../types/DropdownOption';
import { ExistingTimeCodeRow } from './ExistingTimeCodeRow';

interface ExistingLaborCodeRowProps {
    laborCode: DropdownOption;
    fetchLaborCodes: () => Promise<void>;
    setError: (message: string) => void;
    setSuccess: (message: string) => void;
}

export const ExistingLaborCodeRow: React.FC<ExistingLaborCodeRowProps> = (
    props: ExistingLaborCodeRowProps,
) => {
    const { laborCode, setError, setSuccess, fetchLaborCodes } = props;

    const deleteLaborCode = async (id: number) => {
        const response = await fetchDeleteResponse(`LaborCode/Delete/${id}`);
        return response;
    };

    return (
        <ExistingTimeCodeRow
            code={laborCode}
            fetchCodes={fetchLaborCodes}
            setError={setError}
            setSuccess={setSuccess}
            deleteApiCall={deleteLaborCode}
            label="labor code"
        />
    );
};

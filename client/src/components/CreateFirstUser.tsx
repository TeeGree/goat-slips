import React from 'react';
import { fetchPostResponse } from '../helpers/fetchFunctions';
import { CreateUser } from './CreateUser';

interface CreateFirstUserProps {
    onSuccessfulUserCreation: () => void;
}

export const CreateFirstUser: React.FC<CreateFirstUserProps> = (props: CreateFirstUserProps) => {
    const { onSuccessfulUserCreation } = props;

    const createUser = async (
        username: string,
        email: string,
        firstName: string,
        lastName: string,
        password: string,
    ) => {
        const response = await fetchPostResponse('User/CreateFirstUser', {
            username,
            email,
            firstName,
            lastName,
            password,
        });

        if (response.ok) {
            onSuccessfulUserCreation();
            return true;
        }

        return false;
    };

    return (
        <CreateUser createUser={createUser}>
            Welcome to G.O.A.T. Slips!
            <p>
                There are no users in the system. Please enter user information so that you can log
                in.
            </p>
        </CreateUser>
    );
};

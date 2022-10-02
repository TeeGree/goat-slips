import path from 'path-browserify';

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

export const fetchGet = async <T>(apiPath: string): Promise<T> => {
    if (apiEndpoint === undefined) {
        throw Error('No REACT_APP_API_ENDPOINT has been set!');
    }

    const url = path.join(apiEndpoint, apiPath);
    const result = await fetch(url, { credentials: 'include' });

    const deserializedResult: T = await result.json();
    return deserializedResult;
};

export const fetchPostResponse = async (apiPath: string, body?: any): Promise<Response> => {
    if (apiEndpoint === undefined) {
        throw Error('No REACT_APP_API_ENDPOINT has been set!');
    }

    const url = path.join(apiEndpoint, apiPath);

    const requestInit: RequestInit = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    };

    if (body !== undefined) {
        requestInit.body = JSON.stringify(body);
    }

    const response = await fetch(url, requestInit);

    return response;
};

import path from 'path-browserify';

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

export const fetchGet = async <T>(apiPath: string): Promise<T> => {
    const result = await fetchGetResponse(apiPath);

    const deserializedResult: T = await result.json();
    return deserializedResult;
};

export const fetchGetResponse = async (apiPath: string): Promise<Response> => {
    if (apiEndpoint === undefined) {
        throw Error('No REACT_APP_API_ENDPOINT has been set!');
    }

    const url = path.join(apiEndpoint, apiPath);
    const response = await fetch(url, { credentials: 'include' });

    return response;
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

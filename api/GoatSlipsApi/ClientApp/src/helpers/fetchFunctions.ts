const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

const getApiPath = (apiPath: string) => {
    if (apiEndpoint === undefined) {
        throw Error('No REACT_APP_API_ENDPOINT has been set!');
    }
    if (!apiEndpoint.endsWith('/')) {
        return `${apiEndpoint}/${apiPath}`;
    }

    return `${apiEndpoint}${apiPath}`;
};

export const fetchGet = async <T>(apiPath: string): Promise<T> => {
    const result = await fetchGetResponse(apiPath);

    const deserializedResult: T = await result.json();
    return deserializedResult;
};

export const fetchGetResponse = async (apiPath: string): Promise<Response> => {
    const url = getApiPath(apiPath);
    const response = await fetch(url, { credentials: 'include', headers: { mode: 'no-cors' } });

    return response;
};

export const fetchDeleteResponse = async (apiPath: string): Promise<Response> => {
    const url = getApiPath(apiPath);
    const response = await fetch(url, {
        method: 'DELETE',
        credentials: 'include',
        headers: { mode: 'no-cors' },
    });

    return response;
};

export const fetchPostResponse = async (apiPath: string, body?: any): Promise<Response> => {
    const url = getApiPath(apiPath);

    const requestInit: RequestInit = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            mode: 'no-cors',
        },
        credentials: 'include',
    };

    if (body !== undefined) {
        requestInit.body = JSON.stringify(body);
    }

    const response = await fetch(url, requestInit);

    return response;
};

export const fetchPost = async <T>(apiPath: string, body?: any) => {
    const result = await fetchPostResponse(apiPath, body);

    const deserializedResult: T = await result.json();
    return deserializedResult;
};

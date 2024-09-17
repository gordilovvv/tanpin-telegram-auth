import { IRequest } from 'itty-router';

export const parseJson = async (request: IRequest) => {
    try {
        const body = await request.json() as Request;
        return body;
    } catch (error) {
        return {};
    }
};
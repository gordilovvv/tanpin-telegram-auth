import { IRequest } from 'itty-router';
import { badRequest, serverError, success } from './response';
import { verifyTelegramLogin } from '../utils/verifyLogin';
import { logError } from '../utils/logger';

export type LoginParams = {
    id: string,
    first_name: string,
    last_name: string,
    username: string,
    photo_url: string,
    auth_date: string,
    hash: string
}

export const authHandler = (request: IRequest) => {
    const query = request.query as LoginParams;

    if (!query.hash) {
        return badRequest('Hash is missing in the request');
    }

    try {
        const user = verifyTelegramLogin(query);

        console.log(user);

        // wallet logic

        return success('Ok');
    } catch (error) {
        logError(error);

        return serverError('Something failed!');
    }
};
import { error, json } from 'itty-router';

export function success(body: any) {
    return json(body);
}

export function badRequest(message: string) {
    return error(400, message);
}

export function notFound(message?: string) {
    return error(404, message);
}

export function serverError(message: string) {
    return error(500, message);
}
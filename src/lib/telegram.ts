import crypto from 'crypto';
import dayjs from 'dayjs';
import { env } from '@environment';

export interface TelegramAuth {
    id: string,
    first_name?: string,
    last_name?: string,
    username?: string,
    photo_url?: string,
    auth_date: string,
    hash: string
}

const authLifetime = parseInt(env.TELEGRAM_PARAMS_TTL_SECONDS);

const verifyAuthDate = (authDate: string, ttl: number): boolean => {
    const current = dayjs().unix();
    const timestamp = parseInt(authDate);
    if (isNaN(timestamp)) return false;

    return (current - timestamp) < ttl;
};

export const verifyTelegramAuth = (rawAuth: TelegramAuth) => {
    const { hash, ...rest } = rawAuth;

    const dataCheckString: string = Object.entries(rest)
        .map(([key, value]) => `${key}=${value}`)
        .sort()
        .join('\n');

    const secretKey: Buffer = crypto.createHash('sha256').update(env.TELEGRAM_BOT_TOKEN).digest();
    const hashBuffer: Buffer = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest();

    const calculatedHash = hashBuffer.toString('hex');
    const isValidAuthDate = verifyAuthDate(rawAuth.auth_date, authLifetime);

    if (calculatedHash !== hash) {
        throw new TelegramAuthError('Invalid auth');
    }

    if (!isValidAuthDate) {
        throw new TelegramAuthError('Auth expired');
    }

    return {
        id: rest.id,
        username: rest.username,
        firstName: rest.first_name,
        lastName: rest.last_name,
        photoUrl: rest.photo_url,
        authDate: rest.auth_date
    };
};

export class TelegramAuthError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'TelegramAuthError';
    }
}
import crypto from 'crypto';
import { env } from '@environment';

export type TelegramLoginParams = {
    id: string,
    first_name?: string,
    last_name?: string,
    username?: string,
    photo_url?: string,
    auth_date: string,
    hash: string
}

export const verifyTelegramLogin = (params: TelegramLoginParams) => {
    const { hash, ...rest } = params;

    const dataCheckString: string = Object.entries(rest)
        .map(([key, value]) => `${key}=${value}`)
        .sort()
        .join('\n');

    const secretKey: Buffer = crypto.createHash('sha256')
        .update(env.BOT_TOKEN)
        .digest();

    const hashBuffer: Buffer = crypto.createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest();

    const calculatedHash: string = hashBuffer.toString('hex');
    const elapsedTime = Date.now() / 1000 - parseInt(params.auth_date);

    if (calculatedHash !== hash) {
        throw new Error('Bad auth');
    }

    if (elapsedTime > 86400) {
        throw new Error('Auth is outdated');
    }

    return {
        userId: params.id,
        username: params.username
    };
};
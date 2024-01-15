import crypto from 'crypto';
import { BOT_TOKEN } from '../config';
import { LoginParams } from '../handlers/auth';

export const verifyTelegramLogin = (params: LoginParams) => {
    const { hash, ...rest } = params;

    const dataCheckString: string = Object.entries(rest)
        .map(([key, value]) => `${key}=${value}`)
        .sort()
        .join('\n');

    const secretKey: Buffer = crypto.createHash('sha256')
        .update(BOT_TOKEN)
        .digest();

    const hashBuffer: Buffer = crypto.createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest();

    const calculatedHash: string = hashBuffer.toString('hex');
    const elapsedTime = Date.now() / 1000 - parseInt(params.auth_date);

    if (calculatedHash !== hash) {
        throw new Error('Bad auth');
    }

    if (elapsedTime <= 86400) {
        throw new Error('Auth is outdated');
    }

    return {
        userId: params.id,
        username: params.username
    };
};
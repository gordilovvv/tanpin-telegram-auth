import { IRequest } from 'itty-router';
import { z } from 'zod';
import { env } from '@environment';
import { pool } from 'db/pool';
import { insertSession, selectSessionByPubKey } from 'db/session';
import { User, insertUser, selectUserByTelegramId } from 'db/user';
import { badRequest, serverError, success } from './response';
import { verifyTelegramLogin, TelegramLoginParams } from 'lib/bot';
import { encrypt } from 'lib/aes';
import { logError, logger } from 'utils/logger';
import { generateWallet } from 'utils/wallet';
import { getCurrentTimestampSeconds } from 'utils/timestamp';

// TODO: move to package
import { getPublic } from 'packages/tanpin-tg-cipher/elliptic';

const validationSchema = z.object({
    id: z.string(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    username: z.string().optional(),
    photo_url: z.string().optional(),
    auth_date: z.string(),
    hash: z.string(),
    sessionId: z.string(),
    sessionLifetime: z.string(),
});

export const authHandler = async (request: IRequest) => {
    const { sessionId, sessionLifetime, ...query } = request.query as TelegramLoginParams & {
        sessionId: string,
        sessionLifetime: string
    };

    const validation = validationSchema.safeParse({ sessionId, sessionLifetime, ...query });

    if (!validation.success) {
        return badRequest('Data are missing in the request!');
    }

    if (parseInt(sessionLifetime) <= 0) {
        return badRequest('Session lifetime is zero or smaller!');
    }

    logger.http('Auth request', query);

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const telegramUser = verifyTelegramLogin(query);
        let localUser = await selectUserByTelegramId(client, telegramUser.userId) as User;

        // If user doesn't exist - insert to db and create wallet
        if (!localUser) {
            logger.info(`Create new wallet for user: ${query.first_name} ${query.last_name}`);

            const wallet = generateWallet();
            const encryptedPrivateKey = encrypt(wallet.privateKey, {
                tgId: telegramUser.userId,
                secret: env.ENCRYPTION_SECRET,
                salt: wallet.privateKeySalt
            });

            const user: User = {
                tgUserId: telegramUser.userId,
                tgUsername: telegramUser.username,
                address: wallet.address,
                privateKey: encryptedPrivateKey.encryptedData,
                privateKeyIv: encryptedPrivateKey.iv,
                privateKeySalt: wallet.privateKeySalt
            };

            await insertUser(client, user);

            localUser = await selectUserByTelegramId(client, telegramUser.userId) as User;
        }

        const pubKey = getPublic(Buffer.from(sessionId, 'hex')).toString('hex');
        const existedSession = await selectSessionByPubKey(client, pubKey);

        if (existedSession) {
            return badRequest('Current session existed!');
        }

        // Save session privKey
        const currentTimestamp = getCurrentTimestampSeconds();
        const expiredTimestamp = currentTimestamp + parseInt(sessionLifetime);

        await insertSession(client, {
            userId: localUser.tgUserId,
            sessionPubKey: pubKey,
            sessionPrivKey: sessionId,
            sessionLifeTime: parseInt(sessionLifetime),
            sessionCreationTimestamp: currentTimestamp,
            sessionExpiredTimestamp: expiredTimestamp
        });

        logger.verbose(`Create new session for ${query.first_name} ${query.last_name}, pubKey: ${pubKey}`);

        await client.query('COMMIT');

        return success({ success: true });
    } catch (error) {
        await client.query('ROLLBACK');

        logError(error);

        return serverError('Bad auth!');
    } finally {
        client.release();
    }
};
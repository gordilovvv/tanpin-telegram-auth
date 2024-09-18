import { IRequest } from 'itty-router';
import { z } from 'zod';
import { env } from '@environment';
import { pool } from 'db/pool';
import { insertSession, selectSessionByPubKey } from 'db/session';
import { insertUser, selectUserByTelegramId } from 'db/user';
import { badRequest, serverError, success } from './response';
import { verifyTelegramAuth, TelegramAuthError } from 'lib/telegram';
import { encrypt } from 'lib/aes';
import { generateWallet } from 'utils/wallet';
import { parseSessionId, safeParseInt } from 'lib/format';
import { getCurrentTimestampSeconds } from 'utils/timestamp';
import { logError, logger } from 'utils/logger';

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
    const validation = validationSchema.safeParse(request.query);
    if (!validation.success) {
        return badRequest('Data are missing in the request!');
    }

    const { sessionId: rawSessionId, sessionLifetime: rawSessionLifetime, ...parsedQuery } = validation.data;
    const sessionId = parseSessionId(rawSessionId);
    if (!sessionId) {
        return badRequest('Invalid session id');
    }

    const sessionLifetime = safeParseInt(rawSessionLifetime);
    if (!sessionLifetime || sessionLifetime < 0) {
        return badRequest('Session lifetime is zero or smaller!');
    }

    logger(`[auth] request: ${JSON.stringify({ telegram_id: parsedQuery.id, username: parsedQuery.username })}`);
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const telegramUser = verifyTelegramAuth(parsedQuery);
        const user = await selectUserByTelegramId(client, telegramUser.id);
        if (!user) {
            const wallet = generateWallet();
            const encryptedPrivateKey = encrypt(wallet.privateKey, {
                tgId: telegramUser.id,
                secret: env.ENCRYPTION_SECRET,
                salt: wallet.privateKeySalt
            });

            await insertUser(client, {
                tgUserId: telegramUser.id,
                tgUsername: telegramUser.username,
                address: wallet.address,
                privateKey: encryptedPrivateKey.encryptedData,
                privateKeyIv: encryptedPrivateKey.iv,
                privateKeySalt: wallet.privateKeySalt
            });

            logger(`[auth] create new wallet for user: ${JSON.stringify({ telegram_id: parsedQuery.id, username: parsedQuery.username })}`);
        }

        const pubKey = getPublic(Buffer.from(sessionId, 'hex')).toString('hex');
        const existedSession = await selectSessionByPubKey(client, pubKey);

        if (existedSession) {
            return badRequest('Session existed!');
        }

        // Save session privKey
        const currentTimestamp = getCurrentTimestampSeconds();
        const expiredTimestamp = currentTimestamp + sessionLifetime;

        await insertSession(client, {
            userId: telegramUser.id,
            sessionPubKey: pubKey,
            sessionPrivKey: sessionId,
            sessionLifeTime: sessionLifetime,
            sessionCreationTimestamp: currentTimestamp,
            sessionExpiredTimestamp: expiredTimestamp
        });

        logger(`[auth] create new session for user: ${JSON.stringify({ telegram_id: parsedQuery.id, username: parsedQuery.username })}, pubKey: ${pubKey}`);
        await client.query('COMMIT');

        return success({ success: true });
    } catch (error) {
        await client.query('ROLLBACK');
        if (error instanceof TelegramAuthError) {
            return badRequest(error.message);
        }

        logError(error);
        return serverError('Failed to auth telegram');
    } finally {
        client.release();
    }
};
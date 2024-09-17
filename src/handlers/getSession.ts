import { IRequest } from 'itty-router';
import { env } from '@environment';
import { pool } from 'db/pool';
import { selectUserBySessionPubKey } from 'db/user';
import { deleteSessionByPubKey, selectSessionByPubKey } from 'db/session';
import { badRequest, serverError, success } from './response';
import { decrypt } from 'lib/aes';
import { parsePubKey } from 'lib/format';
import { getCurrentTimestampSeconds } from 'utils/timestamp';
import { logError } from 'utils/logger';

import { encryptData } from 'packages/tanpin-tg-cipher/cipher';

export const getSessionHandler = async (request: IRequest) => {
    const pubKey = parsePubKey(request.query.pubKey as string);
    if (!pubKey) {
        return badRequest('pubKey bad or empty!');
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const session = await selectSessionByPubKey(client, pubKey);
        if (!session) {
            return badRequest('Session invalid!');
        }

        const currentTimestamp = getCurrentTimestampSeconds();
        if (session.sessionExpiredTimestamp <= currentTimestamp) {
            await deleteSessionByPubKey(client, session.sessionPubKey);
            return badRequest('Session expired!');
        }

        const user = await selectUserBySessionPubKey(client, session.sessionPubKey);
        if (!user) {
            await deleteSessionByPubKey(client, session.sessionPubKey);
            return badRequest('Session unknown!');
        }

        const privateKey = decrypt(user.privateKey, user.privateKeyIv, {
            tgId: user.tgUserId,
            secret: env.ENCRYPTION_SECRET,
            salt: user.privateKeySalt
        });

        const encrypted = await encryptData(session.sessionPrivKey, {
            address: user.address,
            privateKey
        });

        await client.query('COMMIT');
        return success({ str: encrypted });
    } catch (error) {
        await client.query('ROLLBACK');
        logError(error);
        return serverError('Something failed!');
    } finally {
        client.release();
    }
};
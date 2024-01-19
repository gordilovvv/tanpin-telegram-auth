import { IRequest } from 'itty-router';
import { env } from '@environment';
import { pool } from 'db/pool';
import { selectUserBySessionPubKey } from 'db/user';
import { deleteSessionByPubKey, selectSessionByPubKey } from 'db/session';
import { badRequest, serverError, success } from './response';
import { decrypt } from 'lib/aes';
import { isHex } from 'viem';
import { getCurrentTimestampSeconds } from 'utils/timestamp';
import { logError } from 'utils/logger';

import { encryptData } from 'packages/tanpin-tg-cipher/cipher';

export const getSessionHandler = async (request: IRequest) => {
    const query = request.query as {
        pubKey: string
    };

    if (!query.pubKey || !isHex(`0x${query.pubKey}`)) {
        return badRequest('pubKey bad or empty!');
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const session = await selectSessionByPubKey(client, query.pubKey);

        if (!session) {
            return badRequest('Session unknown!');
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
            username: user.tgUsername,
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
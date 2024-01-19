import { IRequest } from 'itty-router';
import { z } from 'zod';
import { pool } from 'db/pool';
import { deleteSessionByPubKey, selectSessionByPubKey } from 'db/session';
import { badRequest, serverError, success } from './response';
import { verifySignature } from 'utils/signature';
import { logError, logger } from 'utils/logger';

// TODO: move to package
import { decryptData } from 'packages/tanpin-tg-cipher/cipher';

type RequestBody = {
    pubKey: string,
    str: string,
    signature: string
}

type SessionParams = {
    revoked?: boolean
}

const validationSchema = z.object({
    pubKey: z.string(),
    str: z.string(),
    signature: z.string()
});

/** Now only for revoke session! */
export const setSessionHandler = async (request: IRequest) => {
    const body = await request.json();
    const validation = validationSchema.safeParse(body);

    if (!validation.success) {
        return badRequest('Session data are missing!');
    }

    const client = await pool.connect();
    const { pubKey, str, signature } = body as RequestBody;

    logger.http(`Request to set session params for pubKey ${pubKey}`);

    try {
        await client.query('BEGIN');

        const session = await selectSessionByPubKey(client, pubKey);

        if (!session) {
            return badRequest('Unknown session!');
        }

        await verifySignature(
            str,
            session.sessionPubKey,
            signature
        );

        const { revoked, error } = await decryptData<SessionParams & { error?: string }>(
            session.sessionPrivKey,
            str
        );

        if (error) {
            throw new Error('Encrypt data was failed!');
        }

        // Revoke session
        if (revoked) {
            logger.info(`Delete session ${session.sessionPubKey}`);

            await deleteSessionByPubKey(client, session.sessionPubKey);
        }

        await client.query('COMMIT');

        return success({ success: true });
    } catch (error) {
        await client.query('ROLLBACK');

        logError(error);

        return serverError('Bad session!');
    } finally {
        client.release();
    }
};
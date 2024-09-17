import { IRequest } from 'itty-router';
import { parseJson } from './request';
import { badRequest, serverError, success } from './response';
import { z } from 'zod';
import { pool } from 'db/pool';
import { deleteSessionByPubKey, selectSessionByPubKey } from 'db/session';
import { parsePubKey } from 'lib/format';
import { verifySignature } from 'utils/signature';
import { logError, logger } from 'utils/logger';

// TODO: move to package
import { decryptData } from 'packages/tanpin-tg-cipher/cipher';

interface SessionParams {
    revoked?: boolean
}

const validationSchema = z.object({
    pubKey: z.string(),
    str: z.string(),
    signature: z.string()
});

/** Now only for revoke session! */
export const setSessionHandler = async (request: IRequest) => {
    const body = await parseJson(request);
    const validation = validationSchema.safeParse(body);
    if (!validation.success) {
        return badRequest('Session data are missing!');
    }

    const pubKey = parsePubKey(validation.data.pubKey);
    if (!pubKey) {
        return badRequest('Invalid pub key!');
    }

    const { str, signature } = validation.data;
    const client = await pool.connect();

    logger(`[session] request to set session params for pubKey ${pubKey}`);

    try {
        const session = await selectSessionByPubKey(client, pubKey);
        if (!session) {
            return badRequest('Invalid session!');
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
            return badRequest('Bad session!');
        } else if (revoked) {
            logger(`[session] delete session ${session.sessionPubKey}`);
            await deleteSessionByPubKey(client, session.sessionPubKey);
        }

        return success({ success: true });
    } catch (error) {
        logError(error);
        return serverError('Failed to set session');
    } finally {
        client.release();
    }
};
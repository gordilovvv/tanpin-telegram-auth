import cron from 'node-cron';
import { pool } from 'db/pool';
import { deleteSessionByPubKey, selectExpiredSessions } from 'db/session';
import { getCurrentTimestampSeconds } from 'utils/timestamp';
import { logger } from 'utils/logger';

const cleanSessions = async () => {
    logger('[session] cleaner have been started at 00:00!');

    const client = await pool.connect();

    try {
        const currentTimestamp = getCurrentTimestampSeconds();
        const expiredSessions = await selectExpiredSessions(client, currentTimestamp);
        if (!expiredSessions.length) {
            return;
        }

        logger(`[session] sessions Cleaner found ${expiredSessions.length} expired sessions!`);

        await client.query('BEGIN');

        for (const session of expiredSessions) {
            await deleteSessionByPubKey(client, session.sessionPubKey);
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
    } finally {
        client.release();
    }
};

export const startSessionsCleaner = () => {
    const everyDayAtMidnight = '0 0 * * *';
    cron.schedule(everyDayAtMidnight, cleanSessions);
};
import { PoolClient } from 'pg';
import format from 'pg-format';

export type Session = {
    userId: string,
    sessionPubKey: string,
    sessionPrivKey: string,
    sessionLifeTime: number,
    sessionCreationTimestamp: number,
    sessionExpiredTimestamp: number
}

export type SessionStorage = {
    user_id: string,
    session_pub_key: string,
    session_priv_key: string,
    session_lifetime: number,
    session_creation_timestamp: number,
    session_expired_timestamp: number
}

export const toRowStorage = (session: Session) => {
    const sessionStorage: SessionStorage = {
        user_id: session.userId,
        session_pub_key: session.sessionPubKey,
        session_priv_key: session.sessionPrivKey,
        session_lifetime: session.sessionLifeTime,
        session_creation_timestamp: session.sessionCreationTimestamp,
        session_expired_timestamp: session.sessionExpiredTimestamp
    };

    return sessionStorage;
};

export const fromRowStorage = (sessionStorage: SessionStorage) => {
    const session: Session = {
        userId: sessionStorage.user_id,
        sessionPubKey: sessionStorage.session_pub_key,
        sessionPrivKey: sessionStorage.session_priv_key,
        sessionLifeTime: sessionStorage.session_lifetime,
        sessionCreationTimestamp: sessionStorage.session_creation_timestamp,
        sessionExpiredTimestamp: sessionStorage.session_expired_timestamp
    };

    return session;
};

export const selectSessionByPubKey = async (client: PoolClient, sessionPubKey: string) => {
    const session = await client.query<SessionStorage>(format('SELECT * FROM sessions WHERE session_pub_key = %L;', sessionPubKey), []);

    if (session.rows.length) {
        return fromRowStorage(session.rows[0]);
    }

    return undefined;
};

export const selectSessionByPrivKey = async (client: PoolClient, sessionPrivKey: string) => {
    const session = await client.query<SessionStorage>(format('SELECT * FROM sessions WHERE session_priv_key = %L;', sessionPrivKey), []);

    if (session.rows.length) {
        return fromRowStorage(session.rows[0]);
    }

    return undefined;
};

export const selectSessionsByUserId = async (client: PoolClient, userId: string) => {
    const sessions = await client.query<SessionStorage>(format('SELECT * FROM sessions WHERE user_id = %L;', userId), []);

    return sessions.rows.map(fromRowStorage);
};

export const insertSession = async (client: PoolClient, session: Session) => {
    const sessionStorage = toRowStorage(session);

    /* eslint-disable @typescript-eslint/indent */
    await client.query(format(`
    INSERT INTO sessions (
        user_id,
        session_pub_key,
        session_priv_key,
        session_lifetime,
        session_creation_timestamp,
        session_expired_timestamp
    ) VALUES (%L, %L, %L, %L, %L, %L) ON CONFLICT DO NOTHING;`,
        sessionStorage.user_id,
        sessionStorage.session_pub_key,
        sessionStorage.session_priv_key,
        sessionStorage.session_lifetime,
        sessionStorage.session_creation_timestamp,
        sessionStorage.session_expired_timestamp
    ));
    /* eslint-enable @typescript-eslint/indent */
};

export const deleteSessionByPubKey = async (client: PoolClient, sessionPubKey: string) => {
    return client.query(format('delete from sessions where session_pub_key = %L', [sessionPubKey]), []);
};
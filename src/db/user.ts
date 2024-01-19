import { PoolClient } from 'pg';
import format from 'pg-format';
import { Address } from 'viem';

export type User = {
    tgUserId: string,
    tgUsername: string,
    address: Address,
    privateKey: string,
    privateKeyIv: string,
    privateKeySalt: string
}

export type UserStorage = {
    tg_user_id: string,
    tg_username: string,
    address: string,
    private_key: string,
    private_key_iv: string,
    private_key_salt: string
}

export const toRowStorage = (user: User) => {
    const userStorage: UserStorage = {
        tg_user_id: user.tgUserId,
        tg_username: user.tgUsername,
        address: user.address,
        private_key: user.privateKey,
        private_key_iv: user.privateKeyIv,
        private_key_salt: user.privateKeySalt
    };

    return userStorage;
};

export const fromRowStorage = (userStorage: UserStorage) => {
    const user: User = {
        tgUserId: userStorage.tg_user_id,
        tgUsername: userStorage.tg_username,
        address: userStorage.address as Address,
        privateKey: userStorage.private_key,
        privateKeyIv: userStorage.private_key_iv,
        privateKeySalt: userStorage.private_key_salt
    };

    return user;
};

export const selectUserBySessionPubKey = async (client: PoolClient, sessionPubKey: string) => {
    const users = await client.query<UserStorage & { id: string }>(format(`
        SELECT users.*
        FROM users
        INNER JOIN sessions ON users.tg_user_id = sessions.user_id
        WHERE sessions.session_pub_key = %L;
    `, sessionPubKey), []);

    if (users.rows.length) {
        return fromRowStorage(users.rows[0]);
    }

    return undefined;
};

export const selectUserByTelegramId = async (client: PoolClient, telegramUserId: string) => {
    const users = await client.query<UserStorage>(format('SELECT * FROM users WHERE tg_user_id = %L;', telegramUserId), []);

    if (users.rows.length) {
        return fromRowStorage(users.rows[0]);
    }

    return undefined;
};

export const insertUser = async (client: PoolClient, user: User) => {
    const userStorage = toRowStorage(user);

    /* eslint-disable @typescript-eslint/indent */
    await client.query(format(`
    INSERT INTO users (
        tg_user_id,
        tg_username,
        address,
        private_key,
        private_key_iv,
        private_key_salt
    ) VALUES (%L, %L, %L, %L, %L, %L) ON CONFLICT DO NOTHING;`,
        userStorage.tg_user_id,
        userStorage.tg_username,
        userStorage.address,
        userStorage.private_key,
        userStorage.private_key_iv,
        userStorage.private_key_salt
    ), []);
    /* eslint-enable @typescript-eslint/indent */
};
import { env } from '@environment';
import pg from 'pg';

Object.defineProperties(BigInt.prototype, {
    toJSON: {
        value: function (this: bigint) {
            return this.toString();
        },
    },
});

const connectionString = `postgresql://${env.PGUSER}:${env.PGPASSWORD}@${env.PGHOST}:${env.PGPORT}/${env.PGDATABASE}?schema=public`;

export const pool = new pg.Pool({
    max: 1,
    min: 0,
    idleTimeoutMillis: 120_000,
    connectionTimeoutMillis: 10_000,
    connectionString,
});
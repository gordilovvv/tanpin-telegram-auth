import { Client } from 'memjs';
import { env } from 'environment';

const connectionString = `${env.MEMCACHED_HOST}:${env.MEMCACHED_PORT}`;

export const memcachedClient = Client.create(connectionString, {
    timeout: 5_000
});

memcachedClient.stats((error) => {
    if (error) {
        Promise.reject(error);
    }
});
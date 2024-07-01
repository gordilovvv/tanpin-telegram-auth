import { memcachedClient as client } from './client';

type CacheOptions = {
    expires: number
}

export type MemcachedMap<K, V> = {
    set(key: K, value: V): Promise<void>
    get(key: K): Promise<V | null>
    has(keY: K): Promise<boolean>
    delete(key: K): Promise<void>
}

export const createMemcachedMap = <V>(cachePrefix: string, options: CacheOptions): MemcachedMap<string, V> => {
    const createKey = (key: string) => `${cachePrefix}:${key}`;

    const set = async (key: string, value: V) => {
        const cacheKey = createKey(key);
        const preparedValue = JSON.stringify(value);

        await client.set(cacheKey, preparedValue, { expires: options.expires });
    };

    const get = async (key: string): Promise<V | null> => {
        const cacheKey = createKey(key);
        const value = await client.get(cacheKey);

        return value.value
            ? JSON.parse(value.value.toString()) as V
            : null;
    };

    const has = async (key: string): Promise<boolean> => {
        const cacheKey = createKey(key);
        const result = await client.get(cacheKey);

        return !!result.value;
    };

    const deleteKey = async (key: string) => {
        const cacheKey = createKey(key);

        client.delete(cacheKey);
    };

    return {
        has,
        set,
        get,
        delete: deleteKey
    };
};

export const createNumberMemcachedMap = (cachePrefix: string, options: CacheOptions) => {
    const createKey = (key: string) => `${cachePrefix}:${key}`;

    const set = async (key: string, value: number) => {
        const cacheKey = createKey(key);
        await client.set(cacheKey, value.toString(), { expires: options.expires });
    };

    const get = async (key: string): Promise<number | null> => {
        const cacheKey = createKey(key);
        const value = await client.get(cacheKey);

        return value.value
            ? parseFloat(value.value.toString())
            : null;
    };

    const increment = async (key: string, amount: number = 1): Promise<number | null | undefined> => {
        const cacheKey = createKey(key);
        const result = await client.increment(cacheKey, amount, { initial: 0 });

        return result.value;
    };

    const decrement = async (key: string, amount: number = 1): Promise<number | null | undefined> => {
        const cacheKey = createKey(key);
        const result = await client.decrement(cacheKey, amount, { initial: 0 });

        return result.value;
    };

    return {
        set,
        get,
        increment,
        decrement
    };
};
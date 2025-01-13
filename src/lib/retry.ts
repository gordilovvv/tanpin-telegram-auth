import pRetry from 'p-retry';
import { sleep } from './promise';

const is429Error = (error: any) => {
    return (
        error?.response?.statusCode === 429 ||
        error?.code === 'ETELEGRAM' && error?.response?.body?.error_code === 429
    );
};

const getRetryAfter = (error: any): number | undefined => {
    return error?.response?.body?.parameters?.retry_after;
};

export const withRetry = <T>(fn: () => Promise<T>): Promise<T> => {
    return pRetry(fn, {
        retries: 1,
        onFailedAttempt: async (error) => {
            if (is429Error(error)) {
                const retryAfter = getRetryAfter(error);
                if (retryAfter && retryAfter > 0 && retryAfter < 600) {
                    console.warn(`Got 429 Too Many Requests. Wait ${retryAfter} seconds...`);
                    await sleep(retryAfter * 1_000);
                    return;
                }
            }

            throw error;
        },
    });
};
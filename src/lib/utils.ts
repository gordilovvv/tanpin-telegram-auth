import TelegramBot from 'node-telegram-bot-api';
import pRetry from 'p-retry';
import PQueue from 'p-queue';
import { bot } from '../bot/bot';
import { sleep } from 'lib/promise';

export const telegramLoginUrl = (url: string, tanpinHash?: string) => {
    const parsedUrl = new URL(url);
    if (tanpinHash) {
        parsedUrl.searchParams.append('tanpin_hash', tanpinHash);
    }
    return parsedUrl.toString();
};

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
                if (retryAfter && retryAfter > 0 && retryAfter < 360) {
                    console.warn(`Got 429 Too Many Requests. Wait ${retryAfter} seconds...`);
                    await sleep(retryAfter * 1_000);
                }
            }

            throw error;
        },
    });
};

export const queue = new PQueue({
    interval: 60,
    intervalCap: 1_000
});

export async function sendMessageWithRetry(
    chatId: number | string,
    text: string,
    options?: TelegramBot.SendMessageOptions
) {
    return queue.add(
        () => withRetry(
            () => bot.sendMessage(chatId, text, options)
        )
    );
}

const uploadedFiles: Record<string, string | undefined> = {};

export async function sendPhotoWithRetry(
    chatId: number | string,
    photo: string | Buffer,
    options?: TelegramBot.SendPhotoOptions,
    fileOptions?: TelegramBot.FileOptions
) {
    const filename = fileOptions?.filename;
    const fileId = filename ? uploadedFiles[filename] : undefined;

    const image = fileId || photo;
    const res = await queue.add(
        () => withRetry(
            () => bot.sendPhoto(chatId, image, options, fileOptions)
        )
    );

    if (!fileId && filename) {
        const uploadedFileId = res.photo?.[res.photo.length - 1]?.file_id;
        uploadedFiles[filename] = uploadedFileId;
    }

    return res;
}
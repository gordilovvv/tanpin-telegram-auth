import TelegramBot from 'node-telegram-bot-api';
import PQueue from 'p-queue';
import { withRetry } from 'lib/retry';

export const queue = new PQueue({
    interval: 60,
    intervalCap: 1_000
});

export async function sendMessageWithRetry(
    bot: TelegramBot,
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
    bot: TelegramBot,
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
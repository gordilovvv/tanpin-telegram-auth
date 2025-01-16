import { Client } from 'pg';
import { config } from 'dotenv';
import format from 'pg-format';
import PQueue from 'p-queue';
import TelegramBot from 'node-telegram-bot-api';
import { safeParseInt } from 'lib/format';
import { withRetry } from '../lib/retry';
import path from 'path';
import fs from 'fs';

config({ path: path.resolve(__dirname, '../../.env.scripts') });

type Bot = 'nft' | 'play' | 'auth';
const BOTS: Bot[] = ['nft', 'play', 'auth'];

const MESSAGE: {
    photo: { file: Buffer, fileId?: string | undefined, filename: string, contentType: string },
    caption: string,
    options: TelegramBot.SendPhotoOptions
} = {
    photo: { file: fs.readFileSync('assets/season_2.png'), filename: 'season_2.png', contentType: 'image/png' },
    caption: '*Tanpin Сезон 2 уже идет 🎉*\n\nУчаствуй в ежедневных розыгрышах и получай крутые призы: Telegram Premium, Black Coins, Boost Glasses, Punker и многие другие.\n\nХочешь большего? Поборись за супер приз от Tanpin и Black Russia в финале.',
    options: {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: 'Участвовать ❤️‍🔥', url: 'https://t.me/TanpinNftBot?start=' }
                ]
            ]
        }
    }
};

function help() {
    console.log('pnpm run process-broadcast {bot} {offset?}');
}

async function main() {
    // argv[0]: ts-node
    // argv[1]: process-broadcast.ts
    // argv[2]: {bot}
    // argv[3]: {offset}
    if (process.argv.length < 3) {
        console.error('Missing arguments');
        return help();
    }

    const bot: Bot = process.argv[2] as Bot;
    if (!BOTS.includes(bot)) {
        throw new Error(`Available bots: ${BOTS.join(', ')}`);
    }

    console.log(`[broadcast] started for bot 🤖 ${bot}`);

    const getTelegramBotUsers = async (limit: number, offset: number) => {
        const client = new Client({
            user: process.env.PGUSER,
            host: process.env.PGHOST,
            database: process.env.PGDATABASE,
            password: process.env.PGPASSWORD,
            port: Number(process.env.PGPORT)
        });

        try {
            await client.connect();
            const result = await client.query<{ telegram_id: string }>(
                format(
                    `
                    SELECT telegram_id
                    FROM telegram_accounts
                    ORDER BY created_at DESC
                    LIMIT %L OFFSET %L
                    `,
                    limit,
                    offset
                )
            );
            return result.rows;
        } catch (error: any) {
            console.error(`[season-pass-db] error ${error.message}`);
            throw error;
        } finally {
            await client.end();
        }
    };

    const getTelegramAuthUsers = async (limit: number, offset: number) => {
        const client = new Client({
            user: process.env.TELEGRAM_PGUSER,
            host: process.env.TELEGRAM_PGHOST,
            database: process.env.TELEGRAM_PGDATABASE,
            password: process.env.TELEGRAM_PGPASSWORD,
            port: Number(process.env.TELEGRAM_PGPORT)
        });

        try {
            await client.connect();
            const result = await client.query<{ telegram_id: string }>(
                format(
                    `
                    SELECT tg_user_id as telegram_id
                    FROM users
                    ORDER BY tg_user_id ASC
                    LIMIT %L OFFSET %L
                    `,
                    limit,
                    offset
                )
            );
            return result.rows;
        } catch (error: any) {
            console.error(`[telegram-auth-db] error ${error.message}`);
            throw error;
        } finally {
            await client.end();
        }
    };

    let offset = safeParseInt(process.argv[3]) || 0;
    const limit = 100;
    const queue = new PQueue({ interval: 1_100, intervalCap: 20 });

    const token = bot === 'nft' ? process.env.NFT_BOT_TOKEN : bot === 'auth' ? process.env.AUTH_BOT_TOKEN : process.env.PLAY_BOT_TOKEN;
    const botApi = new TelegramBot(token!, { webHook: false, polling: false });

    // eslint-disable-next-line no-constant-condition
    while (true) {
        console.log(`[broadcast] fetch users from ${offset} to ${offset + limit} > ${new Date().toISOString()}`);
        const users = bot === 'auth'
            ? await getTelegramAuthUsers(limit, offset)
            : await getTelegramBotUsers(limit, offset);

        if (users.length === 0) {
            console.log(`[broadcast] no users from ${offset} to ${offset + limit}`);
            break;
        }

        for (const user of users) {
            try {
                const hrstart = process.hrtime();
                await queue.add(async () => {
                    return withRetry(async () => {
                        const res = await botApi.sendPhoto(user.telegram_id, MESSAGE.photo.fileId || MESSAGE.photo.file, {
                            caption: MESSAGE.caption,
                            parse_mode: 'Markdown',
                            ...MESSAGE.options
                        }, { filename: MESSAGE.photo.filename, contentType: MESSAGE.photo.contentType });

                        if (!MESSAGE.photo.fileId) {
                            const uploadedFileId = res.photo?.[res.photo.length - 1]?.file_id;
                            MESSAGE.photo.fileId = uploadedFileId;
                        }

                        return res;
                    });
                });

                const hrend = process.hrtime(hrstart);
                console.log(
                    `Message to user ${user.telegram_id} has been sent for %ds %dms`,
                    hrend[0],
                    hrend[1] / 1000000,
                );
            } catch (error: any) {
                console.error(`[broadcast] failed to send message to user ${user.telegram_id}`, error.message);
            }
        }

        offset += limit;
    }

    console.log(`[broadcast] broadcast finished > ${new Date().toISOString()}`);
}

main()
    .then(() => {
        process.exit(0);
    })
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
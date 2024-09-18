import { IRequest, error, json } from 'itty-router';
import TelegramBot, { Update } from 'node-telegram-bot-api';
import { authMessage, startImage, startMessage } from 'messages';
import PQueue from 'p-queue';
import pRetry from 'p-retry';
import { logger } from 'logger';
import { env } from 'environment';

const bot = new TelegramBot(env.TELEGRAM_BOT_TOKEN);

const queue = new PQueue({
    interval: parseInt(env.TELEGRAM_API_INTERVAL),
    intervalCap: parseInt(env.TELEGRAM_API_INTERVAL_CAP)
});

/** Ссылка на авторизацию Telegram webview */
const telegramLoginUrl = (url: string, tanpinHash?: string) => {
    const parsedUrl = new URL(url);
    if (tanpinHash) {
        parsedUrl.searchParams.append('tanpin_hash', tanpinHash);
    }
    return parsedUrl.toString();
};

export const runBot = () => {
    bot.setWebHook(`${env.APP_URL}/bot${env.TELEGRAM_WEB_HOOK_SECRET}`);
    bot.setMyCommands([
        { command: 'start', description: 'Start' },
    ]);

    // Обработка команды start
    bot.onText(/\/start ?(.*)?/, (msg, match) => {
        const chatId = msg.chat.id;
        const startParam = match?.[1];

        queue.add(() => {
            return pRetry(async () => {
                if (startParam?.length === 64) {
                    const tanpinHash = startParam;
                    return bot.sendMessage(chatId, authMessage(msg.from?.username, msg.from?.first_name), {
                        parse_mode: 'Markdown',
                        disable_web_page_preview: false,
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    {
                                        text: '✈️ Войти с Telegram',
                                        login_url: {
                                            url: telegramLoginUrl(env.TANPIN_AUTH_SYNC_URL, tanpinHash),
                                            bot_username: env.TELEGRAM_BOT_USERNAME,
                                            forward_text: 'Чужой котик 🐾',
                                            request_write_access: true
                                        }
                                    }
                                ]
                            ]
                        }
                    });
                }

                return bot.sendPhoto(chatId, startImage.data, {
                    caption: startMessage(msg.from?.username, msg.from?.first_name),
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: '🚀 Войти на Tanpin',
                                    login_url: {
                                        url: telegramLoginUrl(env.TANPIN_LOGIN_URL),
                                        bot_username: env.TELEGRAM_BOT_USERNAME,
                                        forward_text: 'Что такое Tanpin ? 💚',
                                        request_write_access: true
                                    }
                                },
                            ],
                            [
                                {
                                    text: '🐱 Играть',
                                    web_app: {
                                        url: env.TANPIN_MINI_APP_URL
                                    }
                                },
                                {
                                    text: '💚 Канал',
                                    url: 'https://t.me/tanpin_ru'
                                }
                            ]
                        ]
                    }
                }, startImage.options);
            }, {
                retries: 2,
                minTimeout: 100,
                maxTimeout: 500
            });
        });
    });
};

export const webhookHandler = async (request: IRequest) => {
    try {
        const body = await request.json() as Request;

        if ('update_id' in body) {
            const update = body as Update;

            logger(`bot start command ${update.message?.from?.username || update.message?.from?.first_name || 'unknown user'}`);
            bot.processUpdate(update);
        } else {
            return error(400, { error: 'invalid' });
        }

        return json({ ok: true }, { status: 200 });
    } catch (err: any) {
        logger(`🔴 bot error: ${err.message}`);
        console.error(err);
        return error(500, 'failed');
    }
};
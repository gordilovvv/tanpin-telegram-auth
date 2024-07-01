import { IRequest, error, json } from 'itty-router';
import TelegramBot, { Update } from 'node-telegram-bot-api';
import { createLoginUrl, parseReferralCode, parseRedirectHash, parseAuthSecret } from 'utils';
import { generateTelegramRedirectHash, getRedirectUrlByHash, parseTelegramRedirectUrl } from 'redirect';
import { logError, logger } from 'logger';
import { env } from 'environment';
import PQueue from 'p-queue';
import fs from 'fs';

const bot = new TelegramBot(env.BOT_TOKEN);

const startMessage = (username?: string, firstName?: string) => {
    const hello = username
        ? `Привет, @${username} 👋`
        : firstName
            ? `Привет, ${firstName} 👋`
            : 'Привет 👋';

    return `${hello}\n\nДобро пожаловать в Tanpin — платформу нового поколения, которая соединяет игры с миром блокчейна!\n\nУже скоро ты сможешь окунуться в мир уникальных предметов BlackRussia!\n\nНажми на кнопку ниже, чтобы войти на Tanpin.`;
};

const image = fs.readFileSync(env.START_PROMO_IMAGE);
const imageOptions = {
    filename: 'start-promo.jpeg',
    contentType: 'image/jpeg'
};

const queue = new PQueue({
    interval: parseInt(env.TELEGRAM_API_INTERVAL),
    intervalCap: parseInt(env.TELEGRAM_API_INTERVAL_CAP)
});

export const startBot = () => {
    bot.setWebHook(`${env.APP_URL}/bot${env.TELEGRAM_WEB_HOOK_SECRET}`);
    bot.setMyCommands([
        { command: 'start', description: 'Начать' }
    ]);

    bot.onText(/^\/start(?:\s(.*))?$/, (msg, match) => {
        const chatId = msg.chat.id;
        const redirectHash = parseRedirectHash(match);
        const referralCode = parseReferralCode(match);
        const authSecret = parseAuthSecret(match);

        queue.add(async () => {
            try {
                const redirectUrl = redirectHash
                    ? await getRedirectUrlByHash(redirectHash)
                    : null;

                console.log(`${msg?.from?.username || msg?.from?.first_name || 'unknown user'} request ${JSON.stringify({
                    redirectHash,
                    redirectUrl,
                    referralCode,
                    authSecret
                })}`);

                await bot.sendPhoto(chatId, image, {
                    caption: startMessage(msg.from?.username, msg.from?.first_name),
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: '🚀 Войти с Telegram',
                                    login_url: {
                                        url: createLoginUrl(
                                            env.TELEGRAM_LOGIN_URL,
                                            redirectUrl || undefined,
                                            referralCode,
                                            authSecret
                                        )
                                    }
                                }
                            ],
                            [
                                {
                                    text: '💚 Сообщество Tanpin',
                                    url: env.TELEGRAM_RU_CHANNEL_URL
                                }
                            ]
                        ]
                    }
                }, imageOptions);
            } catch (error) {
                logError(error);
            }
        });
    });
};

export const webhookHandler = async (request: IRequest) => {
    try {
        const body = await request.json() as Request;

        if ('update_id' in body) {
            const update = body as Update;

            logger.info(`bot start command ${update.message?.from?.username || update.message?.from?.first_name || 'unknown user'}`);
            bot.processUpdate(update);
        } else {
            logger.warn(body);
            return error(400, { error: 'invalid' });
        }

        return json({ ok: true }, { status: 200 });
    } catch (err) {
        logError(err);
        return error(500, 'failed');
    }
};

export const getTelegramRedirectHashHandler = async (request: IRequest) => {
    const parsedUrl = parseTelegramRedirectUrl(request.query.url);
    if (!parsedUrl) {
        return error(400, { error: 'Invalid url' });
    }

    try {
        const hash = await generateTelegramRedirectHash(parsedUrl);
        return json({ h: hash });
    } catch (e) {
        logError(e);
        return error(500, { error: 'Something failed' });
    }
};
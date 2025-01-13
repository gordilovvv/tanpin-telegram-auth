import fs from 'fs';
import { sendMessageWithRetry, sendPhotoWithRetry, telegramLoginUrl } from '../lib/utils';
import { MESSAGE } from './message';
import { env } from 'environment';
import { bot } from './bot';

if (env.TELEGRAM_WEBHOOK === 'true') {
    bot.setWebHook(`${env.APP_URL}/bot${env.TELEGRAM_WEB_HOOK_SECRET}`);
}

bot.setMyCommands([
    { command: 'start', description: 'Let\'s go 🎉' },
    { command: 'dice', description: 'Play dice 🎲' },
    { command: 'help', description: 'Guide' },
    { command: 'support', description: 'Support ' },
]);

const startImage = {
    name: 'start.png',
    type: 'image/png',
    file: fs.readFileSync('assets/start.png')
} as const;

bot.onText(/^\/start(?:\s(.*))?$/, async (msg, match) => {
    try {
        const chatId = msg.chat.id;
        const startParam = match?.[1];

        if (startParam?.length === 64) {
            const tanpinHash = startParam;
            await sendMessageWithRetry(chatId, MESSAGE.START_AUTH, {
                disable_web_page_preview: false,
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: '✈️ Войти с Telegram',
                                login_url: {
                                    url: telegramLoginUrl(env.TANPIN_AUTH_SYNC_URL, tanpinHash),
                                    request_write_access: true
                                }
                            }
                        ]
                    ]
                }
            });
            return;
        }

        await sendPhotoWithRetry(chatId, startImage.file, {
            caption: MESSAGE.START(msg.from?.username),
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: 'Маркет 💸',
                            login_url: {
                                url: telegramLoginUrl(env.TANPIN_LOGIN_URL),
                                forward_text: 'Что такое Tanpin ? 💚',
                                request_write_access: true
                            }
                        },
                        {
                            text: 'Канал 💬',
                            url: 'https://t.me/tanpin_ru'
                        }
                    ],
                    [
                        {
                            text: 'Розыгрыши 🎟️',
                            web_app: {
                                url: env.TANPIN_MINI_APP_URL
                            }
                        },
                    ]
                ]
            }
        }, { filename: startImage.name, contentType: startImage.type });
    } catch (error: any) {
        console.error('[bot] failed to send /start message', error.message);
    }
});

const guidePhoto = {
    name: 'guide.png',
    type: 'image/png',
    file: fs.readFileSync('assets/guide.png')
} as const;

bot.onText(/\/help/, (msg) => {
    try {
        return sendPhotoWithRetry(msg.chat.id, guidePhoto.file, {
            caption: MESSAGE.GUIDE,
            parse_mode: 'Markdown'
        }, { filename: guidePhoto.name, contentType: guidePhoto.type });
    } catch (error: any) {
        console.error('[bot] failed to send /start message', error.message);
    }
});

bot.onText(/\/dice/, (msg) => {
    return sendMessageWithRetry(msg.chat.id, 'Хочешь больше билетов для лоттерей? И другие игроки хотят тоже 🥷\n\nЗаходи в кости, побеждай и выигрывай билеты у других игроков.\n\n@tanpin_dice_bot', {
        parse_mode: 'Markdown'
    });
});


bot.onText(/\/support/, (msg) => {
    return sendMessageWithRetry(msg.chat.id, 'Появилась проблема? Есть идея или вопрос?\n\n@tanpin_market_support');
});
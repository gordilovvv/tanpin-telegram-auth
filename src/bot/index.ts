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
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: 'Маркет 💸',
                            login_url: {
                                url: telegramLoginUrl(env.TANPIN_LOGIN_URL),
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

bot.onText(/\/help/, async (msg) => {
    try {
        await sendPhotoWithRetry(msg.chat.id, guidePhoto.file, {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: 'Маркет 💸',
                            login_url: {
                                url: telegramLoginUrl(env.TANPIN_LOGIN_URL),
                                request_write_access: true
                            }
                        },
                        {
                            text: 'Билеты 🎟️',
                            web_app: {
                                url: env.TANPIN_MINI_APP_URL
                            }
                        },
                    ],
                    [
                        {
                            text: 'Полный гайд 🎓',
                            url: 'https://zest-caraway-315.notion.site/Tanpin-1560fa60092280cfa697e50cef4c44c8?pvs=74'
                        },
                    ]
                ]
            },
            caption: MESSAGE.GUIDE,
            parse_mode: 'Markdown'
        }, { filename: guidePhoto.name, contentType: guidePhoto.type });
    } catch (error: any) {
        console.error('[bot] failed to send /help message', error.message);
    }
});

bot.onText(/\/dice/, async (msg) => {
    try {
        await sendMessageWithRetry(msg.chat.id, MESSAGE.DICE, {
            parse_mode: 'HTML'
        });
    } catch (error: any) {
        console.error('[bot] failed to send /dice message', error.message);
    }
});


bot.onText(/\/support/, async (msg) => {
    try {
        await sendMessageWithRetry(msg.chat.id, MESSAGE.SUPPORT, {
            parse_mode: 'HTML'
        });
    } catch (error: any) {
        console.error('[bot] failed to send /support message', error.message);
    }
});
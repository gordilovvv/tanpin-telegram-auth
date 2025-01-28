import fs from 'fs';
import TelegramBot from 'node-telegram-bot-api';
import { botAuth, botPlay } from './bots';
import { sendPhotoWithRetry } from './utils';

const message = '<b>Офицальный Tanpin бот переехал 🗺️</b>\n\nМаркетплейс и коллекция Black Russia уже там.\n\nХочешь выиграть призы от Tanpin и Black Russia? Розыгрыши ждут тебя!\n\nНажимай на кнопку ниже и переходи в нового бота👇';

const image1 = {
    name: 'new_bot_1.png',
    type: 'image/png',
    file: fs.readFileSync('assets/new_bot.png')
} as const;

const image2 = {
    name: 'new_bot_2.png',
    type: 'image/png',
    file: fs.readFileSync('assets/new_bot.png')
} as const;

const handler = async (msg: TelegramBot.Message, bot: TelegramBot, type: 'play' | 'auth') => {
    const chatId = msg.chat.id;
    const image = type === 'play' ? image1 : image2;
    await sendPhotoWithRetry(bot, chatId, image.file, {
        caption: message,
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'Начать',
                        url: 'https://t.me/TanpinNftBot?start='

                    }
                ]
            ]
        }
    }, { filename: image.name, contentType: image.type });
};

botPlay.setMyCommands([{ command: 'start', description: 'Начать' }]);
botAuth.setMyCommands([{ command: 'start', description: 'Начать' }]);

botPlay.onText(/^\/start(?:\s(.*))?$/, async (msg) => {
    try {
        await handler(msg, botPlay, 'play');
    } catch (error: any) {
        console.error('[fallback-play-bot] failed to send /start message', error.message);
    }
});

botAuth.onText(/^\/start(?:\s(.*))?$/, async (msg) => {
    try {
        await handler(msg, botAuth, 'auth');
    } catch (error: any) {
        console.error('[fallback-auth-bot] failed to send /start message', error.message);
    }
});
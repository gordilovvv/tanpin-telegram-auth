import fs from 'fs';
import TelegramBot from 'node-telegram-bot-api';
import { botAuth, botPlay } from './bots';
import { sendPhotoWithRetry } from './utils';

const message = '*Офицальный Tanpin бот переехал 🗺️*\n\nМаркетплейс и коллекция Black Russia уже там.\n\nХочешь выиграть призы от Tanpin и Black Russia? Розыгрыши ждут тебя!\n\nНажимай на кнопку ниже и переходи в нового бота👇';

const mapImage = {
    name: 'new_bot.png',
    type: 'image/png',
    file: fs.readFileSync('assets/new_bot.png')
} as const;

const handler = async (msg: TelegramBot.Message, bot: TelegramBot) => {
    const chatId = msg.chat.id;
    await sendPhotoWithRetry(bot, chatId, mapImage.file, {
        caption: message,
        parse_mode: 'Markdown',
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
    });
};

botPlay.setMyCommands([{ command: 'start', description: 'Начать' }]);
botAuth.setMyCommands([{ command: 'start', description: 'Начать' }]);

botPlay.onText(/^\/start(?:\s(.*))?$/, async (msg) => {
    return handler(msg, botPlay);
});

botAuth.onText(/^\/start(?:\s(.*))?$/, async (msg) => {
    return handler(msg, botAuth);
});
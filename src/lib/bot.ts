import TelegramBot from 'node-telegram-bot-api';
import { BOT_TOKEN, START_PROMO_IMAGE, TELEGRAM_LOGIN_URL } from '../config';
import fs from 'fs';

export const bot = new TelegramBot(BOT_TOKEN, {
    polling: true
});

const startMessage = (username?: string) => `
Привет, @${username} 👋

Добро пожаловать в Tanpin — платформу нового поколения, которая соединяет игры с миром блокчейна!

Уже скоро ты сможешь окунуться в мир уникальных предметов BlackRussia!

Нажми на кнопку ниже, чтобы войти на Tanpin.
`;

export const startBot = () => {
    bot.setMyCommands([
        { command: 'start', description: 'Начать' }
    ]);

    bot.onText(/\/start/, (msg) => {
        const chatId = msg.chat.id;

        bot.sendPhoto(chatId, fs.readFileSync(START_PROMO_IMAGE), {
            caption: startMessage(msg.from?.username),
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '🚀 Войти с Telegram',
                            login_url: {
                                url: TELEGRAM_LOGIN_URL
                            }
                        }
                    ]
                ]
            }
        });
    });
};
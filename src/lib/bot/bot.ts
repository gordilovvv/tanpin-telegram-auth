import TelegramBot from 'node-telegram-bot-api';
import { env } from '@environment';
import fs from 'fs';

const bot = new TelegramBot(env.BOT_TOKEN, {
    polling: true
});

const startMessage = (username?: string, firstName?: string) => {
    const hello = username
        ? `Привет, @${username} 👋`
        : firstName
            ? `Привет, ${firstName} 👋`
            : 'Привет 👋';

    return `${hello}\n\nДобро пожаловать в Tanpin — платформу нового поколения, которая соединяет игры с миром блокчейна!\n\nУже скоро ты сможешь окунуться в мир уникальных предметов BlackRussia!\n\nНажми на кнопку ниже, чтобы войти на Tanpin.`;
};

export const startBot = () => {
    bot.setMyCommands([
        { command: 'start', description: 'Начать' }
    ]);

    bot.onText(/\/start/, (msg) => {
        const chatId = msg.chat.id;

        const image = fs.readFileSync(env.START_PROMO_IMAGE);
        const imageOptions = {
            filename: 'start-promo.jpeg',
            contentType: 'image/jpeg'
        };

        bot.sendPhoto(chatId, image, {
            caption: startMessage(msg.from?.username, msg.from?.first_name),
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '🚀 Войти с Telegram',
                            login_url: {
                                url: env.TELEGRAM_LOGIN_URL
                            }
                        }
                    ]
                ]
            }
        }, imageOptions);
    });
};
import { env } from 'environment';
import TelegramBot from 'node-telegram-bot-api';

export const botPlay = new TelegramBot(env.TELEGRAM_PLAY_BOT_TOKEN, {
    polling: env.TELEGRAM_WEBHOOK === 'false',
});

export const botAuth = new TelegramBot(env.TELEGRAM_AUTH_BOT_TOKEN, {
    polling: env.TELEGRAM_WEBHOOK === 'false'
});
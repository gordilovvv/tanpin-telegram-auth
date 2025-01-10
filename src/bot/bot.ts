import { env } from 'environment';
import TelegramBot from 'node-telegram-bot-api';

export const bot = new TelegramBot(env.TELEGRAM_BOT_TOKEN, {
    polling: env.TELEGRAM_WEBHOOK === 'false',
    webHook: env.TELEGRAM_WEBHOOK === 'true'
});
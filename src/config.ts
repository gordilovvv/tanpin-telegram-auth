import { config as envConfig } from 'dotenv';

envConfig();

export const APP_PORT = process.env.APP_PORT as string;
export const BOT_TOKEN = process.env.BOT_TOKEN as string;
export const START_PROMO_IMAGE = 'assets/start-promo.jpeg';
export const TELEGRAM_LOGIN_URL = 'https://gate.tanpin.io/test';

const requiredParams = [APP_PORT, BOT_TOKEN];

if (requiredParams.some(param => typeof param === 'undefined')) {
    throw new Error('Some of required config values are undefined!');
}
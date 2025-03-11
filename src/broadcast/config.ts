import TelegramBot from 'node-telegram-bot-api';
// import fs from 'fs';

export const PROD_BROADCAST = true;

export const MESSAGE: {
    video?: { url: string, fileId?: string | undefined },
    photo?: { file: Buffer, fileId?: string | undefined, filename: string, contentType: string },
    caption: string,
    options: TelegramBot.SendPhotoOptions,
    optionsFallback: TelegramBot.SendPhotoOptions
} = {
    video: { url: 'https://tmacdn.tanpin.io/output.mp4' },
    // photo: { file: fs.readFileSync('assets/sea_battle_promo.png'), filename: 'sea_battle_promo.png', contentType: 'image/png' },
    caption: 'Привет, друзья 👋\n\nТеперь вы можете играть в Морской Бой, но с одним важным отличием — *вы можете делать ставки на Tanpin Билеты!*\n\nА как получить билеты? Читай в канале Tanpin.',
    options: {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'Играть ⛵️',
                        url: 'https://t.me/sea_battle_tanpin_bot?start='
                        // web_app: {
                        //     url: 'https://app.tanpin.io'
                        // }
                    },
                    {
                        text: 'Канал 🤙',
                        url: 'https://t.me/tanpin_ru'
                    }
                ]
            ]
        }
    },
    optionsFallback: {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'Играть ⛵️',
                        url: 'https://t.me/sea_battle_tanpin_bot?start='
                    },
                    {
                        text: 'Канал 🤙',
                        url: 'https://t.me/tanpin_ru'
                    }
                ]
            ]
        }
    }
};

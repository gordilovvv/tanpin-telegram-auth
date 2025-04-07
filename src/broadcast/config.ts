import TelegramBot from 'node-telegram-bot-api';
import fs from 'fs';

export const PROD_BROADCAST = true;

export const MESSAGE: {
    video?: { url: string, fileId?: string | undefined },
    photo?: { file: Buffer, fileId?: string | undefined, filename: string, contentType: string },
    caption: string,
    options: TelegramBot.SendPhotoOptions,
    optionsFallback: TelegramBot.SendPhotoOptions
} = {
    // video: { url: 'https://tmacdn.tanpin.io/output.mp4' },
    photo: { file: fs.readFileSync('assets/cup_post.png'), filename: 'cup_post.png', contentType: 'image/png' },
    caption: '*Новая неделя уже началась🏆*\n\nА это значит, что ты можешь побороться за ценные призы. Разгроми флот соперника и стань лидером этой недели.\n\nЛидеры прошлой недели получили свои награды.\n\n[Список победителей](https://docs.google.com/spreadsheets/d/1JqYWSiU8Coj5Cvl7DMKUKgT-0UYx8jv5-Nng9De1Qpc/edit?usp=sharing)',
    options: {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'Играть 💥',
                        // url: 'https://t.me/sea_battle_tanpin_bot?start='
                        web_app: {
                            url: 'https://seabattle.tanpin.io'
                        }
                    },
                    {
                        text: 'Канал 🗺️',
                        url: 'https://t.me/sea_battle_tanpin'
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

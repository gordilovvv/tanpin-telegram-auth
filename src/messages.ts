import fs from 'fs';

export const startImage = {
    data: fs.readFileSync('assets/start.png'),
    options: {
        filename: 'start.png',
        contentType: 'image/png'
    }
};

export const startMessage = (username?: string, firstName?: string) => `Привет, @${username || firstName} 👋

Это Tanpin — маркетплейс для геймеров, где можно торговать предметами из любимых игр и зарабатывать на этом!

Встречай первую коллекцию и завладей эксклюзивными предметами от Black Russia 🐻

Играешь один? Заходи в канал, находи новых друзей, и играйте и зарабатывайте вместе!`;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const authMessage = (username?: string, firstName?: string) => `Подключить Telegram 🔗

*Нажми на кнопку ниже, чтобы войти.*

После возвращайся в игру, твой аккаунт будет готов 🎉`;
export const startMessage = '*💚💚💚\nДобро пожаловать в Tanpin!*\nМы создаем маркетплейс для геймеров, где ты сможешь торговать предметами из любимых игр и зарабатывать на этом!';

export const authMessage = (username?: string, firstName?: string) => {
    return `Привет, ${username || firstName}👋\n Нажми на кнопку ниже, войти. Все твои купленные предметы появятся в игре`;
};

// const imageOptions = {
//     filename: 'start-promo.jpeg',
//     contentType: 'image/jpeg'
// };

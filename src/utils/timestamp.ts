import dayjs from 'dayjs';

export const getCurrentTimestampSeconds = () => {
    return dayjs().unix();
};
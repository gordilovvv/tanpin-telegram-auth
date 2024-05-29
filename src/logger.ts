import pino from 'pino';

export const logger = pino({
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true
        }
    }
});

export function logError(error: any) {
    logger.error(error);
}
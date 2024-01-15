import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

function logFormat() {
    return format.printf(
        (info: {
            level: string
            message: string | undefined
            [key: string]: string | null | undefined
        }) => {
            let level = info.level.toUpperCase();

            if (info.message === undefined) {
                info.message = '(empty message)';
            }

            return info.stack
                ? `[${info.timestamp}] ${level}: ${info.message} ${info.stack}`
                : `[${info.timestamp}] ${level}: ${info.message}`;
        }
    );
}

const logsFileTransport = new DailyRotateFile({
    level: 'info',
    format: format.combine(
        format.splat(),
        format.timestamp({ format: 'MM-DD|HH:mm:ss' }),
        logFormat()
    ),
    maxFiles: 3,
    filename: `${process.cwd()}/logs/log.%DATE%`,
    datePattern: 'YYYY-MM-DD',
    handleExceptions: false,
    handleRejections: false,
});

const consoleTransport = new transports.Console({
    level: 'debug',
    format: format.combine(
        format.colorize(),
        format.simple()
    )
});

export const logger = createLogger({
    level: 'debug',
    exitOnError: false,
    transports: [
        consoleTransport,
        logsFileTransport
    ]
});

export function logError(error: any) {
    if (error instanceof Error) {
        logger.error({
            message: error.message,
            stack: error.stack
        });
    } else {
        logger.error(error);
    }
}
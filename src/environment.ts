import { config } from 'dotenv';
import { z } from 'zod';

config();

export const environmentSchema = z.object({
    APP_PORT: z.string(),
    APP_URL: z.string(),

    TANPIN_MINI_APP_URL: z.string(),
    TANPIN_LOGIN_URL: z.string(),
    TANPIN_AUTH_SYNC_URL: z.string(),

    TELEGRAM_WEBHOOK: z.enum(['true', 'false']),
    TELEGRAM_BOT_TOKEN: z.string(),
    TELEGRAM_WEB_HOOK_SECRET: z.string(),

    TELEGRAM_AUTH_BOT_TOKEN: z.string(),
    TELEGRAM_AUTH_BOT_WEBHOOK: z.enum(['true', 'false']),
    TELEGRAM_AUTH_BOT_WEBHOOK_SECRET: z.string(),
    TELEGRAM_PLAY_BOT_TOKEN: z.string(),
    TELEGRAM_PLAY_BOT_WEBHOOK: z.string(),
    TELEGRAM_PLAY_BOT_WEBHOOK_SECRET: z.string()
});

export type Environment = z.infer<typeof environmentSchema>

declare global {
    namespace NodeJS {
        interface ProcessEnv extends Environment { }
    }
}

export const env: Environment = environmentSchema.parse(process.env);
import { config } from 'dotenv';
import { z } from 'zod';

config();

export const environmentSchema = z.object({
    APP_PORT: z.string(),
    APP_URL: z.string(),

    TANPIN_LOGIN_URL: z.string(),
    TANPIN_AUTH_SYNC_URL: z.string(),

    TELEGRAM_BOT_TOKEN: z.string(),
    TELEGRAM_BOT_USERNAME: z.string(),

    TELEGRAM_WEB_HOOK_SECRET: z.string(),
    TELEGRAM_API_INTERVAL: z.string(),
    TELEGRAM_API_INTERVAL_CAP: z.string(),
});

export type Environment = z.infer<typeof environmentSchema>

declare global {
    namespace NodeJS {
        interface ProcessEnv extends Environment { }
    }
}

export const env: Environment = environmentSchema.parse(process.env);
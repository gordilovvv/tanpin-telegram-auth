import { config } from 'dotenv';
import { z } from 'zod';

config();

export const environmentSchema = z.object({
    APP_PORT: z.string(),
    ENCRYPTION_SECRET: z.string(),
    PGHOST: z.string(),
    PGUSER: z.string(),
    PGDATABASE: z.string(),
    PGPASSWORD: z.string(),
    PGPORT: z.string(),
    BOT_TOKEN: z.string(),
    START_PROMO_IMAGE: z.string(),
    TELEGRAM_LOGIN_URL: z.string(),
    TELEGRAM_RU_CHANNEL_URL: z.string(),
    TELEGRAM_API_INTERVAL: z.string(),
    TELEGRAM_API_INTERVAL_CAP: z.string()
});

export type Environment = z.infer<typeof environmentSchema>

declare global {
    namespace NodeJS {
        interface ProcessEnv extends Environment { }
    }
}

export const env: Environment = environmentSchema.parse(process.env);
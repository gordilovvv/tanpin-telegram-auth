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
    TELEGRAM_BOT_TOKEN: z.string(),
    TELEGRAM_PARAMS_TTL_SECONDS: z.string()
});

export type Environment = z.infer<typeof environmentSchema>

declare global {
    namespace NodeJS {
        interface ProcessEnv extends Environment { }
    }
}

export const env: Environment = environmentSchema.parse(process.env);
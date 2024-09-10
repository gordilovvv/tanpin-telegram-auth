import { createServerAdapter } from '@whatwg-node/server';
import { cors, error, json, Router } from 'itty-router';
import { runBot, webhookHandler } from 'bot';
import { createServer } from 'http';
import { logger } from 'logger';
import { env } from 'environment';

const { preflight, corsify } = cors({
    origin: '*',
    allowMethods: ['HEAD', 'GET', 'POST']
});

const router = Router({
    before: [preflight],
    finally: [corsify],
    catch: error
});

router
    .all('*', preflight)
    .get('/', () => json({
        message: 'Welcome 👋'
    }));

router.post(`/bot${env.TELEGRAM_WEB_HOOK_SECRET}`, webhookHandler);
router.all('*', () => error(404));

const ittyServer = createServerAdapter(router.fetch);
const httpServer = createServer(ittyServer);

httpServer.listen(env.APP_PORT);
runBot();

logger(`🟢 Start telegram bot on port ${env.APP_PORT}\nWebhook url: ${env.APP_URL}/bot${env.TELEGRAM_WEB_HOOK_SECRET}`);
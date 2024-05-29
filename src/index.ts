import { createServerAdapter } from '@whatwg-node/server';
import { Router, createCors, error, json } from 'itty-router';
import { createServer } from 'http';
import { startBot, webhookHandler } from 'bot';
import { logger } from 'logger';
import { env } from 'environment';

const { preflight, corsify } = createCors({
    origins: ['*'],
    methods: ['HEAD', 'GET', 'POST']
});

const router = Router();

router
    .all('*', preflight)
    .get('/', () => json({
        message: 'TG Bot 👋'
    }));

router.post(`/bot${env.TELEGRAM_WEB_HOOK_SECRET}`, (request) => webhookHandler(request));
router.all('*', () => error(404));

const ittyServer = createServerAdapter(
    (request) => router
        .handle(request)
        .then(json)
        .catch(error)
        .then(corsify)
);
const httpServer = createServer(ittyServer);

httpServer.listen(env.APP_PORT);
startBot();

logger.info(`
    Start bot on port ${env.APP_PORT}
    Webhook url: ${env.APP_URL}/bot${env.TELEGRAM_WEB_HOOK_SECRET}
`);


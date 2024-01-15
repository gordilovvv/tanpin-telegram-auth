import { Router, createCors, error, json } from 'itty-router';
import { createServer } from 'http';
import { createServerAdapter } from '@whatwg-node/server';
import { APP_PORT } from './config';
import { authHandler } from './handlers/auth';
import { startBot } from './lib/bot';
import { logger } from './utils/logger';

const { preflight, corsify } = createCors({
    origins: ['*'],
    methods: ['HEAD', 'GET', 'POST']
});

const router = Router();

router
    .all('*', preflight)
    .get('/', () => json({
        message: 'Welcome to Tanpin APIs 👋'
    }));

router.get('/auth', (request) => authHandler(request));
router.all('*', () => error(404));

const ittyServer = createServerAdapter(
    (request) => router
        .handle(request)
        .then(json)
        .catch(error)
        .then(corsify)
);
const httpServer = createServer(ittyServer);

startBot();

logger.info(`Start app on port ${APP_PORT}`);
httpServer.listen(APP_PORT);


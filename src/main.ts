import { Router, cors, error, json } from 'itty-router';
import { createServer } from 'http';
import { createServerAdapter } from '@whatwg-node/server';
import { authHandler } from 'handlers/auth';
import { getSessionHandler } from 'handlers/getSession';
import { setSessionHandler } from 'handlers/setSession';
import { startSessionsCleaner } from 'lib/session';
import { logger } from 'utils/logger';
import { env } from '@environment';

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
        message: 'Welcome to Tanpin APIs 💚'
    }));

router.get('/auth', authHandler);
router.get('/session/get', getSessionHandler);
router.post('/session/set', setSessionHandler);

router.all('*', () => error(404));

const ittyServer = createServerAdapter(router.fetch);
const httpServer = createServer(ittyServer);

httpServer.listen(env.APP_PORT);

startSessionsCleaner();
logger(`🟢 Telegram Auth started on port: ${env.APP_PORT}`);

import { error, IRequest, json, Router } from 'itty-router';
import { createServerAdapter } from '@whatwg-node/server';
import { Update } from 'node-telegram-bot-api';
import { createServer } from 'http';
import { bot } from './bot';
import { env } from 'environment';
import { logger } from 'lib/logger';

export const router = Router({
    catch: error
});

router.post(`/bot${env.TELEGRAM_WEB_HOOK_SECRET}`, async (request: IRequest) => {
    try {
        const body = await request.json() as Request;
        const clientIp = request.headers.get('CF-Connecting-IP') ||
            request.headers.get('X-Forwarded-For') ||
            request.headers.get('Remote-Addr') ||
            'unknown_ip';

        logger(`[bot] request to bot from ${clientIp}`);
        if (!('update_at' in body)) {
            console.error('invalid request', body);
            return error(400);
        }

        const update = body as never as Update;
        bot.processUpdate(update);
        return json({ ok: true }, { status: 200 });
    } catch (err) {
        console.error(err);
        return error(500, 'failed');
    }
});

const ittyServer = createServerAdapter(router.fetch);
const httpServer = createServer(ittyServer);

httpServer.listen(env.APP_PORT);
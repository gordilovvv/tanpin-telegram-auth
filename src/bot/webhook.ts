import { error, IRequest, json, Router } from 'itty-router';
import { createServerAdapter } from '@whatwg-node/server';
import { Update } from 'node-telegram-bot-api';
import { createServer } from 'http';
import { bot } from './bot';
import { env } from 'environment';

export const router = Router({
    catch: error
});

router.post(`/bot${env.TELEGRAM_WEB_HOOK_SECRET}`, async (request: IRequest) => {
    try {
        const body = await request.json() as Request;

        if ('update_id' in body) {
            const update = body as Update;
            bot.processUpdate(update);
        } else {
            console.warn('invalid request', body);
            return error(400, { error: 'invalid' });
        }

        return json({ ok: true }, { status: 200 });
    } catch (err) {
        console.error(err);
        return error(500, 'failed');
    }
});

const ittyServer = createServerAdapter(router.fetch);
const httpServer = createServer(ittyServer);

httpServer.listen(env.APP_PORT);
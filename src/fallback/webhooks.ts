import TelegramBot, { Update } from 'node-telegram-bot-api';
import { error, IRequest, json } from 'itty-router';
import { botAuth, botPlay } from './bots';
import { logger } from 'lib/logger';
import { router } from 'bot/webhook';
import { env } from 'environment';

const handler = async (request: IRequest, bot: TelegramBot, botName: string) => {
    try {
        const body = await request.json() as Request;
        const clientIp = request.headers.get('CF-Connecting-IP') ||
            request.headers.get('X-Forwarded-For') ||
            request.headers.get('Remote-Addr') ||
            'unknown_ip';

        logger(`[fallback-bot] request to ${botName} from ${clientIp}`);
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
};

router.post(`/bot${env.TELEGRAM_PLAY_BOT_WEBHOOK_SECRET}`, async (request: IRequest) => {
    logger('[bot] play bot request');
    return handler(request, botPlay, 'PlayBot');
});

router.post(`/bot${env.TELEGRAM_AUTH_BOT_WEBHOOK_SECRET}`, async (request: IRequest) => {
    logger('[bot] auth bot request');
    return handler(request, botAuth, 'AuthBot');
});
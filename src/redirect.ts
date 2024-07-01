import { createHmac, randomBytes } from 'crypto';
import { createMemcachedMap } from './cache';

const urlToHash = createMemcachedMap<string>('telegram#urls', { expires: 5 * 60 }); // 5 mins
const hashToUrl = createMemcachedMap<string>('telegram#hashes', { expires: 5 * 60 }); // 5 mins

const domainRegex = /^([a-zA-Z0-9-]+\.)*tanpin\.io$/;
const redirectHashSalt = 'telegram_redirect_%';
const redirectUrlMaxLength = 216;

export const parseTelegramRedirectUrl = (url?: string | string[] | undefined) => {
    if (!url || typeof url !== 'string') {
        return null;
    }
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;

    return domainRegex.test(hostname) && url.length < redirectUrlMaxLength
        ? parsedUrl.toString()
        : null;
};

export const generateTelegramRedirectHash = async (url: string) => {
    const encodedUrl = encodeURI(url);
    const createdHash = await urlToHash.get(encodedUrl);
    if (createdHash) {
        return createdHash;
    }

    const hmac = createHmac('sha256', encodedUrl);
    hmac.update(Buffer.concat([
        randomBytes(3),
        Buffer.from(redirectHashSalt)
    ]));

    const hash = hmac.digest('base64')
        .replace(/[^a-zA-Z0-9]/g, '')
        .slice(0, 16);

    await hashToUrl.set(hash, encodedUrl);
    await urlToHash.set(encodedUrl, hash);
    return hash;
};

export const getRedirectUrlByHash = async (hash: string) => {
    if (!/^[a-zA-Z0-9]{16}$/.test(hash)) {
        return null;
    }

    return hashToUrl.get(hash);
};
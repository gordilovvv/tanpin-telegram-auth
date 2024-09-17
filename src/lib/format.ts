import { isHex } from 'viem';

export const parseSessionId = (sessionId?: string) => {
    try {
        if (!sessionId || sessionId.length > 64) {
            return null;
        }
        return isHex(`0x${sessionId}`) ? sessionId : null;
    } catch (error) {
        return null;
    }
};

export const parsePubKey = (pubKey?: string) => {
    try {
        if (!pubKey || pubKey.length > 130) {
            return null;
        }
        return isHex(`0x${pubKey}`) ? pubKey : null;
    } catch (error) {
        return null;
    }
};

export function safeParseInt(data?: string | null, defaultValue = undefined) {
    if (data == null) {
        return defaultValue;
    }

    const parsed = parseInt(data);
    if (isNaN(parsed)) {
        return defaultValue;
    }

    return parsed;
}
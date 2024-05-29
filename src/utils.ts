import base64url from 'base64url';

/**
 * @example /deposit
 */
export const parseRedirectUrl = (match: RegExpExecArray | null) => {
    const encodedString = match?.[1];
    if (!encodedString) {
        return;
    }

    const decodedString = base64url.decode(encodedString);
    const matches = decodedString.match(/(?:^|&)(?:u_([^&]*))/);

    return matches?.[1];
};

export const parseReferralCode = (match: RegExpExecArray | null) => {
    const encodedString = match?.[1];
    if (!encodedString) {
        return;
    }

    const decodedString = base64url.decode(encodedString);
    const matches = decodedString.match(/(?:^|&)(?:r_([^&]*))/);

    return matches?.[1];
};

/** Season Pass */
export const parseAuthSecret = (match: RegExpExecArray | null) => {
    const encodedString = match?.[1];
    if (!encodedString) {
        return;
    }

    const decodedString = base64url.decode(encodedString);
    const matches = decodedString.match(/(?:^|&)(?:s_([^&]*))/);

    return matches?.[1];
};

export const createLoginUrl = (
    baseUrl: string,
    redirectUrl?: string,
    referralCode?: string,
    authSecret?: string
) => {
    const url = new URL(baseUrl);

    if (redirectUrl) {
        url.searchParams.append('u', redirectUrl);
    }

    if (referralCode) {
        url.searchParams.append('r', referralCode);
    }

    if (authSecret) {
        url.searchParams.append('s', base64url.encode(authSecret));
    }

    return url.toString();
};

// https://jasonformat.com/javascript-sleep/
export function sleep(milliseconds: number) {
    if (typeof Atomics === 'undefined') {
        return new Promise((resolve) => setTimeout(resolve, milliseconds));
    }

    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds);
}


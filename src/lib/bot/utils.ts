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

export const createLoginUrl = (
    baseUrl: string,
    redirectUrl?: string,
    referralCode?: string
) => {
    const url = new URL(baseUrl);

    if (redirectUrl) {
        url.searchParams.append('u', redirectUrl);
    }

    if (referralCode) {
        url.searchParams.append('r', referralCode);
    }

    return url.toString();
};
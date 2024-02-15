export const parseReferralCode = (match: RegExpExecArray | null) => {
    return match?.[1]?.split('_')?.[1];
};

export const createLoginUrl = (baseUrl: string, referralCode?: string) => {
    const url = new URL(baseUrl);

    if (referralCode) {
        url.searchParams.append('r', referralCode);
    }

    return url.toString();
};
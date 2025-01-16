export function safeParseInt(data?: string | null, defaultValue = undefined) {
    if (data == null) return defaultValue;
    const parsed = parseInt(data);
    if (isNaN(parsed)) return defaultValue;
    return parsed;
}
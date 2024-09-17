export const logger = (msg: string) => console.log(`> ${msg}`, new Date().toISOString());
export const logError = (error: any) => console.error(error);
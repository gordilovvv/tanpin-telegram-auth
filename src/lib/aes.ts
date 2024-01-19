import * as crypto from 'crypto';

type AnyObject = Record<string, any>;

export function generatePrivKey(data: AnyObject): Buffer {
    const keyInput = Object.values(data).join('\n');

    return crypto
        .createHash('sha256')
        .update(keyInput)
        .digest();
}

/**
 * @param value clean phrase
 * @param data object for encryption
 */
export function encrypt(value: string, data: AnyObject) {
    const iv = crypto.randomBytes(16);
    const privKey = generatePrivKey(data);
    const cipher = crypto.createCipheriv('aes-256-cbc', privKey, iv);
    const encrypted = Buffer.concat([cipher.update(value, 'utf-8'), cipher.final()]);

    return {
        iv: iv.toString('hex'),
        encryptedData: encrypted.toString('hex')
    };
}

/**
 * @param encryptedValue Encrypted phrase
 * @param privKey Cipher key
 * @param iv Initialization vector
 */
export function decrypt(encryptedValue: string, iv: string, data: AnyObject) {
    const privKey = generatePrivKey(data);
    const decipher = crypto.createDecipheriv('aes-256-cbc', privKey, Buffer.from(iv, 'hex'));
    const decrypted = Buffer.concat([decipher.update(Buffer.from(encryptedValue, 'hex')), decipher.final()]);

    return decrypted.toString('utf-8');
}
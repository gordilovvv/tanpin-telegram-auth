import { Ecies, decrypt, ec, encrypt, getPublic } from './eccrypto';

export type EciesHex = {
    iv: string;
    ephemPublicKey: string;
    ciphertext: string;
    mac: string;
};

export function encParamsHexToBuf(encParamsHex: EciesHex): Ecies {
    return {
        iv: Buffer.from(encParamsHex.iv, 'hex'),
        ephemPublicKey: Buffer.from(encParamsHex.ephemPublicKey, 'hex'),
        ciphertext: Buffer.from(encParamsHex.ciphertext, 'hex'),
        mac: Buffer.from(encParamsHex.mac, 'hex'),
    };
}

export function encParamsBufToHex(encParams: Ecies): EciesHex {
    return {
        iv: Buffer.from(encParams.iv).toString('hex'),
        ephemPublicKey: Buffer.from(encParams.ephemPublicKey).toString('hex'),
        ciphertext: Buffer.from(encParams.ciphertext).toString('hex'),
        mac: Buffer.from(encParams.mac).toString('hex'),
    };
}

export async function encryptData(privKeyHex: string, d: unknown): Promise<string> {
    const serializedDec = JSON.stringify(d);
    const serializedBuf = Buffer.from(serializedDec, 'utf-8');
    const encParams = await encrypt(getPublic(Buffer.from(privKeyHex, 'hex')), serializedBuf);
    const encParamsHex = encParamsBufToHex(encParams);
    const sData = JSON.stringify(encParamsHex);
    return sData;
}

export async function decryptData<T>(privKeyHex: string, d: string): Promise<T> {
    const encParamsHex: EciesHex = JSON.parse(d);
    const encParams = encParamsHexToBuf(encParamsHex);
    const keyPair = ec.keyFromPrivate(privKeyHex);
    const serializedBuf = await decrypt(Buffer.from(keyPair.getPrivate().toString('hex', 64), 'hex'), encParams);
    const serializedDec = serializedBuf.toString('utf-8');
    const data: T = JSON.parse(serializedDec);
    return data;
}
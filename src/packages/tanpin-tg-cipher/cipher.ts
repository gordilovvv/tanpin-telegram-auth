import { Ecies, decrypt, ec, encrypt, getPublic } from './elliptic';

export type EciesHex = {
    iv: string;
    ephemPublicKey: string;
    ciphertext: string;
    mac: string;
};

const encParamsHexToBuf = (encParamsHex: EciesHex): Ecies => ({
    iv: Buffer.from(encParamsHex.iv, 'hex'),
    ephemPublicKey: Buffer.from(encParamsHex.ephemPublicKey, 'hex'),
    ciphertext: Buffer.from(encParamsHex.ciphertext, 'hex'),
    mac: Buffer.from(encParamsHex.mac, 'hex'),
});

const encParamsBufToHex = (encParams: Ecies): EciesHex => ({
    iv: encParams.iv.toString('hex'),
    ephemPublicKey: encParams.ephemPublicKey.toString('hex'),
    ciphertext: encParams.ciphertext.toString('hex'),
    mac: encParams.mac.toString('hex'),
});

export const encryptData = async (privKeyHex: string, d: unknown): Promise<string> => {
    const serializedDec = JSON.stringify(d);
    const serializedBuf = Buffer.from(serializedDec, 'utf-8');
    const encParams = await encrypt(getPublic(Buffer.from(privKeyHex, 'hex')), serializedBuf);
    const encParamsHex = encParamsBufToHex(encParams);

    return JSON.stringify(encParamsHex);
};

export const decryptData = async <T>(privKeyHex: string, d: string): Promise<T> => {
    const encParamsHex: EciesHex = JSON.parse(d);
    const encParams = encParamsHexToBuf(encParamsHex);
    const keyPair = ec.keyFromPrivate(privKeyHex);
    const serializedBuf = await decrypt(Buffer.from(keyPair.getPrivate().toString('hex', 64), 'hex'), encParams);
    const serializedDec = serializedBuf.toString('utf-8');
    const data: T = JSON.parse(serializedDec);

    return data;
};
import { keccak256 } from 'viem';

// TODO: move to package
import { verify } from 'packages/tanpin-tg-cipher/elliptic';

export const verifySignature = async (encryptedStr: string, sessionPubKey: string, signature: string) => {
    const message = keccak256(Buffer.from(encryptedStr, 'utf8')).slice(2);

    await verify(
        Buffer.from(sessionPubKey, 'hex'),
        Buffer.from(message, 'hex'),
        Buffer.from(signature, 'hex'),
    );
};
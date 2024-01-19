import crypto from 'crypto';
import { generatePrivateKey, privateKeyToAddress } from 'viem/accounts';

export const generateWallet = () => {
    const privateKey = generatePrivateKey();
    const privateKeySalt = crypto.randomBytes(16).toString('hex');
    const address = privateKeyToAddress(privateKey);

    return {
        address,
        privateKey,
        privateKeySalt
    };
};
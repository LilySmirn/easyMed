import CryptoJS from 'crypto-js';
import { decryptData } from './crypto.js';

describe('decryptData', () => {
    it('должен расшифровывать корректно', async () => {
        const secretKey = 'secretKey';
        const originalText = 'Hello, world!';

        const encrypted = CryptoJS.AES.encrypt(originalText, secretKey).toString();

        const decrypted = await decryptData(encrypted);

        expect(decrypted).toBe(originalText);
    });

    it('должен вернуть пустую строку при неверном ключе', async () => {
        const wrongEncrypted = CryptoJS.AES.encrypt('test', 'wrongKey').toString();

        const result = await decryptData(wrongEncrypted);

        expect(result).not.toBe('test');
    });
});

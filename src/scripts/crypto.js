import CryptoJS from 'crypto-js';

const tmpKey = "secretKey";
const keyUrl = "https://easymed.pro/key"; //TODO: provide the correct url

export async function decryptData(encryptedData) {
    try {
        let decrypted = CryptoJS.AES.decrypt(encryptedData, tmpKey);
        return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (err) {
        console.error("Decryption failed:", err);
        return '';
    }
}




// TODO: remove after CryptoJS testing
// export function encryptData(encryptedData) {
//     //let key = await fetch(keyUrl);
//
//     return CryptoJS.AES.encrypt(encryptedData, tmpKey).toString();
// }





//import CryptoJS from 'crypto-js';
//
// const tmpKey = "secretKey";
//
// // Функция для расшифровки base64-строки, созданной в PHP
// export function decryptData(base64Data) {
//     try {
//         // Декодируем из base64
//         const combinedBytes = CryptoJS.enc.Base64.parse(base64Data);
//
//         // IV = первые 16 байт (128 бит = 16 байт)
//         const iv = CryptoJS.lib.WordArray.create(
//             combinedBytes.words.slice(0, 4), // 4 words * 4 bytes = 16 bytes
//             16
//         );
//
//         // Зашифрованные данные = оставшиеся байты
//         const encryptedData = CryptoJS.lib.WordArray.create(
//             combinedBytes.words.slice(4),
//             combinedBytes.sigBytes - 16
//         );
//
//         // Ключ должен быть 256 бит (32 байта)
//         const key = CryptoJS.enc.Utf8.parse(tmpKey.padEnd(32, ' ')); // дополним пробелами
//
//         const decrypted = CryptoJS.AES.decrypt(
//             { ciphertext: encryptedData },
//             key,
//             { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
//         );
//
//         return decrypted.toString(CryptoJS.enc.Utf8);
//     } catch (err) {
//         console.error("Decryption failed:", err);
//         return '';
//     }
// }

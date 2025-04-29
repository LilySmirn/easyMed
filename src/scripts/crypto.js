import CryptoJS from 'crypto-js';

const tmpKey = "secretKey";
const keyUrl = "https://easymed.pro/key"; //TODO: provide the correct url

// export async function decryptData(encryptedData) {
//     //let key = await fetch(keyUrl);
//
//     let decrypted = CryptoJS.AES.decrypt(encryptedData, tmpKey);
//     return decrypted.toString(CryptoJS.enc.Utf8);
// }


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

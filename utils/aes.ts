import config from 'config';
// @ts-ignore
import AesEncryption from 'aes-encryption';

/**
 * @class AES
 * @description Handles AES encryption and decryption using a secret key.
 */
class AES {
    aes;

    /**
     * @constructor
     * @description Initializes AES encryption with a secret key from configuration.
     */
    constructor() {
        const key = config.get('AES_SECRET_KEY');
        this.aes = new AesEncryption();
        this.aes.setSecretKey(key);
    }

    /**
     * @description Encrypts a given string payload.
     * @param {string} payload - The string to be encrypted.
     * @returns {Promise<string>} - The encrypted string.
     */
    async encrypt(payload: string | null) {
        const encrypted = await this.aes.encrypt(payload);
        return encrypted;
    }

    /**
     * @description Decrypts an encrypted string. If AUTH_VERSION is 'v1', returns the encrypted token as is.
     * @param {string} encryptedToken - The encrypted string to be decrypted.
     * @returns {Promise<string>} - The decrypted string.
     */
    async decrypt(encryptedToken: string) {
        /**
         * If AUTH_VERSION is v1 then do not encrypt the token
         */
        if(config.get('AUTH_VERSION') === 'v1') return encryptedToken;
        const decryptedToken = await this.aes.decrypt(encryptedToken);
        return decryptedToken;
    }
}

export const aes = new AES()
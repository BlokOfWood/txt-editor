import { inject, Injectable } from '@angular/core';
import { User } from './user';

@Injectable({
    providedIn: 'root',
})
export class Encryption {
    static readonly LocalStorageKey = 'encryptionKey';

    readonly user = inject(User);
    readonly crypto = globalThis.crypto.subtle;

    readonly textEncoder = new TextEncoder();
    readonly textDecoder = new TextDecoder();

    readonly keyDeriveParams: Pbkdf2Params = {
        name: 'PBKDF2',
        hash: 'SHA-512',
        salt: this.textEncoder.encode('salt'),
        iterations: 100,
    };
    readonly aesKeyAlgorithm: AesKeyAlgorithm = { name: 'AES-GCM', length: 256 };

    encryptionKey: CryptoKey | null = null;

    async encryptText(plainText: string): Promise<{ cipherTextB64: string; ivB64: string }> {
        try {
            if (this.encryptionKey == null) {
                this.user.logout();
                throw 'No encryption key set!';
            }

            let iv = new Uint8Array(12);
            window.crypto.getRandomValues(iv);

            let aesGcmParams: AesGcmParams = {
                name: 'AES-GCM',
                iv,
                tagLength: 128,
            };

            let cipherText = await this.crypto.encrypt(
                aesGcmParams,
                this.encryptionKey,
                this.textEncoder.encode(plainText),
            );

            const cipherTextArray = new Uint8Array(cipherText);
            const cipherTextB64 = btoa(String.fromCharCode(...cipherTextArray));

            const ivB64 = btoa(String.fromCharCode(...iv));

            return {
                cipherTextB64,
                ivB64,
            };
        } catch (err) {
            console.error(err);
            throw 'Failed to encrypt text!';
        }
    }

    async decryptText(cipherTextBytes: BufferSource, iv: BufferSource): Promise<string> {
        try {
            if (this.encryptionKey == null) {
                this.user.logout();
                throw 'No encryption key set!';
            }

            let aesGcmParams: AesGcmParams = {
                name: 'AES-GCM',
                iv,
                tagLength: 128,
            };

            return this.textDecoder.decode(
                await this.crypto.decrypt(aesGcmParams, this.encryptionKey, cipherTextBytes),
            );
        } catch (err) {
            console.error(err);
            throw 'Failed to decrypt text!';
        }
    }

    async setEncryptionKey(password: string) {
        const passwordKey = await this.crypto.importKey(
            'raw',
            this.textEncoder.encode(password),
            { name: 'PBKDF2' },
            false,
            ['deriveKey'],
        );
        this.encryptionKey = await this.crypto.deriveKey(
            this.keyDeriveParams,
            passwordKey,
            this.aesKeyAlgorithm,
            true,
            ['encrypt', 'decrypt'],
        );

        localStorage.setItem(
            Encryption.LocalStorageKey,
            JSON.stringify(new Uint32Array(await this.crypto.exportKey('raw', this.encryptionKey))),
        );
    }

    async loadEncryptionKey() {
        try {
            const key = localStorage.getItem(Encryption.LocalStorageKey);

            if (key == null) {
                throw 'No encryption key found!';
            }

            const keyBytes: Uint32Array = new Uint32Array(Object.values(JSON.parse(key)));

            this.encryptionKey = await this.crypto.importKey(
                'raw',
                keyBytes as BufferSource,
                this.aesKeyAlgorithm,
                true,
                ['encrypt', 'decrypt'],
            );
        } catch (err) {
            if (this.user.isLoggedIn) {
                console.error(err);
                this.user.logout();
            }
        }
    }
}

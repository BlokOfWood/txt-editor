import { inject, Injectable } from '@angular/core';
import { User } from './user';

@Injectable({
    providedIn: 'root',
})
export class Encryption {
    static readonly LocalStorageKey = 'encryptionKey';

    readonly user = inject(User);
    readonly crypto = globalThis.crypto.subtle;
    static readonly CryptoKeyDbConfig = {
        DATABASE_NAME: 'KeyDb',
        OBJECT_STORE_NAME: 'KeyObjectStore',
        VERSION: 1,
        KEY_ID: 1,
    };

    readonly textEncoder = new TextEncoder();
    readonly textDecoder = new TextDecoder();

    readonly keyDeriveParams: Pbkdf2Params = {
        name: 'PBKDF2',
        hash: 'SHA-512',
        salt: this.textEncoder.encode('salt'),
        iterations: 1000000,
    };
    readonly aesKeyAlgorithm: AesKeyAlgorithm = { name: 'AES-GCM', length: 256 };

    encryptionKey: CryptoKey | null = null;

    async encryptText(plainText: string): Promise<{ cipherTextB64: string; ivB64: string }> {
        try {
            if (this.encryptionKey == null) {
                this.user.logout();
                throw 'No encryption key set!';
            }

            const iv = new Uint8Array(12);
            window.crypto.getRandomValues(iv);

            const aesGcmParams: AesGcmParams = {
                name: 'AES-GCM',
                iv,
                tagLength: 128,
            };

            const cipherText = await this.crypto.encrypt(
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

            const aesGcmParams: AesGcmParams = {
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
        const key = await this.crypto.deriveKey(
            this.keyDeriveParams,
            passwordKey,
            this.aesKeyAlgorithm,
            false,
            ['encrypt', 'decrypt'],
        );
        this.encryptionKey = key;

        const open = this.openDb();

        open.onsuccess = function () {
            const db = open.result;
            const tx = db.transaction(Encryption.CryptoKeyDbConfig.OBJECT_STORE_NAME, 'readwrite');
            const store = tx.objectStore(Encryption.CryptoKeyDbConfig.OBJECT_STORE_NAME);

            store.put({ id: 1, key });
        };

        open.onerror = function (errorEvent) {
            throw errorEvent;
        };
    }

    async loadEncryptionKey() {
        try {
            const open = this.openDb();

            const key: CryptoKey = await new Promise((resolve, error) => {
                open.onsuccess = () => {
                    const db = open.result;
                    const tx = db.transaction(
                        Encryption.CryptoKeyDbConfig.OBJECT_STORE_NAME,
                        'readonly',
                    );
                    const store = tx.objectStore(Encryption.CryptoKeyDbConfig.OBJECT_STORE_NAME);

                    const keyRequest = store.get(1);

                    keyRequest.onsuccess = () => resolve(keyRequest.result?.key);
                    keyRequest.onerror = (errorEvent) => error(errorEvent);
                };
                open.onerror = (errorEvent) => {
                    error(errorEvent);
                };
            });

            this.encryptionKey = key;
        } catch (err) {
            if (this.user.isLoggedIn) {
                console.error(err);
                this.user.logout();
            }
        }
    }

    openDb(): IDBOpenDBRequest {
        const indexedDB = window.indexedDB;
        const open = indexedDB.open(
            Encryption.CryptoKeyDbConfig.DATABASE_NAME,
            Encryption.CryptoKeyDbConfig.VERSION,
        );

        open.onupgradeneeded = function () {
            const db = open.result;
            db.createObjectStore(Encryption.CryptoKeyDbConfig.OBJECT_STORE_NAME, {
                keyPath: 'id',
            });
        };

        return open;
    }
}

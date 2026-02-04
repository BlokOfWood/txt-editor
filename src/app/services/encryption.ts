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

    async encryptText(plainText: string): Promise<ArrayBuffer> {
        if (this.encryptionKey == null) {
            this.user.logout();
            throw 'No encryption key set!';
        }

        return await this.crypto.encrypt(
            this.aesKeyAlgorithm,
            this.encryptionKey,
            this.textEncoder.encode(plainText),
        );
    }

    async decryptText(cipherTextBytes: ArrayBuffer): Promise<string> {
        if (this.encryptionKey == null) {
            this.user.logout();
            throw 'No encryption key set!';
        }

        return this.textDecoder.decode(
            await this.crypto.decrypt(this.aesKeyAlgorithm, this.encryptionKey, cipherTextBytes),
        );
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

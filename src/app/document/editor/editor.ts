import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { debounceTime } from 'rxjs';
import { DocumentApi } from '../../services/api/document.api';
import { Encryption } from '../../services/encryption';
import { DocumentDto } from '../../../models/document.model';
import { User } from '../../services/user';

@Component({
    selector: 'app-editor',
    imports: [FormsModule, RouterLink],
    templateUrl: './editor.html',
    styleUrl: './editor.css',
})
export class Editor {
    documentApi = inject(DocumentApi);
    route = inject(ActivatedRoute);
    encryption = inject(Encryption);
    user = inject(User);
    destroyRef = inject(DestroyRef);

    textDecoder = new TextDecoder();
    textEncoder = new TextEncoder();

    cipherTextBytes = new ArrayBuffer();
    initVectorBytes = new ArrayBuffer();

    documentId: string = '';
    title = signal('');
    content = signal('');
    contentAsB64 = computed(() => (this.textEncoder.encode(this.content()) as any).toBase64());

    constructor() {
        this.route.params.subscribe((params) => (this.documentId = params['id']));

        this.route.data.subscribe(async (data) => {
            this.title.set(data['document'].title);

            const documentDto = data['document'] as DocumentDto;
            this.cipherTextBytes = this.base64ToArrayBuffer(documentDto.content);
            this.initVectorBytes = this.base64ToArrayBuffer(documentDto.initializationVector);

            try {
                const decryptedText = await this.encryption.decryptText(
                    this.cipherTextBytes,
                    this.initVectorBytes,
                );
                this.content.set(decryptedText);
            } catch (err) {
                this.user.logout({ message: 'LOGOUT_ENCRYPTION_KEY_INVALID' });

                throw err;
            }
        });

        toObservable(this.title)
            .pipe(debounceTime(500))
            .subscribe((newValue) => {
                this.documentApi
                    .modifyDocument(this.documentId, { title: newValue }, this.destroyRef)
                    .subscribe();
            });

        toObservable(this.content)
            .pipe(debounceTime(500))
            .subscribe(async (newValue) => {
                try {
                    const _ = await this.encryption.decryptText(
                        this.cipherTextBytes,
                        this.initVectorBytes,
                    );
                } catch (err) {
                    this.user.logout({ message: 'LOGOUT_ENCRYPTION_KEY_INVALID' });
                    throw err;
                }

                const { cipherTextB64: cipherText, ivB64: iv } =
                    await this.encryption.encryptText(newValue);

                this.documentApi
                    .modifyDocument(
                        this.documentId,
                        { content: cipherText, initializationVector: iv },
                        this.destroyRef,
                    )
                    .subscribe(() => {
                        this.cipherTextBytes = this.base64ToArrayBuffer(cipherText);
                        this.initVectorBytes = this.base64ToArrayBuffer(iv);
                    });
            });
    }

    private base64ToArrayBuffer(base64: string): ArrayBuffer {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }
}

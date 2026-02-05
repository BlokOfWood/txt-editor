import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { debounceTime } from 'rxjs';
import { DocumentApi } from '../../services/api/document.api';
import { Encryption } from '../../services/encryption';
import { DocumentDto } from '../../../models/document.model';

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
    destroyRef = inject(DestroyRef);

    textDecoder = new TextDecoder();
    textEncoder = new TextEncoder();

    documentId: string = '';
    title = signal('');
    content = signal('');
    contentAsB64 = computed(() => (this.textEncoder.encode(this.content()) as any).toBase64());

    constructor() {
        this.route.params.subscribe((params) => (this.documentId = params['id']));

        this.route.data.subscribe(async (data) => {
            this.title.set(data['document'].title);

            const documentDto = data['document'] as DocumentDto;
            const cipherTextBytes = this.base64ToArrayBuffer(documentDto.content);
            const initVectorBytes = this.base64ToArrayBuffer(documentDto.initializationVector);

            const decryptedText = await this.encryption.decryptText(
                cipherTextBytes,
                initVectorBytes,
            );

            this.content.set(decryptedText);
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
                const { cipherTextB64: cipherText, ivB64: iv } =
                    await this.encryption.encryptText(newValue);

                this.documentApi
                    .modifyDocument(
                        this.documentId,
                        { content: cipherText, initializationVector: iv },
                        this.destroyRef,
                    )
                    .subscribe();
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

import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { debounceTime } from 'rxjs';
import { DocumentApi } from '../../services/api/document.api';
import { Encryption } from '../../services/encryption';

@Component({
    selector: 'app-editor',
    imports: [FormsModule, RouterLink],
    templateUrl: './editor.html',
    styleUrl: './editor.css',
})
export class Editor {
    // TODO: Add ability to modify title
    documentApi = inject(DocumentApi);
    route = inject(ActivatedRoute);
    encryption = inject(Encryption);
    destroyRef = inject(DestroyRef);

    textEncoder = new TextEncoder();

    documentId: string = '';
    title = signal('');
    content = signal('');
    contentAsB64 = computed(() => (this.textEncoder.encode(this.content()) as any).toBase64());

    constructor() {
        this.route.params.subscribe((params) => (this.documentId = params['id']));

        this.route.data.subscribe((data) => {
            this.title.set(data['document'].title);
            this.content.set(data['document'].content);
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
            .subscribe((newValue) => {
                this.documentApi
                    .modifyDocument(this.documentId, { content: newValue }, this.destroyRef)
                    .subscribe();
            });
    }
}

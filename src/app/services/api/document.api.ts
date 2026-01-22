import { DestroyRef, inject, Injectable } from '@angular/core';
import { Api } from './api';
import { CreateDocumentDto, DocumentBriefDto } from '../../../models/document.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DocumentApi {
    private api = inject(Api);

    getDocumentBriefs(destroyRef: DestroyRef): Observable<DocumentBriefDto[]> {
        return this.api.get('document', destroyRef);
    }

    createNewDocument(createDocumentRequest: CreateDocumentDto, destroyRef: DestroyRef): Observable<void> {
        return this.api.post('document', createDocumentRequest, destroyRef)
    }
}

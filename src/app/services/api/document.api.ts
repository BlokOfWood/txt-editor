import { DestroyRef, inject, Injectable } from '@angular/core';
import { Api } from './api';
import { CreateDocumentDto, DocumentBrief, DocumentBriefsDto, DocumentDto, ModifyDocumentDto } from '../../../models/document.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DocumentApi {
    private api = inject(Api);

    getDocumentBriefs(offset: number, quantity: number, destroyRef: DestroyRef): Observable<DocumentBriefsDto> {
        return this.api.get(`document?offset=${offset}&quantity=${quantity}`, destroyRef);
    }

    getDocumentById(id: string, destroyRef: DestroyRef): Observable<DocumentDto> {
        return this.api.get(`document/${id}`, destroyRef);
    }

    createNewDocument(createDocumentRequest: CreateDocumentDto, destroyRef: DestroyRef): Observable<void> {
        return this.api.post('document', createDocumentRequest, destroyRef)
    }

    modifyDocument(id: string, newContent: ModifyDocumentDto, destroyRef: DestroyRef): Observable<void> {
        return this.api.post(`document/${id}`, newContent, destroyRef);
    }

    deleteDocument(id: string, destroyRef: DestroyRef): Observable<void> {
        return this.api.delete(`document/${id}`, destroyRef);
    }
}

import { DestroyRef, inject, Injectable } from '@angular/core';
import { Api } from './api';
import { DocumentBriefDto } from '../../../models/document.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DocumentApi {
    private api = inject(Api);

    getDocumentBriefs(destroyRef: DestroyRef): Observable<DocumentBriefDto[]> {
        return this.api.get('document', destroyRef);
    }
}

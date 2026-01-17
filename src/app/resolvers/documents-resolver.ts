import { ResolveFn } from '@angular/router';
import { DocumentBriefDto } from '../../models/document.model';
import { DestroyRef, inject } from '@angular/core';
import { DocumentApi } from '../services/api/document.api';

export const documentsResolver: ResolveFn<DocumentBriefDto[]> = (route, state) => {
    const documentApi = inject(DocumentApi);

    return documentApi.getDocumentBriefs(inject(DestroyRef));
};

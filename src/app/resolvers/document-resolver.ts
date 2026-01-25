import { ResolveFn } from '@angular/router';
import { DocumentApi } from '../services/api/document.api';
import { DestroyRef, inject } from '@angular/core';
import { DocumentDto } from '../../models/document.model';

export const documentResolver: ResolveFn<DocumentDto> = (route, state) => {
    const documentApi = inject(DocumentApi);

    const documentId = route.paramMap.get('id');

    if (documentId === null)
        throw `No route param named id on route ${route.toString()}. Document resolver might be registered to wrong route?`;

    return documentApi.getDocumentById(documentId, inject(DestroyRef));
};

import { ResolveFn } from '@angular/router';
import { DocumentBriefsDto } from '../../models/document.model';
import { DestroyRef, inject } from '@angular/core';
import { DocumentApi } from '../services/api/document.api';
import { Dashboard } from '../document/dashboard/dashboard';

export const documentsResolver: ResolveFn<DocumentBriefsDto> = () => {
    const documentApi = inject(DocumentApi);

    return documentApi.getDocumentBriefs("", 0, Dashboard.DOCUMENTS_PER_PAGE, inject(DestroyRef));
};

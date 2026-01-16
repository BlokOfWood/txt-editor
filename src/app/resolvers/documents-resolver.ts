import { ResolveFn } from '@angular/router';
import { DocumentBriefDto } from '../../models/document.model';

export const documentsResolver: ResolveFn<DocumentBriefDto[]> = (route, state) => {
  return true;
};

import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { documentsResolver } from './documents-resolver';

describe('documentsResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => documentsResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});

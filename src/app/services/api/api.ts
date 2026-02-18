import { HttpClient } from '@angular/common/http';
import { DestroyRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class Api {
    private http = inject(HttpClient);
    baseAddress = "http://localhost:5129";

    constructUrl(endpoint: string): string {
        return `${this.baseAddress}/${endpoint}`
    }

    get<T>(endpoint: string, destroyRef: DestroyRef, options?: Parameters<typeof this.http.get>[1]): Observable<T> {
        return this.http.get<T>(this.constructUrl(endpoint), { ...options, withCredentials: true }).pipe(takeUntilDestroyed(destroyRef));
    }

    post<T>(endpoint: string, body: unknown, destroyRef: DestroyRef, options?: Parameters<typeof this.http.post>[2]): Observable<T> {
        return this.http.post<T>(this.constructUrl(endpoint), body, { ...options, withCredentials: true }).pipe(takeUntilDestroyed(destroyRef));
    }

    delete<T>(endpoint: string, destroyRef: DestroyRef, options?: Parameters<typeof this.http.post>[2]): Observable<T> {
        return this.http.delete<T>(this.constructUrl(endpoint), { ...options, withCredentials: true }).pipe(takeUntilDestroyed(destroyRef));
    }

    constructor() {
        if (this.baseAddress.endsWith("/")) {
            throw `API base address cannot end in slash. (${this.baseAddress})`;
        }
    }
}

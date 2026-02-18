import { DestroyRef, inject, Injectable } from '@angular/core';
import { UserApi } from './api/user.api';
import { catchError, EMPTY, tap } from 'rxjs';
import { Router } from '@angular/router';
import { Encryption } from './encryption';
import { Websocket } from './websocket';
import { HttpErrorResponse } from '@angular/common/http';

// TODO: handle expiry that happens while the user is logged in
@Injectable({
    providedIn: 'root',
})
export class User {
    readonly userApi = inject(UserApi);
    readonly router = inject(Router);
    readonly websocket = inject(Websocket);
    readonly destroyRef = inject(DestroyRef);

    private _isLoggedIn = false;

    login(): void {
        this._isLoggedIn = true;
        this.websocket.init('ws://localhost:5129/document/ws');
    }

    logout(params?: Record<string, unknown>): void {
        if (!this._isLoggedIn) return;

        this.userApi.logout(this.destroyRef).subscribe(() => {
            this._isLoggedIn = false;
            localStorage.removeItem(Encryption.LocalStorageKey);
            this.router.navigate(['login'], { relativeTo: null, state: params });
        });
    }

    get isLoggedIn(): boolean {
        return this._isLoggedIn;
    }

    init() {
        return this.userApi.me(this.destroyRef).pipe(
            tap({
                next: () => {
                    this._isLoggedIn = true;
                    this.websocket.init('ws://localhost:5129/document/ws');
                },
                error: (errorResponse: HttpErrorResponse) => {
                    this._isLoggedIn = false;
                    if (errorResponse.status === 401) {
                        localStorage.removeItem(Encryption.LocalStorageKey);
                    } else {
                        throw 'Cannot connect to server!';
                    }
                },
            }),
            catchError(() => EMPTY),
        );
    }
}

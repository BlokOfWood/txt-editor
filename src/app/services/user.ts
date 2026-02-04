import { DestroyRef, inject, Injectable } from '@angular/core';
import { UserApi } from './api/user.api';
import { catchError, EMPTY, tap } from 'rxjs';
import { Router } from '@angular/router';
import { Encryption } from './encryption';

// TODO: handle expiry that happens while the user is logged in
@Injectable({
    providedIn: 'root',
})
export class User {
    readonly userApi = inject(UserApi);
    readonly router = inject(Router);
    readonly destroyRef = inject(DestroyRef);

    private _isLoggedIn = false;

    login(password: string): void {
        this._isLoggedIn = true;
    }

    logout(): void {
        if (!this._isLoggedIn) return;

        this.userApi.logout(this.destroyRef).subscribe(() => {
            this._isLoggedIn = false;
            localStorage.removeItem(Encryption.LocalStorageKey);
            this.router.navigate(['login'], { relativeTo: null });
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
                },
                error: () => {
                    this._isLoggedIn = false;
                    localStorage.removeItem(Encryption.LocalStorageKey);
                },
            }),
            catchError((err) => EMPTY),
        );
    }
}

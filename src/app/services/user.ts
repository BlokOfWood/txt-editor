import { HttpClient } from '@angular/common/http';
import { DestroyRef, inject, Injectable } from '@angular/core';
import { UserApi } from './api/user.api';
import { map, Observable, ReplaySubject, Subject, tap } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class User {
    private _isLoggedIn = false;

    login(): void {
        this._isLoggedIn = true;
    }

    logout(): void {
        this._isLoggedIn = false;
    }

    get isLoggedIn(): boolean {
        return this._isLoggedIn;
    }

    init() {
        return inject(UserApi).me(inject(DestroyRef)).pipe(tap({
            next: () => {
               this._isLoggedIn = true;
            },
            error: () => {
                this._isLoggedIn = false;
            }
        }));
    }
}

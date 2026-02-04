import { DestroyRef, inject, Injectable } from '@angular/core';
import { LoginDto, RegisterDto, UserData } from '../../../models/user.model';
import { Observable } from 'rxjs';
import { Api } from './api';

@Injectable({
    providedIn: 'root',
})
export class UserApi {
    private api = inject(Api);

    login(loginRequest: LoginDto, destroyRef: DestroyRef): Observable<void> {
        return this.api.post('user/login', loginRequest, destroyRef);
    }

    logout(destroyRef: DestroyRef): Observable<void> {
        return this.api.post('user/logout', {}, destroyRef);
    }

    register(registerRequest: RegisterDto, destroyRef: DestroyRef): Observable<void> {
        return this.api.post('user/register', registerRequest, destroyRef);
    }

    me(destroyRef: DestroyRef): Observable<UserData> {
        return this.api.get('user/me', destroyRef);
    }
}

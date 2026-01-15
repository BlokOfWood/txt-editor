import { DestroyRef, inject, Injectable } from '@angular/core';
import { LoginDto, RegisterDto } from '../../../models/login.model';
import { Observable } from 'rxjs';
import { Api } from './api';

@Injectable({
    providedIn: 'root',
})
export class UserApi {
    private api = inject(Api)

    login(loginRequest: LoginDto, destroyRef: DestroyRef): Observable<void> {
        return this.api.post("user/login", loginRequest, destroyRef);
    }

    register(registerRequest: RegisterDto, destroyRef: DestroyRef): Observable<void> {
        return this.api.post("user/register", registerRequest, destroyRef);
    }
}

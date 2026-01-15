import { DestroyRef, inject, Injectable } from '@angular/core';
import { LoginDto } from '../../../models/login.model';
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
}

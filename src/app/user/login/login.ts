import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { LoginDto } from '../../../models/login.model';
import { form, Field } from '@angular/forms/signals';
import { UserApi } from '../../services/api/user.api';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Api } from '../../services/api/api';
import { RouterLink } from "@angular/router";
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'app-login',
    imports: [Field, RouterLink],
    templateUrl: './login.html',
    styleUrl: './login.css',
})
export class Login {
    private userApi = inject(UserApi);
    private destroyRef = inject(DestroyRef);

    errorMessage = signal<string | null>(null);

    loginModel = signal<LoginDto>({ username: "", password: "" });
    loginForm = form(this.loginModel);

    login(event: SubmitEvent): void {
        this.errorMessage.set(null);

        event.preventDefault();

        this.userApi.login(this.loginForm().value(), this.destroyRef).subscribe({
            next: () => {
            },
            error: (error: HttpErrorResponse) => {
                switch (error.status) {
                    case 0:
                        this.errorMessage.set("Could not connect to server.");
                        return;
                    case 401:
                        this.errorMessage.set("Invalid username or password.");
                        return;
                    default:
                        this.errorMessage.set(`An unknown error occurred. (Status code: ${error.status})`);
                        return;
                }
            }
        });
    }
}

import { Component, DestroyRef, inject, signal } from '@angular/core';
import { LoginDto } from '../../../models/login.model';
import { form, Field } from '@angular/forms/signals';
import { UserApi } from '../../services/api/user.api';
import { RouterLink } from "@angular/router";
import { HttpErrorResponse } from '@angular/common/http';
import { Message } from '../../../models/ui.model';

@Component({
    selector: 'app-login',
    imports: [Field, RouterLink],
    templateUrl: './login.html',
    styleUrl: './login.css',
})
export class Login {
    private userApi = inject(UserApi);
    private destroyRef = inject(DestroyRef);

    message = signal<Message>(null);

    loginModel = signal<LoginDto>({ username: "", password: "" });
    loginForm = form(this.loginModel);

    login(event: SubmitEvent): void {
        this.message.set(null);

        event.preventDefault();

        this.userApi.login(this.loginForm().value(), this.destroyRef).subscribe({
            next: () => {
                this.message.set({ message: "Login successful!", type: "info" });
            },
            error: (error: HttpErrorResponse) => {
                switch (error.status) {
                    case 0:
                        this.message.set({ message: "Could not connect to server.", type: "error" });
                        return;
                    case 401:
                        this.message.set({ message: "Invalid username or password.", type: "error" });
                        return;
                    default:
                        this.message.set({ message: `An unknown error occurred. (Status code: ${error.status})`, type: "error" });
                        return;
                }
            }
        });
    }
}

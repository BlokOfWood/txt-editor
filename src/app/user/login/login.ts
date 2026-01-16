import { Component, DestroyRef, inject, signal } from '@angular/core';
import { LoginDto } from '../../../models/user.model';
import { form, Field } from '@angular/forms/signals';
import { UserApi } from '../../services/api/user.api';
import { Router, RouterLink } from "@angular/router";
import { HttpErrorResponse } from '@angular/common/http';
import { Message } from '../../../models/ui.model';
import { User } from '../../services/user';

@Component({
    selector: 'app-login',
    imports: [Field, RouterLink],
    templateUrl: './login.html',
    styleUrl: './login.css',
})
export class Login {
    private userApi = inject(UserApi);
    private destroyRef = inject(DestroyRef);
    private router = inject(Router);
    private userService = inject(User);

    message = signal<Message>(null);

    loginModel = signal<LoginDto>({ username: "", password: "" });
    loginForm = form(this.loginModel);

    login(event: SubmitEvent): void {
        this.message.set(null);

        event.preventDefault();

        this.userApi.login(this.loginForm().value(), this.destroyRef).pipe().subscribe({
            next: () => {
                this.message.set({ message: "Login successful!", type: "info" });

                this.userService.login();

                const timeoutId = setTimeout(() => {
                    this.router.navigateByUrl("/document");
                }, 500);

                this.destroyRef.onDestroy(() => { clearTimeout(timeoutId); });
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

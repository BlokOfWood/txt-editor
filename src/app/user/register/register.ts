import { Component, DestroyRef, inject, signal } from '@angular/core';
import { RegisterDto } from '../../../models/login.model';
import { form, Field } from '@angular/forms/signals';
import { UserApi } from '../../services/api/user.api';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from "@angular/common";
import { Router, RouterLink } from "@angular/router";

@Component({
    selector: 'app-register',
    imports: [Field, CommonModule, RouterLink],
    templateUrl: './register.html',
    styleUrl: './register.css',
})
export class Register {
    private userApi = inject(UserApi);
    private destroyRef = inject(DestroyRef);
    private router = inject(Router);

    message = signal<{ message: string, type: "error" | "info" } | null>(null);

    registerModel = signal<RegisterDto & { confirmPassword: string }>({ username: "", password: "", confirmPassword: "" });
    registerForm = form(this.registerModel);

    register(event: SubmitEvent): void {
        this.message.set(null);

        event.preventDefault();

        if (this.registerForm().value().password !== this.registerForm().value().confirmPassword) {
            this.message.set({ message: "Passwords do not match.", type: "error" });
            return;
        }

        this.userApi.register(this.registerForm().value(), this.destroyRef).subscribe({
            next: () => {
            },
            error: (error: HttpErrorResponse) => {
                switch (error.status) {
                    case 200:
                        this.message.set({ message: "Registration successful! You will now be redirected to the login page.", type: "info" });

                        const timeoutId = setTimeout(() => {
                            this.router.navigate(['/login']);
                        }, 1500);

                        this.destroyRef.onDestroy((() => {
                            clearTimeout(timeoutId);
                        }));

                        return;
                    case 0:
                        this.message.set({ message: "Could not connect to server.", type: "error" });
                        return;
                    case 409:
                        this.message.set({ message: "Username already exists.", type: "error" });
                        return;
                    case 500:
                        this.message.set({ message: "A server error occurred. Please try again later.", type: "error" });
                        return;
                    default:
                        this.message.set({ message: `An unknown error occurred. (Status code: ${error.status})`, type: "error" });
                        return;
                }
            }
        });
    }
}


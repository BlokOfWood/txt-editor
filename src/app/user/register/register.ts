import { Component, DestroyRef, inject, signal } from '@angular/core';
import { RegisterDto } from '../../../models/user.model';
import { form, FormField } from '@angular/forms/signals';
import { UserApi } from '../../services/api/user.api';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from "@angular/common";
import { Router, RouterLink } from "@angular/router";
import { MessageComponent } from "../../reusable-components/message/message";
import { MessageKey } from '../../../models/message.model';

@Component({
    selector: 'app-register',
    imports: [FormField, CommonModule, RouterLink, MessageComponent],
    templateUrl: './register.html',
    styleUrl: './register.css',
})
export class Register {
    private userApi = inject(UserApi);
    private destroyRef = inject(DestroyRef);
    private router = inject(Router);

    message = signal<MessageKey>(null);

    registerModel = signal<RegisterDto & { confirmPassword: string }>({ username: "", password: "", confirmPassword: "" });
    registerForm = form(this.registerModel);

    register(event: SubmitEvent): void {
        this.message.set(null);

        event.preventDefault();

        if (this.registerForm().value().password !== this.registerForm().value().confirmPassword) {
            this.message.set('PASSWORDS_DONT_MATCH');
            return;
        }

        this.userApi.register(this.registerForm().value(), this.destroyRef).subscribe({
            next: () => {
            },
            error: (error: HttpErrorResponse) => {
                switch (error.status) {
                    case 200:
                        this.message.set('SUCCESSFUL_REGISTRATION');

                        const timeoutId = setTimeout(() => {
                            this.router.navigate(['/login']);
                        }, 1500);

                        this.destroyRef.onDestroy((() => {
                            clearTimeout(timeoutId);
                        }));

                        return;
                    case 0:
                        this.message.set('CONNECTION_FAILED');
                        return;
                    case 409:
                        this.message.set('USERNAME_DUPLICATE');
                        return;
                    case 500:
                        this.message.set('SERVER_ERROR');
                        return;
                    default:
                        this.message.set('UNKNOWN_ERROR');
                        return;
                }
            }
        });
    }
}


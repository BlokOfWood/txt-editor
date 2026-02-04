import { Component, DestroyRef, inject, signal } from '@angular/core';
import { LoginDto } from '../../../models/user.model';
import { form, Field } from '@angular/forms/signals';
import { UserApi } from '../../services/api/user.api';
import { Router, RouterLink } from "@angular/router";
import { HttpErrorResponse } from '@angular/common/http';
import { Message, MessageKey } from '../../../models/ui.model';
import { User } from '../../services/user';
import { MessageComponent } from "../../reusable-components/message/message";
import { Encryption } from '../../services/encryption';

@Component({
    selector: 'app-login',
    imports: [Field, RouterLink, MessageComponent],
    templateUrl: './login.html',
    styleUrl: './login.css',
})
export class Login {
    private userApi = inject(UserApi);
    private destroyRef = inject(DestroyRef);
    private router = inject(Router);
    private userService = inject(User);
    private encryption = inject(Encryption);

    message = signal<MessageKey>(null);

    loginModel = signal<LoginDto>({ username: "", password: "" });
    loginForm = form(this.loginModel);

    login(event: SubmitEvent): void {
        this.message.set(null);

        event.preventDefault();

        const loginFormValue = this.loginForm().value()

        this.userApi.login(loginFormValue, this.destroyRef).pipe().subscribe({
            next: () => {
                this.message.set('LOGIN_SUCCESSFUL');

                this.userService.login(this.loginModel().password);
                this.encryption.setEncryptionKey(loginFormValue.password);

                const timeoutId = setTimeout(() => {
                    this.router.navigateByUrl("/document");
                }, 500);

                this.destroyRef.onDestroy(() => { clearTimeout(timeoutId); });
            },
            error: (error: HttpErrorResponse) => {
                switch (error.status) {
                    case 0:
                        this.message.set('CONNECTION_FAILED');
                        return;
                    case 401:
                        this.message.set('INVALID_LOGIN');
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

import { Component, effect, signal } from '@angular/core';
import { LoginDto } from '../../../models/login.model';
import { form, Field } from '@angular/forms/signals';

@Component({
    selector: 'app-login',
    imports: [Field],
    templateUrl: './login.html',
    styleUrl: './login.css',
})
export class Login {
    loginModel = signal<LoginDto>({username:"", password:""});
    loginForm = form(this.loginModel);
    
    login(event: SubmitEvent): void {
        event.preventDefault();
        console.log(this.loginForm().value())
    }
}

import { Routes } from '@angular/router';
import { Login } from './user/login/login';
import { Register } from './user/register/register';

export const routes: Routes = [
    { path: "", pathMatch: "full", redirectTo: "login" },
    { path: "login", component: Login },
    { path: "register", component: Register },
];

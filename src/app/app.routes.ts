import { Routes } from '@angular/router';
import { Login } from './user/login/login';
import { Register } from './user/register/register';
import { Dashboard } from './document/dashboard/dashboard';
import { isLoggedInTsGuard } from './guards/is-logged-in.ts-guard';
import { isLoggedOutTsGuard } from './guards/is-logged-out.ts-guard';
import { documentsResolver } from './resolvers/documents-resolver';

export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'login' },
    { path: 'login', component: Login, canActivate: [isLoggedOutTsGuard] },
    { path: 'register', component: Register, canActivate: [isLoggedOutTsGuard] },
    {
        path: 'document',
        children: [
            {
                path: '',
                component: Dashboard,
                resolve: { documents: documentsResolver },
            },
        ],
        canActivate: [isLoggedInTsGuard],
    },
];

import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { User } from '../services/user';
import { isPlatformBrowser } from '@angular/common';

export const isLoggedInTsGuard: CanActivateFn = (route, state) => {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return true;

    const router = inject(Router);
    const user = inject(User);

    return user.isLoggedIn ? true : router.parseUrl('/login');
};
